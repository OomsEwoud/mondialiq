"""Offline training with explicit mode admission and chronological partitions."""

import argparse
import hashlib
import json
import platform
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

import joblib
import numpy as np
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from ml.data import CLASSES, POLICY, instant, read_export
from ml.dataset import audit, dataset, demo_boundaries, split, training_blockers
from ml.evaluation import metrics, probabilities_for
from ml.mode import DEMO_WARNING, HISTORICAL_WARNING, mode_metadata
from ml.policy import HISTORICAL_POLICY, fixture_fingerprint, validate_mode
from ml.historical import historical_audit
from ml.features import FeatureBuilder
from ml.feature_registry import (
    FeatureConfig,
    feature_metadata,
    add_feature_arguments,
    config_from_arguments,
)

SEED = 20261013


def candidates() -> dict:
    def pipeline(model, scale=False):
        return make_pipeline(
            SimpleImputer(
                strategy="median", add_indicator=True, keep_empty_features=True
            ),
            *([StandardScaler()] if scale else []),
            model,
        )

    return {
        "majority": DummyClassifier(strategy="most_frequent"),
        "home_bias": DummyClassifier(strategy="prior"),
        "logistic_regression": pipeline(
            LogisticRegression(solver="lbfgs", max_iter=2000, C=1.0, random_state=SEED),
            scale=True,
        ),
        "random_forest": pipeline(
            RandomForestClassifier(
                n_estimators=200,
                max_depth=8,
                min_samples_leaf=10,
                random_state=SEED,
                n_jobs=1,
            )
        ),
        "gradient_boosting": pipeline(
            HistGradientBoostingClassifier(
                max_iter=100,
                max_leaf_nodes=15,
                min_samples_leaf=20,
                l2_regularization=1.0,
                early_stopping=False,
                random_state=SEED,
            )
        ),
    }


def write_json(path: Path, payload: dict) -> None:
    path.write_text(
        json.dumps(
            payload,
            indent=2,
            allow_nan=False,
            default=lambda value: value.item()
            if isinstance(value, np.generic)
            else str(value),
        )
        + "\n",
        encoding="utf-8",
    )


def run(
    source: Path,
    output: Path,
    validation_start: datetime | None,
    test_start: datetime | None,
    allow_demo: bool = False,
    historical: bool = False,
    target_seasons: set[int] | None = None,
    audit_only: bool = False,
    feature_config: FeatureConfig | None = None,
) -> dict:
    validate_mode(allow_demo, historical)
    feature_config = feature_config or FeatureConfig()
    if audit_only and not historical:
        raise ValueError("Audit-only requires historical mode")
    if target_seasons and not historical:
        raise ValueError("Target seasons require historical mode")
    output.mkdir(parents=True, exist_ok=False)
    header, fixtures = read_export(source)
    rows, names, matrix = dataset(
        fixtures,
        instant(header["exported_at"]),
        allow_demo=allow_demo,
        historical=historical,
        target_seasons=target_seasons,
        feature_config=feature_config,
    )
    report = {
        **feature_metadata(feature_config),
        **mode_metadata(allow_demo, historical),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "seed": SEED,
        "export": header,
        "dataset_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "availability_policy": HISTORICAL_POLICY if historical else POLICY,
        "features": names,
        "artifact_produced": False,
        "audit": audit(fixtures, rows, names, matrix, allow_demo=allow_demo),
        "python": platform.python_version(),
        "dependencies": {
            name: version(name)
            for name in ("numpy", "scipy", "scikit-learn", "joblib", "threadpoolctl")
        },
        "source_sha256": {
            path.name: hashlib.sha256(path.read_bytes()).hexdigest()
            for path in sorted(Path(__file__).parent.glob("*.py"))
        },
        "calibration": "Reliability reported; no fitted calibrator without independent chronological calibration and selection samples.",
    }
    if historical:
        report["historical_audit"] = historical_audit(
            fixtures, rows, instant(header["exported_at"]), target_seasons
        )
        report["metric_interpretation"] = (
            "Experimental retrospective evaluation; no demonstrated live performance."
        )
        report["calibration"] = (
            "Skipped: no independent chronological calibration sample; reliability bins reported."
        )
        report["split_method"] = "explicit_dates"
        if validation_start is None and test_start is None:
            boundaries = demo_boundaries(rows)
            report["split_method"] = (
                "60/20/20 unique kickoff groups; ties kept together"
            )
            if boundaries:
                validation_start, test_start = boundaries
    if allow_demo:
        report["calibration"] = (
            "Calibration skipped: insufficient validation samples in demo mode."
        )
        report["metric_interpretation"] = (
            "DEMO ONLY — statistically meaningless; technical verification only."
        )
        if validation_start is None and test_start is None:
            boundaries = demo_boundaries(rows)
            if boundaries:
                validation_start, test_start = boundaries
    if validation_start is None or test_start is None:
        blockers = [
            "Specify --validation-start and --test-start after reviewing real data coverage."
        ]
        minimum = 3 if allow_demo else (18 if historical else 500)
        if len(rows) < minimum:
            blockers.insert(
                0,
                f"Only {len(rows)} usable fixtures; at least {minimum} required before splitting.",
            )
        report.update(status="blocked", blockers=blockers)
        write_json(output / "report.json", report)
        return report
    partitions = split(
        rows, validation_start, test_start, allow_demo=allow_demo, historical=historical
    )
    report["boundaries"] = {
        "validation_start": validation_start.isoformat(),
        "test_start": test_start.isoformat(),
    }
    report["candidate_partition_counts"] = {
        "train": sum(row.kickoff < validation_start for row in rows),
        "validation": sum(validation_start <= row.kickoff < test_start for row in rows),
        "test": sum(row.kickoff >= test_start for row in rows),
    }
    report["partitions"] = {
        name: {
            "fixture_ids": [rows[i].id for i in indices],
            "start": min((rows[i].kickoff.isoformat() for i in indices), default=None),
            "end": max((rows[i].kickoff.isoformat() for i in indices), default=None),
            "count": len(indices),
            "class_counts": {
                label: sum(rows[i].target == label for i in indices)
                for label in CLASSES
            },
        }
        for name, indices in partitions.items()
    }
    report["purged_fixture_ids"] = [
        row.id
        for i, row in enumerate(rows)
        if not any(i in indices for indices in partitions.values())
    ]
    coverage_builder = FeatureBuilder(
        fixtures, allow_demo=allow_demo, historical=historical
    )
    coverage_names = ["home_all_5_count", "away_all_5_count"]
    coverage_matrix = np.array(
        [
            [
                min(5, len(coverage_builder.source_history(row, team, row.kickoff)))
                for team in (row.home_team_id, row.away_team_id)
            ]
            for row in rows
        ]
    ).reshape(len(rows), 2)
    blockers = training_blockers(
        rows,
        partitions,
        coverage_names,
        coverage_matrix,
        allow_demo=allow_demo,
        historical=historical,
    )
    if blockers:
        report.update(status="blocked", blockers=blockers)
        write_json(output / "report.json", report)
        return report
    if historical:
        report["baseline_readiness_blockers"] = training_blockers(
            rows, partitions, coverage_names, coverage_matrix
        )
        report["status"] = "ready_for_experimental_training"
        write_json(output / "report.json", report)
    if audit_only:
        report["status"] = "audit_only"
        write_json(output / "report.json", report)
        return report
    labels = np.array([row.target for row in rows])
    train, validation, test = (
        partitions[key] for key in ("train", "validation", "test")
    )
    models = candidates()
    report["validation"] = {}
    report["hyperparameters"] = {}
    report["skipped_models"] = {}
    for name, model in list(models.items()):
        if (
            allow_demo
            and name in ("logistic_regression", "gradient_boosting")
            and len(set(labels[train])) < 2
        ):
            report["skipped_models"][name] = "SKIPPED: insufficient class diversity"
            del models[name]
            continue
        model.fit(matrix[train], labels[train])
        if not allow_demo and not historical and tuple(model.classes_) != CLASSES:
            raise ValueError("Unexpected estimator class order")
        report["validation"][name] = metrics(
            labels[validation], probabilities_for(model, matrix[validation])
        )
        report["hyperparameters"][name] = {
            key: repr(value) for key, value in model.get_params(deep=True).items()
        }
    selection_pool = [name for name in models if name not in ("majority", "home_bias")]
    selected = min(
        selection_pool or list(models),
        key=lambda name: report["validation"][name]["log_loss"],
    )
    report["selected"] = selected
    report["beats_validation_baselines"] = all(
        report["validation"][selected]["log_loss"]
        < report["validation"][name]["log_loss"]
        for name in ("majority", "home_bias")
    )
    importance = permutation_importance(
        models[selected],
        matrix[validation],
        labels[validation],
        scoring=lambda model, features, targets: -metrics(
            targets, probabilities_for(model, features)
        )["log_loss"],
        n_repeats=5,
        random_state=SEED,
        n_jobs=1,
    )
    report["validation_permutation_importance"] = sorted(
        [
            {
                "feature": name,
                "mean_log_loss_increase": float(importance.importances_mean[i]),
                "std": float(importance.importances_std[i]),
            }
            for i, name in enumerate(names)
        ],
        key=lambda item: item["mean_log_loss_increase"],
        reverse=True,
    )
    # Selection is frozen before reading test outcomes. Do not refit on validation.
    probabilities = {
        name: probabilities_for(model, matrix[test]) for name, model in models.items()
    }
    report["test"] = {
        name: metrics(labels[test], values) for name, values in probabilities.items()
    }
    report["status"] = (
        "EXPERIMENTAL_HISTORICAL"
        if historical
        else ("demo_only" if allow_demo else "experimental_candidate")
    )
    report["beats_test_baselines"] = all(
        report["test"][selected]["log_loss"] < report["test"][name]["log_loss"]
        for name in ("majority", "home_bias")
    )
    if historical:
        report["baseline_candidate"] = (
            not report["baseline_readiness_blockers"]
            and report["beats_validation_baselines"]
            and report["beats_test_baselines"]
        )
        report["performance_conclusion"] = (
            "Meets sample, coverage and baseline comparisons; independent review still required."
            if report["baseline_candidate"]
            else "Experimental only: sample/coverage or baseline comparison requirements not met."
        )
    artifact = {
        **feature_metadata(feature_config),
        "estimator": models[selected],
        "features": names,
        **mode_metadata(allow_demo, historical),
        "model_type": selected,
        "trained_at": report["trained_at"],
        "fixture_count": len(rows),
        "partitions": report["partitions"],
        "metrics": {"validation": report["validation"], "test": report["test"]},
        "availability_policy": HISTORICAL_POLICY if historical else POLICY,
        "trained_through": validation_start.isoformat(),
        "selected_through": test_start.isoformat(),
        "dataset_sha256": report["dataset_sha256"],
        "dependencies": report["dependencies"],
        "source_sha256": report["source_sha256"],
        "status": report["status"],
    }
    if historical:
        artifact["fixture_fingerprint"] = fixture_fingerprint(fixtures)
        artifact.update(
            {
                key: report[key]
                for key in (
                    "historical_audit",
                    "hyperparameters",
                    "export",
                    "seed",
                    "python",
                    "boundaries",
                    "split_method",
                    "baseline_candidate",
                    "performance_conclusion",
                    "beats_validation_baselines",
                    "beats_test_baselines",
                    "calibration",
                )
            }
        )
    joblib.dump(artifact, output / "model.joblib")
    report["artifact_produced"] = True
    write_json(
        output / "test-predictions.json",
        {
            **mode_metadata(allow_demo, historical),
            **feature_metadata(feature_config),
            "features": names,
            "fixture_ids": [rows[i].id for i in test],
            "labels": labels[test].tolist(),
            "probabilities": {
                name: values.tolist() for name, values in probabilities.items()
            },
        },
    )
    write_json(output / "report.json", report)
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("export", type=Path)
    parser.add_argument(
        "--output", type=Path, required=True, help="New directory, never overwritten"
    )
    parser.add_argument("--validation-start", type=instant)
    parser.add_argument("--test-start", type=instant)
    parser.add_argument(
        "--allow-demo",
        action="store_true",
        help="Explicit demo-only mode; retains all timestamp availability checks",
    )
    parser.add_argument(
        "--mode", choices=("standard", "historical"), default="standard"
    )
    parser.add_argument("--target-season", type=int, action="append")
    parser.add_argument(
        "--audit-only",
        action="store_true",
        help="Historical data report without fitting models",
    )
    add_feature_arguments(parser)
    args = parser.parse_args()
    historical = args.mode == "historical"
    if historical:
        print(HISTORICAL_WARNING)
    if args.allow_demo:
        print(DEMO_WARNING)
    report = run(
        args.export,
        args.output,
        args.validation_start,
        args.test_start,
        allow_demo=args.allow_demo,
        historical=historical,
        target_seasons=set(args.target_season) if args.target_season else None,
        audit_only=args.audit_only,
        feature_config=config_from_arguments(args),
    )
    print(
        json.dumps(
            {
                "status": report["status"],
                **mode_metadata(args.allow_demo, historical),
                "audit": report.get("historical_audit", report["audit"]),
                "blockers": report.get("blockers", []),
                "skipped_models": report.get("skipped_models", {}),
            },
            indent=2,
            default=str,
        )
    )
    raise SystemExit(2 if report["status"] == "blocked" else 0)


if __name__ == "__main__":
    main()
