"""One shared feature builder for historical rows and pre-match inference."""

from collections import defaultdict
from datetime import datetime, timedelta
from math import nan, isfinite

from ml.data import Fixture
from ml.policy import available_at, result_exclusion, validate_mode
from ml.feature_registry import (
    FeatureConfig,
    REGISTRY,
    WINDOWS,
    STREAKS,
    active_definitions,
    feature_metadata,
)
from ml.football_context import elo_snapshot, league_features, score_for
from ml.feature_sources import StatisticObservation, statistics_features

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
        config: FeatureConfig | None = None,
        statistics: tuple[StatisticObservation, ...] = (),
    ):
        validate_mode(allow_demo, historical)
        self.config = config or FeatureConfig()
        self.definitions = active_definitions(self.config)
        self.statistics = statistics
        identities = [(o.fixture_id, o.team_id, o.metric) for o in statistics]
        if len(identities) != len(set(identities)):
            raise ValueError("Duplicate statistic observation")
        indexed = {f.id: f for f in fixtures}
        for observation in statistics:
            source = indexed.get(observation.fixture_id)
            if source is None or observation.team_id not in (
                source.home_team_id,
                source.away_team_id,
            ):
                raise ValueError("Statistic must belong to an exported fixture team")
        self.historical = historical
        self.fixtures = fixtures
        self.allow_demo = allow_demo
        self.history = defaultdict(list)
        for fixture in sorted(fixtures, key=lambda item: (item.kickoff, item.id)):
            if available_at(fixture, allow_demo, historical) is not None:
                for team in (fixture.home_team_id, fixture.away_team_id):
                    self.history[team].append(fixture)

    def build(self, fixture: Fixture, cutoff: datetime) -> dict[str, float]:
        return self._compute(fixture, cutoff)[0]

    def eligible_results(self, fixture: Fixture, cutoff: datetime) -> list[Fixture]:
        if cutoff.tzinfo is None or cutoff > fixture.kickoff:
            raise ValueError("Cutoff must be timezone-aware and no later than kickoff")
        return sorted(
            [
                item
                for item in self.fixtures
                if item.id != fixture.id
                and item.kickoff < cutoff
                and available_at(item, self.allow_demo, self.historical) is not None
                and available_at(item, self.allow_demo, self.historical) < cutoff
            ],
            key=lambda item: (item.kickoff, item.id),
        )

    def _compute(self, fixture: Fixture, cutoff: datetime) -> tuple[dict, dict, dict]:
        eligible = self.eligible_results(fixture, cutoff)
        values, traces = {}, {}

        def record(features: dict, games: list[Fixture]) -> None:
            values.update(features)
            for name in features:
                traces[name] = [game.id for game in games]

        histories = {}
        for side, team in (
            ("home", fixture.home_team_id),
            ("away", fixture.away_team_id),
        ):
            history = self.source_history(fixture, team, cutoff)
            histories[side] = history
            venue_history = [
                item
                for item in history
                if (item.home_team_id if side == "home" else item.away_team_id) == team
            ]
            for context, games in (("all", history), ("venue", venue_history)):
                for window in WINDOWS:
                    record(
                        self._rolling(
                            games[-window:], team, f"{side}_{context}_{window}"
                        ),
                        games[-window:],
                    )
            rest = (
                (fixture.kickoff - history[-1].kickoff).total_seconds() / 86400
                if history
                else nan
            )
            record(
                {
                    f"{side}_rest_days": rest,
                    f"{side}_long_rest": float(rest > 30) if history else nan,
                },
                history[-1:],
            )
            for days in (7, 14, 21):
                games = [
                    item
                    for item in history
                    if item.kickoff >= cutoff - timedelta(days=days)
                ]
                record({f"{side}_played_{days}d": float(len(games))}, games)
            record(
                {
                    f"{side}_available_history_count": float(len(history)),
                    f"{side}_venue_history_count": float(len(venue_history)),
                    f"{side}_insufficient_history": float(len(history) < 5),
                },
                history,
            )
            traces[f"{side}_venue_history_count"] = [g.id for g in venue_history]
            for streak in STREAKS:
                streak_games = []
                for game in reversed(history[-self.config.streak_cap :]):
                    scored, conceded = score_for(game, team)
                    condition = {
                        "unbeaten": scored >= conceded,
                        "win": scored > conceded,
                        "losing": scored < conceded,
                        "draw": scored == conceded,
                        "scoring": scored > 0,
                        "clean_sheet": conceded == 0,
                        "conceding": conceded > 0,
                        "failed_to_score": scored == 0,
                    }[streak]
                    streak_games.append(game)
                    if not condition:
                        break
                count = len(streak_games) - int(bool(streak_games) and not condition)
                record(
                    {f"{side}_{streak}_streak": float(count) if history else nan},
                    streak_games,
                )
            if "match_statistics" in self.config.groups:
                stats, sources = statistics_features(
                    history, team, side, cutoff, self.statistics, self.historical
                )
                values.update(stats)
                traces.update(sources)
        for window in (3, 5):
            meetings = [
                g
                for g in histories["home"]
                if {g.home_team_id, g.away_team_id}
                == {fixture.home_team_id, fixture.away_team_id}
            ][-window:]
            pairs = [score_for(g, fixture.home_team_id) for g in meetings]
            record(
                {
                    f"h2h_{window}_count": float(len(pairs)),
                    f"h2h_{window}_home_wins": float(sum(a > b for a, b in pairs))
                    if pairs
                    else nan,
                    f"h2h_{window}_draws": float(sum(a == b for a, b in pairs))
                    if pairs
                    else nan,
                    f"h2h_{window}_away_wins": float(sum(a < b for a, b in pairs))
                    if pairs
                    else nan,
                    f"h2h_{window}_home_goals": float(sum(a for a, _ in pairs))
                    if pairs
                    else nan,
                    f"h2h_{window}_away_goals": float(sum(b for _, b in pairs))
                    if pairs
                    else nan,
                    f"h2h_{window}_total_goals_mean": sum(a + b for a, b in pairs)
                    / len(pairs)
                    if pairs
                    else nan,
                },
                meetings,
            )
        league_games = [
            g
            for g in eligible
            if (g.league_id, g.season) == (fixture.league_id, fixture.season)
        ]
        league_values, table = league_features(league_games, fixture, self.config)
        record(league_values, league_games)
        elo = elo_snapshot(eligible, fixture, self.config)
        values.update(elo["features"])
        for name in elo["features"]:
            traces[name] = elo["source_fixture_ids"]
        for name, definition in REGISTRY.items():
            if not definition.dependencies:
                continue
            left, right = (values[key] for key in definition.dependencies)
            if definition.family == "ratios":
                values[name] = (
                    left / right
                    if isfinite(left) and isfinite(right) and right > 0
                    else nan
                )
            else:
                values[name] = left - right
            traces[name] = sorted(
                {source for key in definition.dependencies for source in traces[key]}
            )
        selected = {name: values[name] for name in self.definitions}
        return (
            selected,
            traces,
            {
                "elo": elo,
                "reconstructed_table": table,
                "table_source_fixture_ids": [g.id for g in league_games],
                "cutoff": cutoff.isoformat(),
            },
        )

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
        values, traces, contexts = self._compute(fixture, cutoff)
        return {
            **feature_metadata(self.config),
            "feature_details": {
                name: {
                    "value": value if isfinite(value) else None,
                    "family": self.definitions[name].family,
                    "source": self.definitions[name].source,
                    "window": self.definitions[name].window,
                    "available": isfinite(value),
                    "source_fixture_ids": traces[name],
                    "missingness": self.definitions[name].missingness,
                }
                for name, value in values.items()
            },
            "contexts": contexts,
            "fixture_id": fixture.id,
            "kickoff": fixture.kickoff.isoformat(),
            "cutoff_time": cutoff.isoformat(),
            "source_history": sources,
            "excluded_sources": self.excluded_sources(fixture, cutoff)
            if self.historical
            else {},
            "features": {
                name: None if value != value else value
                for name, value in values.items()
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
        result = {
            f"{prefix}_count": float(len(games)),
            f"{prefix}_available": float(bool(games)),
        }
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
        result.update(
            {
                f"{prefix}_{key}_total": value if games else nan
                for key, value in totals.items()
            }
        )
        pairs = [score_for(game, team) for game in games]
        extras = {
            "clean_sheet_rate": sum(b == 0 for _, b in pairs) / len(pairs)
            if pairs
            else nan,
            "failed_to_score_rate": sum(a == 0 for a, _ in pairs) / len(pairs)
            if pairs
            else nan,
            "scoring_1_count": float(sum(a >= 1 for a, _ in pairs)) if pairs else nan,
            "scoring_2_count": float(sum(a >= 2 for a, _ in pairs)) if pairs else nan,
            "conceding_1_count": float(sum(b >= 1 for _, b in pairs)) if pairs else nan,
            "conceding_2_count": float(sum(b >= 2 for _, b in pairs)) if pairs else nan,
        }
        result.update({f"{prefix}_{key}": value for key, value in extras.items()})
        return result
