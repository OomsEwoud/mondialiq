"""Inspect the existing feature snapshot without requiring a trained model."""

import argparse
import json
from pathlib import Path

from ml.data import instant, read_export
from ml.features import FeatureBuilder
from ml.mode import mode_metadata


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export", type=Path)
    parser.add_argument("fixture_id", type=int)
    parser.add_argument("--cutoff", type=instant, required=True)
    parser.add_argument("--allow-demo", action="store_true")
    parser.add_argument(
        "--mode", choices=("standard", "historical"), default="standard"
    )
    args = parser.parse_args()
    historical = args.mode == "historical"
    metadata = mode_metadata(args.allow_demo, historical)
    header, fixtures = read_export(args.export)
    fixture = next((item for item in fixtures if item.id == args.fixture_id), None)
    if fixture is None or not fixture.admitted(args.allow_demo):
        parser.error("Fixture not found or not admitted in this mode")
    if args.cutoff > instant(header["exported_at"]):
        parser.error("Cannot inspect a cutoff after export time")
    snapshot = FeatureBuilder(
        fixtures, allow_demo=args.allow_demo, historical=historical
    ).snapshot(fixture, args.cutoff)
    print(
        json.dumps(
            {
                **metadata,
                "artifact_produced": False,
                "purpose": "feature inspection only; no prediction",
                **snapshot,
            },
            indent=2,
            allow_nan=False,
        )
    )


if __name__ == "__main__":
    main()
