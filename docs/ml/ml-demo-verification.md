# Demo-verificatie — 13 oktober 2026

**DEMO ONLY — deze resultaten mogen niet geïnterpreteerd worden als werkelijke voorspellingskwaliteit.**

De expliciete demo-modus is geïmplementeerd. De lokale export → features → dataset
is uitgevoerd. **Training → artifact → evaluation → inference blijft voor de
bestaande lokale data geblokkeerd.** Op de expliciete vervolgvraag koos de gebruiker
voor behoud van alle beschikbaarheidscontroles; een retrospectieve uitzondering
voor te laat waargenomen labels is daarom niet toegevoegd.

## Dataset en split

Bron: de bestaande database, opnieuw alleen-lezen geëxporteerd op
`2026-10-13T21:17:05Z`. Geen nieuwe wedstrijden gegenereerd, geen tijdstempels gewijzigd.

| Onderdeel | Aantal |
|---|---:|
| Fixtures totaal | 45 |
| Finished (FT) | 20 |
| Geldige demo-targetrijen vóór split | 20 |
| Beschikbare feature-rijen | 20 × 85 |
| H / D / A | 10 / 6 / 4 |
| Training / validation / test vóór beschikbaarheidsfilter | 12 / 4 / 4 |
| Training / validation / test ná beschikbaarheidsfilter | **0 / 0 / 4** |

Validation-start: `2026-10-03T17:00:00Z`; test-start: `2026-10-05T16:00:00Z`.
De vier testfixtures zijn 28, 42, 1 en 2 (H=2, D=1, A=1).
Alle 20 uitslagen zijn pas op `2026-10-06T21:25:23Z` geobserveerd. Daardoor zijn de
12 traininglabels niet beschikbaar vóór validation-start en de vier validationlabels
niet vóór test-start. Zestien rijen worden terecht gepurged. Andere grenzen binnen
de bestaande finished-kickoffs lossen dit niet op: alle observatietijden liggen
na de laatste finished-kickoff.

Alle 20 historische feature-rijen hebben nul beschikbare eerdere resultaten;
rate/rest-features ontbreken voor 100%. Counts zijn nul, rates zijn NaN/null,
geen gefingeerde nulpunten- of nulgoalrates. De normale run zonder demo-optie is
eveneens uitgevoerd en blijft geblokkeerd met nul toegelaten echte fixtures.

## Modellen en metrics op bestaande demodata

> DEMO ONLY — deze resultaten mogen niet geïnterpreteerd worden als werkelijke voorspellingskwaliteit.

| Model | Accuracy | Log loss | Brier | Status |
|---|---|---|---|---|
| Majority | n.v.t. | n.v.t. | n.v.t. | Geen trainingrijen |
| Home-bias | n.v.t. | n.v.t. | n.v.t. | Geen trainingrijen |
| Logistic Regression | n.v.t. | n.v.t. | n.v.t. | Geen trainingrijen |
| Random Forest | n.v.t. | n.v.t. | n.v.t. | Geen trainingrijen |
| Gradient boosting | n.v.t. | n.v.t. | n.v.t. | Geen trainingrijen |

Er is geen confusion matrix of voorspelde klasseverdeling omdat geen model kon worden
gefit. De werkelijke targetverdeling hierboven is wel uit de database berekend.
`Calibration skipped: insufficient validation samples in demo mode.`

Geen demo-model geselecteerd, **geen artifact op bestaande demodata gemaakt** en
geen kansvoorspelling beschikbaar. Ook is geen echte toekomstige NS-fixture aanwezig:
de laatste NS-kickoff is 13 oktober 18:30 UTC, vóór de exporttijd. Een volledige
voorspelling tonen zou hier resultaten verzinnen. Testcode verifieert training,
artifact, evaluatie en inference uitsluitend met expliciete kleine synthetische
unit-testfixtures waarvan de tijdstempels wél een geldige split toelaten.

## Concrete feature-sanitycheck

Fixture **27**, thuisteam 1, uitteam 13. Kickoff `2026-10-13T18:30:00Z`;
inspectiecutoff `2026-10-13T18:00:00Z` (20:00 Brussels). Dit is een historische
feature-inspectie, geen claim dat een model toen bestond.

| Teamcontext | Gebruikte fixture-IDs | Eigen venue-subset |
|---|---|---|
| Thuisteam 1 | 39, 34, 28, 1 | Thuis: 39, 1 |
| Uitteam 13 | 37, 33, 42 | Uit: 33, 42 |

Alle zeven bronuitslagen hebben `available_at=2026-10-06T21:25:23Z`, strikt vóór
de cutoff. Ook alle bronkickoffs liggen daarvoor. Fixture 27 ontbreekt in beide
lijsten. Snapshots bevatten bronkickoff, beschikbaarheid, home/away-identiteit en
de historische score, zodat de richting handmatig controleerbaar is.

| Feature | Waarde |
|---|---:|
| home_all_5_count | 4 |
| away_all_5_count | 3 |
| home_all_5_points | 1,5 |
| away_all_5_points | 3,0 |
| home_all_5_goals_for | 1,5 |
| away_all_5_goals_for | 2,666667 |
| home_venue_5_count | 2 |
| away_venue_5_count | 2 |
| home_venue_5_goals_for | 2,5 |
| away_venue_5_goals_for | 2,0 |
| home_rest_days | 7,0865393519 |
| away_rest_days | 8,0208333333 |

Points zijn gemiddelde punten per wedstrijd, zoals in de bestaande builder.
Rest thuis: `(13 oktober 18:30 − 6 oktober 16:25:23) / 24 uur`.
Rest uit: `(13 oktober 18:30 − 5 oktober 18:00) / 24 uur`.
Beide teams hebben minder dan vijf eerdere wedstrijden; er worden geen extra
wedstrijden of nulresultaten bij verzonnen. Een historische FT-fixture vóór de
observatiedatum krijgt juist lege bronhistorie en null-rates. Dit is correct onder
de behouden policy, ook al bestond de voetbalwedstrijd zelf al eerder.

## Leakage en productieveiligheid

- Demo wijzigt alleen broneligibility, de minimumaantallen/klassevereisten en de
  automatische keuze van chronologische grenzen; alle beschikbaarheidsfilters blijven.
- Exact dezelfde builder, vensters, venue-richting, rustformule en cutoffvoorwaarden.
- Geen huidige fixture, toekomstig resultaat, huidige eindscore, odds, provider
  predictions, standings of ID als feature.
- De standaardroute accepteert geen demodata; demo accepteert geen echte fixtures
  of onbekende fixtures zonder provider-ID. Geen gemengde trainingsset.
- Demo-artifacts dragen `production_eligible=false`, `training_mode=demo`,
  `dataset_type=demo`, `model_version=demo-baseline-1` en de volledige waarschuwing.
- Evaluatie/inference vereisen opnieuw `--allow-demo`. Tegenstrijdige markers en
  artifacts zonder expliciete modemetadata worden afgewezen. Geen Laravel-integratie.
- Demo-testreplay staat alleen held-out testfixtures toe, op kickoff, en houdt de
  controle op modelselectietijd intact. Geen replay-uitzondering voor late labels.

## Reproduceren

Vanaf de repositoryroot in PowerShell:

```powershell
php artisan ml:export --kickoff-timezone=Europe/Brussels
$export = 'storage/app/private/ml/fixtures-20261013-211705-402053.jsonl'
ml/.venv/Scripts/python -m ml.training $export --output ml/artifacts/demo/NIEUWE-RUN --allow-demo
ml/.venv/Scripts/python -m ml.inspect_features $export 27 --cutoff 2026-10-13T18:00:00Z --allow-demo
```

Gebruik bij een nieuwe export de bestandsnaam die Artisan afdrukt. Op de huidige
data eindigt training bewust met exitcode 2 en alleen een report. Voor een dataset
die later wel aan de behouden tijdseisen voldoet:

```powershell
ml/.venv/Scripts/python -m ml.evaluation ml/artifacts/demo/NIEUWE-RUN/test-predictions.json --allow-demo
ml/.venv/Scripts/python -m ml.inference $export ml/artifacts/demo/NIEUWE-RUN/model.joblib TEST_FIXTURE_ID --allow-demo --replay-test
ml/.venv/Scripts/python -m ml.inference $export ml/artifacts/demo/NIEUWE-RUN/model.joblib FUTURE_NS_FIXTURE_ID --allow-demo
```

De laatste drie opdrachten zijn nu niet uitvoerbaar op de lokale demo-run: het
vereiste model ontbreekt. Er wordt geen testartifact als vervanging aangeboden.

## Bewijs en checks

Private, genegeerde bestanden:

- `ml/artifacts/demo-final-20261013/report.json`: daadwerkelijke geblokkeerde demo-run.
- `ml/artifacts/demo-final-20261013/feature-snapshot-27.json`: volledige 85 features en bronhistorie.
- `ml/artifacts/standard-verified-20261013/report.json`: standaardbeveiliging intact.

Bij hervatting op 14 oktober is gecontroleerd dat alle Python-bronchecksums in het
definitieve demo-report overeenkomen met de huidige implementatie. De opgeslagen
split en het ontbreken van een modelartifact zijn opnieuw geverifieerd.

| Controle | Resultaat |
|---|---|
| Python-regressietests inclusief demo-CLI, evaluatie en inference | 41 geslaagd op 14 oktober |
| Gerichte Laravel-exporttests, uitgevoerd tijdens deze demo-opdracht op 13 oktober | 3 geslaagd, 13 assertions |
| `ruff check ml` | Geslaagd op 14 oktober |
| `ruff format --check ml` | 12 bestanden correct geformatteerd op 14 oktober |
| `git diff --check` | Geslaagd op 14 oktober |
| Controle definitief lokaal demo-report | Bronchecksums correct; 12/4/4 wordt 0/0/4; geen artifact |

De synthetische unit-testfixtures zijn uitsluitend voor technische regressietests.
Ze leveren geen modelkwaliteitsbewijs voor de bestaande lokale demodata. Joblib
meldt op deze Windows-omgeving een waarschuwing over het bepalen van fysieke
CPU-cores en gebruikt vervolgens logische cores; dit blokkeert de tests niet.
Laravel- of frontendproductcode is in deze demo-vervolgopdracht niet gewijzigd;
de volledige Laravel- en frontendchecks van de foundation zijn niet opnieuw nodig.

## Reviewbare wijzigingen

Geen commits gemaakt; eerdere foundationwijzigingen zijn behouden.

1. `Voeg expliciete demo-modus met behoud van tijdscontroles toe`:
   `ml/mode.py`, `ml/data.py`, `ml/dataset.py`, `ml/features.py`, `ml/training.py`,
   `ml/evaluation.py`, `ml/inference.py`, `ml/inspect_features.py`,
   `ml/tests/test_demo.py`, `ml/tests/test_pipeline.py`.
   Modemetadata, broneligibility, dezelfde tijdscontrole, beperkte minimums,
   kanskolommen bij ontbrekende klassen, CLI-regressietests en inspectie van bronhistorie.
2. `Documenteer demo-verificatie en resterende datablokkade`:
   `ml/README.md`, `docs/ml/ml-demo-verification.md`.
   Exacte commando's, echte dataset/split, concrete featurecontrole en eerlijke grenzen.

Om met de huidige strikte policy verder te komen zijn opeenvolgende, tijdig
vastgelegde resultaten nodig die voldoende training-, validation- en testperioden
overlaten. De huidige twintig achteraf opgeslagen finished-fixtures voldoen daar
niet aan. Deze opdracht verandert de dataverzameling niet.
