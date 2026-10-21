"""Declarative feature schema, configuration and fail-closed artifact contract."""

from dataclasses import asdict, dataclass
import hashlib
import json
from math import isfinite

VERSION = "v2"
WINDOWS = (3, 5, 10)
FORM_RATES = ("points", "wins", "draws", "losses")
GOAL_RATES = ("goals_for", "goals_against", "goal_difference")
TOTALS = FORM_RATES + GOAL_RATES
GOAL_EXTRAS = (
    "clean_sheet_rate",
    "failed_to_score_rate",
    "scoring_1_count",
    "scoring_2_count",
    "conceding_1_count",
    "conceding_2_count",
)
STREAKS = (
    "unbeaten",
    "win",
    "losing",
    "draw",
    "scoring",
    "clean_sheet",
    "conceding",
    "failed_to_score",
)
STATISTICS = (
    "shots",
    "shots_on_target",
    "possession",
    "corners",
    "fouls",
    "yellow_cards",
    "red_cards",
)
DEFAULT_GROUPS = (
    "result_form",
    "goals",
    "venue_form",
    "streaks",
    "elo",
    "league_context",
    "rest",
    "congestion",
    "h2h",
    "season",
    "history_quality",
    "reconstructed_standings",
    "ratios",
)
DISABLED_GROUPS = ("xg", "player_availability")


@dataclass(frozen=True)
class FeatureConfig:
    groups: tuple[str, ...] = DEFAULT_GROUPS
    elo_initial: float = 1500.0
    elo_k: float = 20.0
    elo_home_advantage: float = 60.0
    elo_season_retention: float = 0.75
    league_min_matches: int = 10
    streak_cap: int = 20

    def __post_init__(self) -> None:
        if not self.groups or len(set(self.groups)) != len(self.groups):
            raise ValueError("Feature groups must be nonempty and unique")
        if set(self.groups) - set(DEFAULT_GROUPS + ("match_statistics",)):
            raise ValueError(
                "Unknown or disabled feature group; reliable data contract required"
            )
        if not all(
            isfinite(value)
            for value in (
                self.elo_initial,
                self.elo_k,
                self.elo_home_advantage,
                self.elo_season_retention,
            )
        ):
            raise ValueError("Elo settings must be finite")
        if self.elo_k <= 0 or not 0 <= self.elo_season_retention <= 1:
            raise ValueError("Invalid Elo K or season retention")
        if any(
            type(value) is not int or value < 1
            for value in (self.league_min_matches, self.streak_cap)
        ):
            raise ValueError("Sample threshold and streak cap must be positive")


@dataclass(frozen=True)
class FeatureDefinition:
    name: str
    family: str
    meaning: str
    source: str = "historical_results"
    historical_safe: bool = True
    production_safe: bool = True
    requires: tuple[str, ...] = ("fixtures",)
    window: int | None = None
    context: str = "all"
    missingness: str = "NaN when no eligible evidence"
    dependencies: tuple[str, ...] = ()
    enabled: bool = True


def definitions() -> dict[str, FeatureDefinition]:
    result = {}

    def add(name: str, family: str, meaning: str, **kwargs) -> None:
        if name in result:
            raise ValueError(f"Duplicate registry feature: {name}")
        result[name] = FeatureDefinition(name, family, meaning, **kwargs)

    def difference(name: str, family: str, home: str, away: str, **kwargs) -> None:
        add(name, family, f"{home} minus {away}", dependencies=(home, away), **kwargs)

    for side in ("home", "away"):
        for context in ("all", "venue"):
            for window in WINDOWS:
                prefix = f"{side}_{context}_{window}"
                family = "result_form" if context == "all" else "venue_form"
                common = {"window": window, "context": f"{side}:{context}"}
                add(
                    f"{prefix}_count",
                    family,
                    "Number of eligible results in window",
                    missingness="0 means no eligible history",
                    **common,
                )
                add(
                    f"{prefix}_available",
                    family,
                    "At least one eligible result",
                    missingness="0 or 1",
                    **common,
                )
                for metric in TOTALS:
                    group = (
                        "goals" if context == "all" and metric in GOAL_RATES else family
                    )
                    add(
                        f"{prefix}_{metric}",
                        group,
                        f"{metric} per observed match; legacy rate name",
                        **common,
                    )
                    add(
                        f"{prefix}_{metric}_total",
                        group,
                        f"Total {metric} in observed window",
                        **common,
                    )
                for metric in GOAL_EXTRAS:
                    add(
                        f"{prefix}_{metric}",
                        "goals" if context == "all" else family,
                        metric.replace("_", " "),
                        **common,
                    )
        add(
            f"{side}_rest_days", "rest", "Kickoff-to-kickoff days since previous result"
        )
        add(f"{side}_long_rest", "rest", "Rest exceeds 30 days; no cap on actual rest")
        for days in (7, 14, 21):
            add(
                f"{side}_played_{days}d",
                "congestion",
                "Count of eligible results in trailing days",
                window=days,
                missingness="0 means none observed",
            )
        for streak in STREAKS:
            add(
                f"{side}_{streak}_streak",
                "streaks",
                f"Consecutive {streak} results, capped; 730-day history",
            )
        add(
            f"{side}_elo",
            "elo",
            "Pre-cutoff league-specific Elo rating",
            missingness="Configured initial rating for unseen team",
        )
        add(
            f"{side}_elo_initializing",
            "elo",
            "Fewer than five eligible league Elo updates",
            missingness="1 for new team",
        )
        for metric in ("points", "goals_for", "goals_against", "goal_difference"):
            add(
                f"{side}_league_relative_{metric}",
                "league_context",
                "Team league-season rate minus league all-team average",
            )
        add(
            f"{side}_venue_relative_points",
            "league_context",
            "Team league-season venue PPG minus league venue PPG",
        )
        add(
            f"{side}_season_played",
            "season",
            "Observed league-season matches before cutoff",
            missingness="0 means none observed",
        )
        add(
            f"{side}_early_season",
            "season",
            "Fewer than five observed league-season matches",
            missingness="0 or 1",
        )
        add(
            f"{side}_season_progress",
            "season",
            "Normalized season progress",
            missingness="Always NaN until trusted season-length contract exists",
        )
        for metric in (
            "available_history_count",
            "venue_history_count",
            "insufficient_history",
        ):
            add(
                f"{side}_{metric}",
                "history_quality",
                metric.replace("_", " "),
                missingness="Counts 0; insufficient=1 when fewer than five",
            )
        add(
            f"{side}_reconstructed_rank",
            "reconstructed_standings",
            "Approximate rank by points, GD, GF; ties share rank",
        )
        for stat in STATISTICS:
            add(
                f"{side}_stats_5_{stat}",
                "match_statistics",
                f"Mean {stat} from last five eligible matches with verified values",
                source="verified_fixture_statistics",
                requires=("fixtures", "historical_fixture_statistics"),
                window=5,
            )
            add(
                f"{side}_stats_5_{stat}_count",
                "match_statistics",
                "Number of nonmissing verified values",
                source="verified_fixture_statistics",
                requires=("fixtures", "historical_fixture_statistics"),
                window=5,
                missingness="0 means unavailable",
            )
        for metric in ("xg", "xga", "xg_difference", "xg_overperformance"):
            add(
                f"{side}_rolling_{metric}",
                "xg",
                "Disabled until real versioned xG is supplied",
                source="verified_xg",
                requires=("historical_xg",),
                historical_safe=False,
                production_safe=False,
                enabled=False,
            )
        for metric in (
            "expected_xi_strength",
            "missing_starters",
            "lineup_continuity",
            "goalkeeper_availability",
            "minutes_weighted_strength",
            "injuries_suspensions",
        ):
            add(
                f"{side}_{metric}",
                "player_availability",
                "Disabled until verified pre-match snapshots exist",
                source="prematch_player_snapshots",
                requires=(
                    "prematch_lineups",
                    "player_minutes",
                    "prematch_availability",
                ),
                historical_safe=False,
                production_safe=False,
                enabled=False,
            )
    for window in WINDOWS:
        for metric in TOTALS + ("clean_sheet_rate", "failed_to_score_rate"):
            group = "result_form" if metric in FORM_RATES else "goals"
            difference(
                f"difference_{window}_{metric}",
                group,
                f"home_all_{window}_{metric}",
                f"away_all_{window}_{metric}",
                window=window,
            )
    difference("difference_rest_days", "rest", "home_rest_days", "away_rest_days")
    for days in (7, 14, 21):
        difference(
            f"difference_played_{days}d",
            "congestion",
            f"home_played_{days}d",
            f"away_played_{days}d",
            window=days,
        )
    difference("difference_elo", "elo", "home_elo", "away_elo")
    add(
        "elo_expected_home_score",
        "elo",
        "Expected score (win + half draw), not a calibrated win probability",
        missingness="Configured prior for new teams",
    )
    for metric in (
        "home_win_rate",
        "draw_rate",
        "away_win_rate",
        "home_goals",
        "away_goals",
    ):
        add(
            f"league_{metric}",
            "league_context",
            f"League-season historical {metric}; requires minimum sample",
        )
    add(
        "league_context_count",
        "league_context",
        "Observed league-season result count",
        missingness="0 means none observed",
    )
    add(
        "league_context_available",
        "league_context",
        "Configured minimum sample reached",
        missingness="0 or 1",
    )
    for window in (3, 5):
        for metric in (
            "count",
            "home_wins",
            "draws",
            "away_wins",
            "home_goals",
            "away_goals",
            "total_goals_mean",
        ):
            add(
                f"h2h_{window}_{metric}",
                "h2h",
                f"{metric} mapped to CURRENT home/away identities",
                window=window,
                missingness="0 for count; NaN for other values without meetings",
            )
    add(
        "reconstructed_table_available",
        "reconstructed_standings",
        "Both teams observed in league-season table",
        missingness="0 or 1",
    )
    difference(
        "difference_reconstructed_rank",
        "reconstructed_standings",
        "home_reconstructed_rank",
        "away_reconstructed_rank",
    )
    add(
        "difference_table_points",
        "reconstructed_standings",
        "Home minus away reconstructed points",
    )
    add(
        "difference_table_ppg",
        "reconstructed_standings",
        "Home minus away reconstructed PPG",
    )
    for side, opponent in (("home", "away"), ("away", "home")):
        add(
            f"{side}_attack_defence_ratio_5",
            "ratios",
            "Scoring rate divided by opponent concession rate; positive denominator only",
            dependencies=(f"{side}_all_5_goals_for", f"{opponent}_all_5_goals_against"),
            window=5,
        )
    return result


REGISTRY = definitions()


def active_definitions(config: FeatureConfig) -> dict[str, FeatureDefinition]:
    return {
        name: definition
        for name, definition in sorted(REGISTRY.items())
        if definition.enabled and definition.family in config.groups
    }


def feature_metadata(config: FeatureConfig) -> dict:
    schema = [asdict(item) for item in active_definitions(config).values()]
    return {
        "feature_set_version": VERSION,
        "active_feature_groups": list(config.groups),
        "feature_config": asdict(config),
        "feature_config_sha256": hashlib.sha256(
            json.dumps(asdict(config), sort_keys=True).encode()
        ).hexdigest(),
        "feature_registry_sha256": hashlib.sha256(
            json.dumps(schema, sort_keys=True).encode()
        ).hexdigest(),
    }


def config_from_artifact(artifact: dict) -> FeatureConfig:
    if artifact.get("feature_set_version") != VERSION:
        raise ValueError("Feature-set version mismatch; retrain artifact")
    raw = artifact.get("feature_config", {})
    config = FeatureConfig(**{**raw, "groups": tuple(raw.get("groups", ()))})
    expected = feature_metadata(config)
    for key in (
        "active_feature_groups",
        "feature_registry_sha256",
        "feature_config_sha256",
    ):
        if artifact.get(key) != expected[key]:
            raise ValueError("Feature registry/config mismatch; retrain artifact")
    if artifact.get("features") != list(active_definitions(config)):
        raise ValueError("Feature names mismatch; retrain artifact")
    return config


def add_feature_arguments(parser) -> None:
    parser.add_argument(
        "--feature-group",
        action="append",
        choices=DEFAULT_GROUPS + ("match_statistics",),
    )
    parser.add_argument(
        "--feature-config",
        help="JSON FeatureConfig; cannot be combined with --feature-group",
    )


def config_from_arguments(args) -> FeatureConfig:
    from pathlib import Path

    if args.feature_config:
        if args.feature_group:
            raise ValueError("Choose feature-config or feature-group, not both")
        raw = json.loads(Path(args.feature_config).read_text(encoding="utf-8-sig"))
        return FeatureConfig(
            **{**raw, "groups": tuple(raw.get("groups", DEFAULT_GROUPS))}
        )
    return FeatureConfig(
        groups=tuple(args.feature_group) if args.feature_group else DEFAULT_GROUPS
    )
