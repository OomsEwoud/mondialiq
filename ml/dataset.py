"""Dataset diagnostics and chronological, availability-purged partitions."""

from collections import Counter
from datetime import datetime

import numpy as np

from ml.data import CLASSES, Fixture
from ml.features import FeatureBuilder


def dataset(
    fixtures: list[Fixture], exported_at: datetime, allow_demo: bool = False
) -> tuple[list[Fixture], list[str], np.ndarray]:
    builder = FeatureBuilder(fixtures, allow_demo=allow_demo)
    rows = [
        fixture
        for fixture in fixtures
        if fixture.available_for(allow_demo) is not None
        and fixture.available_for(allow_demo) < exported_at
    ]
    names = sorted(builder.build(rows[0], rows[0].kickoff)) if rows else []
    snapshots = [builder.build(row, row.kickoff) for row in rows]
    matrix = np.array(
        [[snapshot[name] for name in names] for snapshot in snapshots], dtype=float
    ).reshape(len(rows), len(names))
    return rows, names, matrix


def audit(
    fixtures: list[Fixture],
    rows: list[Fixture],
    names: list[str],
    matrix: np.ndarray,
    allow_demo: bool = False,
) -> dict:
    groups = {}
    eligible = {row.id for row in rows}
    for fixture in fixtures:
        key = f"{fixture.league_id}:{fixture.season}"
        group = groups.setdefault(
            key, {"total": 0, "finished": 0, "usable": 0, "outcomes": Counter()}
        )
        group["total"] += 1
        group["finished"] += fixture.status_short in ("FT", "AET", "PEN")
        if fixture.id in eligible:
            group["usable"] += 1
            group["outcomes"][fixture.target] += 1
    return {
        "total": len(fixtures),
        "finished": sum(f.status_short in ("FT", "AET", "PEN") for f in fixtures),
        "excluded_by_mode": sum(not f.admitted(allow_demo) for f in fixtures),
        "usable": len(rows),
        "feature_rows": len(matrix),
        "league_seasons": groups,
        "outcomes": dict(Counter(row.target for row in rows)),
        "missing_fraction": {
            name: float(np.isnan(matrix[:, i]).mean()) for i, name in enumerate(names)
        },
        "cold_start_rows": int(
            np.sum(
                (matrix[:, names.index("home_all_5_count")] == 0)
                | (matrix[:, names.index("away_all_5_count")] == 0)
            )
        )
        if names
        else 0,
    }


def split(
    rows: list[Fixture],
    validation_start: datetime,
    test_start: datetime,
    allow_demo: bool = False,
) -> dict[str, list[int]]:
    if validation_start >= test_start:
        raise ValueError("Validation must start before test")
    return {
        "train": [
            i
            for i, row in enumerate(rows)
            if row.kickoff < validation_start
            and row.available_for(allow_demo) < validation_start
        ],
        "validation": [
            i
            for i, row in enumerate(rows)
            if validation_start <= row.kickoff < test_start
            and row.available_for(allow_demo) < test_start
        ],
        "test": [i for i, row in enumerate(rows) if row.kickoff >= test_start],
    }


def training_blockers(
    rows: list[Fixture],
    partitions: dict[str, list[int]],
    names: list[str],
    matrix: np.ndarray,
    allow_demo: bool = False,
) -> list[str]:
    blockers = []
    minimums = (
        (("train", 1), ("validation", 1), ("test", 1))
        if allow_demo
        else (("train", 300), ("validation", 100), ("test", 100))
    )
    for name, minimum in minimums:
        indices = partitions[name]
        if len(indices) < minimum:
            blockers.append(f"{name}: {len(indices)} rows; at least {minimum} required")
        counts = Counter(rows[i].target for i in indices)
        for label in () if allow_demo else CLASSES:
            if counts[label] < 20:
                blockers.append(
                    f"{name}: class {label} has {counts[label]}; at least 20 required"
                )
        if indices and names and not allow_demo:
            covered = (matrix[indices, names.index("home_all_5_count")] >= 5) & (
                matrix[indices, names.index("away_all_5_count")] >= 5
            )
            if covered.mean() < 0.8:
                blockers.append(
                    f"{name}: fewer than 80% of rows have five prior results for both teams"
                )
    return blockers


def demo_boundaries(rows: list[Fixture]) -> tuple[datetime, datetime] | None:
    dates = sorted({row.kickoff for row in rows})
    if len(dates) < 3:
        return None
    return dates[min(max(1, int(len(dates) * 0.6)), len(dates) - 2)], dates[
        min(max(2, int(len(dates) * 0.8)), len(dates) - 1)
    ]
