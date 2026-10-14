"""One shared feature builder for historical rows and pre-match inference."""

from collections import defaultdict
from datetime import datetime, timedelta
from math import nan

from ml.data import Fixture
from ml.policy import available_at, result_exclusion, validate_mode

WINDOWS = (5, 10)
RATES = (
    "points",
    "wins",
    "draws",
    "losses",
    "goals_for",
    "goals_against",
    "goal_difference",
)


class FeatureBuilder:
    def __init__(
        self,
        fixtures: list[Fixture],
        allow_demo: bool = False,
        historical: bool = False,
    ):
        validate_mode(allow_demo, historical)
        self.historical = historical
        self.fixtures = fixtures
        self.allow_demo = allow_demo
        self.history = defaultdict(list)
        for fixture in sorted(fixtures, key=lambda item: (item.kickoff, item.id)):
            if available_at(fixture, allow_demo, historical) is not None:
                for team in (fixture.home_team_id, fixture.away_team_id):
                    self.history[team].append(fixture)

    def build(self, fixture: Fixture, cutoff: datetime) -> dict[str, float]:
        if cutoff.tzinfo is None or cutoff > fixture.kickoff:
            raise ValueError("Cutoff must be timezone-aware and no later than kickoff")
        features = {}
        for side, team in (
            ("home", fixture.home_team_id),
            ("away", fixture.away_team_id),
        ):
            history = self.source_history(fixture, team, cutoff)
            venue_history = [
                item
                for item in history
                if (
                    item.home_team_id == team
                    if side == "home"
                    else item.away_team_id == team
                )
            ]
            for context, games in (("all", history), ("venue", venue_history)):
                for window in WINDOWS:
                    features.update(
                        self._rolling(
                            games[-window:], team, f"{side}_{context}_{window}"
                        )
                    )
            features[f"{side}_rest_days"] = (
                (fixture.kickoff - history[-1].kickoff).total_seconds() / 86400
                if history
                else nan
            )
            for days in (7, 14):
                features[f"{side}_played_{days}d"] = float(
                    sum(
                        item.kickoff >= cutoff - timedelta(days=days)
                        for item in history
                    )
                )
        for window in WINDOWS:
            for rate in RATES:
                name = f"all_{window}_{rate}"
                features[f"difference_{window}_{rate}"] = (
                    features[f"home_{name}"] - features[f"away_{name}"]
                )
        features["difference_rest_days"] = (
            features["home_rest_days"] - features["away_rest_days"]
        )
        return features

    def source_history(
        self, fixture: Fixture, team: int, cutoff: datetime
    ) -> list[Fixture]:
        if cutoff.tzinfo is None or cutoff > fixture.kickoff:
            raise ValueError("Cutoff must be timezone-aware and no later than kickoff")
        return [
            item
            for item in self.history[team]
            if item.id != fixture.id
            and item.kickoff < cutoff
            and available_at(item, self.allow_demo, self.historical) < cutoff
            and item.kickoff >= cutoff - timedelta(days=730)
        ]

    def snapshot(self, fixture: Fixture, cutoff: datetime) -> dict:
        sources = {}
        for side, team in (
            ("home", fixture.home_team_id),
            ("away", fixture.away_team_id),
        ):
            history = self.source_history(fixture, team, cutoff)
            sources[side] = [
                {
                    "fixture_id": item.id,
                    "home_team_id": item.home_team_id,
                    "away_team_id": item.away_team_id,
                    "home_goals": item.home_goals,
                    "away_goals": item.away_goals,
                    "kickoff": item.kickoff.isoformat(),
                    "available_at": available_at(
                        item, self.allow_demo, self.historical
                    ).isoformat(),
                    "venue": "home" if item.home_team_id == team else "away",
                    "eligibility_reason": "earlier reliable FT result with completion buffer"
                    if self.historical
                    else "observed before cutoff",
                    "observed_at": item.observed_at.isoformat()
                    if item.observed_at
                    else None,
                }
                for item in history
            ]
        return {
            "fixture_id": fixture.id,
            "kickoff": fixture.kickoff.isoformat(),
            "cutoff_time": cutoff.isoformat(),
            "source_history": sources,
            "excluded_sources": self.excluded_sources(fixture, cutoff)
            if self.historical
            else {},
            "features": {
                name: None if value != value else value
                for name, value in self.build(fixture, cutoff).items()
            },
        }

    def excluded_sources(self, fixture: Fixture, cutoff: datetime) -> dict:
        excluded = {}
        for side, team in (
            ("home", fixture.home_team_id),
            ("away", fixture.away_team_id),
        ):
            items = []
            for item in self.fixtures:
                if team not in (item.home_team_id, item.away_team_id):
                    continue
                reason = result_exclusion(item)
                if item.id == fixture.id:
                    reason = "current_fixture"
                elif item.kickoff >= cutoff:
                    reason = "same_or_later_kickoff"
                elif reason is None and available_at(item, historical=True) >= cutoff:
                    reason = "completion_buffer"
                elif reason is None and item.kickoff < cutoff - timedelta(days=730):
                    reason = "outside_730_day_window"
                if reason:
                    items.append(
                        {
                            "fixture_id": item.id,
                            "kickoff": item.kickoff.isoformat(),
                            "reason": reason,
                        }
                    )
            excluded[side] = items
        return excluded

    @staticmethod
    def _rolling(games: list[Fixture], team: int, prefix: str) -> dict[str, float]:
        result = {f"{prefix}_count": float(len(games))}
        totals = dict.fromkeys(RATES, 0.0)
        for game in games:
            scored, conceded = (
                (game.home_goals, game.away_goals)
                if game.home_team_id == team
                else (game.away_goals, game.home_goals)
            )
            totals["points"] += 3 if scored > conceded else int(scored == conceded)
            totals["wins"] += scored > conceded
            totals["draws"] += scored == conceded
            totals["losses"] += scored < conceded
            totals["goals_for"] += scored
            totals["goals_against"] += conceded
            totals["goal_difference"] += scored - conceded
        result.update(
            {
                f"{prefix}_{key}": value / len(games) if games else nan
                for key, value in totals.items()
            }
        )
        return result
