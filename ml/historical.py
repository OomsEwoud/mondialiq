"""Historical data quality and warm-up coverage, independent of model fitting."""

from collections import Counter
from datetime import datetime

from ml.data import CLASSES, Fixture
from ml.features import FeatureBuilder
from ml.policy import available_at, result_exclusion


def historical_audit(
    fixtures: list[Fixture],
    rows: list[Fixture],
    exported_at: datetime,
    target_seasons: set[int] | None,
) -> dict:
    builder = FeatureBuilder(fixtures, historical=True)
    targets = {row.id for row in rows}
    used = set()
    coverage = []
    for row in rows:
        histories = [
            builder.source_history(row, team, row.kickoff)
            for team in (row.home_team_id, row.away_team_id)
        ]
        used.update(item.id for history in histories for item in history)
        coverage.append(
            {
                "fixture_id": row.id,
                "league_id": row.league_id,
                "season": row.season,
                "home": len(histories[0]),
                "away": len(histories[1]),
                "home_prior_season": sum(
                    item.season < row.season for item in histories[0]
                ),
                "away_prior_season": sum(
                    item.season < row.season for item in histories[1]
                ),
            }
        )

    def summarize(items: list[dict]) -> dict:
        result = {}
        for threshold in (1, 3, 5, 10):
            result[str(threshold)] = {}
            for side in ("home", "away", "both"):
                count = sum(
                    (item["home"] >= threshold and item["away"] >= threshold)
                    if side == "both"
                    else item[side] >= threshold
                    for item in items
                )
                result[str(threshold)][side] = {
                    "count": count,
                    "total": len(items),
                    "percentage": 100 * count / len(items) if items else None,
                }
        return result

    def quality(items: list[Fixture]) -> dict:
        reasons = Counter()
        eligible_history = 0
        for item in items:
            reason = result_exclusion(item)
            if reason is None and available_at(item, historical=True) >= exported_at:
                reason = "chronology"
            if reason:
                reasons[reason] += 1
            else:
                eligible_history += 1
        return {
            "total": len(items),
            "real_provider": sum(item.real for item in items),
            "finished": sum(
                item.status_short in ("FT", "AET", "PEN") for item in items
            ),
            "eligible_history": eligible_history,
            "eligible_targets": sum(item.id in targets for item in items),
            "eligible_non_targets": eligible_history
            - sum(item.id in targets for item in items),
            "used_as_history": sum(item.id in used for item in items),
            "excluded": {
                key: reasons[key]
                for key in (
                    "demo",
                    "unknown_provenance",
                    "status",
                    "missing_or_invalid_scores",
                    "invalid_teams",
                    "chronology",
                )
            },
            "outcomes": {
                label: sum(
                    item.id in targets and item.target == label for item in items
                )
                for label in CLASSES
            },
        }

    groups = {}
    for league, season in sorted({(f.league_id, f.season) for f in fixtures}):
        groups[f"{league}:{season}"] = {
            **quality(
                [f for f in fixtures if (f.league_id, f.season) == (league, season)]
            ),
            "coverage": summarize(
                [
                    c
                    for c in coverage
                    if (c["league_id"], c["season"]) == (league, season)
                ]
            ),
        }
    return {
        **quality(fixtures),
        "league_seasons": groups,
        "leagues": {
            str(league): quality([f for f in fixtures if f.league_id == league])
            for league in sorted({f.league_id for f in fixtures})
        },
        "seasons": {
            str(season): quality([f for f in fixtures if f.season == season])
            for season in sorted({f.season for f in fixtures})
        },
        "target_seasons": sorted(target_seasons) if target_seasons else "all",
        "source_leagues": sorted({f.league_id for f in fixtures}),
        "source_seasons": sorted({f.season for f in fixtures}),
        "coverage": summarize(coverage),
        "target_coverage": coverage,
        "targets_without_prior_season_history": sum(
            not c["home_prior_season"] or not c["away_prior_season"] for c in coverage
        ),
        "warmup_only_fixture_ids": sorted(used - targets),
        "history_window_days": 730,
        "provenance_limit": "Positive provider ID outside reserved demo range; export has no independent provider authenticity attestation.",
    }
