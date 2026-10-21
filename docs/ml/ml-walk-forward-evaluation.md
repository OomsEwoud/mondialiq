# Chronologische ML-evaluatie

Deze fase voegt een evaluatieframework toe aan de bestaande ML-laag. Het gebruikt
dezelfde `dataset`, `FeatureBuilder`, `FeatureConfig`, vijf modeldefinities,
preprocessingpipelines, probability-mapping en metrics. Er zijn geen nieuwe features,
API-calls, imports, backfills, schedulers of databasewijzigingen toegevoegd.

**Technische correctheid is geen bewijs van goede voetbalvoorspellingen.** Alle
modelruns in de regressietests gebruiken synthetische fixtures. De bestaande lokale
demo-export is alleen gebruikt voor een dry-run; er is geen echt voetbalmodel getraind.

## Walk-forwardstrategie

`ml.walk_forward.Fold` legt expliciete tijdsgrenzen vast. Minimaal twee folds zijn
vereist. Zonder calibratie:

```text
train       kickoff < validation_start
validation  validation_start <= kickoff < validation_end
```

Met calibratie:

```text
train        kickoff < calibration_start
calibration  calibration_start <= kickoff < validation_start
validation   validation_start <= kickoff < validation_end
```

De traininghistorie begint steeds bij de eerste eligible target in de dataset en
groeit per fold. Oudere validationresultaten mogen in een latere trainingsperiode
terechtkomen zodra de actieve availability-policy dat toestaat. Validationperioden
overlappen niet; de train-eindgrenzen moeten strikt toenemen. Gaten tussen evaluatie-
perioden mogen bestaan en worden niet stil als extra validation meegenomen.

Datums vereisen een tijdzone en worden in UTC gelezen. Alle grenzen zijn exclusief
aan de bovenkant. Gelijke kickoffs vallen daardoor in dezelfde periode. De bestaande
builder voorkomt ook onderlinge featureleakage bij gelijktijdige wedstrijden.

Een label moet vóór het einde van zijn eigen fase beschikbaar zijn. Traininglabels
worden gepurged tegen de train-eindgrens, calibratielabels tegen validation-start en
validationlabels tegen validation-end. Standard/demo behouden observatietijd en de
vieruursbuffer. Historical gebruikt uitsluitend de bestaande historische FT-policy.
Per fase worden uitgesloten fixture-ID's opgeslagen. Een eindgrens ná exporttijd
wordt geweigerd.

Er is geen random K-fold, random train/test split of automatische datumkeuze. Een
random split zou latere informatie in preprocessing en modeltraining van eerdere
wedstrijden kunnen brengen. Kies en bevries de tijdsgrenzen vóór evaluatie van de
modelresultaten, op basis van de echte datasetdekking.

## Preprocessing en minimums

Elke model/fold-combinatie krijgt een nieuwe estimator uit de bestaande
`training.candidates()`-factory. Imputer en eventuele scaler fitten uitsluitend op
trainindices. Alleen Logistic Regression wordt geschaald. Er is geen refit op de
validationdata, featureselectie op de volledige dataset of thresholdoptimalisatie.
De outcome voor accuracy/F1 is steeds argmax van A/D/H; thresholds worden niet geleerd.

De bestaande minimums blijven behouden: standaard 300 train en 100 validation,
20 voorbeelden per klasse per fase en 80% dekking met vijf eerdere wedstrijden voor
beide teams. Historical experimenten vereisen 12 train, 3 validation en minstens
twee trainingsklassen. Demo vereist minstens één sample per fase en behoudt alle
beschikbaarheidscontroles. Coverageguards zijn onafhankelijk van de geselecteerde
featuregroepen.

Een ongeschikte fold blokkeert de run; er worden niet alleen gunstige folds behouden.
Bij een demofold met slechts één trainingsklasse worden Logistic Regression en
Gradient Boosting voor **alle folds en experimenten** overgeslagen. RF en de twee
baselines blijven bruikbaar. Ontbrekende klassen worden door de gedeelde mapper als
nulkans weergegeven en expliciet gerapporteerd. Calibratie vereist alle drie klassen
en blokkeert bij onvoldoende data; er is geen stille fallback naar ongecalibreerd.

## Feature-ablation

`ml.experiment_config` leest een versieerbaar JSON-contract. De voorbeeldconfiguratie
`ml/experiments.example.json` beschrijft A–H: resultaat/goalvorm, vervolgens venue,
Elo, leaguecontext, gereconstrueerde standen, rust/congestion, H2H/streaks en de volledige
standaardset. De trainingslogica kent deze letters niet; andere namen en groepen
zijn configureerbaar. xG/spelerfamilies blijven door `FeatureConfig` geweigerd.

Alle experimenten delen dezelfde numerieke feature-instellingen en exact dezelfde
targets, folds en purges. De runner bouwt één matrix van de union van de gevraagde
groepen en selecteert daaruit de exacte registrykolommen per experiment. Er worden
geen rows verwijderd wegens missing features. Deze deterministische featureberekening
is geen preprocessingfit: ieder snapshot blijft op zijn eigen kickoff begrensd.

Per experiment worden featureconfig/hash, actieve families, exacte namen en aantal
opgeslagen. Per fold/fase staan sampleaantallen, fixture-ID's, perioden, missingness
per feature en de vijf-matchcoverage in het rapport. Eerlijke vergelijkbaarheid is
dus achteraf controleerbaar. Alleen groepen variëren; K, thuisvoordeel en andere
numerieke feature-instellingen blijven gelijk binnen een ablationrun.

## Metrics en vergelijking

De gedeelde `ml.evaluation.metrics` bevat nu ook macro F1. De metrics zijn:

- accuracy en macro F1 over de vaste A/D/H-klassevolgorde;
- multiclass log loss;
- multiclass Brier: gemiddelde som van drie gekwadrateerde fouten, bereik 0–2;
- confusion matrix, precision/recall/F1/support en ontbrekende klassen;
- werkelijke/voorspelde klassenverdelingen en gemiddelde kansen;
- reliability bins per klasse: count, gemiddelde kans en waargenomen frequentie.

Probabilities moeten N×3, eindig, binnen [0,1] en per rij gesommeerd tot 1 zijn
(absolute tolerantie 1e-8). Labels moeten niet-leeg, uit A/D/H en uitgelijnd zijn.
`SCALAR_METRICS` bepaalt welke scalars worden geaggregeerd. Iedere fold weegt even
zwaar; mean, population std, min, max en foldcount worden gerapporteerd. Dit is geen
samplegewogen pooling of betrouwbaarheidsinterval. Kleine en grote folds hebben
bewust hetzelfde gewicht; de afzonderlijke samplecounts blijven zichtbaar.

Elke kandidaat wordt expliciet tegen majority en home-bias vergeleken via mean
log-lossverschil en het aantal folds waarin de log loss lager is. Deze namen blijven
de bestaande implementaties: majority=most-frequent, home-bias=empirische trainprior.
Beide baselines zijn verplicht in de experimentconfiguratie. Er is geen parametersearch.

De ranking gebruikt gemiddelde validation log loss over **alle** folds, inclusief
de baselines. Bij gelijkstand beslissen experimentnaam en modelnaam deterministisch.
Een ML-model wordt niet automatisch boven een simpelere baseline verkozen.
De spreiding en individuele folds blijven zichtbaar; één gunstige periode geldt
niet als bewijs van verbetering. Ook een winnaar in dit rapport is niet productiegeschikt.

## Afzonderlijke calibratiefase

Calibratie is optioneel: `method=none` of `sigmoid`. De implementatie is gecontroleerd
tegen de lokaal geïnstalleerde, vastgepinde sklearn **1.7.2**-broncode
`sklearn/calibration.py` en `sklearn/frozen/_frozen.py`; er is geen dependencyupdate.

Eerst fit de hele pipeline op train. Vervolgens omhult `FrozenEstimator` de complete
pipeline, inclusief imputer/scaler. `CalibratedClassifierCV` leert alleen sigmoid-
calibrators op de latere, disjuncte calibratiesamples. Het base-model wordt niet
opnieuw getraind. Een expliciete één-batch CV-indexlijst levert alle calibratie-
voorspellingen; de interne train/test-indexlijst bevat hier dezelfde calibratierijen,
maar **FrozenEstimator.fit doet niets**. Dit is geen hertraining of random CV.
Een regressietest registreert precies één echte fit, uitsluitend met trainrows.

Default minimum: 30 calibratiesamples en minstens 2 van elke klasse. Deze minimums
zijn configureerbaar, maar mogen niet onder 3 totaal/1 per klasse. Alle drie klassen
moeten ook in de basistraining voorkomen. Kleine minimums zijn uitsluitend geschikt
voor technische tests. Methode, actief-status, thresholds, fasegrenzen, effectieve
sampleperiode, samplecount en fixture-ID's staan in elk artifact.

Iedere fold heeft zijn eigen calibrator. Geen fit op validation of finale test.
Calibratie verbetert het model niet automatisch; dat moet later op echte onafhankelijke
data worden vastgesteld. Een vergelijking tussen losse runs mét en zonder calibratie
vereist extra aandacht: zonder calibratie loopt de trainperiode tot validation-start,
dus de hoeveelheid basistraining verschilt. Deze runner claimt geen zuivere causale
calibratie-ablation tussen zulke losse runs.

## Optionele finale test

Zonder `final_test` wordt geen finale test uitgevoerd. Latere fixtures worden niet
automatisch als test gebruikt. Een expliciete finale periode moet na alle validation-
perioden liggen. Bij finale calibratie moet ook de calibratieperiode na alle
validationperioden liggen.

De runner rangschikt kandidaten uitsluitend op walk-forwardvalidation en schrijft
`selected_on_validation` naar schijf voordat finale testuitkomsten voor evaluatie
worden gebruikt. Alleen de gekozen experiment/model-combinatie wordt opnieuw gefit
op de toegestane uitgebreide trainperiode en eventueel apart gecalibreerd. Daarna
wordt de finale test één keer geëvalueerd. De test verandert de ranking niet.

De planner gebruikt intern dezelfde `validation`-indexsleutel voor het evaluatievenster
van een finale fold; `evaluation_phase=final_test`, de map `final-test` en het aparte
`final_test`-rapport maken de semantiek expliciet. De finale kwaliteitscontrole vindt
pas ná selectie plaats. Bij onvoldoende data is de status `final_test_blocked`,
zonder terug te vallen op een andere kandidaat of andere datums.

Een testfixture mag als context voor een latere testfixture dienen zodra zijn resultaat
volgens de bestaande policy beschikbaar is. Dat simuleert opeenvolgende pre-match-
voorspellingen; het is geen batchvoorspelling waarbij alle features aan het begin
van de hele testperiode worden bevroren. Model en calibrator blijven tijdens test vast.

## Artifacts en reproduceerbaarheid

Elke run krijgt een nieuwe map, UUID en timestamp; bestaande mappen worden geweigerd.

```text
RUN/report.json
RUN/EXPERIMENT/MODEL/fold-01/model.joblib
RUN/EXPERIMENT/MODEL/fold-01/metadata.json
RUN/EXPERIMENT/MODEL/fold-01/predictions.json
RUN/SELECTED_EXPERIMENT/SELECTED_MODEL/final-test/...  # alleen indien gevraagd
```

Metadata omvat feature-set-versie, exacte featurelijst, actieve groepen, featureconfig
en hashes, modeltype/config, datasetchecksum en fixturefingerprint, seed, runtime/
dependencyversies, hashes van alle ML-bronbestanden, opgeloste experimentconfig/hash,
foldgrenzen/hash, sample-ID's/perioden, purges, calibratie en metrics. Run-ID/timestamp
verschillen per run; gelijkblijvende inputs/config leveren dezelfde folds en numerieke
resultaten onder dezelfde runtime. De config in het rapport is de opgeloste structuur,
niet een bytekopie van het invoerbestand.

`report.json` bevat daarnaast aggregate metrics, baselinevergelijkingen en ranking.
Foldmetrics worden niet vervangen door één samengevoegd getal. Predictions bevatten
de labels en A/D/H-kansen zodat de bestaande `ml.evaluation` ze opnieuw kan berekenen.
Dry-runs bevatten modelconfiguraties en diagnostiek, maar geen fitted artifacts.

Alle artifacts hebben `artifact_kind=walk_forward_evaluation` en
`production_eligible=false`. De bestaande `ml.inference.predict` weigert deze bestanden
expliciet, ook voor historische replay. Het zijn audit-/evaluatiebestanden, geen
automatisch gepromoveerde inference-modellen. De bestaande mode-, featureversie- en
inferencecontracten blijven gelden. Laad uitsluitend vertrouwde lokale joblib-bestanden.

## Commands

Gebruik een **bestaande** lokale export; deze fase voert geen nieuwe import uit.
De voorbeeldseizoenen/datums zijn uitsluitend syntaxvoorbeelden en moeten vóór een
echte evaluatie worden aangepast aan gecontroleerde historische dekking.

```powershell
$export = 'storage/app/private/ml/fixtures-TIMESTAMP.jsonl'
ml/.venv/Scripts/python -m ml.evaluate $export --mode historical --feature-config ml/feature-config.example.json --strategy expanding-window --experiment-config ml/experiments.example.json --output ml/artifacts/evaluations/audit-UNIQUE --dry-run
ml/.venv/Scripts/python -m ml.evaluate $export --mode historical --feature-config ml/feature-config.example.json --strategy expanding-window --experiment-config ml/experiments.example.json --output ml/artifacts/evaluations/run-UNIQUE
```

Zonder `--feature-config` geldt de bestaande `FeatureConfig`. Een experiment zonder
`groups` gebruikt de groepen van die basisconfig; expliciete experimentgroepen
vervangen alleen dat groepsveld. `target_seasons` is alleen geldig in historical mode.
Demo gebruikt expliciet `--allow-demo` en een config zonder target-seasonfilter;
standaardtraining heeft geen modeflag nodig. Er is geen autodetectie of availability-
bypass. Dry-run fit nooit modellen. Exit 0 is dry-run/evaluated; exit 2 is geblokkeerd
of een geblokkeerde finale test.

Voor sigmoid: zet `calibration.method` op `sigmoid` en geef **elke** fold een
`calibration_start` vóór validation-start. Voor een finale test kan de config bevatten:

```json
"final_test": {
  "start": "2023-05-01T00:00:00Z",
  "end": "2023-06-01T00:00:00Z"
}
```

Bij sigmoid hoort daar bijvoorbeeld `calibration_start=2023-04-01T00:00:00Z` bij,
mits alle validationperioden uiterlijk dan eindigen. Een incompleet of overlappend
schema wordt geweigerd.

Opgeslagen voorspellingen opnieuw evalueren:

```powershell
ml/.venv/Scripts/python -m ml.evaluation ml/artifacts/evaluations/run-UNIQUE/A/logistic_regression/fold-01/predictions.json --mode historical
```

## Lokale audit en tests

Dry-run uitgevoerd op de bestaande export `fixtures-20261014-152612-210512.jsonl`,
met voorbeeldconfiguratie en targetseizoen 2022. De export bevat alleen demofixtures;
historical houdt nul targets over. Alle drie folds worden terecht geblokkeerd.
Er is geen modelartifact aangemaakt. Rapport:
`ml/artifacts/evaluations/local-audit-20261015/report.json` (privé en Git-ignored).

Nieuwe synthetische tests controleren expanding trainsets, geen faseoverlap, ties,
late labels en completionbuffer, ongeldige schema's, train-only imputer/scaler,
bevroren basismodel bij calibratie, ongeldige/te kleine calibratiesamples, metrics,
probabilityvalidatie, deterministische folds/hashes, identieke ablationsamples,
CLI/dry-run zonder fit, artifactmetadata, offline-only weigering en behoud van
standard/demo-availability. Wijziging van finale testuitslagen laat ranking en
validationmetrics exact gelijk. Een run zonder finale test gebruikt latere rows niet.

Verificatie afgerond op 15 oktober 2026:

- Volledige Python-suite: **103 geslaagd**, inclusief 21 nieuwe evaluatietests.
  Command: `ml/.venv/Scripts/python -m pytest ml/tests -q -p no:cacheprovider --basetemp=ml/artifacts/evaluation-complete-1`.
  Eén Windows/joblib-waarschuwing: detectie van fysieke cores ontbreekt; joblib
  gebruikt het aantal logische cores. Geen testfouten.
- Volledige Laravel-suite: **611 geslaagd, 16.199 assertions** via
  `php artisan test --compact` met de bestaande in-memory testdatabase.
- Ruff lint en formatting gecontroleerd voor de Python-laag; Markdown en de
  nieuwe experimentconfiguratie gecontroleerd met Prettier.
- De lokale historische dry-run is bewust **blocked**, zonder fitted artifacts.
  Deze uitkomst bevestigt de dataguards, niet de kwaliteit van een model.

## Grenzen en volgende fase

- Er zijn nog geen echte prestaties of nuttige featurefamilies vastgesteld.
- De folds delen historische trainingsdata: fold-std is geen onafhankelijk
  betrouwbaarheidsinterval. Twee folds zijn een technisch minimum, geen sterke claim.
- Meer vooraf gekozen experimenten verhogen selectieoptimisme; een afgeschermde
  finale test en externe toekomstige controle blijven nodig.
- De software verhindert niet dat iemand een nieuwe run maakt na het bekijken van
  dezelfde finale test. Bewaar een organisatorisch embargo op hergebruik voor tuning.
- Coverage en provenance van de input blijven bepalend. Historical behoudt de
  retrospectieve resultaat-aannames; het is geen historisch provider-snapshotarchief.
- Calibratie heeft nog geen bewezen nut, en kleine samples kunnen instabiel zijn.
- Bij een onderbroken run blijft het rapport `running`; alleen `evaluated` bevestigt
  een volledige run. Een nieuwe outputmap voorkomt stil overschrijven van partials.
- De matrix past nu in geheugen. Grotere datasets kunnen later gerichte caching of
  incrementele contextberekening vereisen, zonder cutoffcontracten te veranderen.

Na gecontroleerde echte data-import: eerst dry-run/coverage, vooraf perioden en een
beperkte experimentset vastleggen, daarna vergelijken. Uitgesteld zijn productie-
promotie, uitgebreide tuning, nieuwe features, echte xG/speler/statistieken-adapters
en claims over voetbalprestatie.

## Gewijzigde bestanden en commitgroepen

De eerdere v2-wijzigingen stonden al in de werkboom en zijn behouden. Bij gedeelde
bestanden horen alleen de nieuwe evaluatie-hunks bij deze fase; commit v2 eerst of
stage gericht. Er zijn geen commits gemaakt.

1. **`Voeg chronologische evaluatie en aparte calibratie toe`**:
   `ml/walk_forward.py` (folds/purging), `ml/calibration.py` (frozen calibratie),
   `ml/experiment_config.py` (configcontract), `ml/evaluate.py` (orchestratie/CLI),
   `ml/experiments.example.json` (vooraf vastgelegde A–H-experimenten).
2. **`Deel evaluatiemetrics en bewaak modelgebruik`**:
   `ml/evaluation.py` (macro F1, labelvalidatie, aggregate metrics), `ml/dataset.py`
   (gedeelde sampleguards met behoud van bestaande minimums), `ml/inference.py`
   (evaluatie-artifacts weigeren).
3. **`Test walk-forwardevaluatie en calibratiegrenzen`**:
   `ml/tests/test_walk_forward.py` (nieuwe synthetische regressies).
4. **`Documenteer chronologische ML-experimenten`**:
   dit rapport, `README.md`, `ml/README.md` (architectuur, commands, beperkingen).
