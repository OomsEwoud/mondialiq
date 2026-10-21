"""Versioned, predefined experiments. No search space or data-driven feature choice."""

from dataclasses import dataclass, replace
from pathlib import Path
import json
import re

from ml.calibration import CalibrationConfig
from ml.feature_registry import FeatureConfig, VERSION
from ml.walk_forward import Fold, parse_fold

MODEL_NAMES = (
    "majority",
    "home_bias",
    "logistic_regression",
    "random_forest",
    "gradient_boosting",
)


@dataclass(frozen=True)
class Experiment:
    name: str
    features: FeatureConfig


@dataclass(frozen=True)
class EvaluationConfig:
    experiments: tuple[Experiment, ...]
    folds: tuple[Fold, ...]
    calibration: CalibrationConfig
    models: tuple[str, ...] = MODEL_NAMES
    target_seasons: frozenset[int] = frozenset()
    final_test: Fold | None = None


def parse_config(raw: dict, features: FeatureConfig) -> EvaluationConfig:
    allowed = {
        "schema_version",
        "feature_set_version",
        "strategy",
        "experiments",
        "folds",
        "calibration",
        "models",
        "target_seasons",
        "final_test",
    }
    if set(raw) - allowed or raw.get("schema_version") != 1:
        raise ValueError("Unsupported evaluation config schema")
    if raw.get("feature_set_version") != VERSION:
        raise ValueError("Evaluation feature-set version mismatch")
    if raw.get("strategy") != "expanding-window":
        raise ValueError("Only expanding-window evaluation is supported")
    experiments = []
    for item in raw["experiments"]:
        if set(item) - {"name", "groups"} or not re.fullmatch(
            r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}", item["name"]
        ):
            raise ValueError("Invalid experiment name or configuration")
        config = (
            replace(features, groups=tuple(item["groups"]))
            if "groups" in item
            else features
        )
        experiments.append(Experiment(item["name"], config))
    if not experiments or len({e.name for e in experiments}) != len(experiments):
        raise ValueError("Experiment names must be nonempty and unique")
    models = tuple(raw.get("models", MODEL_NAMES))
    if (
        len(set(models)) != len(models)
        or set(models) - set(MODEL_NAMES)
        or not {"majority", "home_bias"} <= set(models)
    ):
        raise ValueError("Use known unique models and retain both simple baselines")
    folds = tuple(
        parse_fold(item, f"fold-{index + 1:02d}")
        for index, item in enumerate(raw["folds"])
    )
    final = None
    if raw.get("final_test"):
        spec = raw["final_test"]
        if set(spec) - {"start", "end", "calibration_start"}:
            raise ValueError("Unknown final test setting")
        final = parse_fold(
            {
                "validation_start": spec["start"],
                "validation_end": spec["end"],
                "calibration_start": spec.get("calibration_start"),
            },
            "final-test",
        )
    seasons = raw.get("target_seasons", [])
    if any(type(season) is not int for season in seasons):
        raise ValueError("Target seasons must be integers")
    return EvaluationConfig(
        tuple(experiments),
        folds,
        CalibrationConfig(**raw.get("calibration", {})),
        models,
        frozenset(seasons),
        final,
    )


def read_config(path: Path, features: FeatureConfig) -> EvaluationConfig:
    return parse_config(json.loads(path.read_text(encoding="utf-8-sig")), features)
