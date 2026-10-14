"""Explicit demo admission and shared, fail-closed artifact metadata."""

DEMO_WARNING = (
    "WARNING: DEMO DATA MODE\n"
    "This model is trained on demo/synthetic data.\n"
    "Metrics are not representative of real football performance.\n"
    "The generated artifact must never be used as a production model."
)


def mode_metadata(allow_demo: bool) -> dict:
    return {
        "model_version": "demo-baseline-1" if allow_demo else "baseline-1",
        "training_mode": "demo" if allow_demo else "standard",
        "dataset_type": "demo" if allow_demo else "real",
        "production_eligible": False,
        "warning": DEMO_WARNING
        if allow_demo
        else "Experimental candidate; not approved for production.",
    }


def check_mode(metadata: dict, allow_demo: bool = False) -> bool:
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
