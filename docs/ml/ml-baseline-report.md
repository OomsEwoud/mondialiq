# Baseline-1 — eerste resultaat

Datum: 13 oktober 2026. Status: **foundation geïmplementeerd; echte training geblokkeerd**.

## Bestaande data en datasetgrootte

45 fixtures, 20 FT, alle 45 demodata. Vier democompetities, uitsluitend seizoen 2026.
Nul bruikbare echte fixtures, dus geen echte H/D/A-verdeling, feature-missingness of
betrouwbare chronologische train/validation/testperiode. Zie [data-audit](ml-data-audit.md)
voor alle tabelcounts, per-leaguegegevens en leakagebevindingen.

De lokale Laravel-export en Python-audit zijn daadwerkelijk uitgevoerd. De run stopt
bewust zonder modelbestand. Geen synthetische of demoresultaten worden voorgesteld
als voetbalevaluatie.

## Features, splits, modellen en resultaten

85 vooraf gedefinieerde vorm-, thuis/uit-, goalrate-, rust/congestie- en verschilfeatures.
Eén builder voor historisch en toekomstig gebruik. Exacte namen en formules staan in
[het featureontwerp](ml-feature-design.md). Geen IDs, timestamps, actuele uitslag,
standings, provider predictions of odds als modelinput.

| Model | Accuracy | Log loss | Brier / calibration | Status |
|---|---|---|---|---|
| Majority | n.v.t. | n.v.t. | n.v.t. | Geïmplementeerd, echte data ontbreekt |
| Home-bias | n.v.t. | n.v.t. | n.v.t. | Geïmplementeerd, echte data ontbreekt |
| Logistic Regression | n.v.t. | n.v.t. | n.v.t. | Geïmplementeerd, echte data ontbreekt |
| Random Forest | n.v.t. | n.v.t. | n.v.t. | Geïmplementeerd, echte data ontbreekt |
| Gradient boosting | n.v.t. | n.v.t. | n.v.t. | Geïmplementeerd, echte data ontbreekt |

Geen splitdatums gekozen, geen calibrator toegevoegd, geen bookmakerbenchmark
(nul odds) en geen echte feature-importance-resultaten. Er is **geen gekozen
productiemodel baseline-1**. Of ML triviale voorspellingen verslaat, is onbekend.
De selector kiest straks een voorlopige ML-kandidaat op validation-log-loss,
vergelijkt expliciet met de baselines en rapporteert de test pas daarna.

## Architectuur en inference

Private Laravel-export → Python featurebuilder → chronologische selectie/evaluatie →
lokaal modelartifact → lokale CLI-inference. Geen frontendwijziging, API-syncwijziging,
quota-aanpassing, migratie, productie-integratie of databasewrite.

Inference retourneert modelversie, fixture-ID, generation/cutoff-tijd,
trainingschecksum, feature-snapshot en home/draw/away-kansen die optellen tot 1.
De bestaande prediction-infrastructuur is onderzocht; het voorstel voor beperkte
latere uitbreiding staat in het featureontwerp. Er is geen dubbel datamodel gemaakt.

## Exact ontbrekende data en prioriteiten

1. Echte provider-fixtures met teamkoppeling, competitie, seizoen, betrouwbare timezone,
   FT-status en beide reguliere scores. Richt op meerdere volledige seizoenen per
   gekozen competitie; minimaal 300 training + 100 validation + 100 test, plus
   voldoende oudere warm-upwedstrijden. Per partitie minstens 20 H, D en A.
2. Bewijs wanneer resultaten beschikbaar waren. Achteraf backfillen krijgt nieuwe
   `updated_at`-waarden en levert onder de huidige strikte policy geen historische
   rolling context binnen dat oude seizoen op. Historische observaties/snapshots
   verzamelen of prospectief opbouwen is noodzakelijk. Geen timestamps terugdateren.
3. Minstens 80% per partitie moet vijf oudere beschikbare resultaten voor beide teams
   hebben. Controleer competitiedekking, promoties, cups/neutrale velden, gewijzigde
   kickoffs en ontbrekende teamwedstrijden voordat rustfeatures geïnterpreteerd worden.
4. Daarna: eerste echte modelvergelijking en reliability-evaluatie; zo nodig aparte
   chronologische calibratie/selectieblokken. Geen testset gebruiken voor tuning.
5. Fase 2: Elo/teamratings en historische xG/rolling stats; vervolgens betrouwbaar
   vastgelegde player availability/lineups; pas daarna stronger boosting, tuning en
   ensembles. Bookmakerbenchmark vereist echte pre-match oddsversies. Exact-score
   blijft een apart later model.

De bestaande Laravel-sync blijft verantwoordelijk voor verzamelen. Er zijn in deze
opdracht geen synccommando's uitgevoerd en geen API-calls voor training gedaan.

## Gewijzigde bestanden en reviewbare commitgroepen

Geen commits gemaakt. Iedere rij hieronder noemt alle bestanden in die groep.

| Commitvoorstel | Bestanden | Reden |
|---|---|---|
| `Voeg alleen-lezen ML-export toe` | `app/Console/Commands/ExportMlFixtures.php`, `app/Services/MachineLearning/FixtureDatasetExporter.php`, `tests/Feature/ExportMlFixturesTest.php` | Expliciete tijdzone, private export, whitelist, completion marker en Laravel-regressietests |
| `Voeg reproduceerbare 1X2-baselinepipeline toe` | `ml/__init__.py`, `ml/.gitignore`, `ml/requirements.txt`, `ml/requirements-dev.txt`, `ml/data.py`, `ml/features.py`, `ml/dataset.py`, `ml/training.py`, `ml/evaluation.py`, `ml/inference.py`, `ml/tests/test_features.py`, `ml/tests/test_pipeline.py`, `eslint.config.js` | Schema/eligibility, 85 features, tijdsplits, modellen, metrics, metadata, inference en kritieke Python-tests; alleen de gegenereerde Python-venv uitsluiten van ESLint |
| `Documenteer ML-audit en datavereisten` | `README.md`, `ml/README.md`, `docs/ml/ml-data-audit.md`, `docs/ml/ml-feature-design.md`, `docs/ml/ml-baseline-report.md` | Installatie/commando's, echte audit, leakagebeleid, integratievoorstel en eindrapport |

Tests blijven bij hun implementatie zodat iedere groep zelfstandig reviewbaar is.
Exports, venv, tijdelijke testartifacts en modelbestanden blijven buiten Git.

## Validatie

| Controle | Resultaat |
|---|---|
| `php artisan test --compact` | 611 geslaagd, 16.199 assertions |
| Gerichte exporttests | 3 geslaagd, 13 assertions; inbegrepen in volledige suite |
| `python -m pytest ml/tests -q` met unieke lokale basetemp | 34 geslaagd |
| `ruff check ml` | Geslaagd |
| `ruff format --check ml` | 9 Pythonbestanden correct geformatteerd |
| `python -m pip check` | Geen conflicterende dependencies |
| `composer run lint:check` | Geslaagd |
| `npm run types:check` | Geslaagd |
| `npm run lint:check` | Geslaagd na uitsluiten van gegenereerde `.venv` |
| `npm run format:check` | Geslaagd |
| `git diff --check` | Geslaagd |
| Lokale export → audit | 45 totaal, 20 finished, 45 uitgesloten, 0 bruikbaar; training bewust geblokkeerd |

PHP-tests moesten buiten de sandbox lopen wegens toegang tot `vendor/autoload.php`;
de database bleef de geconfigureerde SQLite-geheugendatabase. Python-tests gebruikten
een unieke tijdelijke directory in de genegeerde artifacts-map. Joblib meldde op
Windows één waarschuwing dat het fysieke aantal CPU-cores niet gevonden werd en
viel terug op logische cores; alle tests slaagden. Geen modelkwaliteit afgeleid uit
de synthetische pipeline-test. Geen frontend build/visuele QA nodig: er is geen
frontendproductcode gewijzigd.

Private lokale bewijslocaties (niet committen):
`storage/app/private/ml/fixtures-20261013-210243-279936.jsonl` en
`ml/artifacts/local-audit-final-20261013/report.json`.
