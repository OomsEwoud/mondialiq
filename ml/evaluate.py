"""Walk-forward orchestration over the existing dataset, models and metrics."""

import argparse
from dataclasses import asdict, replace
from datetime import datetime, timezone
import hashlib
from importlib.metadata import version
import json
from pathlib import Path
import platform
from uuid import uuid4

import joblib
import numpy as np

from ml.calibration import calibration_blockers, fit_model
from ml.data import POLICY, instant, read_export
from ml.dataset import dataset, sample_blockers
from ml.evaluation import aggregate_metrics, metrics, probabilities_for
from ml.experiment_config import EvaluationConfig, read_config
from ml.feature_registry import (
    active_definitions,
    add_feature_arguments,
    config_from_arguments,
    feature_metadata,
)
from ml.features import FeatureBuilder
from ml.mode import mode_metadata
from ml.policy import HISTORICAL_POLICY, fixture_fingerprint, validate_mode
from ml.training import SEED, candidates, write_json
from ml.walk_forward import Fold, partition, validate_schedule


def digest(value: dict | list) -> str:
    return hashlib.sha256(
        json.dumps(value, sort_keys=True, default=str).encode()
    ).hexdigest()


def sample_summary(rows, indices: list[int]) -> dict:
    return {
        "fixture_ids": [rows[i].id for i in indices],
        "count": len(indices),
        "start": min((rows[i].kickoff.isoformat() for i in indices), default=None),
        "end": max((rows[i].kickoff.isoformat() for i in indices), default=None),
    }


def phase_quality(
    matrix: np.ndarray, names: list[str], coverage: np.ndarray, indices: list[int]
) -> dict:
    return {
        "count": len(indices),
        "both_teams_five_prior_results_fraction": float(coverage[indices].mean())
        if indices
        else None,
        "missing_fraction": {
            name: float(np.isnan(matrix[indices, column]).mean()) if indices else None
            for column, name in enumerate(names)
        },
    }


def fold_blockers(
    rows,
    labels,
    parts: dict,
    coverage: np.ndarray,
    config: EvaluationConfig,
    allow_demo: bool,
    historical: bool,
) -> list[str]:
    reasons = []
    for phase in ("train", "validation"):
        indices = parts[phase]
        minimum = (
            1
            if allow_demo
            else (
                (12 if phase == "train" else 3)
                if historical
                else (300 if phase == "train" else 100)
            )
        )
        reasons.extend(
            sample_blockers(
                rows,
                indices,
                phase,
                minimum,
                class_minimum=0 if historical or allow_demo else 20,
                diversity=2 if historical and phase == "train" else 0,
                coverage=coverage[indices]
                if not historical and not allow_demo
                else None,
            )
        )
    reasons.extend(
        calibration_blockers(
            labels, parts["train"], parts["calibration"], config.calibration
        )
    )
    return reasons


def run(
    source: Path,
    output: Path,
    config: EvaluationConfig,
    *,
    allow_demo: bool = False,
    historical: bool = False,
    dry_run: bool = False,
) -> dict:
    validate_mode(allow_demo, historical)
    if config.target_seasons and not historical:
        raise ValueError("Target seasons require historical mode")
    header, fixtures = read_export(source)
    validate_schedule(
        config.folds,
        config.final_test,
        instant(header["exported_at"]),
        config.calibration.enabled,
    )
    # Experiments change groups only; all numerical feature settings must match.
    settings = [
        {key: value for key, value in asdict(e.features).items() if key != "groups"}
        for e in config.experiments
    ]
    if not settings or any(item != settings[0] for item in settings):
        raise ValueError("Ablations require identical numerical feature settings")
    union_config = replace(
        config.experiments[0].features,
        groups=tuple(
            sorted({group for e in config.experiments for group in e.features.groups})
        ),
    )
    rows, union_names, matrix = dataset(
        fixtures,
        instant(header["exported_at"]),
        allow_demo,
        historical,
        set(config.target_seasons) or None,
        union_config,
    )
    if not rows:
        union_names = list(active_definitions(union_config))
        matrix = np.empty((0, len(union_names)))
    labels = np.array([row.target for row in rows])
    builder = FeatureBuilder(fixtures, allow_demo=allow_demo, historical=historical)
    coverage = np.array(
        [
            all(
                len(builder.source_history(row, team, row.kickoff)) >= 5
                for team in (row.home_team_id, row.away_team_id)
            )
            for row in rows
        ],
        dtype=bool,
    )
    plans = {
        fold.name: partition(rows, fold, allow_demo, historical)
        for fold in config.folds
    }
    resolved_config = asdict(config)
    resolved_config["target_seasons"] = sorted(config.target_seasons)
    metadata = {
        **mode_metadata(allow_demo, historical),
        "artifact_kind": "walk_forward_evaluation",
        "evaluation_schema_version": 1,
        "run_id": str(uuid4()),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "seed": SEED,
        "strategy": "expanding-window",
        "feature_set_version": feature_metadata(union_config)["feature_set_version"],
        "export": header,
        "dataset_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "fixture_fingerprint": fixture_fingerprint(fixtures),
        "target_fixture_ids": [row.id for row in rows],
        "availability_policy": HISTORICAL_POLICY if historical else POLICY,
        "evaluation_config": resolved_config,
        "evaluation_config_sha256": digest(resolved_config),
        "calibration_config": asdict(config.calibration),
        "model_configs": {
            name: {
                key: repr(value) for key, value in model.get_params(deep=True).items()
            }
            for name, model in candidates().items()
            if name in config.models
        },
        "python": platform.python_version(),
        "dependencies": {
            name: version(name)
            for name in ("numpy", "scipy", "scikit-learn", "joblib", "threadpoolctl")
        },
        "source_sha256": {
            path.name: hashlib.sha256(path.read_bytes()).hexdigest()
            for path in sorted(Path(__file__).parent.glob("*.py"))
        },
        "interpretation": "Technical evaluation only; no demonstrated real football quality or production approval.",
    }
    report = {
        **metadata,
        "status": "planned",
        "folds": [],
        "experiments": {},
        "blockers": [],
        "skipped_models": {},
    }
    for fold in config.folds:
        plan = plans[fold.name]
        report["folds"].append(
            {
                **fold.metadata(),
                "samples": {
                    phase: sample_summary(rows, indices)
                    for phase, indices in plan["indices"].items()
                },
                "purged_fixture_ids": plan["purged_fixture_ids"],
            }
        )
        report["blockers"].extend(
            f"{fold.name}: {reason}"
            for reason in fold_blockers(
                rows, labels, plan["indices"], coverage, config, allow_demo, historical
            )
        )
    report["folds_sha256"] = digest(report["folds"])
    if config.final_test:
        final_plan = partition(rows, config.final_test, allow_demo, historical)
        report["final_test"] = {
            **config.final_test.metadata(),
            "status": "reserved_not_evaluated",
            "samples": {
                phase: sample_summary(rows, indices)
                for phase, indices in final_plan["indices"].items()
            },
        }
    for name in config.models:
        if name in ("logistic_regression", "gradient_boosting"):
            deficient = [
                fold.name
                for fold in config.folds
                if len(set(labels[plans[fold.name]["indices"]["train"]])) < 2
            ]
            if deficient:
                report["skipped_models"][name] = (
                    f"Insufficient train class diversity in {', '.join(deficient)}; excluded from ALL fold comparisons"
                )
    matrices = {}
    for experiment in config.experiments:
        names = list(active_definitions(experiment.features))
        selected = matrix[:, [union_names.index(name) for name in names]]
        matrices[experiment.name] = selected
        report["experiments"][experiment.name] = {
            **feature_metadata(experiment.features),
            "features": names,
            "feature_count": len(names),
            "fold_quality": {
                fold.name: {
                    phase: phase_quality(selected, names, coverage, indices)
                    for phase, indices in plans[fold.name]["indices"].items()
                }
                for fold in config.folds
            },
            "models": {},
        }
    output.mkdir(parents=True, exist_ok=False)
    if report["blockers"]:
        report["status"] = "blocked"
    elif dry_run:
        report["status"] = "dry_run"
    write_json(output / "report.json", report)
    if report["status"] in ("blocked", "dry_run"):
        return report
    report["status"] = "running"
    write_json(output / "report.json", report)

    def fit_evaluate(experiment, name: str, fold: Fold, plan: dict, phase: str) -> dict:
        parts = plan["indices"]
        estimator = candidates()[name]
        model_config = {
            key: repr(value) for key, value in estimator.get_params(deep=True).items()
        }
        fitted = fit_model(
            estimator,
            matrices[experiment.name],
            labels,
            parts["train"],
            parts["calibration"],
            config.calibration,
        )
        probabilities = probabilities_for(
            fitted, matrices[experiment.name][parts["validation"]]
        )
        evaluated = metrics(labels[parts["validation"]], probabilities)
        calibration = {
            **asdict(config.calibration),
            "active": config.calibration.enabled,
            "period_start": fold.calibration_start.isoformat()
            if fold.calibration_start
            else None,
            "period_end_exclusive": fold.validation_start.isoformat()
            if fold.calibration_start
            else None,
            **sample_summary(rows, parts["calibration"]),
        }
        artifact = {
            **metadata,
            **feature_metadata(experiment.features),
            "features": report["experiments"][experiment.name]["features"],
            "experiment": experiment.name,
            "model_type": name,
            "model_config": model_config,
            "fold": fold.metadata(),
            "folds_sha256": report["folds_sha256"],
            "evaluation_phase": phase,
            "samples": {
                key: sample_summary(rows, indices) for key, indices in parts.items()
            },
            "purged_fixture_ids": plan["purged_fixture_ids"],
            "calibration": calibration,
            "metrics": evaluated,
            "estimator": fitted,
        }
        directory = output / experiment.name / name / fold.name
        directory.mkdir(parents=True, exist_ok=False)
        joblib.dump(artifact, directory / "model.joblib")
        write_json(
            directory / "metadata.json",
            {key: value for key, value in artifact.items() if key != "estimator"},
        )
        predictions = {
            **mode_metadata(allow_demo, historical),
            **feature_metadata(experiment.features),
            "features": artifact["features"],
            "run_id": metadata["run_id"],
            "evaluation_phase": phase,
            "fixture_ids": [rows[i].id for i in parts["validation"]],
            "labels": labels[parts["validation"]].tolist(),
            "probabilities": {name: probabilities.tolist()},
        }
        write_json(directory / "predictions.json", predictions)
        return {
            "fold": fold.name,
            "metrics": evaluated,
            "calibration": calibration,
            "samples": artifact["samples"],
            "model_config": model_config,
            "artifact": (directory / "model.joblib").relative_to(output).as_posix(),
            "predictions": (directory / "predictions.json")
            .relative_to(output)
            .as_posix(),
        }

    for experiment in config.experiments:
        for name in config.models:
            if name in report["skipped_models"]:
                continue
            results = [
                fit_evaluate(experiment, name, fold, plans[fold.name], "validation")
                for fold in config.folds
            ]
            report["experiments"][experiment.name]["models"][name] = {
                "folds": results,
                "aggregate": aggregate_metrics(
                    [result["metrics"] for result in results]
                ),
            }
        write_json(output / "report.json", report)
    for detail in report["experiments"].values():
        models = detail["models"]
        for name, result in models.items():
            result["baseline_comparison"] = {
                baseline: {
                    "mean_log_loss_difference": result["aggregate"]["log_loss"]["mean"]
                    - models[baseline]["aggregate"]["log_loss"]["mean"],
                    "folds_with_lower_log_loss": sum(
                        current["metrics"]["log_loss"]
                        < reference["metrics"]["log_loss"]
                        for current, reference in zip(
                            result["folds"], models[baseline]["folds"]
                        )
                    ),
                    "total_folds": len(result["folds"]),
                }
                for baseline in ("majority", "home_bias")
            }
    ranking = sorted(
        [
            {
                "experiment": experiment,
                "model": name,
                "mean_validation_log_loss": result["aggregate"]["log_loss"]["mean"],
                "std_validation_log_loss": result["aggregate"]["log_loss"]["std"],
            }
            for experiment, detail in report["experiments"].items()
            for name, result in detail["models"].items()
        ],
        key=lambda item: (
            item["mean_validation_log_loss"],
            item["experiment"],
            item["model"],
        ),
    )
    report["validation_ranking"] = ranking
    report["selected_on_validation"] = ranking[0]
    report["selection_rule"] = (
        "Lowest equally weighted fold mean log loss including both baselines; ties by experiment/model name"
    )
    report["status"] = "evaluated"
    # Persist and freeze the choice before accessing final test outcomes for evaluation.
    write_json(output / "report.json", report)
    if config.final_test:
        final_reasons = fold_blockers(
            rows,
            labels,
            final_plan["indices"],
            coverage,
            config,
            allow_demo,
            historical,
        )
        if final_reasons:
            report["final_test"].update(status="blocked", blockers=final_reasons)
            report["status"] = "final_test_blocked"
        else:
            selected = ranking[0]
            experiment = next(
                e for e in config.experiments if e.name == selected["experiment"]
            )
            report["final_test"].update(
                status="evaluated_once",
                result=fit_evaluate(
                    experiment,
                    selected["model"],
                    config.final_test,
                    final_plan,
                    "final_test",
                ),
            )
    write_json(output / "report.json", report)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export", type=Path)
    parser.add_argument("--experiment-config", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument(
        "--mode", choices=("standard", "historical"), default="standard"
    )
    parser.add_argument("--allow-demo", action="store_true")
    parser.add_argument(
        "--strategy", choices=("expanding-window",), default="expanding-window"
    )
    parser.add_argument("--dry-run", action="store_true")
    add_feature_arguments(parser)
    args = parser.parse_args()
    config = read_config(args.experiment_config, config_from_arguments(args))
    report = run(
        args.export,
        args.output,
        config,
        allow_demo=args.allow_demo,
        historical=args.mode == "historical",
        dry_run=args.dry_run,
    )
    print(
        json.dumps(
            {
                "status": report["status"],
                "run_id": report["run_id"],
                "warning": report["warning"],
                "folds_sha256": report["folds_sha256"],
                "blockers": report["blockers"],
                "report": str(args.output / "report.json"),
            },
            indent=2,
        )
    )
    raise SystemExit(2 if report["status"] in ("blocked", "final_test_blocked") else 0)


if __name__ == "__main__":
    main()
