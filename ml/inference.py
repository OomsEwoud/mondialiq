"""Local inference; load only trusted model artifacts created by this pipeline."""

import argparse
import hashlib
import json
from datetime import datetime, timezone
from importlib.metadata import version
from pathlib import Path

import joblib
import numpy as np

from ml.data import POLICY, Fixture, instant, read_export
from ml.evaluation import probabilities_for
from ml.features import FeatureBuilder
from ml.mode import check_mode
from ml.feature_registry import config_from_artifact, feature_metadata
from ml.policy import HISTORICAL_POLICY, fixture_fingerprint


def predict(
    artifact: dict,
    fixtures: list[Fixture],
    fixture_id: int,
    cutoff: datetime,
    allow_demo: bool = False,
    replay: bool = False,
    historical_replay: bool = False,
) -> dict:
    if artifact.get("artifact_kind") == "walk_forward_evaluation":
        raise ValueError("Evaluation artifacts are offline-only; not inference models")
    demo = check_mode(artifact, allow_demo, historical=historical_replay)
    if historical_replay:
        if replay or fixture_id not in artifact["partitions"]["test"]["fixture_ids"]:
            raise ValueError(
                "Historical replay requires a held-out historical test fixture"
            )
        if fixture_fingerprint(fixtures) != artifact.get("fixture_fingerprint"):
            raise ValueError("Historical replay requires the unchanged training export")
    feature_config = config_from_artifact(artifact)
    fixture = next((item for item in fixtures if item.id == fixture_id), None)
    if replay and (
        not demo or fixture_id not in artifact["partitions"]["test"]["fixture_ids"]
    ):
        raise ValueError(
            "Replay requires explicit demo mode and a held-out test fixture"
        )
    if (
        fixture is None
        or not fixture.admitted(demo)
        or (
            not replay
            and not historical_replay
            and (fixture.status_short != "NS" or cutoff >= fixture.kickoff)
        )
        or ((replay or historical_replay) and cutoff != fixture.kickoff)
        or (historical_replay and not fixture.complete)
    ):
        raise ValueError(
            "Inference requires a real, not-started fixture and a pre-kickoff cutoff"
        )
    expected_policy = HISTORICAL_POLICY if historical_replay else POLICY
    if artifact["availability_policy"] != expected_policy or cutoff < instant(
        artifact["selected_through"]
    ):
        raise ValueError(
            "Model policy or model selection time is incompatible with cutoff"
        )
    for name, expected in artifact["dependencies"].items():
        if version(name) != expected:
            raise ValueError(f"Dependency mismatch: {name}")
    for name in (
        "data.py",
        "features.py",
        "mode.py",
        "policy.py",
        "feature_registry.py",
        "football_context.py",
        "feature_sources.py",
    ):
        digest = hashlib.sha256(Path(__file__).with_name(name).read_bytes()).hexdigest()
        if artifact["source_sha256"][name] != digest:
            raise ValueError("Feature builder changed; retrain model")
    builder = FeatureBuilder(
        fixtures, allow_demo=demo, historical=historical_replay, config=feature_config
    )
    values = builder.build(fixture, cutoff)
    if sorted(values) != artifact["features"]:
        raise ValueError("Feature or class schema mismatch")
    probabilities = probabilities_for(
        artifact["estimator"],
        np.array([[values[name] for name in artifact["features"]]]),
    )
    mapped = dict(zip(("A", "D", "H"), probabilities[0].tolist()))
    result = {
        **feature_metadata(feature_config),
        "model_version": artifact["model_version"],
        "training_mode": artifact["training_mode"],
        "dataset_type": artifact["dataset_type"],
        "production_eligible": artifact["production_eligible"],
        "warning": artifact["warning"],
        "fixture_id": fixture.id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "cutoff_time": cutoff.isoformat(),
        "status": artifact["status"],
        "training_dataset_sha256": artifact["dataset_sha256"],
        "source_history": builder.snapshot(fixture, cutoff)["source_history"],
        "features": {
            name: value if np.isfinite(value) else None
            for name, value in values.items()
        },
        "probabilities": {
            "home": mapped["H"],
            "draw": mapped["D"],
            "away": mapped["A"],
        },
    }

    if historical_replay:
        result["actual_result"] = {
            "outcome": fixture.target,
            "home_goals": fixture.home_goals,
            "away_goals": fixture.away_goals,
        }
        result["purpose"] = "held-out historical replay only"
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export", type=Path)
    parser.add_argument("model", type=Path)
    parser.add_argument("fixture_id", type=int)
    parser.add_argument("--allow-demo", action="store_true")
    parser.add_argument(
        "--replay-test",
        action="store_true",
        help="Replay a demo test fixture at kickoff; model availability check remains enforced",
    )
    parser.add_argument("--historical-replay", action="store_true")
    args = parser.parse_args()
    header, fixtures = read_export(args.export)
    cutoff = instant(header["exported_at"])
    if args.replay_test or args.historical_replay:
        fixture = next((item for item in fixtures if item.id == args.fixture_id), None)
        if fixture is None:
            parser.error("Fixture not found")
        cutoff = fixture.kickoff
    result = predict(
        joblib.load(args.model),
        fixtures,
        args.fixture_id,
        cutoff,
        allow_demo=args.allow_demo,
        replay=args.replay_test,
        historical_replay=args.historical_replay,
    )
    print(json.dumps(result, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
