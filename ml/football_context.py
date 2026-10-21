"""Result-only Elo and league tables. Inputs must already pass cutoff policy."""

from collections import defaultdict
from itertools import groupby
from math import nan

from ml.data import Fixture
from ml.feature_registry import FeatureConfig


def score_for(fixture: Fixture, team: int) -> tuple[int, int]:
    return (
        (fixture.home_goals, fixture.away_goals)
        if fixture.home_team_id == team
        else (fixture.away_goals, fixture.home_goals)
    )


def expected_score(home: float, away: float, advantage: float) -> float:
    exponent = max(-300.0, min(300.0, (away - home - advantage) / 400.0))
    return 1.0 / (1.0 + 10.0**exponent)


def elo_snapshot(
    history: list[Fixture], target: Fixture, config: FeatureConfig
) -> dict:
    # League-specific ratings avoid double season regression across concurrent cups.
    games = sorted(
        (f for f in history if f.league_id == target.league_id),
        key=lambda f: (f.kickoff, f.id),
    )
    ratings: dict[int, float] = {}
    seasons: dict[int, int] = {}
    counts: dict[int, int] = defaultdict(int)

    def transition(team: int, season: int) -> None:
        ratings.setdefault(team, config.elo_initial)
        previous = seasons.get(team, season)
        if season > previous:
            ratings[team] = config.elo_initial + (
                ratings[team] - config.elo_initial
            ) * config.elo_season_retention ** (season - previous)
        seasons[team] = max(previous, season)

    for _, simultaneous in groupby(games, key=lambda f: f.kickoff):
        batch = list(simultaneous)
        for game in batch:
            for team in (game.home_team_id, game.away_team_id):
                transition(team, game.season)
        changes: dict[int, float] = defaultdict(float)
        for game in batch:
            home, away = game.home_team_id, game.away_team_id
            expected = expected_score(
                ratings[home], ratings[away], config.elo_home_advantage
            )
            actual = (
                1.0
                if game.home_goals > game.away_goals
                else (0.5 if game.home_goals == game.away_goals else 0.0)
            )
            delta = config.elo_k * (actual - expected)
            changes[home] += delta
            changes[away] -= delta
            counts[home] += 1
            counts[away] += 1
        for team, delta in changes.items():
            ratings[team] += delta
    for team in (target.home_team_id, target.away_team_id):
        transition(team, target.season)
    home, away = ratings[target.home_team_id], ratings[target.away_team_id]
    return {
        "features": {
            "home_elo": home,
            "away_elo": away,
            "home_elo_initializing": float(counts[target.home_team_id] < 5),
            "away_elo_initializing": float(counts[target.away_team_id] < 5),
            "elo_expected_home_score": expected_score(
                home, away, config.elo_home_advantage
            ),
        },
        "source_fixture_ids": [game.id for game in games],
        "home_updates": counts[target.home_team_id],
        "away_updates": counts[target.away_team_id],
        "home_advantage": config.elo_home_advantage,
        "season_retention": config.elo_season_retention,
        "scope": "target league, all eligible seasons; no fixed lookback",
    }


def reconstructed_table(games: list[Fixture]) -> list[dict]:
    teams = {}
    for game in games:
        for team in (game.home_team_id, game.away_team_id):
            row = teams.setdefault(
                team,
                dict(
                    team_id=team,
                    played=0,
                    wins=0,
                    draws=0,
                    losses=0,
                    goals_for=0,
                    goals_against=0,
                    goal_difference=0,
                    points=0,
                ),
            )
            scored, conceded = score_for(game, team)
            row["played"] += 1
            row["wins"] += scored > conceded
            row["draws"] += scored == conceded
            row["losses"] += scored < conceded
            row["goals_for"] += scored
            row["goals_against"] += conceded
            row["goal_difference"] += scored - conceded
            row["points"] += 3 if scored > conceded else int(scored == conceded)
    table = sorted(
        teams.values(),
        key=lambda row: (
            -row["points"],
            -row["goal_difference"],
            -row["goals_for"],
            row["team_id"],
        ),
    )
    previous = None
    rank = 0
    for index, row in enumerate(table):
        key = (row["points"], row["goal_difference"], row["goals_for"])
        if key != previous:
            rank = index + 1
        row["reconstructed_rank"] = rank
        previous = key
    return table


def league_features(
    games: list[Fixture], target: Fixture, config: FeatureConfig
) -> tuple[dict[str, float], list[dict]]:
    table = reconstructed_table(games)
    indexed = {row["team_id"]: row for row in table}
    enough = len(games) >= config.league_min_matches
    values = {
        "league_context_count": float(len(games)),
        "league_context_available": float(enough),
    }
    home_wins = sum(game.home_goals > game.away_goals for game in games)
    draws = sum(game.home_goals == game.away_goals for game in games)
    away_wins = len(games) - home_wins - draws
    goals_home, goals_away = (
        sum(g.home_goals for g in games),
        sum(g.away_goals for g in games),
    )
    for name, total in (
        ("home_win_rate", home_wins),
        ("draw_rate", draws),
        ("away_win_rate", away_wins),
        ("home_goals", goals_home),
        ("away_goals", goals_away),
    ):
        values[f"league_{name}"] = total / len(games) if enough else nan
    averages = {
        "points": (3 * (home_wins + away_wins) + 2 * draws) / (2 * len(games))
        if enough
        else nan,
        "goals_for": (goals_home + goals_away) / (2 * len(games)) if enough else nan,
        "goals_against": (goals_home + goals_away) / (2 * len(games))
        if enough
        else nan,
        "goal_difference": 0.0 if enough else nan,
    }
    for side, team in (("home", target.home_team_id), ("away", target.away_team_id)):
        row = indexed.get(team)
        values[f"{side}_season_played"] = float(row["played"] if row else 0)
        values[f"{side}_early_season"] = float(not row or row["played"] < 5)
        values[f"{side}_season_progress"] = nan
        values[f"{side}_reconstructed_rank"] = (
            float(row["reconstructed_rank"]) if row else nan
        )
        for metric, average in averages.items():
            values[f"{side}_league_relative_{metric}"] = (
                row[metric] / row["played"] - average if row else nan
            )
        venue = [
            g
            for g in games
            if (g.home_team_id if side == "home" else g.away_team_id) == team
        ]
        points = sum(
            3
            if score_for(g, team)[0] > score_for(g, team)[1]
            else int(score_for(g, team)[0] == score_for(g, team)[1])
            for g in venue
        )
        league_points = 3 * (home_wins if side == "home" else away_wins) + draws
        values[f"{side}_venue_relative_points"] = (
            points / len(venue) - league_points / len(games)
            if enough and venue
            else nan
        )
    home, away = indexed.get(target.home_team_id), indexed.get(target.away_team_id)
    values["reconstructed_table_available"] = float(
        home is not None and away is not None
    )
    values["difference_table_points"] = (
        float(home["points"] - away["points"]) if home and away else nan
    )
    values["difference_table_ppg"] = (
        home["points"] / home["played"] - away["points"] / away["played"]
        if home and away
        else nan
    )
    return values, table
