from dataclasses import replace
from datetime import datetime, timedelta, timezone
from math import isnan

import pytest
import numpy as np

from ml.data import Fixture
from ml.features import FeatureBuilder

START = datetime(2020, 1, 1, tzinfo=timezone.utc)


def game(index=1, **changes):
    kickoff = START + timedelta(days=index)
    return replace(
        Fixture(
            index,
            index,
            1,
            2020,
            1,
            2,
            kickoff,
            "FT",
            2,
            1,
            kickoff + timedelta(hours=3),
        ),
        **changes,
    )


def test_last_five_exclude_current_future_simultaneous_and_late_updates():
    history = [game(i) for i in range(1, 9)]
    current = game(9)
    late = game(0, observed_at=current.kickoff + timedelta(days=1), home_goals=99)
    simultaneous = game(11, kickoff=current.kickoff, home_goals=99)
    values = FeatureBuilder(history + [late, current, simultaneous, game(10)]).build(
        current, current.kickoff
    )
    assert values["home_all_5_count"] == 5
    assert values["home_all_5_points"] == 3
    assert values["home_all_5_goals_for"] == 2
    assert values["home_all_10_count"] == 8


def test_last_five_are_the_most_recent_older_games():
    history = [game(i, home_goals=i) for i in range(1, 8)]
    current = game(8)
    assert (
        FeatureBuilder(history).build(current, current.kickoff)["home_all_5_goals_for"]
        == 5
    )


@pytest.mark.parametrize(
    "status",
    ["NS", "PST", "CANC", "ABD", "AWD", "WO", "SUSP", "2H", "AET", "PEN", None],
)
def test_non_ft_results_are_excluded(status):
    current = game(2)
    assert (
        FeatureBuilder([game(status_short=status)]).build(current, current.kickoff)[
            "home_all_5_count"
        ]
        == 0
    )


@pytest.mark.parametrize(
    "changes",
    [
        {"home_goals": None},
        {"away_goals": -1},
        {"home_goals": 1.5},
        {"observed_at": None},
        {"external_id": 99000001},
        {"external_id": None},
    ],
)
def test_incomplete_or_untrusted_history_excluded(changes):
    current = game(2)
    assert (
        FeatureBuilder([game(**changes)]).build(current, current.kickoff)[
            "home_all_5_count"
        ]
        == 0
    )


def test_home_away_orientation_multiple_leagues_seasons_and_short_history():
    home_game = game(1, league_id=2, season=2019)
    reversed_game = game(2, home_team_id=2, away_team_id=1, home_goals=0, away_goals=3)
    current = game(3)
    values = FeatureBuilder([home_game, reversed_game]).build(current, current.kickoff)
    assert values["home_all_5_count"] == 2
    assert values["home_all_5_goals_for"] == 2.5
    assert values["home_venue_5_goals_for"] == 2
    assert values["away_venue_5_goals_for"] == 1
    assert values["away_all_5_points"] == 0
    assert values["difference_5_points"] == 3
    assert values["home_rest_days"] == 1
    assert values["home_played_7d"] == 2


def test_new_team_missing_values_and_history_horizon():
    current = game(800)
    values = FeatureBuilder([game()]).build(current, current.kickoff)
    assert values["home_all_5_count"] == 0
    assert isnan(values["home_all_5_points"])
    assert isnan(values["away_rest_days"])


def test_same_builder_historical_future_and_mutated_target():
    current = game(3)
    builder = FeatureBuilder([game(), game(2), current])
    historical = builder.build(current, current.kickoff)
    future = replace(current, status_short="NS", home_goals=None, away_goals=None)
    for changed in (future, replace(current, home_goals=99)):
        actual = builder.build(changed, changed.kickoff)
        assert historical.keys() == actual.keys()
        np.testing.assert_allclose(
            list(historical.values()), list(actual.values()), equal_nan=True
        )


def test_result_must_be_available_strictly_before_cutoff():
    current = game(2)
    previous = game(1, observed_at=current.kickoff)
    assert (
        FeatureBuilder([previous]).build(current, current.kickoff)["home_all_5_count"]
        == 0
    )
    overlapping = game(
        1,
        kickoff=current.kickoff - timedelta(hours=1),
        observed_at=current.kickoff - timedelta(minutes=1),
    )
    assert (
        FeatureBuilder([overlapping]).build(current, current.kickoff)[
            "home_all_5_count"
        ]
        == 0
    )
    with pytest.raises(ValueError):
        FeatureBuilder([]).build(current, current.kickoff + timedelta(seconds=1))
