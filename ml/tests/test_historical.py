"""Synthetic contract tests, never evidence of real football performance."""

import json
import subprocess
import sys
from dataclasses import replace
from datetime import timedelta

import joblib
import numpy as np
import pytest

from ml.data import instant, read_export
from ml.dataset import dataset, split, training_blockers
from ml.features import FeatureBuilder
from ml.feature_registry import FeatureConfig, active_definitions
from ml.historical import historical_audit
from ml.inference import predict
from ml.mode import check_mode, mode_metadata
from ml.tests.test_features import game
from ml.tests.test_pipeline import export_file
from ml.training import run

IMPORTED = instant("2026-10-14T00:00:00Z")
EXPORTED = instant("2026-10-15T00:00:00Z")


def historical_game(index, **changes):
    return replace(
        game(index),
        kickoff=instant("2022-08-01T18:00:00Z") + timedelta(days=index - 1),
        observed_at=IMPORTED,
        season=2022,
        **changes,
    )


def historical_export(path, fixtures):
    export_file(path, fixtures)
    lines = path.read_text().splitlines()
    header = json.loads(lines[0])
    header["exported_at"] = EXPORTED.isoformat()
    lines[0] = json.dumps(header)
    path.write_text("\n".join(lines))


def test_2022_results_imported_2026_are_only_available_historically():
    a, b, c = [historical_game(i) for i in (1, 8, 15)]
    tied = replace(c, id=16, kickoff=b.kickoff)
    overlapping = replace(c, id=17, kickoff=b.kickoff - timedelta(hours=2))
    fixtures = [a, b, c, tied, overlapping]
    builder = FeatureBuilder(fixtures, historical=True)
    assert [f.id for f in builder.source_history(b, 1, b.kickoff)] == [a.id]
    snapshot = builder.snapshot(b, b.kickoff)
    assert snapshot["features"]["home_all_5_goals_for"] == 2
    assert {row["reason"] for row in snapshot["excluded_sources"]["home"]} == {
        "current_fixture",
        "same_or_later_kickoff",
        "completion_buffer",
    }
    assert FeatureBuilder(fixtures).build(b, b.kickoff)["home_all_5_count"] == 0
    demos = [replace(f, external_id=99_000_000 + f.id) for f in fixtures]
    assert (
        FeatureBuilder(demos, allow_demo=True).build(demos[1], b.kickoff)[
            "home_all_5_count"
        ]
        == 0
    )
    changed = replace(b, home_goals=98, away_goals=99)
    np.testing.assert_allclose(
        list(builder.build(b, b.kickoff).values()),
        list(
            FeatureBuilder([a, changed, c], historical=True)
            .build(changed, b.kickoff)
            .values()
        ),
        equal_nan=True,
    )


@pytest.mark.parametrize(
    "changes,reason",
    [
        ({"external_id": 99_000_001}, "demo"),
        ({"external_id": None}, "unknown_provenance"),
        ({"external_id": 0}, "unknown_provenance"),
        ({"status_short": "AET"}, "status"),
        ({"status_short": "PEN"}, "status"),
        ({"status_short": "PST"}, "status"),
        ({"status_short": "CANC"}, "status"),
        ({"status_short": "ABD"}, "status"),
        ({"status_short": "NS"}, "status"),
        ({"home_goals": None}, "missing_or_invalid_scores"),
        ({"away_goals": -1}, "missing_or_invalid_scores"),
        ({"home_goals": True}, "missing_or_invalid_scores"),
        ({"away_team_id": 1}, "invalid_teams"),
    ],
)
def test_invalid_historical_sources_are_excluded_and_counted(changes, reason):
    source, target = replace(historical_game(1), **changes), historical_game(8)
    rows, _, _ = dataset([source, target], EXPORTED, historical=True)
    assert [f.id for f in rows] == [8]
    assert (
        FeatureBuilder([source, target], historical=True).build(target, target.kickoff)[
            "home_all_5_count"
        ]
        == 0
    )
    audit = historical_audit([source, target], rows, EXPORTED, None)
    assert audit["excluded"][reason] == 1


def test_target_season_keeps_prior_season_warmup_and_reports_missing_history():
    warmup = replace(historical_game(1), season=2021, league_id=17)
    target = historical_game(8)
    cold = replace(historical_game(15), home_team_id=3)
    rows, names, matrix = dataset(
        [warmup, target, cold], EXPORTED, historical=True, target_seasons={2022}
    )
    assert [f.id for f in rows] == [8, 15]
    assert matrix[0, names.index("home_all_5_count")] == 1
    assert np.isnan(matrix[1, names.index("home_all_5_points")])
    audit = historical_audit([warmup, target, cold], rows, EXPORTED, {2022})
    assert audit["warmup_only_fixture_ids"] == [1]
    assert audit["coverage"]["1"]["both"]["count"] == 1
    assert audit["league_seasons"]["17:2021"]["eligible_targets"] == 0
    with pytest.raises(ValueError, match="Target seasons"):
        dataset([target], EXPORTED, target_seasons={2022})


def test_historical_label_purge_ignores_ingestion_but_retains_completion_and_ties():
    fixtures = [historical_game(i) for i in range(1, 21)]
    fixtures[11] = replace(
        fixtures[11], kickoff=fixtures[12].kickoff - timedelta(hours=2)
    )
    fixtures[13] = replace(fixtures[13], kickoff=fixtures[12].kickoff)
    standard = split(fixtures, fixtures[12].kickoff, fixtures[16].kickoff)
    assert standard["train"] == standard["validation"] == []
    historical = split(
        fixtures, fixtures[12].kickoff, fixtures[16].kickoff, historical=True
    )
    assert historical["train"] == list(range(11))
    assert historical["validation"] == [12, 13, 14, 15]


def test_postmatch_snapshots_and_odds_never_enter_feature_contract(tmp_path):
    source = tmp_path / "data.jsonl"
    fixtures = [historical_game(1), historical_game(8)]
    historical_export(source, fixtures)
    _, original = read_export(source)
    lines = [json.loads(line) for line in source.read_text().splitlines()]
    forbidden = (
        "standings",
        "odds",
        "predictions",
        "lineups",
        "injuries",
        "statistics",
        "player_stats",
        "events",
        "team_statistics",
        "coaches",
    )
    for row in lines[1:-1]:
        row.update(
            {
                key: {
                    "recorded_at": IMPORTED.isoformat(),
                    "target_outcome": "H",
                    "value": 999,
                }
                for key in forbidden
            }
        )
    source.write_text("\n".join(json.dumps(row) for row in lines))
    _, polluted = read_export(source)
    assert polluted == original
    _, names, expected = dataset(original, EXPORTED, historical=True)
    _, _, actual = dataset(polluted, EXPORTED, historical=True)
    assert names == list(active_definitions(FeatureConfig()))
    np.testing.assert_allclose(actual, expected, equal_nan=True)


def test_historical_minimums_and_future_result_exclusion():
    fixtures = [historical_game(i) for i in range(1, 21)]
    future = replace(historical_game(30), kickoff=EXPORTED)
    rows, names, matrix = dataset(fixtures + [future], EXPORTED, historical=True)
    assert len(rows) == 20
    audit = historical_audit(fixtures + [future], rows, EXPORTED, None)
    assert audit["excluded"]["chronology"] == 1
    parts = split(rows, rows[12].kickoff, rows[16].kickoff, historical=True)
    assert "train: at least two outcome classes required" in training_blockers(
        rows, parts, names, matrix, historical=True
    )
    with pytest.raises(ValueError, match="mutually exclusive"):
        FeatureBuilder(fixtures, allow_demo=True, historical=True)


def test_historical_cli_training_evaluation_replay_and_live_refusal(tmp_path):
    source = tmp_path / "data.jsonl"
    fixtures = [replace(historical_game(i), home_goals=i % 3) for i in range(1, 31)]
    historical_export(source, fixtures)
    output = tmp_path / "historical"

    def cli(module, *args, success=True):
        result = subprocess.run(
            [sys.executable, "-m", module, *map(str, args)],
            capture_output=True,
            text=True,
        )
        assert (result.returncode == 0) is success, result.stderr
        return result

    cli(
        "ml.training",
        source,
        "--output",
        output,
        "--mode",
        "historical",
        "--target-season",
        "2022",
    )
    report = json.loads((output / "report.json").read_text())
    artifact = joblib.load(output / "model.joblib")
    assert report["status"] == "EXPERIMENTAL_HISTORICAL"
    assert report["baseline_candidate"] is False
    assert report["production_eligible"] is False
    assert len(report["test"]) == len(report["validation"]) == 5
    assert report["purged_fixture_ids"] == []
    selected = min(
        (
            name
            for name in report["validation"]
            if name not in ("majority", "home_bias")
        ),
        key=lambda name: report["validation"][name]["log_loss"],
    )
    assert report["selected"] == selected
    evaluated = cli(
        "ml.evaluation", output / "test-predictions.json", "--mode", "historical"
    )
    assert json.loads(evaluated.stdout)["metrics"] == report["test"]
    cli("ml.evaluation", output / "test-predictions.json", success=False)
    heldout = next(
        f for f in fixtures if f.id == artifact["partitions"]["test"]["fixture_ids"][0]
    )
    replay = cli(
        "ml.inference",
        source,
        output / "model.joblib",
        heldout.id,
        "--historical-replay",
    )
    result = json.loads(replay.stdout)
    assert result["actual_result"]["outcome"] == heldout.target
    assert sum(result["probabilities"].values()) == pytest.approx(1)
    assert result["probabilities"] == pytest.approx(
        dict(
            zip(
                ("away", "draw", "home"),
                json.loads((output / "test-predictions.json").read_text())[
                    "probabilities"
                ][selected][0],
            )
        )
    )
    inspected = cli(
        "ml.inspect_features",
        source,
        heldout.id,
        "--mode",
        "historical",
        "--cutoff",
        heldout.kickoff.isoformat(),
    )
    assert json.loads(inspected.stdout)["features"] == result["features"]
    for kwargs in ({}, {"allow_demo": True}, {"replay": True, "allow_demo": True}):
        with pytest.raises(ValueError):
            predict(artifact, fixtures, heldout.id, heldout.kickoff, **kwargs)
    with pytest.raises(ValueError, match="held-out"):
        predict(
            artifact,
            fixtures,
            fixtures[0].id,
            fixtures[0].kickoff,
            historical_replay=True,
        )
    with pytest.raises(ValueError, match="unchanged"):
        predict(
            artifact,
            [replace(f, home_goals=99) for f in fixtures],
            heldout.id,
            heldout.kickoff,
            historical_replay=True,
        )
    for key, value in (
        ("production_eligible", True),
        ("warning", ""),
        ("training_mode", "standard"),
    ):
        with pytest.raises(ValueError, match="Inconsistent"):
            check_mode({**artifact, key: value}, historical=True)
    with pytest.raises(ValueError, match="historical artifact"):
        check_mode(mode_metadata(False), historical=True)
    standard = run(
        source, tmp_path / "standard", fixtures[18].kickoff, fixtures[24].kickoff
    )
    assert standard["status"] == "blocked"
    assert standard["partitions"]["train"]["count"] == 0


def test_audit_only_never_fits_and_two_class_experiment_is_admitted(tmp_path):
    source = tmp_path / "data.jsonl"
    fixtures = [replace(historical_game(i), home_goals=i % 2) for i in range(1, 31)]
    historical_export(source, fixtures)
    report = run(
        source, tmp_path / "audit", None, None, historical=True, audit_only=True
    )
    assert report["status"] == "audit_only"
    assert report["artifact_produced"] is False
    assert not (tmp_path / "audit/model.joblib").exists()
    assert report["historical_audit"]["coverage"]["1"]["both"][
        "percentage"
    ] == pytest.approx(100 * 29 / 30)
    with pytest.raises(ValueError, match="Audit-only"):
        run(source, tmp_path / "invalid", None, None, audit_only=True)
