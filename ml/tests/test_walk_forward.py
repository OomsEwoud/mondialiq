"""Synthetic evaluation contracts; no evidence of real football performance."""

from dataclasses import replace
from datetime import timedelta
import json
import subprocess
import sys

import joblib
import numpy as np
import pytest

from ml.calibration import CalibrationConfig, fit_model
from ml.data import CLASSES
from ml.evaluate import run
from ml.evaluation import (
    aggregate_metrics,
    metrics,
    probabilities_for,
    validate_probabilities,
)
from ml.experiment_config import parse_config
from ml.feature_registry import FeatureConfig, config_from_artifact
from ml.inference import predict
from ml.tests.test_features import game
from ml.tests.test_pipeline import export_file
from ml.training import candidates
from ml.walk_forward import Fold, partition, validate_schedule


def specification(calibrated=False, final=False):
    raw = {
        "schema_version": 1,
        "feature_set_version": "v2",
        "strategy": "expanding-window",
        "experiments": [
            {"name": "A", "groups": ["result_form"]},
            {"name": "B", "groups": ["result_form", "elo"]},
        ],
        "models": ["majority", "home_bias", "logistic_regression"],
        "folds": [
            {
                "validation_start": game(start).kickoff.isoformat(),
                "validation_end": game(end).kickoff.isoformat(),
                **(
                    {"calibration_start": game(start - 6).kickoff.isoformat()}
                    if calibrated
                    else {}
                ),
            }
            for start, end in ((25, 31), (37, 43))
        ],
        "calibration": {
            "method": "sigmoid" if calibrated else "none",
            "min_samples": 6,
            "min_per_class": 1,
        },
    }
    if final:
        raw["final_test"] = {
            "start": game(49).kickoff.isoformat(),
            "end": game(55).kickoff.isoformat(),
            **(
                {"calibration_start": game(43).kickoff.isoformat()}
                if calibrated
                else {}
            ),
        }
    return raw


def fixtures():
    return [game(i, home_goals=i % 3) for i in range(1, 61)]


def test_expanding_folds_disjoint_purged_and_reproducible():
    config = parse_config(specification(True, True), FeatureConfig())
    validate_schedule(config.folds, config.final_test, game(100).kickoff, True)
    rows = fixtures()
    first = partition(rows, config.folds[0], historical=True)
    second = partition(rows, config.folds[1], historical=True)
    assert set(first["indices"]["train"]) < set(second["indices"]["train"])
    for fold, result in zip(config.folds, (first, second)):
        parts = result["indices"]
        assert set(parts["train"]).isdisjoint(parts["calibration"])
        assert set(parts["train"]).isdisjoint(parts["validation"])
        assert set(parts["calibration"]).isdisjoint(parts["validation"])
        assert all(rows[i].kickoff < fold.fit_before for i in parts["train"])
        assert all(
            fold.calibration_start <= rows[i].kickoff < fold.validation_start
            for i in parts["calibration"]
        )
        assert all(
            fold.validation_start <= rows[i].kickoff < fold.validation_end
            for i in parts["validation"]
        )
    again = parse_config(specification(True, True), FeatureConfig())
    assert [f.metadata() for f in config.folds] == [f.metadata() for f in again.folds]


def test_tied_kickoffs_and_late_labels_never_cross_phase_boundaries():
    fold = Fold("fold", game(25).kickoff, game(31).kickoff, game(19).kickoff)
    rows = fixtures()
    rows[23] = replace(rows[23], kickoff=rows[24].kickoff)
    rows[0] = replace(rows[0], observed_at=game(30).kickoff)
    rows[18] = replace(rows[18], observed_at=game(25).kickoff)
    rows[24] = replace(rows[24], observed_at=game(31).kickoff)
    strict = partition(rows, fold)
    assert 1 in strict["purged_fixture_ids"]["train"]
    assert 19 in strict["purged_fixture_ids"]["calibration"]
    assert 25 in strict["purged_fixture_ids"]["validation"]
    historical = partition(rows, fold, historical=True)
    assert (
        23 in historical["indices"]["validation"]
        and 24 in historical["indices"]["validation"]
    )
    assert 0 in historical["indices"]["train"]
    rows[17] = replace(rows[17], kickoff=fold.fit_before - timedelta(hours=2))
    assert 18 in partition(rows, fold, historical=True)["purged_fixture_ids"]["train"]


@pytest.mark.parametrize(
    "problem", ["overlap", "future", "calibration", "final", "single", "reverse_train"]
)
def test_invalid_schedule_refused(problem):
    config = parse_config(specification(), FeatureConfig())
    folds, final = config.folds, None
    if problem == "overlap":
        folds = (folds[0], replace(folds[1], validation_start=game(30).kickoff))
    elif problem == "future":
        folds = (folds[0], replace(folds[1], validation_end=game(101).kickoff))
    elif problem == "calibration":
        folds = (replace(folds[0], calibration_start=game(19).kickoff), folds[1])
    elif problem == "final":
        final = Fold("final", game(40).kickoff, game(50).kickoff)
    elif problem == "single":
        folds = folds[:1]
    else:
        folds = (folds[0], replace(folds[1], calibration_start=game(10).kickoff))
    with pytest.raises(ValueError):
        validate_schedule(folds, final, game(100).kickoff, False)


def test_preprocessing_fit_only_on_train_and_calibration_freezes_estimator(monkeypatch):
    matrix = np.arange(90, dtype=float).reshape(45, 2)
    matrix[0, 0] = np.nan
    matrix[30:] += 10000
    labels = np.array([CLASSES[i % 3] for i in range(45)])
    model = candidates()["logistic_regression"]
    original_fit = model.fit
    fit_inputs = []

    def tracked_fit(x, y, **kwargs):
        fit_inputs.append(x.copy())
        return original_fit(x, y, **kwargs)

    monkeypatch.setattr(model, "fit", tracked_fit)
    fitted = fit_model(
        model,
        matrix,
        labels,
        list(range(30)),
        list(range(30, 39)),
        CalibrationConfig("sigmoid", min_samples=9, min_per_class=2),
    )
    assert len(fit_inputs) == 1
    np.testing.assert_allclose(fit_inputs[0], matrix[:30], equal_nan=True)
    imputer = model.named_steps["simpleimputer"]
    np.testing.assert_allclose(imputer.statistics_, np.nanmedian(matrix[:30], axis=0))
    np.testing.assert_allclose(
        model.named_steps["standardscaler"].mean_,
        imputer.transform(matrix[:30]).mean(axis=0),
    )
    assert fitted.calibrated_classifiers_[0].estimator.estimator is model
    validate_probabilities(probabilities_for(fitted, matrix[39:]))


@pytest.mark.parametrize(
    "train,cal",
    [
        ([0, 1, 2], [2, 3, 4]),
        ([0, 1, 1], [3, 4, 5]),
        ([5, 6, 7], [0, 1, 2]),
        ([-1, 0, 1], [3, 4, 5]),
    ],
)
def test_invalid_calibration_splits_fail(train, cal):
    with pytest.raises(ValueError):
        fit_model(
            candidates()["home_bias"],
            np.ones((12, 2)),
            np.array(list(CLASSES) * 4),
            train,
            cal,
            CalibrationConfig("sigmoid", 3, 1),
        )


def test_probability_metrics_and_fold_aggregation():
    result = metrics(np.array(CLASSES), np.eye(3))
    assert result["macro_f1"] == result["accuracy"] == 1
    assert result["brier"] == 0
    assert result["confusion_matrix"] == np.eye(3, dtype=int).tolist()
    assert all(
        sum(bin["count"] for bin in result["reliability"][label]) == 3
        for label in CLASSES
    )
    aggregate = aggregate_metrics([result, {**result, "accuracy": 0.5}])
    assert aggregate["accuracy"]["mean"] == 0.75
    assert aggregate["accuracy"]["std"] == 0.25
    for invalid in (
        np.array([[0.5, 0.3, 0.3]]),
        np.array([[1.1, -0.1, 0]]),
        np.array([[np.inf, 0, 0]]),
        np.ones((1, 2)),
    ):
        with pytest.raises(ValueError):
            validate_probabilities(invalid)
    with pytest.raises(ValueError, match="aligned"):
        metrics(np.array(["H"]), np.eye(3))
    with pytest.raises(ValueError, match="Unknown"):
        metrics(np.array(["X"]), np.array([[0.2, 0.3, 0.5]]))


def test_dry_run_has_identical_ablation_targets_and_never_fits(tmp_path, monkeypatch):
    source = tmp_path / "data.jsonl"
    export_file(source, fixtures())
    config = parse_config(specification(True, True), FeatureConfig())

    def forbidden(*args, **kwargs):
        raise AssertionError("Dry-run must not fit")

    monkeypatch.setattr("ml.evaluate.fit_model", forbidden)
    report = run(source, tmp_path / "audit", config, historical=True, dry_run=True)
    repeated = run(source, tmp_path / "repeat", config, historical=True, dry_run=True)
    assert report["status"] == "dry_run"
    assert report["folds_sha256"] == repeated["folds_sha256"]
    assert report["evaluation_config_sha256"] == repeated["evaluation_config_sha256"]
    assert report["run_id"] != repeated["run_id"]
    assert report["final_test"]["status"] == "reserved_not_evaluated"
    assert (
        report["experiments"]["A"]["feature_count"]
        < report["experiments"]["B"]["feature_count"]
    )
    assert not list((tmp_path / "audit").rglob("*.joblib"))
    with pytest.raises(FileExistsError):
        run(source, tmp_path / "audit", config, historical=True, dry_run=True)


def test_end_to_end_artifacts_calibration_final_selection_and_test_independence(
    tmp_path,
):
    source = tmp_path / "data.jsonl"
    rows = fixtures()
    export_file(source, rows)
    config = parse_config(specification(True, True), FeatureConfig())
    output = tmp_path / "run"
    report = run(source, output, config, historical=True)
    assert report["status"] == "evaluated"
    assert report["final_test"]["status"] == "evaluated_once"
    selected = report["selected_on_validation"]
    assert selected == min(
        report["validation_ranking"],
        key=lambda item: (
            item["mean_validation_log_loss"],
            item["experiment"],
            item["model"],
        ),
    )
    reference = report["experiments"]["A"]["models"]["majority"]["folds"]
    for experiment in report["experiments"].values():
        for model in experiment["models"].values():
            assert [f["samples"] for f in model["folds"]] == [
                f["samples"] for f in reference
            ]
            for fold in model["folds"]:
                artifact = joblib.load(output / fold["artifact"])
                assert artifact["calibration"]["active"] is True
                assert artifact["calibration"]["count"] == 6
                assert artifact["production_eligible"] is False
                assert artifact["source_sha256"]["evaluate.py"]
                config_from_artifact(artifact)
                predictions = json.loads((output / fold["predictions"]).read_text())
                assert (
                    metrics(
                        np.array(predictions["labels"]),
                        np.array(next(iter(predictions["probabilities"].values()))),
                    )
                    == fold["metrics"]
                )
                with pytest.raises(ValueError, match="offline-only"):
                    predict(
                        artifact, rows, 60, game(59).kickoff, historical_replay=True
                    )
    modified_source = tmp_path / "changed.jsonl"
    export_file(
        modified_source,
        [
            replace(f, home_goals=8, away_goals=0)
            if f.kickoff >= game(49).kickoff
            else f
            for f in rows
        ],
    )
    modified = run(modified_source, tmp_path / "changed", config, historical=True)
    assert modified["selected_on_validation"] == selected
    for experiment in report["experiments"]:
        for model in report["experiments"][experiment]["models"]:
            assert (
                modified["experiments"][experiment]["models"][model]["aggregate"]
                == report["experiments"][experiment]["models"][model]["aggregate"]
            )


def test_cli_and_config_version_guards(tmp_path):
    source, configuration = tmp_path / "data.jsonl", tmp_path / "config.json"
    export_file(source, fixtures())
    raw = specification()
    configuration.write_text(json.dumps(raw))
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "ml.evaluate",
            str(source),
            "--mode",
            "historical",
            "--experiment-config",
            str(configuration),
            "--output",
            str(tmp_path / "cli"),
            "--dry-run",
        ],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout)["status"] == "dry_run"
    for changes in (
        {"feature_set_version": "v1"},
        {"strategy": "random"},
        {"models": ["logistic_regression"]},
        {"experiments": [{"name": "../escape", "groups": ["elo"]}]},
    ):
        with pytest.raises(ValueError):
            parse_config({**raw, **changes}, FeatureConfig())


def test_strict_and_demo_availability_remain_blocking(tmp_path):
    config = parse_config(specification(), FeatureConfig())
    for demo in (False, True):
        source = tmp_path / f"late-{demo}.jsonl"
        export_file(
            source,
            [
                replace(
                    f,
                    observed_at=game(100).kickoff,
                    external_id=99_000_000 + f.id if demo else f.external_id,
                )
                for f in fixtures()
            ],
        )
        report = run(
            source, tmp_path / f"strict-{demo}", config, allow_demo=demo, dry_run=True
        )
        assert report["status"] == "blocked"
        assert report["folds"][0]["samples"]["train"]["count"] == 0
        assert not list((tmp_path / f"strict-{demo}").rglob("*.joblib"))


def test_uncalibrated_evaluation_does_not_touch_unreserved_future_rows(tmp_path):
    source = tmp_path / "data.jsonl"
    export_file(source, fixtures())
    raw = specification()
    raw["models"] = ["majority", "home_bias"]
    config = parse_config(raw, FeatureConfig())
    report = run(source, tmp_path / "plain", config, historical=True)
    assert report["status"] == "evaluated"
    assert "final_test" not in report
    assert set(report["model_configs"]) == {"majority", "home_bias"}
    for experiment in report["experiments"].values():
        for model in experiment["models"].values():
            assert len(model["folds"]) == 2
            for fold in model["folds"]:
                assert fold["calibration"]["active"] is False
                assert fold["calibration"]["count"] == 0
                assert max(fold["samples"]["validation"]["fixture_ids"]) < 43


@pytest.mark.parametrize("missing_class", [False, True])
def test_calibration_insufficient_data_blocks_without_refitting(
    tmp_path, missing_class
):
    rows = fixtures()
    if missing_class:
        rows = [replace(f, home_goals=1) if 19 <= f.id < 25 else f for f in rows]
    source = tmp_path / "data.jsonl"
    export_file(source, rows)
    raw = specification(True)
    if not missing_class:
        raw["calibration"]["min_samples"] = 100
    report = run(
        source,
        tmp_path / "blocked",
        parse_config(raw, FeatureConfig()),
        historical=True,
    )
    assert report["status"] == "blocked"
    assert any("Calibration" in reason for reason in report["blockers"])
    assert not list((tmp_path / "blocked").rglob("*.joblib"))
