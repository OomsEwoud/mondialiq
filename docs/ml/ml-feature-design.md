# Feature- en pipelineontwerp baseline-1

## Target en gedeelde builder

Voorspel reguliere 1X2: H thuiswinst, D gelijkspel, A uitwinst. Interne vaste
kolomvolgorde is A/D/H; JSON-output mapt expliciet naar home/draw/away.
Alleen echte FT-fixtures met niet-negatieve gehele scores krijgen labels.

`FeatureBuilder.build(fixture, cutoff)` wordt door training en inference gebruikt.
Historische cutoff is kickoff; inference gebruikt de timestamp van een verse export,
strikt vóór kickoff. Geen fixture na cutoff, dezelfde fixture of resultaat dat nog
niet aantoonbaar beschikbaar was, mag historie zijn. Zie de data-audit voor de policy.

De builder groepeert op team-ID, maar geeft uitsluitend onderstaande **85 numerieke
features** terug. IDs, league, season, kickoff en status blijven metadata.

## Exacte features

Voor elk product van:

- `side`: `home`, `away`;
- `context`: `all`, `venue`;
- `window`: `5`, `10`;

komen deze acht kolommen voor, met naam `{side}_{context}_{window}_{metric}`:

| Metric | Definitie |
|---|---|
| count | Aantal beschikbare eerdere wedstrijden in het venster |
| points | Gemiddelde punten, 3/1/0, per beschikbare wedstrijd |
| wins | Winstfractie vanuit teamperspectief |
| draws | Gelijkspelfractie |
| losses | Verliesfractie |
| goals_for | Gemiddeld gescoorde goals |
| goals_against | Gemiddeld geïncasseerde goals |
| goal_difference | Gemiddeld doelsaldo |

Dit zijn 64 kolommen. `venue` betekent eerdere thuiswedstrijden voor het thuisteam,
eerdere uitwedstrijden voor het uitteam. Algemeen venster omvat lokaal opgeslagen
wedstrijden over leagues/seasons heen binnen 730 dagen. Geen gefingeerde aanvulling
tot vijf/tien; het werkelijke aantal is expliciet. Punten zijn rates in plaats van
sommen zodat korte vensters niet automatisch zwakker lijken.

Zes aanvullende kolommen:

- `home_rest_days`, `away_rest_days`: geplande kickoff min laatste beschikbare kickoff, in dagen;
- `home_played_7d`, `away_played_7d`, `home_played_14d`, `away_played_14d`:
  aantal beschikbare eerdere wedstrijden binnen 7/14 dagen vóór cutoff.

Vijftien verschilkolommen:

- `difference_{5|10}_{points|wins|draws|losses|goals_for|goals_against|goal_difference}`:
  thuisteam minus uitteam, algemeen venster;
- `difference_rest_days`: thuis minus uit.

Deze tellingen beschrijven **beschikbare lokale historie**, niet gegarandeerd alle
gespeelde wedstrijden. Onvolledige competitiedekking vertekent rust/congestie.
Bij cups kan de administratieve thuisploeg op neutraal terrein spelen; een echte
home-advantage-feature vereist betrouwbare neutral-venue-context en is uitgesteld.
H2H, standen, league-categorieën, promotiestatus, fases, xG, spelers, lineups en odds
worden niet gebruikt. Eerst dekking en point-in-time bewijs verzamelen.

## Ontbrekende waarden

Geen historie: count/congestietellingen zijn nul; rates, rust en afgeleide rates
zijn NaN. De train-only `SimpleImputer` leert medianen en missingness-indicatoren.
Een kolom die op training volledig ontbreekt krijgt expliciet de sklearn
`keep_empty_features` nul-placeholder plus missingness-indicator; dit is geen
voetbalwaarde. De daaropvolgende StandardScaler leert ook alleen op training.
Geen datasetbrede imputatie, geen invullen van ontbrekende goals als 0.

## Splits en selectie

Geen automatische random split. Geef twee timezone-aware grenzen:
training vóór validation-start, validation tot test-start, test vanaf test-start.
Gelijktijdige wedstrijden blijven in dezelfde tijdspartitie. Labels die pas na
de volgende grens beschikbaar waren worden gepurged. Eerdere resultaten uit
validation/test mogen later in dezelfde periode historie worden zodra ze beschikbaar
zijn: dit is een sequentiële pre-match-evaluatie, geen voorspelling van het hele seizoen ineens.

Minimum per partitie: 300/100/100 fixtures, 20 per uitkomst en minstens 80% van de
rijen met vijf historische resultaten voor **beide** teams. Dit is een startguardrail;
grotere, meerdere seizoenen omvattende holdouts zijn nodig voor serieuze conclusies.
Er worden geen grenzen gekozen zolang echte lokale historie ontbreekt.

## Modellen en metrics

- Multinomial Logistic Regression: lbfgs, C=1, max_iter=2000.
- Random Forest: 200 bomen, max_depth=8, min_samples_leaf=10, één worker.
- HistGradientBoostingClassifier: 100 iteraties, 15 leaf nodes, min_samples_leaf=20,
  L2=1, early_stopping=False zodat geen interne random validation split ontstaat.
- Majority: één-hot voorspelling van train-meerderheid; log loss is zeer ongunstig
  bij fouten, met de standaard numerieke clipping van sklearn.
- Home-bias: vaste empirische A/D/H-verdeling uitsluitend uit training.

Seed 20261013. Geen class weighting, oversampling, hyperparameterzoektocht of odds.
ML-kandidaat wordt op validation-log-loss gekozen, daarna pas wordt test geëvalueerd.
Geen refit die het geëvalueerde model zou veranderen. Verlies tegen triviale
baselines blijft zichtbaar; een artifact is altijd een experimentele kandidaat.

Metrics: accuracy, log loss, multiclass Brier `mean(sum((p-onehot)^2))` (0..2),
confusion matrix in A/D/H-volgorde, precision/recall/F1/support per klasse,
werkelijke/voorspelde klasseverdeling en gemiddelde kansen. Reliability bevat per
klasse tien vaste kansbins met aantallen, gemiddelde kans en gerealiseerde frequentie.
Die punten vormen de calibration curve en kunnen zonder opnieuw trainen worden geplot.

Er wordt nu **geen calibrator gefit**: geen echte validationdata om verbetering
aan te tonen. Later een chronologisch apart calibratieblok en selectieblok binnen
validation gebruiken; calibratie alleen behouden bij onafhankelijke verbetering.
Lage log loss/Brier bewijst op zichzelf geen perfecte calibratie.

Permutation importance op validation gebruikt neg_log_loss, vijf herhalingen en
dezelfde seed. Rapporteer gemiddelde en spreiding, geen causaliteit; gecorreleerde
vormkenmerken kunnen elkaars belang verdelen. Geen belangscores zonder echte training.

## Reproduceerbaarheid en integratie

Elke run bewaart exportheader, SHA-256 van export en Pythonbronnen, dependencyversies,
seed, gebruikte featurevolgorde, fixture-IDs per split, gepurgede IDs, perioden,
hyperparameters, timestamp, kandidaatkeuze, metrics en testvoorspellingen. Bewaar
de oorspronkelijke export bij de run; huidige database-inhoud kan later veranderen.
`baseline-1` is de modelreeks; de private run-directory en hashes identificeren de run.

Laravel krijgt alleen een nieuw exportcommand en exportservice. Geen schemawijziging.
Toekomstig voorstel: een Laravel queue job start de lokale Pythonmodule als apart
proces met timeout en gevalideerde argumenten. Geen training in een webrequest en
geen HTTP-microservice nodig. Laravel valideert modelversie, cutoff, fixturestatus,
finite probabilities, grenzen en som vóór persistence.

Breid later de bestaande `predictions`-tabel gericht uit met een afzonderlijke `ml`
source, model/runversie, generated_at, cutoff_at en feature-snapshot/featureversie.
De bestaande chancekolommen gebruiken percentages; converteer 0..1 daarom expliciet
naar 0..100 bij de Laravel-grens. Schrijf niet over bestaande AI-/API-/user-rijen.
Herzie `(user_id, fixture_id)`-uniciteit en de null-user-semantiek, scoring hooks en
enumafhandeling vóór introductie. Bewaar meerdere trainingsruns in artifactmetadata;
maak geen tweede parallelle predictiontabel zonder concrete noodzaak. Deze
productie-integratie wordt in fase 1 uitsluitend ontworpen.

## Bronnen

- [scikit-learn 1.7 probability calibration](https://scikit-learn.org/1.7/modules/calibration.html)
- [scikit-learn LogisticRegression](https://scikit-learn.org/1.7/modules/generated/sklearn.linear_model.LogisticRegression.html)
- [scikit-learn HistGradientBoostingClassifier](https://scikit-learn.org/1.7/modules/generated/sklearn.ensemble.HistGradientBoostingClassifier.html)
- [scikit-learn SimpleImputer](https://scikit-learn.org/1.7/modules/generated/sklearn.impute.SimpleImputer.html)
- [Laravel query builder](https://laravel.com/framework/docs/13.x/queries)
