# MondialIQ ML baseline

Offline 1X2 probabilities for regulation time. Laravel remains the application and
the only database reader. Python consumes a local, private JSONL export. There are
no API calls, notebooks, web routes, scheduled jobs or database writes in this pipeline.

The local audit on 2026-10-13 found 45 demo fixtures and **zero usable real fixtures**.
No football model has been trained or approved. See [the report](../docs/ml/ml-baseline-report.md).

An explicit `--allow-demo` mode is available for development. It retains all
availability filters, including label purging across split boundaries. The existing
local demo dataset still cannot train: its results were recorded after the proposed
training and validation periods. See [demo verification](../docs/ml/ml-demo-verification.md).

Retrospectively imported real results now have an explicit `--mode historical`.
Standard and demo timestamp guards remain unchanged. Read the
[historical policy, quality report and commands](../docs/ml/ml-historical-backtest.md)
before using backfilled data. Historical artifacts cannot predict future fixtures.

## Setup

Python 3.12 was used for verification. From the repository root, on Windows:

```powershell
python -m venv ml/.venv
ml/.venv/Scripts/python -m pip install -r ml/requirements-dev.txt
```

On Linux/macOS use `ml/.venv/bin/python` and `ml/.venv/bin/ruff`. Runtime requirements
are pinned separately from the optional Ruff development tool. No changes to `.env`
are required; Laravel uses its existing database configuration.

## Export and audit

```powershell
php artisan ml:export --kickoff-timezone=Europe/Brussels
ml/.venv/Scripts/python -m ml.training storage/app/private/ml/fixtures-TIMESTAMP.jsonl --output ml/artifacts/audit-UNIQUE
```

Replace `fixtures-TIMESTAMP.jsonl` with the path printed by Artisan. Output directories
must be new; existing runs are never overwritten. Insufficient-data runs write
`report.json`, return exit code 2 and never write `model.joblib`. Historical
`--audit-only` returns 0 when data passes the experimental checks, otherwise 2;
it never fits a model.

Verify stored kickoff timezone before export. The current API fixture endpoints
request Europe/Brussels, the importer preserves the supplied local wall-clock time,
and `Fixture::kickoffAt()` uses Brussels. Mixed legacy imports must be checked
separately. Audit timestamps are UTC; exported kickoff timestamps include offsets
and are converted to UTC. The explicit timezone flag prevents silent assumptions.

Exports have a schema header and a completion footer. Incomplete files, duplicate
fixtures, naive timestamps and changes observed after export start are rejected.
Export from a stable local database; repeat if synchronization modified it mid-export.
The export deliberately retains demo rows for diagnostics; Python excludes the
reserved demo fixture range and missing provider IDs from labels and histories.

## Train once sufficient real data exists

```powershell
ml/.venv/Scripts/python -m ml.training storage/app/private/ml/fixtures-TIMESTAMP.jsonl --output ml/artifacts/run-UNIQUE --validation-start 2024-07-01T00:00:00Z --test-start 2025-07-01T00:00:00Z
```

These dates illustrate the syntax, **not a valid split for the current database**.
Choose boundaries from the actual competition seasons before viewing test results.
At least 300/100/100 train/validation/test rows, 20 examples of every outcome per
partition, and 80% coverage with five previous results for both teams are required.
These are minimum safeguards, not statistical guarantees. Do not reduce them just
to obtain a model. Read the strict availability/backfill caveat in the feature design.

Outputs: `report.json`, `test-predictions.json`, `model.joblib`. The three estimators
and two trivial baselines are evaluated. Lowest validation log loss selects the ML
candidate before the test is evaluated. A candidate can lose to the trivial baselines;
both comparisons are explicit in the report. Every artifact remains experimental;
there is no automatic production promotion or Laravel write.

```powershell
ml/.venv/Scripts/python -m ml.evaluation ml/artifacts/run-UNIQUE/test-predictions.json
ml/.venv/Scripts/python -m ml.inference storage/app/private/ml/fixtures-NEW-TIMESTAMP.jsonl ml/artifacts/run-UNIQUE/model.joblib 123
```

Inference uses the fresh export's timestamp as cutoff and the **internal** fixture ID.
It requires a real `NS` fixture with future kickoff, a cutoff after model selection,
matching dependencies and unchanged feature source. It emits probabilities summing
to one, feature snapshot, model version and training data checksum. It cannot run
against the current demo-only dataset. Load only trusted, locally produced joblib
artifacts: Python pickle-based model files can execute code when loaded.

## Explicit demo mode

```powershell
php artisan ml:export --kickoff-timezone=Europe/Brussels
$export = 'storage/app/private/ml/fixtures-TIMESTAMP.jsonl'
ml/.venv/Scripts/python -m ml.training $export --output ml/artifacts/demo/UNIQUE --allow-demo
```

Replace the export filename and choose a new run directory. Demo mode admits only
the known reserved demo fixture range; standard mode admits only real provider
fixtures. Missing provider IDs remain excluded. Without the flag, existing strict
production training safeguards apply. No data is generated or timestamps modified.

Demo auto-splitting uses ordered distinct kickoffs around 60/20/20, retaining ties.
You may supply the existing explicit date arguments instead. **The same label
availability purge applies in both modes.** Demo only reduces sample/class/coverage
minimums, with at least one row in each partition. A blocked run produces a report,
not a model. Current local data yields 12/4/4 before purging and 0/0/4 afterwards.

Only after a demo run actually produces an artifact:

```powershell
ml/.venv/Scripts/python -m ml.evaluation ml/artifacts/demo/UNIQUE/test-predictions.json --allow-demo
ml/.venv/Scripts/python -m ml.inference $export ml/artifacts/demo/UNIQUE/model.joblib TEST_FIXTURE_ID --allow-demo --replay-test
ml/.venv/Scripts/python -m ml.inference $export ml/artifacts/demo/UNIQUE/model.joblib FUTURE_NS_FIXTURE_ID --allow-demo
```

`--replay-test` only permits a held-out test fixture, uses kickoff as feature cutoff
and still requires the model selection boundary to precede that cutoff. It does
not bypass label availability or permit in-sample predictions. The current local
run cannot execute these artifact-dependent commands. No future NS fixtures remain
relative to the verification export timestamp, either.

Demo artifacts have `model_version=demo-baseline-1`, `training_mode=demo`,
`dataset_type=demo`, `production_eligible=false` and the full shared warning.
Evaluation and inference refuse them without `--allow-demo`; inconsistent metadata
is rejected even with the flag. Metadata-free legacy artifacts require retraining.
Standard artifacts remain experimental and are not automatically production-approved.

Missing outcome classes are reported. Probability columns are mapped from estimator
classes to A/D/H, with zero for unlearned classes, never artificial training rows.
Logistic Regression and gradient boosting are skipped for fewer than two training
classes; Random Forest and trivial baselines can still operate on a single class.
All demo metrics are statistically meaningless. Calibration is not fitted.

Inspect actual source history and all 85 features even when training is blocked:

```powershell
ml/.venv/Scripts/python -m ml.inspect_features $export 27 --cutoff 2026-10-13T18:00:00Z --allow-demo
```

This uses the existing builder. The cutoff must not exceed fixture kickoff or export
time. The output is a feature snapshot, **not a model prediction**. Fixture 27 is
from the current demo export; choose an existing fixture ID for other databases.

Keep the original export alongside every run privately. Generated exports are under
Laravel's ignored private storage; `ml/.venv`, `ml/artifacts`, `ml/data`, caches and
binary models are ignored. Do not put generated files elsewhere in the repository.

## Checks

```powershell
ml/.venv/Scripts/python -m pytest ml/tests -q
ml/.venv/Scripts/ruff check ml
ml/.venv/Scripts/ruff format --check ml
php artisan test --compact
```

If sandbox temporary-directory permissions prevent pytest startup, use a **new**
directory under `ml/artifacts` as `--basetemp`; create `ml/artifacts` first. Tests use
synthetic fixtures solely to verify software behavior, never as evidence of predictive
quality. Laravel tests run against the existing configured in-memory SQLite database.
