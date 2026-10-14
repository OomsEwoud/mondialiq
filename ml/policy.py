"""Narrow historical result policy; never admits provider snapshots."""

import hashlib
import json
from dataclasses import asdict
from datetime import datetime, timedelta

from ml.data import Fixture

HISTORICAL_POLICY = "historical-ft-results-v1"


def validate_mode(allow_demo: bool, historical: bool) -> None:
    if allow_demo and historical:
        raise ValueError("Historical and demo modes are mutually exclusive")


def result_exclusion(fixture: Fixture) -> str | None:
    if fixture.demo:
        return "demo"
    if not fixture.real:
        return "unknown_provenance"
    if fixture.status_short != "FT":
        return "status"
    if not all(
        type(s) is int and s >= 0 for s in (fixture.home_goals, fixture.away_goals)
    ):
        return "missing_or_invalid_scores"
    if fixture.home_team_id == fixture.away_team_id:
        return "invalid_teams"
    return None


def available_at(
    fixture: Fixture, allow_demo: bool = False, historical: bool = False
) -> datetime | None:
    validate_mode(allow_demo, historical)
    if not historical:
        return fixture.available_for(allow_demo)
    if result_exclusion(fixture):
        return None
    # Retrospective assumption, not proof of historical provider publication.
    # Retain the conservative completion buffer to exclude overlapping matches.
    return fixture.kickoff + timedelta(hours=4)


def fixture_fingerprint(fixtures: list[Fixture]) -> str:
    payload = [asdict(f) for f in sorted(fixtures, key=lambda item: item.id)]
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, default=str).encode()
    ).hexdigest()
