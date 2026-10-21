"""Calibration of a frozen, train-only estimator on a disjoint later period."""

from dataclasses import dataclass

import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.frozen import FrozenEstimator

from ml.data import CLASSES


@dataclass(frozen=True)
class CalibrationConfig:
    method: str = "none"
    min_samples: int = 30
    min_per_class: int = 2

    def __post_init__(self) -> None:
        if self.method not in ("none", "sigmoid"):
            raise ValueError("Calibration method must be none or sigmoid")
        if type(self.min_samples) is not int or self.min_samples < 3:
            raise ValueError(
                "Calibration requires a positive multiclass sample minimum"
            )
        if type(self.min_per_class) is not int or self.min_per_class < 1:
            raise ValueError("Calibration class minimum must be positive")

    @property
    def enabled(self) -> bool:
        return self.method != "none"


def calibration_blockers(
    labels: np.ndarray,
    train: list[int],
    calibration: list[int],
    config: CalibrationConfig,
) -> list[str]:
    if not config.enabled:
        return (
            ["Calibration rows provided while calibration is disabled"]
            if calibration
            else []
        )
    reasons = []
    if len(calibration) < config.min_samples:
        reasons.append(f"Calibration needs at least {config.min_samples} samples")
    for label in CLASSES:
        if not np.any(labels[train] == label):
            reasons.append(f"Base training lacks calibration class {label}")
        if np.sum(labels[calibration] == label) < config.min_per_class:
            reasons.append(
                f"Calibration class {label} needs at least {config.min_per_class} samples"
            )
    return reasons


def fit_model(
    model,
    matrix: np.ndarray,
    labels: np.ndarray,
    train: list[int],
    calibration: list[int],
    config: CalibrationConfig,
):
    if not train or set(train) & set(calibration):
        raise ValueError("Training must be nonempty and disjoint from calibration")
    if len(set(train)) != len(train) or len(set(calibration)) != len(calibration):
        raise ValueError("Duplicate model fitting indices")
    if any(i < 0 or i >= len(labels) for i in train + calibration):
        raise ValueError("Model fitting index outside dataset")
    if calibration and max(train) >= min(calibration):
        raise ValueError("Calibration indices must follow training chronologically")
    blockers = calibration_blockers(labels, train, calibration, config)
    if blockers:
        raise ValueError("; ".join(blockers))
    model.fit(matrix[train], labels[train])
    if not config.enabled:
        return model
    # FrozenEstimator.fit is a no-op in pinned sklearn 1.7.2, including preprocessing.
    # Explicit single chronological split avoids any implicit random/stratified CV.
    indices = np.arange(len(calibration))
    calibrated = CalibratedClassifierCV(
        FrozenEstimator(model),
        method="sigmoid",
        ensemble=False,
        cv=[(indices, indices)],
        n_jobs=1,
    )
    return calibrated.fit(matrix[calibration], labels[calibration])
