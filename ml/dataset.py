"""Dataset diagnostics and chronological, availability-purged partitions."""

from collections import Counter
from datetime import datetime

import numpy as np

from ml.data import CLASSES, Fixture
from ml.features import FeatureBuilder
from ml.feature_registry import FeatureConfig
from ml.policy import available_at


def dataset(
    fixtures: list[Fixture],
    exported_at: datetime,
    allow_demo: bool = False,
    historical: bool = False,
    target_seasons: set[int] | None = None,
    feature_config: FeatureConfig | None = None,
) -> tuple[list[Fixture], list[str], np.ndarray]:
    builder = FeatureBuilder(
        fixtures, allow_demo=allow_demo, historical=historical, config=feature_config
    )
    if target_seasons and not historical:
        raise ValueError("Target seasons require historical mode")
    rows = [
        fixture
        for fixture in fixtures
        if available_at(fixture, allow_demo, historical) is not None
        and available_at(fixture, allow_demo, historical) < exported_at
        and (not target_seasons or fixture.season in target_seasons)
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
        if "home_all_5_count" in names and "away_all_5_count" in names
        else None,
    }


def split(
    rows: list[Fixture],
    validation_start: datetime,
    test_start: datetime,
    allow_demo: bool = False,
    historical: bool = False,
) -> dict[str, list[int]]:
    if validation_start >= test_start:
        raise ValueError("Validation must start before test")
    return {
        "train": [
            i
            for i, row in enumerate(rows)
            if row.kickoff < validation_start
            and available_at(row, allow_demo, historical) < validation_start
        ],
        "validation": [
            i
            for i, row in enumerate(rows)
            if validation_start <= row.kickoff < test_start
            and available_at(row, allow_demo, historical) < test_start
        ],
        "test": [i for i, row in enumerate(rows) if row.kickoff >= test_start],
    }


def training_blockers(
    rows: list[Fixture],
    partitions: dict[str, list[int]],
    names: list[str],
    matrix: np.ndarray,
    allow_demo: bool = False,
    historical: bool = False,
) -> list[str]:
    blockers = []
    minimums = (
        (("train", 1), ("validation", 1), ("test", 1))
        if allow_demo
        else (("train", 12), ("validation", 3), ("test", 3))
        if historical
        else (("train", 300), ("validation", 100), ("test", 100))
    )
    for name, minimum in minimums:
        indices = partitions[name]
        coverage = None
        if indices and names and not allow_demo and not historical:
            coverage = (matrix[indices, names.index("home_all_5_count")] >= 5) & (
                matrix[indices, names.index("away_all_5_count")] >= 5
            )
        blockers.extend(
            sample_blockers(
                rows,
                indices,
                name,
                minimum,
                class_minimum=0 if allow_demo or historical else 20,
                diversity=2 if historical and name == "train" else 0,
                coverage=coverage,
            )
        )
    return blockers


def demo_boundaries(rows: list[Fixture]) -> tuple[datetime, datetime] | None:
    dates = sorted({row.kickoff for row in rows})
    if len(dates) < 3:
        return None
    return dates[min(max(1, int(len(dates) * 0.6)), len(dates) - 2)], dates[
        min(max(2, int(len(dates) * 0.8)), len(dates) - 1)
    ]


def sample_blockers(
    rows: list[Fixture],
    indices: list[int],
    name: str,
    minimum: int,
    class_minimum: int = 0,
    diversity: int = 0,
    coverage: np.ndarray | None = None,
) -> list[str]:
    blockers = []
    if len(indices) < minimum:
        blockers.append(f"{name}: {len(indices)} rows; at least {minimum} required")
    counts = Counter(rows[i].target for i in indices)
    if diversity and len(counts) < diversity:
        blockers.append(f"{name}: at least two outcome classes required")
    if class_minimum:
        for label in CLASSES:
            if counts[label] < class_minimum:
                blockers.append(
                    f"{name}: class {label} has {counts[label]}; at least {class_minimum} required"
                )
    if coverage is not None and len(coverage) and coverage.mean() < 0.8:
        blockers.append(
            f"{name}: fewer than 80% of rows have five prior results for both teams"
        )
    return blockers
