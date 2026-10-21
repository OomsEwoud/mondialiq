"""Audit feature coverage using the shared point-in-time dataset, without fitting."""

import argparse
import hashlib
import json
from pathlib import Path

import numpy as np

from ml.data import instant, read_export
from ml.dataset import dataset
from ml.feature_registry import (
    FeatureConfig,
    active_definitions,
    add_feature_arguments,
    config_from_arguments,
    feature_metadata,
)
from ml.policy import fixture_fingerprint


def coverage(fixtures, exported_at, config=None, target_seasons=None):
    config = config or FeatureConfig()
    rows, names, matrix = dataset(
        fixtures,
        exported_at,
        historical=True,
        target_seasons=target_seasons,
        feature_config=config,
    )
    registry = active_definitions(config)

    def summarize(indices):
        values = matrix[indices]

        def fraction(keys, minimum=1):
            if not indices or any(key not in names for key in keys):
                return None
            return float(
                np.mean(
                    np.all(
                        values[:, [names.index(key) for key in keys]] >= minimum, axis=1
                    )
                )
            )

        missing = {
            family: float(
                np.isnan(
                    values[
                        :,
                        [
                            i
                            for i, name in enumerate(names)
                            if registry[name].family == family
                        ],
                    ]
                ).mean()
            )
            if indices
            else None
            for family in config.groups
            if any(registry[name].family == family for name in names)
        }
        return {
            "targets": len(indices),
            "both_history_5": fraction(
                ["home_available_history_count", "away_available_history_count"], 5
            ),
            "both_history_10": fraction(
                ["home_available_history_count", "away_available_history_count"], 10
            ),
            "both_venue_history_5": fraction(
                ["home_venue_history_count", "away_venue_history_count"], 5
            ),
            "both_elo_initialized": None
            if not indices or "home_elo_initializing" not in names
            else float(
                np.mean(
                    (values[:, names.index("home_elo_initializing")] == 0)
                    & (values[:, names.index("away_elo_initializing")] == 0)
                )
            ),
            "league_context": fraction(["league_context_available"]),
            "reconstructed_standings": fraction(["reconstructed_table_available"]),
            "h2h": fraction(["h2h_5_count"]),
            "missingness_by_family": missing,
        }

    groups = {}
    for field in ("league_id", "season"):
        groups[field] = {
            str(value): summarize(
                [i for i, row in enumerate(rows) if getattr(row, field) == value]
            )
            for value in sorted({getattr(row, field) for row in rows})
        }
    starts = {}
    for fixture in fixtures:
        key = (fixture.league_id, fixture.season)
        starts[key] = min(starts.get(key, fixture.kickoff), fixture.kickoff)
    early = [
        i
        for i, row in enumerate(rows)
        if (row.kickoff - starts[(row.league_id, row.season)]).days < 30
    ]
    return {
        "purpose": "historical feature coverage only; no model training",
        "production_eligible": False,
        "fixture_fingerprint": fixture_fingerprint(fixtures),
        "feature_config": feature_metadata(config),
        "overall": summarize(list(range(len(rows)))),
        "by": groups,
        "first_30_days": summarize(early),
        "limitations": "Coverage is point-in-time historical result replay; not provider observation availability. NaN season progress is intentional. Missing families return null, not zero coverage.",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export", type=Path)
    parser.add_argument("--target-season", type=int, action="append")
    add_feature_arguments(parser)
    args = parser.parse_args()
    header, fixtures = read_export(args.export)
    report = coverage(
        fixtures,
        instant(header["exported_at"]),
        config_from_arguments(args),
        set(args.target_season) if args.target_season else None,
    )
    report["export_sha256"] = hashlib.sha256(args.export.read_bytes()).hexdigest()
    print(json.dumps(report, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
