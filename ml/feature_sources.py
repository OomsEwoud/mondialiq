"""Explicit future statistic input contract; no reader for mutable DB snapshots."""

from dataclasses import dataclass
from datetime import datetime
from math import isfinite, nan

from ml.data import Fixture
from ml.feature_registry import STATISTICS


@dataclass(frozen=True)
class StatisticObservation:
    fixture_id: int
    team_id: int
    metric: str
    value: float | None
    observed_at: datetime
    provenance: str

    def __post_init__(self) -> None:
        if self.metric not in STATISTICS or self.observed_at.tzinfo is None:
            raise ValueError("Unknown statistic or naive observation timestamp")
        if self.provenance != "verified_final_fixture_statistics_v1":
            raise ValueError("Unverified fixture-statistics provenance")
        if self.value is not None and (
            not isfinite(self.value)
            or self.value < 0
            or (self.metric == "possession" and self.value > 100)
        ):
            raise ValueError("Invalid statistic value; use None for unknown")


def statistics_features(
    games: list[Fixture],
    team: int,
    side: str,
    cutoff: datetime,
    observations: tuple[StatisticObservation, ...],
    historical: bool,
) -> tuple[dict[str, float], dict[str, list[int]]]:
    # Caller passes only eligible final results BEFORE target cutoff.
    eligible = {g.id for g in games[-5:]}
    values, sources = {}, {}
    for metric in STATISTICS:
        admitted = [
            o
            for o in observations
            if o.fixture_id in eligible
            and o.team_id == team
            and o.metric == metric
            and o.value is not None
            and (historical or o.observed_at < cutoff)
        ]
        prefix = f"{side}_stats_5_{metric}"
        values[prefix] = (
            sum(o.value for o in admitted) / len(admitted) if admitted else nan
        )
        values[f"{prefix}_count"] = float(len(admitted))
        sources[prefix] = sources[f"{prefix}_count"] = [o.fixture_id for o in admitted]
    return values, sources
