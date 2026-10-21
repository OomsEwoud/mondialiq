"""Probability metrics in fixed A/D/H order, including reliability bin counts."""

import argparse
import json
from pathlib import Path

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    log_loss,
)

from ml.data import CLASSES
from ml.mode import check_mode


def probabilities_for(model, matrix: np.ndarray) -> np.ndarray:
    raw = model.predict_proba(matrix)
    result = np.zeros((len(matrix), len(CLASSES)))
    if raw.shape != (len(matrix), len(model.classes_)):
        raise ValueError("Estimator probability schema mismatch")
    for index, label in enumerate(model.classes_):
        if label not in CLASSES:
            raise ValueError("Unknown estimator class")
        result[:, CLASSES.index(label)] = raw[:, index]
    validate_probabilities(result)
    return result


def validate_probabilities(probabilities: np.ndarray) -> None:
    if (
        probabilities.ndim != 2
        or probabilities.shape[1] != 3
        or not np.isfinite(probabilities).all()
    ):
        raise ValueError("Expected finite N x 3 probabilities")
    if (
        (probabilities < 0).any()
        or (probabilities > 1).any()
        or not np.allclose(probabilities.sum(axis=1), 1, atol=1e-8, rtol=0)
    ):
        raise ValueError("Invalid probability bounds or sum")


def metrics(labels: np.ndarray, probabilities: np.ndarray) -> dict:
    validate_probabilities(probabilities)
    if labels.ndim != 1 or len(labels) == 0 or len(labels) != len(probabilities):
        raise ValueError("Expected nonempty aligned labels and probabilities")
    if not np.isin(labels, CLASSES).all():
        raise ValueError("Unknown outcome label")
    predicted = np.array(CLASSES)[probabilities.argmax(axis=1)]
    actual = np.column_stack([labels == label for label in CLASSES])
    reliability = {}
    for column, label in enumerate(CLASSES):
        bins = []
        membership = np.minimum((probabilities[:, column] * 10).astype(int), 9)
        for bucket in range(10):
            mask = membership == bucket
            if mask.any():
                bins.append(
                    {
                        "lower": bucket / 10,
                        "count": int(mask.sum()),
                        "mean_probability": float(probabilities[mask, column].mean()),
                        "observed_frequency": float(actual[mask, column].mean()),
                    }
                )
        reliability[label] = bins
    return {
        "missing_classes": [label for label in CLASSES if not np.any(labels == label)],
        "accuracy": float(accuracy_score(labels, predicted)),
        "macro_f1": float(
            f1_score(
                labels,
                predicted,
                labels=list(CLASSES),
                average="macro",
                zero_division=0,
            )
        ),
        "log_loss": float(log_loss(labels, probabilities, labels=list(CLASSES))),
        "brier": float(np.mean(np.sum((probabilities - actual) ** 2, axis=1))),
        "confusion_matrix": confusion_matrix(
            labels, predicted, labels=list(CLASSES)
        ).tolist(),
        "classification_report": classification_report(
            labels, predicted, labels=list(CLASSES), output_dict=True, zero_division=0
        ),
        "actual_distribution": {
            label: float(np.mean(labels == label)) for label in CLASSES
        },
        "predicted_distribution": {
            label: float(np.mean(predicted == label)) for label in CLASSES
        },
        "mean_probabilities": dict(zip(CLASSES, probabilities.mean(axis=0).tolist())),
        "reliability": reliability,
    }


SCALAR_METRICS = ("accuracy", "macro_f1", "log_loss", "brier")


def aggregate_metrics(fold_metrics: list[dict]) -> dict:
    """Equal fold weighting; spread is descriptive, not a confidence interval."""
    if not fold_metrics:
        raise ValueError("Cannot aggregate zero folds")
    return {
        name: {
            "mean": float(np.mean([fold[name] for fold in fold_metrics])),
            "std": float(np.std([fold[name] for fold in fold_metrics], ddof=0)),
            "min": float(min(fold[name] for fold in fold_metrics)),
            "max": float(max(fold[name] for fold in fold_metrics)),
            "fold_count": len(fold_metrics),
        }
        for name in SCALAR_METRICS
    }


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Re-evaluate saved holdout predictions"
    )
    parser.add_argument("predictions", type=Path)
    parser.add_argument("--allow-demo", action="store_true")
    parser.add_argument(
        "--mode", choices=("standard", "historical"), default="standard"
    )
    args = parser.parse_args()
    payload = json.loads(args.predictions.read_text(encoding="utf-8"))
    check_mode(payload, args.allow_demo, historical=args.mode == "historical")
    print(
        json.dumps(
            {
                "model_version": payload["model_version"],
                "training_mode": payload["training_mode"],
                "production_eligible": payload["production_eligible"],
                "dataset_type": payload["dataset_type"],
                "warning": payload["warning"],
                "metrics": {
                    name: metrics(np.array(payload["labels"]), np.array(values))
                    for name, values in payload["probabilities"].items()
                },
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
