"""Numerical and leakage contracts for the shared v2 feature builder."""

from dataclasses import replace
from datetime import timedelta
from math import isnan

import numpy as np
import pytest

from ml.feature_registry import (
    FeatureConfig,
    REGISTRY,
    active_definitions,
    feature_metadata,
    config_from_artifact,
)
from ml.feature_sources import StatisticObservation
from ml.features import FeatureBuilder
from ml.football_context import expected_score
from ml.tests.test_features import game
from ml.training import candidates, run
from ml.tests.test_pipeline import export_file
from ml.inference import predict
from ml.mode import mode_metadata


def build(fixtures, target, **kwargs):
    return FeatureBuilder(fixtures, **kwargs).build(target, target.kickoff)


@pytest.mark.parametrize("window", [3, 5, 10])
def test_rolling_totals_rates_and_actual_denominators(window):
    fixtures = [game(i, home_goals=i % 3, away_goals=1) for i in range(1, 13)]
    values = build(fixtures, fixtures[-1])
    selected = fixtures[:-1][-window:]
    prefix = f"home_all_{window}"
    wins = sum(f.home_goals > f.away_goals for f in selected)
    draws = sum(f.home_goals == f.away_goals for f in selected)
    assert values[f"{prefix}_count"] == window
    assert values[f"{prefix}_wins_total"] == wins
    assert values[f"{prefix}_draws_total"] == draws
    assert values[f"{prefix}_points_total"] == 3 * wins + draws
    assert values[f"{prefix}_points"] == (3 * wins + draws) / window
    assert values[f"{prefix}_goals_for_total"] == sum(f.home_goals for f in selected)
    assert values[f"{prefix}_goals_for"] == sum(f.home_goals for f in selected) / window
    sparse = build(fixtures[:1], fixtures[-1])
    assert sparse[f"{prefix}_count"] == 1
    assert sparse[f"{prefix}_points"] == 1


def test_venue_direction_goals_and_head_to_head_swapped_venues():
    first = game(1, home_goals=2, away_goals=0)
    swapped = game(2, home_team_id=2, away_team_id=1, home_goals=3, away_goals=1)
    third = game(3, home_goals=0, away_goals=0)
    target = game(4)
    builder = FeatureBuilder([first, swapped, third, target])
    values = builder.build(target, target.kickoff)
    assert values["home_venue_3_count"] == values["away_venue_3_count"] == 2
    assert values["home_venue_3_goals_for_total"] == 2
    assert values["home_all_3_clean_sheet_rate"] == 2 / 3
    assert values["home_all_3_failed_to_score_rate"] == 1 / 3
    assert values["home_all_3_scoring_2_count"] == 1
    assert values["home_all_3_conceding_2_count"] == 1
    assert values["h2h_3_home_goals"] == 3
    assert values["h2h_3_away_goals"] == 3
    assert (
        values["h2h_3_home_wins"]
        == values["h2h_3_away_wins"]
        == values["h2h_3_draws"]
        == 1
    )
    assert values["h2h_3_total_goals_mean"] == 2
    detail = builder.snapshot(target, target.kickoff)["feature_details"]
    assert detail["home_venue_3_goals_for"]["source_fixture_ids"] == [1, 3]
    assert detail["h2h_3_home_goals"]["source_fixture_ids"] == [1, 2, 3]


def test_streaks_stop_at_last_nonmatching_result_and_respect_cap():
    fixtures = [game(i, home_goals=2, away_goals=0) for i in range(1, 8)]
    fixtures[2] = replace(fixtures[2], home_goals=0, away_goals=1)
    target = game(8)
    values = build(fixtures, target)
    for kind in ("win", "unbeaten", "scoring", "clean_sheet"):
        assert values[f"home_{kind}_streak"] == 4
    for kind in ("draw", "losing", "conceding", "failed_to_score"):
        assert values[f"home_{kind}_streak"] == 0
    capped = build(fixtures, target, config=FeatureConfig(streak_cap=2))
    assert capped["home_win_streak"] == 2
    assert capped["away_losing_streak"] == 2


def test_elo_expected_score_chronology_home_advantage_and_target_exclusion():
    first, target = game(1), game(8)
    config = FeatureConfig(elo_initial=1200, elo_k=32, elo_home_advantage=80)
    values = build([first, target], target, config=config)
    expected = expected_score(1200, 1200, 80)
    assert expected > 0.5
    assert values["home_elo"] == pytest.approx(1200 + 32 * (1 - expected))
    assert values["away_elo"] == pytest.approx(1200 - 32 * (1 - expected))
    assert values["difference_elo"] == values["home_elo"] - values["away_elo"]
    cold = build([target], target, config=config)
    assert cold["home_elo"] == cold["away_elo"] == 1200
    assert cold["elo_expected_home_score"] == expected
    assert cold["home_elo_initializing"] == 1


def test_elo_season_regression_is_applied_once_and_is_league_specific():
    first = game(1, season=2021)
    target = game(10, season=2022)
    config = FeatureConfig(elo_home_advantage=0, elo_season_retention=0.5)
    values = build([first], target, config=config)
    assert values["home_elo"] == 1505
    assert values["away_elo"] == 1495
    next_game = game(11, season=2022)
    after = build([first, target], next_game, config=config)
    assert after["home_elo"] == pytest.approx(
        1505 + 20 * (1 - expected_score(1505, 1495, 0))
    )
    other_league = replace(target, league_id=99)
    assert build([first], other_league, config=config)["home_elo"] == 1500


def test_simultaneous_elo_updates_are_batched_without_id_order_effect():
    first = game(1, home_goals=2, away_goals=0)
    second = game(2, kickoff=first.kickoff, home_goals=0, away_goals=1)
    target = game(8)
    config = FeatureConfig(elo_home_advantage=0)
    values = build([first, second], target, config=config)
    assert values["home_elo"] == values["away_elo"] == 1500
    swapped_ids = [replace(first, id=2), replace(second, id=1)]
    assert build(swapped_ids, target, config=config)["home_elo"] == 1500


def test_rest_congestion_boundaries_and_postponed_results():
    target = game(40)
    fixtures = [
        game(
            i,
            kickoff=target.kickoff - timedelta(days=days),
            observed_at=target.kickoff - timedelta(days=days) + timedelta(hours=4),
        )
        for i, days in enumerate((7, 14, 21, 22), start=1)
    ]
    fixtures.append(
        game(8, kickoff=target.kickoff - timedelta(hours=2), status_short="PST")
    )
    values = build(fixtures, target)
    assert values["home_rest_days"] == 7
    assert [values[f"home_played_{days}d"] for days in (7, 14, 21)] == [1, 2, 3]
    assert values["difference_rest_days"] == 0
    gap = build([game(1)], target)
    assert gap["home_rest_days"] == 39
    assert gap["home_long_rest"] == 1


def test_reconstructed_table_league_averages_and_season_scope():
    first = game(1, home_goals=2, away_goals=0)
    second = game(2, home_team_id=3, away_team_id=1, home_goals=1, away_goals=1)
    target = game(3, home_team_id=1, away_team_id=3, home_goals=99)
    config = FeatureConfig(league_min_matches=2)
    builder = FeatureBuilder([first, second, target, game(4)], config=config)
    snapshot = builder.snapshot(target, target.kickoff)
    values = snapshot["features"]
    table = snapshot["contexts"]["reconstructed_table"]
    assert [row["team_id"] for row in table] == [1, 3, 2]
    assert table[0]["points"] == 4 and table[0]["played"] == 2
    assert values["difference_reconstructed_rank"] == -1
    assert values["difference_table_points"] == 3
    assert values["difference_table_ppg"] == 1
    assert values["league_home_win_rate"] == values["league_draw_rate"] == 0.5
    assert values["league_home_goals"] == 1.5
    assert values["home_league_relative_points"] == 2 - 1.25
    assert values["home_season_played"] == 2
    next_season = replace(target, season=2021)
    assert build([first, second], next_season)["home_season_played"] == 0
    assert isnan(build([first], target)["league_home_win_rate"])


def test_table_ties_share_rank_and_unknown_teams_do_not_get_invented_rank():
    first = game(1, home_goals=0, away_goals=0)
    target = game(2)
    snapshot = FeatureBuilder([first]).snapshot(target, target.kickoff)
    assert [
        r["reconstructed_rank"] for r in snapshot["contexts"]["reconstructed_table"]
    ] == [1, 1]
    newcomer = replace(target, home_team_id=100)
    values = build([first], newcomer)
    assert isnan(values["home_reconstructed_rank"])
    assert values["reconstructed_table_available"] == 0


def test_cold_start_missingness_ratios_and_registry_completeness():
    target = game(20)
    values = build([], target)
    assert values.keys() == active_definitions(FeatureConfig()).keys()
    assert all(name in REGISTRY for name in values)
    assert values["home_all_5_count"] == values["home_all_5_available"] == 0
    assert isnan(values["home_all_5_points_total"])
    assert isnan(values["home_win_streak"])
    assert values["home_insufficient_history"] == values["home_elo_initializing"] == 1
    assert isnan(values["home_season_progress"])
    zero = game(1, home_goals=0, away_goals=0)
    known = build([zero], target)
    assert known["home_all_5_goals_for"] == 0
    assert known["home_all_5_available"] == 1
    assert isnan(known["home_attack_defence_ratio_5"])
    positive = build([game(1, home_goals=2, away_goals=1)], target)
    assert positive["home_attack_defence_ratio_5"] == 1
    assert positive["difference_5_goals_for"] == 1
    assert not any(np.isinf(value) for value in positive.values())


@pytest.mark.parametrize(
    "historical,allow_demo", [(False, False), (True, False), (False, True)]
)
def test_future_current_tied_and_incomplete_fixtures_cannot_change_any_feature(
    historical, allow_demo
):
    target = game(10)
    before = game(1)
    later = game(20, home_goals=99)
    tied = game(11, kickoff=target.kickoff, home_goals=99)
    incomplete = game(2, status_short="PEN", home_goals=99)
    fixtures = [before, target, later, tied, incomplete]
    if allow_demo:
        fixtures = [replace(f, external_id=99_000_000 + f.id) for f in fixtures]
        before, target = fixtures[:2]
    expected = build([before], target, historical=historical, allow_demo=allow_demo)
    actual = build(fixtures, target, historical=historical, allow_demo=allow_demo)
    np.testing.assert_allclose(
        list(actual.values()), list(expected.values()), equal_nan=True
    )


def test_statistics_explicit_provenance_missingness_and_mode_availability():
    first, target = game(1), game(10)
    config = FeatureConfig(groups=("match_statistics",))
    late = StatisticObservation(
        1, 1, "shots", 12.0, game(20).kickoff, "verified_final_fixture_statistics_v1"
    )
    real_zero = replace(late, metric="corners", value=0, observed_at=game(2).kickoff)
    missing = replace(late, metric="fouls", value=None)
    target_stats = replace(late, fixture_id=10, value=999)
    observations = (late, real_zero, missing, target_stats)
    prospective = build([first, target], target, config=config, statistics=observations)
    assert isnan(prospective["home_stats_5_shots"])
    assert prospective["home_stats_5_shots_count"] == 0
    assert prospective["home_stats_5_corners"] == 0
    historical = build(
        [first, target], target, config=config, statistics=observations, historical=True
    )
    assert historical["home_stats_5_shots"] == 12
    assert historical["home_stats_5_shots_count"] == 1
    assert isnan(historical["home_stats_5_fouls"])
    with pytest.raises(ValueError, match="provenance"):
        replace(late, provenance="latest_snapshot")
    with pytest.raises(ValueError, match="Duplicate"):
        FeatureBuilder([first], statistics=(late, late))
    with pytest.raises(ValueError, match="fixture team"):
        FeatureBuilder([first], statistics=(replace(late, team_id=999),))
    with pytest.raises(ValueError, match="Invalid"):
        replace(late, metric="possession", value=101)


def test_configuration_version_registry_and_artifact_fail_closed():
    config = FeatureConfig(groups=("elo", "h2h"), elo_k=24)
    artifact = {
        **feature_metadata(config),
        "features": list(active_definitions(config)),
    }
    assert config_from_artifact(artifact) == config
    for changes in (
        {"feature_set_version": "v1"},
        {"features": ["home_elo"]},
        {"active_feature_groups": ["elo"]},
        {"feature_registry_sha256": "stale"},
        {"feature_config": {**artifact["feature_config"], "elo_k": 40}},
    ):
        with pytest.raises(ValueError, match="mismatch"):
            config_from_artifact({**artifact, **changes})
    for group in ("xg", "player_availability", "team_id"):
        with pytest.raises(ValueError, match="disabled"):
            FeatureConfig(groups=(group,))
    assert all(
        not definition.enabled
        for definition in REGISTRY.values()
        if definition.family in ("xg", "player_availability")
    )


def test_inference_rejects_incompatible_feature_version_before_prediction():
    artifact = {
        **mode_metadata(False),
        **feature_metadata(FeatureConfig()),
        "features": list(active_definitions(FeatureConfig())),
        "feature_set_version": "v1",
    }
    with pytest.raises(ValueError, match="Feature-set version mismatch"):
        predict(artifact, [], 1, game(10).kickoff)


def test_all_context_engines_respect_late_observation_policy():
    target = game(10)
    previous = game(1, observed_at=game(20).kickoff)
    strict = build([previous], target)
    retrospective = build([previous], target, historical=True)
    assert strict["home_elo"] == 1500
    assert strict["home_season_played"] == 0
    assert strict["reconstructed_table_available"] == 0
    assert strict["h2h_3_count"] == 0
    assert retrospective["home_elo"] > 1500
    assert retrospective["home_season_played"] == 1
    assert retrospective["reconstructed_table_available"] == 1
    assert retrospective["h2h_3_count"] == 1


def test_h2h_uses_last_three_and_five_and_preserves_all_legacy_names():
    target = game(10)
    values = build([game(i) for i in range(1, 8)], target)
    assert values["h2h_3_count"] == 3
    assert values["h2h_5_count"] == 5
    assert values["h2h_3_home_goals"] == 6
    assert values["h2h_5_home_goals"] == 10
    legacy = {
        f"{side}_{context}_{window}_{metric}"
        for side in ("home", "away")
        for context in ("all", "venue")
        for window in (5, 10)
        for metric in (
            "count",
            "points",
            "wins",
            "draws",
            "losses",
            "goals_for",
            "goals_against",
            "goal_difference",
        )
    }
    legacy |= {
        f"difference_{window}_{metric}"
        for window in (5, 10)
        for metric in (
            "points",
            "wins",
            "draws",
            "losses",
            "goals_for",
            "goals_against",
            "goal_difference",
        )
    }
    legacy |= {
        f"{side}_{metric}"
        for side in ("home", "away")
        for metric in ("rest_days", "played_7d", "played_14d")
    }
    legacy.add("difference_rest_days")
    assert len(legacy) == 85
    assert legacy <= values.keys()


def test_scaler_only_on_logistic_regression_and_reduced_feature_run(tmp_path):
    models = candidates()
    assert "standardscaler" in models["logistic_regression"].named_steps
    for name in ("random_forest", "gradient_boosting"):
        assert "standardscaler" not in models[name].named_steps
    source = tmp_path / "data.jsonl"
    export_file(source, [game(i, home_goals=i % 3) for i in range(1, 31)])
    config = FeatureConfig(groups=("elo",))
    report = run(
        source,
        tmp_path / "audit",
        None,
        None,
        historical=True,
        audit_only=True,
        feature_config=config,
    )
    assert report["features"] == list(active_definitions(config))
    assert report["status"] == "audit_only"
    assert report["audit"]["cold_start_rows"] is None
