import hashlib
import json
from dataclasses import replace
from datetime import timedelta
from pathlib import Path

import joblib
import numpy as np
import pytest

from ml.data import CLASSES, POLICY, instant, read_export
from ml.dataset import dataset, split, training_blockers
from ml.evaluation import metrics, validate_probabilities
from ml.inference import predict
from ml.mode import mode_metadata
from ml.feature_registry import FeatureConfig, feature_metadata
from ml.tests.test_features import START, game
from ml.training import candidates, run


def export_file(path, fixtures):
    rows = [
        {
            "schema_version": 1,
            "availability_policy": POLICY,
            "exported_at": (START + timedelta(days=2000)).isoformat(),
        }
    ]
    rows.extend(
        {
            "id": f.id,
            "external_id": f.external_id,
            "league_id": f.league_id,
            "season": f.season,
            "home_team_id": f.home_team_id,
            "away_team_id": f.away_team_id,
            "kickoff": f.kickoff.isoformat(),
            "status_short": f.status_short,
            "fulltime_home_goals": f.home_goals,
            "fulltime_away_goals": f.away_goals,
            "updated_at": f.observed_at.isoformat() if f.observed_at else None,
        }
        for f in fixtures
    )
    rows.append({"export_complete": True, "row_count": len(fixtures)})
    path.write_text("\n".join(json.dumps(row) for row in rows), encoding="utf-8")


def test_chronological_split_purges_late_known_labels_and_keeps_ties_together():
    fixtures = [game(i) for i in range(1, 10)]
    fixtures[0] = replace(fixtures[0], observed_at=game(8).kickoff)
    rows, names, matrix = dataset(fixtures, game(20).kickoff)
    parts = split(rows, game(5).kickoff, game(8).kickoff)
    assert parts == {"train": [1, 2, 3], "validation": [4, 5, 6], "test": [7, 8]}
    assert training_blockers(rows, parts, names, matrix)
    with pytest.raises(ValueError):
        split(rows, game(8).kickoff, game(5).kickoff)


@pytest.mark.parametrize(
    "probabilities",
    [[[0.5, 0.2, 0.2]], [[-0.1, 0.5, 0.6]], [[float("nan"), 0.5, 0.5]], [[0.5, 0.5]]],
)
def test_invalid_probabilities_rejected(probabilities):
    with pytest.raises(ValueError):
        validate_probabilities(np.array(probabilities))


def test_metrics_class_order_brier_and_reliability():
    result = metrics(np.array(CLASSES), np.eye(3))
    assert result["accuracy"] == 1
    assert result["brier"] == 0
    assert result["confusion_matrix"] == np.eye(3, dtype=int).tolist()
    assert sum(row["count"] for row in result["reliability"]["H"]) == 3


def test_tied_kickoffs_never_cross_partition_boundaries():
    fixtures = [game(1), game(2), game(3, kickoff=game(2).kickoff), game(4)]
    rows, _, _ = dataset(fixtures, game(10).kickoff)
    parts = split(rows, game(2).kickoff, game(4).kickoff)
    assert parts["train"] == [0]
    assert parts["validation"] == [1, 2]
    assert parts["test"] == [3]


def test_export_rejects_duplicates_naive_dates_and_truncation(tmp_path):
    path = tmp_path / "fixtures.jsonl"
    export_file(path, [game(), game()])
    with pytest.raises(ValueError, match="Duplicate"):
        read_export(path)
    export_file(path, [game()])
    path.write_text("\n".join(path.read_text().splitlines()[:-1]))
    with pytest.raises(ValueError, match="Incomplete"):
        read_export(path)
    with pytest.raises(ValueError, match="timezone"):
        instant("2020-01-01")


def test_no_model_for_demo_data(tmp_path):
    source = tmp_path / "fixtures.jsonl"
    export_file(source, [game(external_id=99000001)])
    report = run(source, tmp_path / "run", game(5).kickoff, game(8).kickoff)
    assert report["status"] == "blocked"
    assert report["audit"]["usable"] == 0
    assert not (tmp_path / "run" / "model.joblib").exists()


def test_estimators_and_inference_share_builder_and_preserve_probabilities(tmp_path):
    # Synthetic data verifies software contracts, never football performance.
    fixtures = [game(i, home_goals=i % 3, away_goals=1) for i in range(1, 40)]
    rows, names, matrix = dataset(fixtures, game(45).kickoff)
    labels = np.array([row.target for row in rows])
    for model in candidates().values():
        model.fit(matrix, labels)
        validate_probabilities(model.predict_proba(matrix))
        assert tuple(model.classes_) == CLASSES
    future = game(50, status_short="NS", home_goals=None, away_goals=None)
    artifact = {
        **mode_metadata(False),
        **feature_metadata(FeatureConfig()),
        "estimator": model,
        "features": names,
        "model_version": "test-only",
        "availability_policy": POLICY,
        "selected_through": game(45).kickoff.isoformat(),
        "dependencies": {},
        "dataset_sha256": "test",
        "status": "test-only",
        "source_sha256": {
            name: hashlib.sha256((Path("ml") / name).read_bytes()).hexdigest()
            for name in (
                "data.py",
                "features.py",
                "mode.py",
                "policy.py",
                "feature_registry.py",
                "football_context.py",
                "feature_sources.py",
            )
        },
    }
    target = tmp_path / "model.joblib"
    joblib.dump(artifact, target)
    result = predict(
        joblib.load(target), fixtures + [future], future.id, game(49).kickoff
    )
    assert sum(result["probabilities"].values()) == pytest.approx(1)
    with pytest.raises(ValueError):
        predict(artifact, fixtures + [future], future.id, future.kickoff)
    with pytest.raises(ValueError):
        predict(artifact, fixtures + [future], future.id, game(44).kickoff)


def test_training_end_to_end_and_selection(tmp_path):
    source = tmp_path / "fixtures.jsonl"
    export_file(
        source, [game(i, home_goals=i % 3, away_goals=1) for i in range(1, 601)]
    )
    output = tmp_path / "run"
    report = run(source, output, game(351).kickoff, game(476).kickoff)
    assert report["status"] == "experimental_candidate"
    assert len(report["validation"]) == 5
    assert len(report["test"]) == 5
    assert report["selected"] == min(
        (
            name
            for name in report["validation"]
            if name not in ("majority", "home_bias")
        ),
        key=lambda name: report["validation"][name]["log_loss"],
    )
    assert (output / "model.joblib").exists()
    artifact = joblib.load(output / "model.joblib")
    _, fixtures = read_export(source)
    rows, _, matrix = dataset(fixtures, game(2000).kickoff)
    train = split(rows, game(351).kickoff, game(476).kickoff)["train"]
    np.testing.assert_allclose(
        artifact["estimator"].named_steps["simpleimputer"].statistics_,
        np.array(
            [
                np.median(column[~np.isnan(column)]) if np.any(~np.isnan(column)) else 0
                for column in matrix[train].T
            ]
        ),
    )
    saved = json.loads((output / "test-predictions.json").read_text())
    for name, values in saved["probabilities"].items():
        evaluated = metrics(np.array(saved["labels"]), np.array(values))
        for metric in ("accuracy", "log_loss", "brier"):
            assert evaluated[metric] == pytest.approx(report["test"][name][metric])
        assert evaluated["confusion_matrix"] == report["test"][name]["confusion_matrix"]
    with pytest.raises(FileExistsError):
        run(source, output, game(351).kickoff, game(476).kickoff)
