from dataclasses import replace
import json
import subprocess
import sys

import joblib
import numpy as np
import pytest

from ml.data import read_export
from ml.dataset import dataset, demo_boundaries, split
from ml.evaluation import metrics, probabilities_for, validate_probabilities
from ml.features import FeatureBuilder
from ml.inference import predict
from ml.mode import DEMO_WARNING, check_mode
from ml.tests.test_features import game
from ml.tests.test_pipeline import export_file
from ml.training import run


def demo_game(index, **changes):
    return game(index, external_id=99_000_000 + index, **changes)


def test_demo_flag_admits_only_demo_and_leaves_standard_blocked(tmp_path):
    source = tmp_path / "fixtures.jsonl"
    export_file(
        source, [demo_game(i, home_goals=i % 3, away_goals=1) for i in range(1, 21)]
    )
    standard = run(source, tmp_path / "standard", game(13).kickoff, game(17).kickoff)
    assert standard["status"] == "blocked"
    assert standard["audit"]["usable"] == 0
    trained = subprocess.run(
        [
            sys.executable,
            "-m",
            "ml.training",
            str(source),
            "--output",
            str(tmp_path / "demo"),
            "--allow-demo",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    assert DEMO_WARNING in trained.stdout
    report = json.loads((tmp_path / "demo/report.json").read_text())
    assert report["status"] == "demo_only"
    artifact = joblib.load(tmp_path / "demo/model.joblib")
    assert artifact["production_eligible"] is False
    assert artifact["warning"] == DEMO_WARNING
    assert artifact["model_version"] == "demo-baseline-1"
    assert artifact["fixture_count"] == 20
    assert len(report["test"]) == 5
    evaluated = subprocess.run(
        [
            sys.executable,
            "-m",
            "ml.evaluation",
            str(tmp_path / "demo/test-predictions.json"),
            "--allow-demo",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    assert json.loads(evaluated.stdout)["warning"] == DEMO_WARNING
    denied = subprocess.run(
        [
            sys.executable,
            "-m",
            "ml.evaluation",
            str(tmp_path / "demo/test-predictions.json"),
        ],
        capture_output=True,
        text=True,
    )
    assert denied.returncode != 0
    assert "explicit --allow-demo" in denied.stderr
    _, fixtures = read_export(source)
    heldout = next(
        f for f in fixtures if f.id == artifact["partitions"]["test"]["fixture_ids"][0]
    )
    result = predict(
        artifact, fixtures, heldout.id, heldout.kickoff, allow_demo=True, replay=True
    )
    assert result["training_mode"] == "demo"
    assert result["production_eligible"] is False
    assert result["warning"] == DEMO_WARNING
    assert sum(result["probabilities"].values()) == pytest.approx(1)
    inferred = subprocess.run(
        [
            sys.executable,
            "-m",
            "ml.inference",
            str(source),
            str(tmp_path / "demo/model.joblib"),
            str(heldout.id),
            "--allow-demo",
            "--replay-test",
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    assert json.loads(inferred.stdout)["probabilities"] == result["probabilities"]
    future = demo_game(30, status_short="NS", home_goals=None, away_goals=None)
    assert predict(
        artifact, fixtures + [future], future.id, game(29).kickoff, allow_demo=True
    )["probabilities"]
    with pytest.raises(ValueError, match="explicit"):
        predict(artifact, fixtures, heldout.id, heldout.kickoff, replay=True)
    with pytest.raises(ValueError, match="held-out"):
        predict(
            artifact,
            fixtures,
            fixtures[0].id,
            fixtures[0].kickoff,
            allow_demo=True,
            replay=True,
        )
    with pytest.raises(ValueError, match="availability|selection time"):
        predict(
            artifact, fixtures + [future], future.id, game(2).kickoff, allow_demo=True
        )
    for key, value in (
        ("production_eligible", True),
        ("training_mode", "standard"),
        ("warning", ""),
    ):
        with pytest.raises(ValueError, match="Inconsistent"):
            check_mode({**artifact, key: value}, allow_demo=True)


def test_late_observations_are_purged_in_demo_as_in_standard(tmp_path):
    source = tmp_path / "fixtures.jsonl"
    fixtures = [demo_game(i, observed_at=game(25).kickoff) for i in range(1, 21)]
    export_file(source, fixtures)
    report = run(source, tmp_path / "blocked", None, None, allow_demo=True)
    assert report["status"] == "blocked"
    assert report["partitions"]["train"]["count"] == 0
    assert report["partitions"]["validation"]["count"] == 0
    assert len(report["purged_fixture_ids"]) == 16
    assert not (tmp_path / "blocked/model.joblib").exists()
    for fixture in fixtures:
        features = FeatureBuilder(fixtures, allow_demo=True).build(
            fixture, fixture.kickoff
        )
        assert features["home_all_5_count"] == 0


def test_demo_feature_values_and_leakage_filters_equal_standard():
    real = [game(i) for i in range(1, 9)]
    real += [game(9), game(10), game(11, observed_at=game(20).kickoff)]
    demo = [replace(f, external_id=99_000_000 + f.id) for f in real]
    expected = FeatureBuilder(real).build(real[8], real[8].kickoff)
    builder = FeatureBuilder(demo, allow_demo=True)
    actual = builder.build(demo[8], demo[8].kickoff)
    np.testing.assert_allclose(
        list(actual.values()), list(expected.values()), equal_nan=True
    )
    snapshot = builder.snapshot(demo[8], demo[8].kickoff)
    for rows in snapshot["source_history"].values():
        assert [row["fixture_id"] for row in rows] == list(range(1, 9))
    assert FeatureBuilder(demo).build(demo[8], demo[8].kickoff)["home_all_5_count"] == 0


@pytest.mark.parametrize("outcomes", [(0, 1), (1,)])
def test_missing_classes_do_not_crash_and_algorithms_are_skipped(tmp_path, outcomes):
    source = tmp_path / "fixtures.jsonl"
    export_file(
        source,
        [
            demo_game(i, home_goals=outcomes[i % len(outcomes)], away_goals=1)
            for i in range(1, 16)
        ],
    )
    report = run(source, tmp_path / "run", None, None, allow_demo=True)
    assert report["status"] == "demo_only"
    assert "H" in report["test"]["home_bias"]["missing_classes"]
    artifact = joblib.load(tmp_path / "run/model.joblib")
    _, fixtures = read_export(source)
    rows, _, matrix = dataset(fixtures, game(100).kickoff, allow_demo=True)
    validate_probabilities(probabilities_for(artifact["estimator"], matrix))
    if len(outcomes) == 1:
        assert set(report["skipped_models"]) == {
            "logistic_regression",
            "gradient_boosting",
        }
        assert set(report["skipped_models"].values()) == {
            "SKIPPED: insufficient class diversity"
        }


def test_auto_demo_split_is_chronological_and_respects_ties():
    fixtures = [demo_game(i) for i in range(1, 21)]
    fixtures[12] = replace(fixtures[12], kickoff=fixtures[11].kickoff)
    validation, test = demo_boundaries(fixtures)
    parts = split(fixtures, validation, test, allow_demo=True)
    assert all(fixtures[i].kickoff < validation for i in parts["train"])
    assert all(validation <= fixtures[i].kickoff < test for i in parts["validation"])
    assert all(fixtures[i].kickoff >= test for i in parts["test"])
    assert any(11 in indices and 12 in indices for indices in parts.values())


def test_metrics_remain_defined_with_one_holdout_class():
    result = metrics(np.array(["D", "D"]), np.array([[0.2, 0.6, 0.2]] * 2))
    assert result["missing_classes"] == ["A", "H"]
    assert result["log_loss"] == pytest.approx(-np.log(0.6))
