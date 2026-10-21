# Feature-engineering v2

Deze fase breidt de offline featurelaag uit. Er zijn geen API-Football-calls,
imports, schedulers of databasewijzigingen uitgevoerd. Synthetische tests bewijzen
softwaregedrag; zij bewijzen geen voetbalprestatie of verbetering van een model.

## Audit en omvang

De [auditmatrix van alle 85 oorspronkelijke features](ml-feature-audit-v1.md)
legt betekenis, bron, window, venue, veiligheid, missingness, leakage, redundantie
en het besluit per feature vast. Geen bestaande feature is verwijderd of hernoemd.
`points` blijft PPG; `wins/draws/losses` blijven fracties. De nieuwe `_total`-namen
zijn echte totalen. De denominators zijn aantallen waargenomen wedstrijden, niet
automatisch de gevraagde windowlengte. Venue wordt vanuit de huidige targetrol
geselecteerd. De oorspronkelijke 730-dagenhorizon en kruisende seizoenen blijven.

De [volledige registrymatrix](ml-feature-registry-v2.md) bevat de exacte namen en
metadata. Omvang: **85 → 378 standaardfeatures**, 28 optionele statistiekfeatures,
20 uitgeschakelde xG/spelerdefinities; 426 definities totaal. Alle 85 oorspronkelijke
namen zitten in de 378. Dit is een catalogus van systematische voetbalmetingen,
geen bewijs dat alle 378 gezamenlijk beter werken. Families zijn afzonderlijk
selecteerbaar voor latere ablations.

| Familie                 | Standaard aantal | Inhoud                                                                                      |
| ----------------------- | ---------------: | ------------------------------------------------------------------------------------------- |
| result_form             |               72 | All-venue 3/5/10 aantallen, beschikbaarheid, W/D/L, punten, totalen, rates en verschillen   |
| goals                   |               87 | All-venue 3/5/10 GF/GA/GD totalen en rates, clean sheets, niet scoren, ≥1/≥2 en verschillen |
| venue_form              |              132 | Dezelfde rolling resultaat/goalmetingen voor home-only en away-only                         |
| streaks                 |               16 | Acht streaks voor elk team                                                                  |
| elo                     |                6 | Twee ratings, twee initialisatie-indicatoren, verschil en expected home score               |
| league_context          |               17 | PPG/goalcontext, venue-PPG, league home/draw/away rates en goals, sample/beschikbaarheid    |
| rest                    |                5 | Twee rusttijden, twee lange-rustindicatoren en rustverschil                                 |
| congestion              |                9 | 7/14/21 dagen per team en verschillen                                                       |
| h2h                     |               14 | Laatste 3/5 ontmoetingen, counts, resultaten, goals en gemiddeld totaalaantal goals         |
| season                  |                6 | Gespeeld, early-season en onbekende genormaliseerde progressie per team                     |
| history_quality         |                6 | Beschikbare historie, venuehistorie en onvoldoende-historie-indicator                       |
| reconstructed_standings |                6 | Twee ranks, rank-/punten-/PPG-verschil en beschikbaarheid                                   |
| ratios                  |                2 | Aanval/goals-conceded-ratio tegenstander over vijf wedstrijden                              |

Rate en totaal zijn bewust redundant wanneer de count bekend is. W/D/L telt op
tot één, PPG = 3 × win rate + draw rate, GD = GF − GA. Verschillen zijn lineair
afgeleid; windows overlappen. Deze relaties staan expliciet in de audit. Er zijn
geen extra aliassen als `points_per_game` naast legacy `points` toegevoegd.
Er zijn geen willekeurige ratio-combinaties of team-ID-encodings.

## Eén builder en policygrens

`FeatureBuilder` blijft het enige entrypoint voor dataset, inspectie en inference.
Resultaatvorm, context en nieuwe families krijgen dezelfde eligible fixtures:
andere fixture-ID, strikt eerdere kickoff, betrouwbare FT-score en beschikbaarheid
strikt vóór cutoff. De vieruursbuffer blijft gelden. Standard/demo vereisen ook
echte observatietijd vóór cutoff. Historisch mag uitsluitend het bekende
resultaatscontract lokale ingestietijd vervangen door voetbalchronologie.

Rolling vorm, H2H, streaks, rust en congestion gebruiken de bestaande 730-dagenhorizon.
Elo gebruikt alle toegestane eerdere resultaten uit de doelcompetitie; een rating
reset niet doordat een bron toevallig buiten een rolling horizon valt. Leaguecontext,
season progression en tabellen gebruiken uitsluitend dezelfde league én season.
Alle bronnen worden opnieuw op cutoff gefilterd; er is geen globale eindstand of
eindrating die terug naar eerdere fixtures wordt gekopieerd.

## Elo

Ratings zijn per league en team. Nieuwe teams beginnen op `elo_initial=1500`.
Voor een eerdere, toegestane wedstrijd:

```text
E_home = 1 / (1 + 10 ** ((R_away - R_home - home_advantage) / 400))
S_home = 1 bij winst, 0.5 bij gelijkspel, 0 bij verlies
delta = K * (S_home - E_home)
R_home += delta
R_away -= delta
```

Defaults: K=20, thuisvoordeel=60. `E_home` is een verwachte score inclusief een
halve draw, **geen gekalibreerde winstkans**. Updates worden chronologisch verwerkt.
Wedstrijden met dezelfde kickoff lezen dezelfde voorafgaande ratings; hun delta's
worden pas daarna samen toegepast. De target staat nooit in de updatehistorie.

Bij overgang naar een hoger seizoensnummer:
`R = initial + (R - initial) * retention ** season_gap`, default retention=0.75.
Dat gebeurt één keer, ook bij de eerste target van een nieuw seizoen. Een later
gespeelde fixture met een ouder seizoensnummer veroorzaakt geen terugwaartse reset.
League-specifieke ratings voorkomen herhaalde seizoensregressie door parallelle
bekers. Een promovendus zonder historie in deze league begint neutraal; transfers
van rating tussen competities worden niet verzonnen. `elo_initializing` betekent
minder dan vijf eerdere updates in deze league.

Alle instellingen staan in `FeatureConfig` en worden in het artifact vastgelegd.

## Leaguecontext, seizoen en gereconstrueerde stand

De leaguegemiddelden gebruiken standaard minimaal tien eerdere resultaten in
hetzelfde seizoen; onder die grens blijven rates NaN en `league_context_available=0`.
Er is geen fallback naar de complete seizoensstand of een andere competitie.
Teamrates worden vergeleken met leaguegemiddelden per teamwedstrijd; de denominator
is dus tweemaal het fixtureaantal. Voor venue-PPG is dat het fixtureaantal.

De tabel telt per eerder waargenomen team gespeeld, W/D/L, GF, GA, GD en punten
(3/1/0). De approximate rank sorteert punten, GD, GF. Teams die daarop gelijkstaan
krijgen dezelfde rank; team-ID bepaalt alleen de weergavevolgorde, niet de rank.
Puntenaftrek, officiële head-to-head tiebreakers, playoffgroepen en een volledige
competitieroster zijn niet beschikbaar in het ML-exportcontract. Daarom heet het
`reconstructed_rank`. Bij onvolledige exports kan de tabel onvolledig zijn.
`reconstructed_table_available` betekent dat beide targetteams in die tabel
voorkomen; het is geen certificaat van een complete of officiële stand.

Een onbekend team krijgt geen fictieve rank/PPG. Season-played is het aantal
waargenomen eerdere wedstrijden; early-season betekent minder dan vijf. De
season-length is niet betrouwbaar geëxporteerd, dus `season_progress` blijft NaN.
Er wordt geen fictief percentage afgeleid van later gespeelde wedstrijden.

League-ID wordt alleen gebruikt voor deze contextselectie, niet als predictor.
Categorische league/competition-type features zijn nu bewust niet toegevoegd:
het exportcontract bevat geen competition type en er is nog geen echte dataset
waarop het nut van league-encoding kan worden onderzocht. Een latere encoder moet
onbekende leagues expliciet ondersteunen. Season wordt geen numerieke krachtindicator.

## Vorm, goals, streaks, H2H, rust en verschillen

Alle rolling families gebruiken 3/5/10 resultaten en zowel all-venue als de
huidige home/away-rol. Clean-sheet/failed-to-score zijn fracties; scoring/conceding
≥1/≥2 zijn aantallen binnen de betreffende window. Totals en rates gebruiken steeds
dezelfde echte subset. Streaks lopen vanaf de meest recente bron terug tot de eerste
niet-passende uitslag; cap standaard 20. Zonder historie is de streak onbekend.

H2H is beperkt tot 14 features. Goals en resultaten worden naar de **huidige**
thuis- en uitploeg gemapt, ook als de venues eerder andersom waren. Rust is het echte
kickoff-to-kickoffverschil in dagen, niet rust sinds het eindfluitje. Offseason gaps
blijven zichtbaar, met `long_rest` boven 30 dagen. Geen negatieve rust. Postponed
en overlappende/onvoltooide wedstrijden passeren de resultaatpolicy niet.
Congestion telt toegestane resultaten inclusief de ondergrens van 7/14/21 dagen.

De registry genereert alleen expliciete verschillen: all-venue PPG/WDL/GF/GA/GD,
clean-sheet/failed-to-score per window, rust, congestion, Elo en reconstructed rank.
De richting is altijd home minus away; een negatieve rankdifference kan dus gunstig
zijn voor home. Tabelpunten/PPG worden rechtstreeks uit de tabel vergeleken.
De twee aanval/verdediging-ratio's vereisen eindige input en denominator > 0.
Bij nul/ontbrekende denominator volgt NaN, geen epsilon, infinity of verzonnen ratio.

## Statistieken, xG en spelers

Lokale inspectie van `FixtureStat`, de migratie en `FixtureStatsService` toont
`fixture_id/team_id/name/value` met mutable timestamps, zonder historisch
snapshotcontract. De importer normaliseert ontbrekende/niet-numerieke waarden naar 0. De demoseeder noemt Ball Possession, Total Shots, Shots on Goal en Corner Kicks.
Dat bewijst geen betrouwbare echte historische statistieken. Er is geen expliciet
xG-veld of gevalideerde xG-mapping gevonden; de generieke name/value-tabel zou een
naam kunnen opslaan, maar dat is nog geen bruikbaar xG-contract. Er is geen API of
nieuwe providerbron geraadpleegd en geen historische beschikbaarheid aangenomen.

`StatisticObservation` biedt daarom een aparte, optionele typed contractlaag:
fixture-ID, team-ID, metric, nullable value, timezone-aware observed_at en
`verified_final_fixture_statistics_v1` provenance. Canonieke metrics zijn shots,
shots_on_target, possession (0–100), corners, fouls, yellow_cards en red_cards.
Dangerous-attacks-proxies worden niet verzonnen. Duplicaten, onbekende metrics,
ongeldige waarden en verkeerde fixture/teamkoppelingen worden geweigerd.

Alleen de laatste vijf **eligible final-resultfixtures** kunnen bijdragen.
Per metric is de mean gebaseerd op werkelijk aanwezige waarden; een aparte count
toont die dekking. Targetstatistics en toekomstige fixtures kunnen niet bijdragen.
Standard/demo vereisen observed_at vóór cutoff; historische backfill mag alleen
het expliciet geverifieerde contract gebruiken, nooit zomaar de huidige tabel.
Het provenanceveld is een verklaring van de toekomstige vertrouwde adapter, geen
automatisch bewijs op basis van een string in een willekeurig importbestand.

De huidige Laravel-export en CLI laden **geen statistics**. De family staat standaard
uit. Met `--feature-group match_statistics` verschijnen 28 nullable/count-kolommen,
maar zonder typed observations blijven means NaN en counts 0. Alleen gecontroleerde
tests voeren observations rechtstreeks aan de builder. Een toekomstige adapter
moet eerst ontbrekende versus echte nul bewaren, providersemantiek verifiëren,
observatieversies vastleggen en deze provenance in export/artifacts doorgeven.
Er wordt nu niets uit de bestaande stats-tabellen opportunistisch aangesloten.

xG/xGA/difference/overperformance (8 definities) en player availability (12 definities)
zijn geregistreerd maar uitgeschakeld. Configuratie kan deze groepen niet activeren.
Spelerscontracten vereisen daadwerkelijk pre-match lineup/availability snapshots,
geldige teamkoppeling en minutes/performance-as-of-cutoff voor expected XI strength,
missing starters, continuity, keeperavailability en minutes-weighted strength.
Vereiste toekomstige provenance: source, fixture/team/player-ID, observed_at,
valid-at/effective-time, immutable snapshot-ID en payloadschema. Current squad,
later bekende starters of actuele blessures mogen dat niet vervangen.

## Missingness en preprocessing

0 is een echte geobserveerde nul; NaN is onbekend/geen bewijs. Historycounts en
availability-indicatoren zijn ook bij lege history bekend (0, of insufficient=1).
Rates, totals, streaks en rust zonder historie blijven NaN; neutrale Elo heeft een
expliciete initialisatie-indicator. `inspect_features` zet NaN om naar JSON null.
Een count van nul is zelf een beschikbare telling, geen bewijs dat het team nul
heeft gepresteerd; de bijbehorende rate blijft onbekend.

Sklearn-imputatie gebeurt alleen binnen de train-fitted pipeline. Median-imputatie
met missing indicators en `keep_empty_features=True` blijft behouden; een volledig
lege trainingskolom krijgt daar nul om de matrixvorm stabiel te houden. Die technische
preprocessing-nul verandert het broncontract niet. Alleen Logistic Regression
gebruikt StandardScaler. Random Forest en Gradient Boosting krijgen geen scaler.
Er is geen preprocessingfit op validation/test.

## Configuratie, versioning en inspectie

`feature_set_version=v2`, actieve families, volledige configuratie, registryhash,
configuratiehash, exacte gesorteerde featurenamen en codehashes worden opgeslagen.
Inference reconstrueert de configuratie uit het artifact en weigert onbekende versie,
gewijzigde namen/families/configuratie/registry of featurebroncode. Oude artifacts
zonder v2-contract moeten opnieuw getraind worden; er is geen stille kolomconversie.

Voorbeeldconfiguratie: `ml/feature-config.example.json`. Alle resultaatfamilies zijn
standaard aan; pas `groups` aan voor kleinere experimenten. `venue_form` bevat zowel
resultaat- als goalmetingen voor venues. `result_form`/`goals` betreffen all-venue;
dat voorkomt dubbel eigenaarschap van kolommen. Dependencies van verschillen/ratio's
worden intern berekend, ook als de onderliggende kolommen niet geselecteerd zijn.

```powershell
$export = 'storage/app/private/ml/fixtures-TIMESTAMP.jsonl'
ml/.venv/Scripts/python -m ml.inspect_features $export FIXTURE_ID --mode historical --cutoff KICKOFF_WITH_OFFSET --feature-config ml/feature-config.example.json
ml/.venv/Scripts/python -m ml.training $export --mode historical --target-season 2022 --audit-only --output ml/artifacts/v2-audit-UNIQUE --feature-group result_form --feature-group goals --feature-group rest --feature-group congestion --feature-group elo
```

Herhaal `--feature-group` voor families; zonder opties geldt de standaardset.
Gebruik een configfile óf de groepsopties. Bijvoorbeeld A=result-only, B=dezelfde
set + elo, C=+reconstructed_standings. Statistics blijft een optioneel contract totdat
betrouwbare data en een adapter beschikbaar zijn; het activeren alleen vult geen data.
De bestaande training/evaluation/replay-commands blijven beschikbaar.

`feature_details` geeft per geselecteerde feature value, family, source, window,
available, source_fixture_ids en missingness. Bronhistory toont kickoff, scores en
venue. `contexts.elo` toont pre-cutoffratings, expected score, updatecounts, parameters
en bronnen; `contexts.reconstructed_table` toont de tabel vóór kickoff. Contextcutoff
staat erbij. De bestaande historische uitsluitredenen blijven behouden.

De bestaande lokale demo-export is technisch geïnspecteerd: fixture 27, cutoff
2026-10-13T18:00:00Z, 378 features, homehistory 4, awayhistory 3 en 7 waargenomen teams
in de gereconstrueerde competitietabel. Het private resultaat staat in
`ml/artifacts/feature-v2-local-inspection.json`. Dit is inspectie, geen voorspelling
of bewijs van modelkwaliteit. Er is geen nieuwe data opgehaald.

## Verificatie

Numerieke regressies testen 3/5/10, echte denominators, total/rate-relaties,
venuewissels, H2H-richting/windows, streakstop/cap, Elo-formule/thuisvoordeel/
seizoensovergang/gelijk-tijdige batches, leaguecontext/table/gelijke ranks,
7/14/21-daggrenzen, offseason gaps, NaN versus nul, ratios, late observaties en
target/future/tied-resultaatuitsluiting in alle modi. Registrycompleetheid,
behoud van 85 namen, versie/configweigering in inference, statistiekprovenance,
empty statistics en uitgeschakelde families hebben regressietests.

De bestaande pipeline-tests blijven de imputer op uitsluitend trainingdata toetsen.
Hun schema-check is bijgewerkt naar de registry, en NaN-vergelijking is expliciet
gemaakt; availability- en replaybeveiligingen zijn niet verzwakt.

Afgerond op 15 oktober 2026:

- Python: **82 tests geslaagd**, inclusief de 61 bestaande tests en 21 nieuwe
  regressies. De bestaande Windows/joblib-waarschuwing over fysieke CPU-detectie
  valt terug op logische cores; geen testfout.
- Laravel: **611 tests geslaagd**, **16.199 assertions**.
- Ruff lint en formatter: geslaagd, 19 Pythonbestanden gecontroleerd.
- Prettier voor gewijzigde documentatie en voorbeeldconfiguratie: geslaagd.
- `git diff --check`: geslaagd; alleen Git-meldingen over toekomstige
  CRLF-naar-LF-normalisatie.
- CLI-inspectie op bestaande demodata: standaardconfig 378 features, Elo-only 6,
  statistics-only 28. Zonder statistics-bron zijn alle means null en alle counts 0.

```powershell
ml/.venv/Scripts/python -m pytest ml/tests -q -p no:cacheprovider --basetemp=ml/artifacts/features-v2-final-20261015
php artisan test --compact
ml/.venv/Scripts/ruff check ml
ml/.venv/Scripts/ruff format --check ml
npx prettier --check README.md ml/README.md ml/feature-config.example.json docs/ml/ml-feature-audit-v1.md docs/ml/ml-feature-registry-v2.md docs/ml/ml-feature-engineering-v2.md
git diff --check
```

De alternatieve pytest-tempmap voorkomt lokale sandboxrechtenproblemen; gebruik
bij herhaling een nieuwe naam. Frontend-types/build zijn niet opnieuw uitgevoerd:
er is geen frontendcode, route, dependency of frontendconfig gewijzigd.

## Volgende fase en grenzen

Na echte gecontroleerde fixture-import: audit dekking en seizoensgrenzen, vergelijk
kleine vooraf gekozen families met chronologische validation en onaangeroerde test.
Een logische architectuurstap daarna is expanding-window/walk-forward validatie
met aparte calibratiesamples en group ablations; geen grote modelzoektocht vóór
bronkwaliteit is vastgesteld. Optimaliseer daarna eventueel incrementele Elo/table
replay voor grote exports; de huidige implementatie herberekent deterministisch per
cutoff en is primair op correctheid gericht. Incomplete imports, scorecorrecties,
provenance van historische statistieken en onofficiële reconstructed ranks blijven
expliciete beperkingen.

## Bestanden en commitgroepen

Geen commits gemaakt. Logische reviewgroepen:

1. **`Voeg versieerbare voetbalfeatures en broncontracten toe`**:
   `ml/feature_registry.py` (declaraties/config/versioning), `ml/feature_sources.py`
   (verified statistics-contract), `ml/football_context.py` (Elo/league/table),
   `ml/features.py` (centrale builder/trace), `ml/feature-config.example.json`.
2. **`Koppel featuresets aan training en inference`**:
   `ml/dataset.py` (configurabele matrix), `ml/training.py` (metadata, onafhankelijke
   coverageguards, modelpreprocessing), `ml/inference.py` (contract/hashchecks),
   `ml/inspect_features.py` (configurabele inspectie).
3. **`Test voetbalfeatures en voorkom datalekken`**:
   `ml/tests/test_feature_engineering.py` (nieuwe regressies),
   `ml/tests/test_features.py` (NaN-correcte targetmutatietest),
   `ml/tests/test_historical.py` (v2-schemacontrole), `ml/tests/test_pipeline.py`
   (v2-testartifact en correcte volledig-lege-kolomverwachting).
4. **`Documenteer featureaudit en v2-contracten`**:
   `docs/ml/ml-feature-audit-v1.md`, `docs/ml/ml-feature-registry-v2.md`, dit rapport,
   `README.md` en `ml/README.md` (vindbaarheid/setup).
