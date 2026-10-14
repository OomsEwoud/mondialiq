"""Validated export contract; identifiers are metadata, never predictors."""

import json
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

POLICY = "latest-recorded-state-v1"
CLASSES = ("A", "D", "H")


def instant(value: str) -> datetime:
    result = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if result.tzinfo is None:
        raise ValueError("Timestamps must include a timezone")
    return result.astimezone(timezone.utc)


@dataclass(frozen=True)
class Fixture:
    id: int
    external_id: int | None
    league_id: int
    season: int
    home_team_id: int
    away_team_id: int
    kickoff: datetime
    status_short: str | None
    home_goals: int | None
    away_goals: int | None
    observed_at: datetime | None

    @property
    def real(self) -> bool:
        return (
            self.external_id is not None
            and self.external_id > 0
            and not (99_000_000 <= self.external_id <= 99_000_999)
        )

    @property
    def demo(self) -> bool:
        return (
            self.external_id is not None
            and 99_000_000 <= self.external_id <= 99_000_999
        )

    def admitted(self, allow_demo: bool = False) -> bool:
        return self.demo if allow_demo else self.real

    @property
    def complete(self) -> bool:
        return self.real and self.result_complete

    @property
    def result_complete(self) -> bool:
        return (
            self.status_short == "FT"
            and all(
                type(score) is int and score >= 0
                for score in (self.home_goals, self.away_goals)
            )
            and self.home_team_id != self.away_team_id
        )

    @property
    def available_at(self) -> datetime | None:
        return self.available_for()

    def available_for(self, allow_demo: bool = False) -> datetime | None:
        if (
            not self.admitted(allow_demo)
            or not self.result_complete
            or self.observed_at is None
        ):
            return None
        # No final whistle timestamp exists. Buffer also excludes overlapping games.
        return max(self.observed_at, self.kickoff + timedelta(hours=4))

    @property
    def target(self) -> str:
        if not self.result_complete:
            raise ValueError("Fixture has no reliable regulation-time target")
        return (
            "H"
            if self.home_goals > self.away_goals
            else ("A" if self.home_goals < self.away_goals else "D")
        )


def read_export(path: Path) -> tuple[dict, list[Fixture]]:
    fixtures = []
    seen = set()
    external_seen = set()
    with path.open(encoding="utf-8-sig") as stream:
        header = json.loads(next(stream))
        if (
            header.get("schema_version") != 1
            or header.get("availability_policy") != POLICY
        ):
            raise ValueError("Unsupported export schema or availability policy")
        exported_at = instant(header["exported_at"])
        complete = False
        for line in stream:
            row = json.loads(line)
            if complete:
                raise ValueError("Unexpected data after export footer")
            if row.get("export_complete") is True:
                if row.get("row_count") != len(fixtures):
                    raise ValueError("Export row count mismatch")
                complete = True
                continue
            times = [
                instant(row[key])
                for key in ("created_at", "updated_at", "fixture_basics_synced_at")
                if row.get(key)
            ]
            fixture = Fixture(
                id=row["id"],
                external_id=row["external_id"],
                league_id=row["league_id"],
                season=row["season"],
                home_team_id=row["home_team_id"],
                away_team_id=row["away_team_id"],
                kickoff=instant(row["kickoff"]),
                status_short=row["status_short"],
                home_goals=row["fulltime_home_goals"],
                away_goals=row["fulltime_away_goals"],
                observed_at=max(times) if row.get("updated_at") else None,
            )
            if fixture.id in seen or (
                fixture.external_id is not None and fixture.external_id in external_seen
            ):
                raise ValueError("Duplicate fixture in export")
            if fixture.observed_at and fixture.observed_at > exported_at:
                raise ValueError(
                    "Export changed while reading; repeat export on a stable database"
                )
            seen.add(fixture.id)
            if fixture.external_id is not None:
                external_seen.add(fixture.external_id)
            fixtures.append(fixture)
        if not complete:
            raise ValueError("Incomplete export; repeat Laravel export")
    return header, sorted(fixtures, key=lambda item: (item.kickoff, item.id))
