"""Reproducible expanding-window boundaries and mode-aware label purging."""

from dataclasses import dataclass
from datetime import datetime

from ml.data import Fixture, instant
from ml.policy import available_at, validate_mode


@dataclass(frozen=True)
class Fold:
    name: str
    validation_start: datetime
    validation_end: datetime
    calibration_start: datetime | None = None

    def __post_init__(self) -> None:
        boundaries = [self.validation_start, self.validation_end]
        if self.calibration_start is not None:
            boundaries.insert(0, self.calibration_start)
        if any(boundary.tzinfo is None for boundary in boundaries):
            raise ValueError("Fold timestamps must be timezone-aware")
        if any(left >= right for left, right in zip(boundaries, boundaries[1:])):
            raise ValueError("Fold boundaries must increase strictly")

    @property
    def fit_before(self) -> datetime:
        return self.calibration_start or self.validation_start

    def metadata(self) -> dict:
        return {
            "name": self.name,
            "train_end_exclusive": self.fit_before.isoformat(),
            "calibration_start": self.calibration_start.isoformat()
            if self.calibration_start
            else None,
            "validation_start": self.validation_start.isoformat(),
            "validation_end_exclusive": self.validation_end.isoformat(),
        }


def parse_fold(raw: dict, name: str) -> Fold:
    if set(raw) - {"validation_start", "validation_end", "calibration_start"}:
        raise ValueError("Unknown fold configuration field")
    return Fold(
        name,
        instant(raw["validation_start"]),
        instant(raw["validation_end"]),
        instant(raw["calibration_start"]) if raw.get("calibration_start") else None,
    )


def validate_schedule(
    folds: tuple[Fold, ...], final: Fold | None, exported_at: datetime, calibrated: bool
) -> None:
    if len(folds) < 2:
        raise ValueError("At least two walk-forward validation folds required")
    for previous, current in zip(folds, folds[1:]):
        if (
            previous.validation_end > current.validation_start
            or previous.fit_before >= current.fit_before
        ):
            raise ValueError(
                "Validation folds must not overlap and training windows must expand"
            )
    if final and folds[-1].validation_end > final.fit_before:
        raise ValueError(
            "Final test training/calibration boundary must follow all validation periods"
        )
    for fold in (*folds, *((final,) if final else ())):
        if fold.validation_end > exported_at:
            raise ValueError("Evaluation period extends beyond export time")
        if (fold.calibration_start is not None) != calibrated:
            raise ValueError(
                "Each fold requires calibration_start exactly when calibration is enabled"
            )


def partition(
    rows: list[Fixture], fold: Fold, allow_demo: bool = False, historical: bool = False
) -> dict:
    validate_mode(allow_demo, historical)
    selected = {"train": [], "calibration": [], "validation": []}
    purged = {name: [] for name in selected}
    for index, fixture in enumerate(rows):
        if fixture.kickoff < fold.fit_before:
            phase, deadline = "train", fold.fit_before
        elif fold.calibration_start and fixture.kickoff < fold.validation_start:
            phase, deadline = "calibration", fold.validation_start
        elif fold.validation_start <= fixture.kickoff < fold.validation_end:
            phase, deadline = "validation", fold.validation_end
        else:
            continue
        ready = available_at(fixture, allow_demo, historical)
        if ready is not None and ready < deadline:
            selected[phase].append(index)
        else:
            purged[phase].append(fixture.id)
    return {"indices": selected, "purged_fixture_ids": purged}
