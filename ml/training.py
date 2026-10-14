"""Offline reproducible training. No DB connection, network or automatic split."""

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
from ml.mode import DEMO_WARNING, mode_metadata

SEED = 20261013


def candidates() -> dict:
    def pipeline(model):
        return make_pipeline(
            SimpleImputer(
                strategy="median", add_indicator=True, keep_empty_features=True
            ),
            StandardScaler(),
            model,
        )

    return {
        "majority": DummyClassifier(strategy="most_frequent"),
        "home_bias": DummyClassifier(strategy="prior"),
        "logistic_regression": pipeline(
            LogisticRegression(solver="lbfgs", max_iter=2000, C=1.0, random_state=SEED)
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
) -> dict:
    output.mkdir(parents=True, exist_ok=False)
    header, fixtures = read_export(source)
    rows, names, matrix = dataset(
        fixtures, instant(header["exported_at"]), allow_demo=allow_demo
    )
    report = {
        **mode_metadata(allow_demo),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "seed": SEED,
        "export": header,
        "dataset_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "availability_policy": POLICY,
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
        minimum = 3 if allow_demo else 500
        if len(rows) < minimum:
            blockers.insert(
                0,
                f"Only {len(rows)} usable fixtures; at least {minimum} required before splitting.",
            )
        report.update(status="blocked", blockers=blockers)
        write_json(output / "report.json", report)
        return report
    partitions = split(rows, validation_start, test_start, allow_demo=allow_demo)
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
    blockers = training_blockers(rows, partitions, names, matrix, allow_demo=allow_demo)
    if blockers:
        report.update(status="blocked", blockers=blockers)
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
        if not allow_demo and tuple(model.classes_) != CLASSES:
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
    report["status"] = "demo_only" if allow_demo else "experimental_candidate"
    report["beats_test_baselines"] = all(
        report["test"][selected]["log_loss"] < report["test"][name]["log_loss"]
        for name in ("majority", "home_bias")
    )
    artifact = {
        "estimator": models[selected],
        "features": names,
        **mode_metadata(allow_demo),
        "model_type": selected,
        "trained_at": report["trained_at"],
        "fixture_count": len(rows),
        "partitions": report["partitions"],
        "metrics": {"validation": report["validation"], "test": report["test"]},
        "availability_policy": POLICY,
        "trained_through": validation_start.isoformat(),
        "selected_through": test_start.isoformat(),
        "dataset_sha256": report["dataset_sha256"],
        "dependencies": report["dependencies"],
        "source_sha256": report["source_sha256"],
        "status": report["status"],
    }
    joblib.dump(artifact, output / "model.joblib")
    report["artifact_produced"] = True
    write_json(
        output / "test-predictions.json",
        {
            **mode_metadata(allow_demo),
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
    args = parser.parse_args()
    if args.allow_demo:
        print(DEMO_WARNING)
    report = run(
        args.export,
        args.output,
        args.validation_start,
        args.test_start,
        allow_demo=args.allow_demo,
    )
    print(
        json.dumps(
            {
                "status": report["status"],
                **mode_metadata(args.allow_demo),
                "audit": report["audit"],
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
