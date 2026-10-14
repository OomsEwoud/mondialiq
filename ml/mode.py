"""Explicit demo admission and shared, fail-closed artifact metadata."""

from ml.policy import validate_mode

HISTORICAL_WARNING = (
    "HISTORICAL BACKTEST ONLY: retrospectively imported FT results; "
    "football chronology does not prove historical provider availability or "
    "absence of later corrections. Not eligible for production or live inference."
)

DEMO_WARNING = (
    "WARNING: DEMO DATA MODE\n"
    "This model is trained on demo/synthetic data.\n"
    "Metrics are not representative of real football performance.\n"
    "The generated artifact must never be used as a production model."
)


def mode_metadata(allow_demo: bool, historical: bool = False) -> dict:
    validate_mode(allow_demo, historical)
    if historical:
        return {
            "model_version": "historical-baseline-1",
            "training_mode": "historical_backtest",
            "dataset_type": "historical_provider_data",
            "production_eligible": False,
            "warning": HISTORICAL_WARNING,
        }
    return {
        "model_version": "demo-baseline-1" if allow_demo else "baseline-1",
        "training_mode": "demo" if allow_demo else "standard",
        "dataset_type": "demo" if allow_demo else "real",
        "production_eligible": False,
        "warning": DEMO_WARNING
        if allow_demo
        else "Experimental candidate; not approved for production.",
    }


def check_mode(
    metadata: dict, allow_demo: bool = False, historical: bool = False
) -> bool:
    validate_mode(allow_demo, historical)
    expected = mode_metadata(False, True)
    markers = (
        metadata.get("training_mode") == expected["training_mode"],
        metadata.get("dataset_type") == expected["dataset_type"],
        str(metadata.get("model_version", "")).startswith("historical-"),
        metadata.get("warning") == HISTORICAL_WARNING,
    )
    if any(markers):
        if any(metadata.get(key) != value for key, value in expected.items()):
            raise ValueError("Inconsistent historical metadata; artifact rejected")
        if not historical:
            raise ValueError("Historical artifact requires explicit historical mode")
        return False
    if historical:
        raise ValueError("Historical mode requires a historical artifact")
    mode = metadata.get("training_mode")
    demo_markers = (
        mode == "demo",
        metadata.get("dataset_type") == "demo",
        str(metadata.get("model_version", "")).startswith("demo-"),
        metadata.get("warning") == DEMO_WARNING,
    )
    if any(demo_markers):
        if not all(demo_markers) or metadata.get("production_eligible") is not False:
            raise ValueError("Inconsistent demo metadata; artifact rejected")
        if not allow_demo:
            raise ValueError("Demo artifact requires explicit --allow-demo")
        return True
    if mode != "standard" or metadata.get("dataset_type") != "real":
        raise ValueError("Missing or unknown training mode; retrain legacy artifact")
    return False
