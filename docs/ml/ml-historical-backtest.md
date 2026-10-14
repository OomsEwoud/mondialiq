# Historical backtest: beleid en verificatie

Gecontroleerd op 14 oktober 2026. Deze uitbreiding maakt training op retrospectief
geïmporteerde providerresultaten mogelijk. Zij verandert geen Laravel-sync, scheduler,
quota, frontend, gebruikersvoorspellingen of databasegegevens. Python leest uitsluitend
de private Laravel-export; er zijn geen netwerk- of API-calls.

## Drie expliciete modi

| Modus                  | Toelating                           | Resultaatbeschikbaarheid                              | Gebruik                                              |
| ---------------------- | ----------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| Standaard, zonder vlag | Echte provider-ID                   | Maximaal observatietijd en kickoff + 4 uur            | Bestaande prospectieve training/inference            |
| `--allow-demo`         | Alleen gereserveerde demo-ID's      | Dezelfde strikte tijdscontrole                        | Technische demoverificatie                           |
| `--mode historical`    | Echte provider-ID, geldige FT-score | Kickoff + 4 uur; lokale importtijd telt hiervoor niet | Offline backtest, evaluatie en expliciete testreplay |

Historisch en demo zijn wederzijds exclusief. Er is geen autodetectie en geen algemene
`ignore_available_at`. Exportvalidatie blijft identiek: schema, complete footer,
unieke IDs, tijdzones en geen observaties ná exporttijd. De resultaatsuitzondering
zit uitsluitend in `ml/policy.py`; de 85 featuredefinities blijven gedeeld.

## Resultaten, scores en leakage

API-Football noemt FT, AET en PEN als afgewerkte statussen in de
[officiële fixturehandleiding](https://www.api-football.com/news/post/how-to-get-all-fixtures-data-from-one-league).
Onze baseline gebruikt **uitsluitend FT**, met `fulltime_home_goals` en
`fulltime_away_goals`: beide gehele, niet-negatieve scores en verschillende teams.
De bestaande Laravel-import gebruikt voor deze velden een fallback van
`score.fulltime` naar `goals`. Bij AET/PEN bewijst die fallback geen reguliere
90-minutenscore. Daarom blijven AET/PEN uitgesloten, evenals NS, uitgestelde,
afgelaste, gestaakte en onvolledige wedstrijden. Dit wijzigt de bestaande scoring
van gebruikersvoorspellingen niet.

Toegestane bronvelden zijn eerdere kickoff, teams, thuis/uit-richting, FT-status
en reguliere score. Daaruit volgen punten, W/D/L, goals voor/tegen/saldo,
rolling gemiddelden over vijf/tien wedstrijden, vorm per locatie, rustdagen,
wedstrijden in zeven/veertien dagen en verschillen tussen de teams.
Er zijn geen nieuwe H2H-features toegevoegd; de bestaande 85 blijven identiek.
IDs, league en season zijn metadata/selectievelden, geen modelinputs.

Per target is cutoff de kickoff. Een bron moet een andere fixture zijn, een strikt
eerdere kickoff hebben, binnen 730 dagen liggen en zijn vieruursbuffer **strikt vóór**
cutoff beëindigen. De buffer blijft behouden omdat een exacte eindfluit ontbreekt;
ook een wedstrijd twee uur eerder wordt dus uitgesloten. De targetscore kan nooit
zijn eigen features beïnvloeden. De historische labelpurge gebruikt eveneens die
buffer, nooit lokale ingestietijd. Gelijke kickoffs blijven in dezelfde partition.

De uitzondering bewijst niet wanneer de provider destijds publiceerde, of een
score, team of kickoff later werd gecorrigeerd. Het is een retrospectieve aanname
over definitieve resultaten, geen point-in-time providerarchief.

Standings, providerpredictions, odds zonder timestampbewijs, lineups, blessures,
events, wedstrijdstatistieken, spelerstatistieken, teamsnapshots en onversioned
coaches blijven volledig buiten het featurecontract. Ze worden niet geëxporteerd
en de Python-reader mappt ze ook niet wanneer extra JSON-velden aanwezig zijn.

## Provider-identiteit, targets en warm-up

De bestaande provenancegrens blijft gelden: positieve externe fixture-ID, buiten
de gereserveerde reeks 99000000–99000999. Demo en ontbrekende/ongeldige
provideridentiteit worden uitgesloten. Een ID is geen onafhankelijke
authenticiteitsverklaring; herkomstcontrole van de Laravel-import blijft nodig.

`--target-season 2022` beperkt alleen labels. Oudere seizoenen blijven beschikbaar
als historie; herhaal de optie voor meerdere targetseizoenen. Zonder optie zijn alle
geschikte seizoenen targets. Er zijn geen ingebouwde league- of seasonkeuzes.
Alleen werkelijk eerdere resultaten kunnen context leveren, ook over leaguegrenzen.
Een ontbrekend vorig seizoen blokkeert een experiment niet: nul historie wordt als
count 0 gerapporteerd, de bijbehorende rates/rust blijven ontbrekend. Geen fictieve
nuluitslagen. Imputatie leert uitsluitend uit de trainingpartition.

`historical_audit` bevat totaal en per league, season en league/season:
totale/echte/afgewerkte fixtures, geschikte targets, mogelijke history,
daadwerkelijk gebruikte history, geschikte niet-targets, H/D/A en uitsluitredenen.
Uitsluitredenen zijn exclusief, in volgorde demo, onbekende herkomst, status,
score, teams, chronologie ten opzichte van export. Daarom tellen uitgesloten
demowedstrijden niet nogmaals als ongeldige status.

Coverage bevat per target home/away aantallen en eerdere-seizoensaantallen; totaal
en per league/season aantallen én percentages home/away/beide met minstens 1/3/5/10
bronwedstrijden. Een lege populatie heeft percentage `null`. `eligible_history`
betekent potentiële bron vóór export; `used_as_history` betekent daadwerkelijk
gebruikt vóór een target. `warmup_only_fixture_ids` maakt de gebruikte niet-targets
zichtbaar. Inspectie geeft daarnaast afwijzingsredenen per relevante bronfixture.

## Split, minimums en modelselectie

Kies bij meerdere seizoenen bij voorkeur expliciete UTC-datumgrenzen op basis van
de audit. Zonder beide grenzen gebruikt historical dezelfde chronologische
60/20/20-helper als demo, op **unieke kickoffgroepen**, dus niet gegarandeerd exact
60/20/20 van de rijen. Een enkele ontbrekende grens is een fout/blocker.
Er is geen random split. Nabije labels kunnen door de vieruursbuffer worden gepurged.

Een development-experiment vereist minimaal 12 train-, 3 validation- en 3 testrijen
na purging en minstens twee trainingsklassen. Ontbrekende klassen blijven zichtbaar
in alle metrics, met nul kans voor niet-geleerde klassen; er worden geen rijen
bijgemaakt. Deze kleine minimums bewijzen alleen dat een experiment uitvoerbaar is.

Alle vijf bestaande modellen blijven: majority, home-bias (empirische trainprior),
Logistic Regression, Random Forest en Gradient Boosting. Geen tuningzoektocht.
Selectie van het ML-model gebruikt uitsluitend validation log loss; daarna volgen
de testmetrics. De testset wordt niet gebruikt voor fit, preprocessing of selectie.
Validatie-permutation importance is beschrijvend, geen featureselectiestap.

Status blijft `EXPERIMENTAL_HISTORICAL`. Het afzonderlijke `baseline_candidate`
is alleen waar bij minstens 300/100/100 rijen, minimaal 20 van elke klasse per
partition, minstens 80% vijf-matchdekking voor beide teams per partition én betere
validation- en test-log-loss dan beide baselines. `baseline_readiness_blockers`,
de twee baselinevergelijkingen en `performance_conclusion` verklaren de uitkomst.
Ook deze sterkere kandidaat krijgt geen automatische productiepromotie.

Rapportage omvat accuracy, multiclass log loss, Brier (som over drie klassen),
confusion matrix, precision/recall/F1 per klasse, werkelijke en voorspelde
verdelingen, gemiddelde kansen en reliability bins. Er wordt geen calibrator
gefit zonder onafhankelijke chronologische calibratiesample; dat staat expliciet
in het rapport. Kleine steekproeven geven geen betrouwbare calibratieclaim.

## Artifact en replay

Elk historisch artifact en iedere evaluatie/replay vermeldt
`training_mode=historical_backtest`, `dataset_type=historical_provider_data`,
`model_version=historical-baseline-1`, `production_eligible=false` en de waarschuwing.
Artifactmetadata bevat trainingtijd, export, checksums, fixturefingerprint,
source leagues/seasons, target/historycounts, partitions/ranges, features,
modeltype, hyperparameters, validation/testmetrics, seed, dependencies en codehashes.

Normale inference en demo-inference weigeren historische artifacts. Alleen
`--historical-replay` is toegestaan, voor een opgeslagen held-out testfixture,
op diens kickoff en na de selectiegrens. De geparste dataset moet exact gelijk
zijn aan de trainingsdataset; dependencies en relevante featurebroncode moeten
overeenkomen. Veranderde of toegevoegde fixtures vereisen opnieuw trainen.
`actual_result` wordt pas aan output toegevoegd, nooit aan modelinputs.
Load alleen vertrouwde lokale joblib-bestanden.

## Commands vanuit de repositoryroot

Gebruik een nieuwe uitvoermap per run. Vervang het exportpad door de uitvoer van
Artisan; gebruik de gecontroleerde kickoff-timezone van de lokale import.

```powershell
php artisan ml:export --kickoff-timezone=Europe/Brussels
$export = 'storage/app/private/ml/fixtures-TIMESTAMP.jsonl'
ml/.venv/Scripts/python -m ml.training $export --mode historical --target-season 2022 --audit-only --output ml/artifacts/historical-audit-UNIQUE
ml/.venv/Scripts/python -m ml.training $export --mode historical --target-season 2022 --output ml/artifacts/historical-run-UNIQUE
```

De audit-only-run schrijft alle diagnostiek en fit nooit modellen. Exit 0 betekent
dat de experimentele minimums gehaald zijn, exit 2 betekent geblokkeerd. Ook een
trainingsrun schrijft eerst de audit naar `report.json`, vóór het fitten.
Na review van de echte coverage kun je expliciete grenzen toevoegen, bijvoorbeeld
`--validation-start 2023-01-01T00:00:00Z --test-start 2023-04-01T00:00:00Z`.
Die datums illustreren alleen syntax; competitie-seizoen 2022 kan doorlopen in 2023.

Alleen nadat training daadwerkelijk een artifact heeft geproduceerd:

```powershell
$run = 'ml/artifacts/historical-run-UNIQUE'
$report = Get-Content "$run/report.json" -Raw | ConvertFrom-Json
$fixtureId = $report.partitions.test.fixture_ids[0]
$cutoff = $report.partitions.test.start
ml/.venv/Scripts/python -m ml.evaluation "$run/test-predictions.json" --mode historical
ml/.venv/Scripts/python -m ml.inference $export "$run/model.joblib" $fixtureId --historical-replay
ml/.venv/Scripts/python -m ml.inspect_features $export $fixtureId --mode historical --cutoff $cutoff
```

## Lokale verificatie en 2022-readiness

De nieuwe lokale export `fixtures-20261014-152612-210512.jsonl` bevat nog 45 fixtures,
allemaal demo, waarvan 20 finished. Er zijn 0 echte providerfixtures, 0 geschikte
historische targets en 0 geschikte historyfixtures. Alleen seizoen 2026 is aanwezig.
De audit met targetseizoen 2022 is daarom terecht `blocked`, zonder modelartifact:
`ml/artifacts/historical-local-20261014/report.json` (privé, genegeerd door Git).

Een echte retrospectieve 2022-export kan technisch worden getraind zodra deze de
genoemde minimums haalt. Er moet nog echte historische fixture/resultaatdata worden
geïmporteerd via de bestaande Laravel-import, bij voorkeur ook seizoen 2021 als
warm-up. Deze opdracht heeft geen import gestart en geen providerquota gebruikt.
Er zijn geen echte voetbalprestatiemetrics of een productiegeschikt model geclaimd.

Uitgevoerde verificatie:

```powershell
ml/.venv/Scripts/python -m pytest ml/tests -q -p no:cacheprovider --basetemp=ml/artifacts/historical-complete-2
ml/.venv/Scripts/ruff check ml
ml/.venv/Scripts/ruff format --check ml
php artisan test --compact
git diff --check
```

Python: 61 geslaagd, inclusief de bestaande 41 standaard/demo-tests. De 20 nieuwe
historische tests omvatten 2022-resultaten geïmporteerd in 2026, current/future/tied
kickoffs, completionbuffer, status/provenance/scores, warm-up, labelpurge,
verboden snapshots, targetscore-onafhankelijkheid, CLI-training/evaluatie/replay,
metadataweigering, datasetwijziging en audit zonder model. Alle trainingsfixtures
in tests zijn synthetisch en uitsluitend softwareverificatie.
Laravel: 611 geslaagd, 16.199 assertions. De Windows-joblib-waarschuwing over
fysieke CPU-detectie valt terug op logische cores en veroorzaakt geen testfout.

## Gewijzigde bestanden en commitgroepen

Geen commits gemaakt. De groepen horen bij deze uitbreiding, niet bij eerdere
foundation- of demowerkzaamheden.

1. **`Voeg afgeschermde historische backtests toe`**:
   `ml/policy.py` (resultaatsbeleid/fingerprint), `ml/historical.py` (audit/coverage),
   `ml/dataset.py` (targetselectie/split/minimums), `ml/features.py` (gedeelde eligibility
   en broninspectie), `ml/mode.py` (metadata/guards), `ml/training.py` (historische run),
   `ml/evaluation.py`, `ml/inference.py`, `ml/inspect_features.py` (expliciete CLI-modi).
2. **`Test historische backfills en blokkeer datalekken`**:
   `ml/tests/test_historical.py` (20 regressietests, bestaande tests behouden).
3. **`Documenteer historische ML-policy en gebruik`**:
   `README.md`, `ml/README.md`, `docs/ml/ml-historical-backtest.md` (beleid, commands,
   verificatie, grenzen en benodigde echte data).
