from dataclasses import replace
from datetime import timedelta

import pytest

from ml.coverage import coverage
from ml.feature_registry import FeatureConfig
from ml.tests.test_features import game


def test_coverage_uses_cutoffs_and_reports_history_without_training():
    fixtures = [game(i) for i in range(1, 13)]
    report = coverage(fixtures, game(20).kickoff)
    overall = report["overall"]
    assert overall["targets"] == 12
    assert overall["both_history_5"] == pytest.approx(7 / 12)
    assert overall["both_history_10"] == pytest.approx(2 / 12)
    assert overall["h2h"] == pytest.approx(11 / 12)
    assert overall["missingness_by_family"]["season"] > 0
    assert report["by"]["league_id"]["1"] == overall
    assert report["first_30_days"] == overall
    # Later and simultaneous results cannot fill the earlier target's history.
    first = coverage(fixtures, game(1).kickoff + timedelta(hours=5))
    assert first["overall"]["targets"] == 1
    assert first["overall"]["both_history_5"] == 0
    assert first["overall"]["both_elo_initialized"] == 0


def test_coverage_filters_non_ft_and_demo_but_keeps_warmup_seasons():
    fixtures = [game(i, season=2019) for i in range(1, 12)] + [game(12)]
    fixtures += [game(13, status_short="PST"), game(14, external_id=99000001)]
    report = coverage(fixtures, game(20).kickoff, target_seasons={2020})
    assert report["overall"]["targets"] == 1
    assert report["overall"]["both_history_10"] == 1
    changed = [replace(row, home_goals=50) if row.id >= 13 else row for row in fixtures]
    assert (
        coverage(changed, game(20).kickoff, target_seasons={2020})["overall"]
        == report["overall"]
    )


def test_coverage_handles_empty_and_disabled_diagnostic_families():
    assert coverage([], game(20).kickoff)["overall"]["targets"] == 0
    report = coverage(
        [game()], game(20).kickoff, FeatureConfig(groups=("result_form",))
    )
    assert report["overall"]["both_elo_initialized"] is None
    assert report["overall"]["both_history_5"] is None
