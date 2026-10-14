"""One shared feature builder for historical rows and pre-match inference."""

from collections import defaultdict
from datetime import datetime, timedelta
from math import nan

from ml.data import Fixture

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
    def __init__(self, fixtures: list[Fixture], allow_demo: bool = False):
        self.allow_demo = allow_demo
        self.history = defaultdict(list)
        for fixture in sorted(fixtures, key=lambda item: (item.kickoff, item.id)):
            if fixture.available_for(allow_demo) is not None:
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
            and item.available_for(self.allow_demo) < cutoff
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
                    "available_at": item.available_for(self.allow_demo).isoformat(),
                    "venue": "home" if item.home_team_id == team else "away",
                }
                for item in history
            ]
        return {
            "fixture_id": fixture.id,
            "kickoff": fixture.kickoff.isoformat(),
            "cutoff_time": cutoff.isoformat(),
            "source_history": sources,
            "features": {
                name: None if value != value else value
                for name, value in self.build(fixture, cutoff).items()
            },
        }

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
