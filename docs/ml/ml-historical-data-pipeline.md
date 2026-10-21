# Historische ML-data: infrastructuur en audit

Auditdatum: 16 oktober 2026. Deze fase verzamelt en controleert resultaatdata.
Er is geen echte API-import, lokale migratie, training, tuning, modelpromotie of
commit uitgevoerd. Alle beschikbaarheidscontroles van de bestaande ML-laag blijven
behouden. Eerder onafgerond commitwerk voor features/evaluatie is behouden.

## Bestaande infrastructuur en analyse

- `Fixture`, `Team` en `League` hebben unieke provider-`external_id`-velden.
  Fixtures hebben foreign keys naar league en beide teams, een seizoen, kickoff,
  status en afzonderlijke fulltime-/extra-time-/penaltyscores. Er is geen aparte
  season-entiteit: het jaar hoort bij de league/fixture-context.
- `FixtureService::storeFixtures` verzorgt mapping, lazy teamcreatie, transacties,
  velden en bestaande prediction scoring. Dit blijft de enige fixture-writer.
  Een nieuwe optionele historische guard beschermt identiteit en definitieve
  resultaten; reguliere callers behouden hun bestaande gedrag.
- `LeagueService` verwerkt metadata. Wanneer een league ontbreekt, wordt alleen
  `/leagues?id=...&season=...` gebruikt; league-type wordt niet gegokt uit fixtures.
  Teams worden uit dezelfde fixture-response gemapt, zonder `/teams`-request.
- `FootballApiService`, `FootballApiBudget`, `FootballApiContext` en `ApiQuota`
  blijven de gedeelde HTTP-, timeout-, cache-, lock-, retry- en quotalaag.
  Geen tweede client, queue- of schedulerpipeline.
- `CompetitionSyncService` beheert huidige kalenderwindows. De historische import
  gebruikt dezelfde `football:calendar:league:season`-lock. Het bestaande
  `app:seed-historical-season` haalt standaard ook teams, standings en details op;
  daarom is dat niet het nieuwe minimale ML-entrypoint.
- Standings zijn league/season/team/group-snapshots. Fixture statistics, lineups,
  player fixture/season stats hebben eigen services en syncmomenten, maar geen
  volledig historisch pre-matchobservatiecontract. Ze worden hier niet opgehaald
  of ingeschakeld. ML reconstrueert tabellen uit eerdere resultaten.
- De scheduler in `routes/console.php` blijft ongewijzigd. Historische imports
  worden alleen handmatig gestart; import roept geen ML-training aan.
- Configuratie heeft `API_FOOTBALL_COMPETITIONS` als expliciete league:season-paren,
  met legacy fallbacks `FOOTBALL_LEAGUE_ID` en `FOOTBALL_SEASON_YEAR`. In de lokale
  `.env` zijn deze selecties niet expliciet aanwezig; defaults zijn 1/2026.
  Er zijn geen environmentbestanden gewijzigd of secrets weergegeven.

De officiële provideruitleg beschrijft het volledige seizoen via
`/fixtures?league=...&season=...` en het hergebruik van kalenderdata in plaats van
per-fixture requests: [fixture-endpointvoorbeelden](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide),
[quotaoptimalisatie](https://www.api-football.com/news/post/how-to-optimize-api-sports-calls-and-quota-usage).
De historische wrapper controleert `results` en `paging.current/total=1` expliciet.
Bij onverwachte pagination stopt hij; hij verzint geen ongedocumenteerde
fixture-paginatieparameters en markeert de eerste pagina niet als compleet.

## Datacontract

Vereist: positieve providerfixture- en team-ID's, verschillende home/awayteams,
exact de aangevraagde league en season, expliciete ISO-kickoff met timezone,
overeenstemmende Unix-timestamp, bekende status en benodigde mappingvelden.
Het gereserveerde demo-ID-bereik wordt geweigerd. Namen, ronde en teamlogo's zijn
ook nodig om aan bestaande niet-null databasestructuren te voldoen; logo's worden
niet gedownload en zijn geen ML-features.

Voor FT zijn beide regulation-time scores verplichte niet-negatieve integers;
`goals` en `score.fulltime` moeten overeenkomen. Scores boven 50 worden geweigerd;
de audit markeert al boven 20 als verdacht. FT-kickoff moet minstens vier uur oud
zijn. Onmogelijke/ongeldige datums, dubbele provider-ID's, mismatched identity,
onbekende status en een lege response blokkeren verwerking.

PST, CANC, ABD, NS, AET, PEN en andere bekende statussen blijven afzonderlijk
bewaard. Alleen betrouwbare **FT**-fixtures zijn huidige ML-targets. Extra-time en
penaltyuitkomsten worden niet als 90-minutenlabels behandeld. Import geeft geen
nieuwe betekenis aan bestaande standard/demo/historical availability-policies.

Resultaten/context volstaan voor de 13 standaardfamilies: result_form, goals,
venue_form, streaks, Elo, league_context, rest, congestion, H2H, season,
history_quality, reconstructed_standings en ratios. Er zijn geen nieuwe features
of statistics/xG/playerdata geactiveerd.

De provider wordt in UTC bevraagd. De gedeelde databaseconventie is momenteel
Brussels wall time, zoals gebruikt door de bestaande kalender/scheduler. De
historische importer converteert expliciet naar die conventie. De originele
offset en timestamp blijven in de bronpayload staan. Exporteer deze data met
`--kickoff-timezone=Europe/Brussels`; gebruik niet blind UTC voor gemengde legacydata.

## Selectie en commands

Eén command met drie acties: `ml:data plan`, `ml:data import`, `ml:data audit`.
Dit voorkomt duplicatie van selectie/validatie over drie commandklassen.

De nieuwe optionele `ML_FOOTBALL_COMPETITIONS=39:2022,140:2022,39:2023` volgt dezelfde
parenconventie, maar staat los van live schedulerselectie. Default is **geen**
historische selectie. Expliciete flags werken zonder environmentwijziging:

```powershell
php artisan ml:data plan --league=39 --season=2022
php artisan ml:data plan --league=39 --league=140 --from-season=2021 --to-season=2023
php artisan ml:data import --league=39 --season=2022 --dry-run
```

CLI-combinaties zijn een expliciet gevraagd league×season-product. Configuratie
bevat juist losse paren. De uitvoering is deterministisch op season en league-ID.
Onvolledige selecties, ongeldige IDs/seizoenen en omgekeerde ranges falen voordat
de provider wordt benaderd. Geen automatische seizoenkeuze.

Plan, audit en import-dry-run doen uitsluitend lokale reads: geen HTTP, quota-
reservatie, writes, cachelocks of dispatch. Ze werken ook vóór de nieuwe migratie
en tonen dan `migration_required=true`. Het plan kan ontbrekende wedstrijden niet
bewijzen zonder eerder ontvangen manifest of betrouwbare verwachte kalender.

## Quota, idempotentie en hervatten

Per ontbrekende snapshot één `/fixtures`-request, plus één gerichte `/leagues`-
request als mapping ontbreekt. Geen per-fixturecalls. De bestaande client heeft
maximaal twee pogingen voor verbinding/serverfouten, expliciete timeouts en een
korte responsecache. De gerapporteerde bovengrens is twee keer het aantal nodige
endpoints. Cachehits kunnen het echte aantal lager maken.

Alle requests krijgen `Background`-prioriteit en respecteren dag-/minuutreserves,
geobserveerde quota en Retry-After. Bestaande headers blijven centraal geregistreerd:
`x-ratelimit-requests-limit/remaining`, `X-RateLimit-Limit/Remaining`.
`UNKNOWN` betekent onbekend, geen gratis of onbeperkt quota. Planning gaat geen
statuscall doen om dat te achterhalen. Bij quota-deferral blijven checkpoints staan;
het command meldt de status en stopt de resterende selectie. Een HTTP 429 stopt met
foutstatus en zet de bestaande centrale pauze, zonder snelle herhaalde requests.

De nieuwe `ml_import_batches`-tabel bewaart per ontvangen snapshot provider,
endpoint, league, season, schemaversie, fetched_at, originele payload, checksum,
hervatindex en completed_at. Nieuwe expliciete refreshes bewaren oudere batches.
Dit is het duurzame hervatpunt en provenancebewijs; een tijdelijke cachemarker
zou na verval opnieuw een volledig seizoen ophalen.

Payloadchecksums canoniseren objectkeys, zodat MySQL JSON-keynormalisatie de hash
niet ongeldig maakt. Arrayvolgorde blijft betekenisvol. Fixtures worden daarna
chronologisch verwerkt. Elke fixture-write en checkpointstap delen een transactie.
Na een onderbreking wordt dezelfde opgeslagen payload hervat, zonder nieuwe call.
De afzonderlijke fixturetransacties behouden reeds correct verwerkte data.

Een afgeronde identieke import doet nul API-calls en schrijft geen fixtures opnieuw.
Ontbrekende lokale fixtures uit een afgeronde snapshot geven een fout en worden
in de audit vermeld. `--force` vraagt na voltooiing een nieuwe snapshot en kan
ontbrekende rijen herstellen, maar negeert geen contract of resultaatconflict.
Bij een onvoltooide batch betekent ook `--force` hervatten, niet weggooien.

Definitieve FT/AET/PEN-records worden bij overeenstemming overgeslagen. Afwijkende
score, status, kickoff, teams, league of season stopt de import met fixture-ID.
Er is geen automatische correctie van definitieve uitslagen. Los het conflict
na inhoudelijke verificatie expliciet op en hervat. Een corrupte snapshotchecksum
blokkeert eveneens. Failed requests of invalid payloads krijgen geen completionmarker.

## Data-audit

Per league/season: fixture- en FT-aantal, kickoffrange, statusverdeling, unieke
teams, wedstrijden per team, eerste/laatste teamwedstrijd, mogelijke gaten >45 dagen,
dubbele provider-ID's, dubbele team/kickoffcombinaties, onbekende teammappings,
gelijke teams, ontbrekende/verdachte scores en verdachte/ongeldige datums.
Daarnaast: globaal ontbrekende league/season-context, vorige-seizoensvolume,
bronmanifestcount, ontbrekende manifestfixtures en lokale fixtures zonder manifest.

Gaten kunnen winterpauzes, promotie of competitiestructuur betekenen. Een incompleet
vorig seizoen is een waarschuwing voor warmup, geen automatische datacorrectie.
Unieke IDs en foreign keys voorkomen normaal duplicates/orphans; de audit blijft
defensief. Een afgeronde snapshot bewijst alleen dat de ontvangen rijen zijn
verwerkt, **niet** dat een seizoen sportief voltooid of providerdekking compleet is.
`season_completeness` blijft daarom expliciet onbekend zonder vertrouwde kalender.

## Featurecoverage zonder training

```powershell
ml/.venv/Scripts/python -m ml.coverage $export --feature-config ml/feature-config.example.json --target-season 2022
```

Dit gebruikt rechtstreeks de bestaande `dataset`, `FeatureBuilder`, `FeatureConfig`
en registry; geen parallelle featureberekening. Alle eerdere toegestane seizoenen
blijven warmupcontext bij selectie van targetseizoen 2022. Cutoffs zijn de eigen
kickoffs, met bestaande FT-/completion-/historical guards.

Het rapport bevat eligible targets, fractie met beide teams ≥5/≥10 wedstrijden,
venuehistory ≥5, Elo-initialisatie, leaguecontext, reconstructed standings, H2H,
missingness per familie en per league/season, plus eerste-30-dagenimpact.
Ontbrekende geselecteerde diagnostiek of nul targets geeft null, niet fictief 0%.
Season-progress-NaN blijft bewust aanwezig zolang de kalenderlengte onbekend is.
De bestaande walk-forward dry-run kan hierna dezelfde dataset verder beoordelen.

## Export en fingerprints

`ml:export` behoudt schema v1, IDs, whitelisted velden en availability-policy.
Het sorteert nu op opgeslagen kickoff en ID, converteert naar UTC en weigert
duplicates of een niet-chronologisch UTC-resultaat. De bestaande Pythonlezer
weigert incomplete exports, duplicate IDs en observaties na het exportmoment.

Naast `fixtures-TIMESTAMP.jsonl` staat `.summary.json` met fixture-, league-,
season- en teamcount, kickoffrange, bestandsgrootte, bestand-SHA256, deterministische
`dataset_rows_sha256` en batchprovenance. De rijhash omvat exact de JSON-datarijen
met LF, exclusief header/footer; veranderde observatietimestamps veranderen de hash.
Het volledige bestand verandert bij een nieuw exporttijdstip. De bestaande Python
`fixture_fingerprint` is een ander, gedocumenteerd modelcontract; hashes zijn niet
onderling uitwisselbaar. Provenance is metadata, geen predictor of historische
beschikbaarheidsclaim. De bronpayload bewaart per fixture status en provider-ID.

Export leest alle lokale fixtures, zodat warmup niet per ongeluk verdwijnt. Niet-FT
en demodata kunnen in de export staan; de ML-lezer/targetselectie blijft ze scheiden.
Exports en modellen blijven privé/Git-ignored. Maak exports op een stabiele database.

## Lokale audit en verwachte calls

Het read-only plan is op de lokale database uitgevoerd voor **39:2022**:

- 0 fixtures, 0 FT, geen league-mapping, geen eerdere ML-importbatch;
- `/leagues` plus `/fixtures`: **2 verwachte requests, maximaal 4 HTTP-pogingen**;
- quota UNKNOWN, remaining null, geen geobserveerde quotatimestamp;
- `migration_required=true`; de migratie is bewust niet lokaal uitgevoerd.

Met bestaande league-mapping: 1 request/maximaal 2 pogingen. Bij een afgeronde
identieke snapshot: 0. Voor bijvoorbeeld zes ontbrekende seizoenen van dezelfde
nieuwe league: 7 requests/maximaal 14 pogingen, omdat de league eenmaal wordt gemapt.
Losse planregels kunnen conservatief dezelfde ontbrekende league tellen; daadwerkelijke
uitvoering hergebruikt de nieuw opgeslagen mapping. Dit is geen quotareservering.

Op de bestaande demo-export is `ml.coverage` uitgevoerd: **0 echte eligible targets**.
Geen training of performanceclaim. Alleen gemockte responses zijn geïmporteerd in
de geïsoleerde tests.

## Exacte eerste workflow voor later

Review eerst de migratie en het plan. Voer daarna zelf uit:

```powershell
php artisan migrate
php artisan ml:data plan --league=39 --season=2022
php artisan ml:data import --league=39 --season=2022 --dry-run
php artisan ml:data import --league=39 --season=2022
php artisan ml:data audit --league=39 --season=2022
php artisan ml:export --kickoff-timezone=Europe/Brussels
$export = (Get-ChildItem 'storage/app/private/ml/fixtures-*.jsonl' | Sort-Object Name | Select-Object -Last 1).FullName
ml/.venv/Scripts/python -m ml.coverage $export --feature-config ml/feature-config.example.json --target-season 2022
$run = 'ml/artifacts/evaluations/historical-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
ml/.venv/Scripts/python -m ml.evaluate $export --mode historical --feature-config ml/feature-config.example.json --experiment-config ml/experiments.example.json --output $run --dry-run
```

39:2022 is een inspecteerbaar voorbeeld, geen automatisch geactiveerde productie-
selectie. Controleer dat je abonnement dit seizoen aanbiedt. De huidige voorbeeld-
evaluationconfig bevat targetseizoen 2022 en drie windows binnen 2022–2023. Pas
perioden vooraf aan als de echte dekking anders blijkt. Importeer later expliciet
oudere warmupseizoenen wanneer de coverage-audit dat nodig maakt. Start geen training
door tijdens de import automatisch de dry-runflag weg te laten.

## Verificatie

- Volledige Laravel-suite: **645 tests geslaagd, 16.320 assertions**.
- Volledige Python-suite: **106 tests geslaagd**. Eén bestaande Windows/joblib-
  waarschuwing over fysieke-coredetectie; logische cores worden gebruikt.
- Gerichte nieuwe coveragetests: 3 geslaagd.
- Gerichte Laravel-selectie (import/export/fixture/config): 60 tests geslaagd.
- Laravel Pint toegepast; Ruff lint en format-check geslaagd (26 Pythonbestanden).
- Providerresponses zijn gemockt; tests dekken idempotentie, mappings, meerdere
  leagues/seasons, FT versus andere statussen, validatie, duplicates, pagination,
  quota, 429/server/API-fouten, read-only planning, resume, resultaatconflicten,
  JSON-keynormalisatie, auditgaten en deterministische chronologische exports.
- Python-regressies behouden cutoffveiligheid en controleren coverage met warmup,
  niet-FT/demo-uitsluiting, nul targets en ontbrekende diagnostiekfamilies.

## Resterende grenzen

- Geen echte providerresponse of bulkperformance gevalideerd. Provider-/abonnement-
  dekking, onverwachte schemawijzigingen en nog onbekende leagues kunnen blokkeren.
- Snapshotvoltooiing plant geen automatische refresh voor lopende seizoenen.
  Inspecteer statuses en gebruik later bewust `--force`; bewaar resultaatconflicten.
- Brussels wall time kan bij de zomer-/wintertijdgrens ambigu zijn. Bronpayloads
  behouden de UTC-timestamp; gemengde legacytimezones vereisen afzonderlijke audit.
- Payload en seizoensaudit passen momenteel in geheugen. De export streamt rijen.
  Voor uitzonderlijk grote competities is gerichte optimalisatie mogelijk nodig.
- Snapshotarchieven groeien bij expliciete refreshes. Retentie/backups moeten
  provenance behouden; deze fase verwijdert geen historische batches.
- Een onbekende verwachte kalender betekent onbekende volledigheid. Teamgaten zijn
  signalen, geen harde bewijzen van ontbrekende wedstrijden.
- Historical ML blijft een retrospectieve resultaatreplay, geen bewijs dat deze
  gegevens destijds bij MondialIQ beschikbaar waren. Standard/demo blijven strikt.

## Gewijzigde bestanden en voorgestelde commitgroepen

Geen commits gemaakt. De eerdere v2/evaluatiewijzigingen stonden al in de werkboom;
stage gedeelde README-hunks gericht of leg die eerdere fase eerst apart vast.

1. **`Voeg hervatbare historische ML-import toe`**:
   `app/Console/Commands/MlData.php`, `app/Models/MlImportBatch.php`,
   `app/Services/MachineLearning/HistoricalDataImporter.php`,
   `app/Services/MachineLearning/HistoricalFixtureContract.php`,
   `app/Services/MachineLearning/HistoricalDataAudit.php`,
   `database/migrations/2026_10_16_081952_create_ml_import_batches_table.php`,
   `config/api-football.php`, `app/Services/Football/CompetitionConfig.php`,
   `app/Concerns/FootballApi/FixtureEndpoints.php`,
   `app/Concerns/FootballApi/MetadataEndpoints.php`,
   `app/Services/Fixture/FixtureService.php`.
2. **`Voeg exportaudit en featurecoverage toe`**:
   `app/Services/MachineLearning/FixtureDatasetExporter.php`,
   `app/Console/Commands/ExportMlFixtures.php`, `ml/coverage.py`.
3. **`Test historische import en datasetkwaliteit`**:
   `tests/Feature/HistoricalMlDataTest.php`, `ml/tests/test_coverage.py`.
4. **`Documenteer historische ML-dataworkflow`**:
   dit document, `README.md`, `ml/README.md`.
