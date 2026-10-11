# API-Football synchronisatie: eindrapport

## 1. Inventaris en analyse

De volledige oorspronkelijke inventaris, endpoints, selecties, schedulerfrequenties en overlap staan in [de analyse vóór implementatie](football-sync-audit.md). Daarin staan alle achttien API-Football-commands, inclusief indirecte calls via services. Geen football-queuejobs bestonden vóór deze wijziging. AI-generation en prediction scoring gebruiken lokale football-data en zijn functioneel ongewijzigd.

## 2. Commands samengevoegd en compatibiliteit

De dagelijkse bediening en scheduler gebruiken één command met zes expliciete fasen: `football:sync reference-data|fixtures|live|pre-match|post-match|standings`. Dit voorkomt zes vrijwel identieke nieuwe commandklassen. Fixture-businesslogica uit drie oude commands is samengebracht in `FixtureSyncService`; bestaande opslagservices worden hergebruikt.

| Bestaande naam | Voorkeur vanaf nu | Status |
|---|---|---|
| app:add-countries, app:add-leagues, app:add-teams, app:add-players, app:add-coaches, app:add-venues, app:add-bookmakers | football:sync reference-data | losse handmatige imports blijven werken |
| app:add-fixtures | football:sync fixtures | blijft beschikbaar, niet meer apart gepland |
| app:add-fixture-data | football:sync live en post-match | dunne compatibiliteitswrapper; deelt locks en retries |
| app:add-fixture-lineups | football:sync pre-match | dunne compatibiliteitswrapper |
| app:add-fixture-player-stats | football:sync post-match | dunne compatibiliteitswrapper, alleen playerstats |
| app:add-standings | football:sync standings | handmatige import blijft beschikbaar |
| app:add-predictions | zelfde naam | alleen niet-gestarte fixtures in komende 14 dagen, geconfigureerde competitie |
| app:add-odds | zelfde naam | komende niet-gestarte fixtures, geconfigureerde competitie; alle API-pagina's |
| app:import-head-to-head | zelfde naam | freshness blijft 90 dagen; reguliere selectie beperkt tot geconfigureerde competitie |
| app:import-team-statistics | zelfde naam | freshness blijft 24 uur / 7 dagen; historische gedateerde inhoud wordt bevroren |
| app:seed-historical-season | zelfde naam | gedeelde detailservice; afgeronde fixtures; nieuwe --retry-incomplete optie |
| app:sync-competition-data | zelfde naam | expliciete bootstrap, geen impliciete --force op H2H/teamstats meer |

Er zijn **geen commandnamen verwijderd**. De oude fixturecommands zijn vervangen als voorkeursingang en uit de scheduler gehaald, maar blijven compatibel bereikbaar. `app:sync-all-data` bestond niet in de code en is uit de README verwijderd. Bootstrap blijft bewust uitgebreider (o.a. odds tot 90 dagen) dan de dagelijkse scheduler.

## 3. Verspilling en correcties

- Seizoenoverzicht tijdens livewedstrijden: van iedere minuut naar dagelijks.
- Per-fixture basis/statistics/events: live en finale sync bundelen maximaal twintig fixtures. Aanwezige arrays in de response worden hergebruikt; alleen ontbrekende keys leiden tot aparte requests. Een aanwezige lege array veroorzaakt geen tweede call naar dezelfde dataset in dezelfde run.
- Lineups uit een livepayload worden binnen het lineupvenster direct gebruikt. Het pre-match-command ziet de opgeslagen compleetheid en slaat zijn call over.
- Historische API-predictions worden niet meer dagelijks gevraagd of achteraf overschreven. Lege predictionresponses wissen bestaande informatie niet; na de request wordt kickoff opnieuw gecontroleerd.
- Final/playerstats-pogingen tellen ook HTTP-fouten mee. Succesvolle datasets blijven bij een retry intact. Een datasetfout blokkeert andere onafhankelijke datasets niet.
- Lege statistieken zijn geen succes. Lineups moeten beide teams met minimaal elf starters bevatten. Playerstats vereisen beide teams, minimaal elf spelers per team, statistics-inhoud en succesvolle lokale mapping. Lege events gelden alleen bij een expliciete 0–0 als complete lege dataset.
- Coach/venue-selectie gebruikt alleen fixtures uit de geconfigureerde competitie en het seizoen. Reference-responsecache voorkomt dagelijkse externe herhaling; persistence blijft via de bestaande services lopen.
- Geneste HTTP-retries zijn vervangen door maximaal twee pogingen bij verbindingsfouten/5xx, met 500 ms wachttijd. 4xx/429 en inhoudelijke API-fouten worden niet onmiddellijk herhaald. Een 429 of quota-uitputting pauzeert het gedeelde budget.
- Het aantal aanvragen is standaard begrensd tot 60 per minuut per sleutel; afstemmen op het abonnement is noodzakelijk. Bij bekende quota-pauzes worden fixturepogingen uitgesteld. Lokale budgetweigering vóór een netwerkpoging put de datasetretryteller niet uit.
- HTTP 200 met `errors`, ongeldige JSON of ontbrekende response-array veroorzaakt een fout; dergelijke responses worden niet gecachet.
- Het ontbrekende ophalen van vervolgpagina's bij odds is hersteld. Dit kan juist méér calls kosten, maar voorkomt verlies van functionele data.

## 4. Strategie per wedstrijdstatus

| Staat | Gedrag |
|---|---|
| Ver in de toekomst | Dagelijkse basiskalender; geen losse lineup/events/statistics-calls |
| 45 minuten vóór tot 15 minuten na kickoff | Lineups maximaal vier keer, minimaal 15 minuten tussen pogingen; stoppen bij complete lineups |
| Laatste 15 minuten vóór kickoff | Basisrefresh wanneer die nog ontbreekt/verouderd is |
| Kickoff verstreken, status nog NS | Snelle basispolling om livegang niet een uur te missen; maximaal drie uur na kickoff |
| Live | Score/status/events/statistics per minuut, in batches; geen aparte playerstats-poll tijdens live |
| FT/AET/PEN, recent | Finale events/statistics plus playerstats; ontbrekende lineups worden in post-match nog meegenomen. Per finale datasetgroep maximaal drie pogingen, minimaal 15 minuten tussen pogingen |
| Definitief verwerkt | Geen periodieke detailcalls. Finalized fixturebasis wordt ook bij kalenderimports niet meer overschreven |
| Onvolledig na limiet of venster | Blijft herkenbaar onvolledig; geen eindeloze automatische retries. Expliciet herstel via historische import |
| Oude live/onderbroken status | Periodieke details beperkt tot zes uur na kickoff; kalender blijft statuswijzigingen ontdekken |

Het bestaande recente finale venster van zes uur **vanaf kickoff** is behouden. Dit is geen garantie op aanvulling na een langdurige providerstoring; gebruik daarvoor de historische herstelimport. De vier lineup-pogingen gelden voor pre-match; post-match kan ontbrekende lineups maximaal tijdens de drie playerstats-pogingen aanvullen. Geen onbeperkte polling van niet-gedekte datasets.

Matchdatums volgen de bestaande Brussels-wandtijdconventie van `Fixture::kickoffAt()`. Nieuwe poging-/succesmetadata gebruikt UTC. Er is geen ingrijpende datumconversie van bestaande data uitgevoerd.

## 5. Scheduler en referencefrequenties

Alle tijden hieronder volgen de Laravel-schedulerconfiguratie, standaard UTC.

| Taak | Planning | Externe requests |
|---|---|---|
| football:sync fixtures | 00:05 dagelijks | één seizoenrequest |
| football:sync reference-data | 01:00 dagelijks | alleen verlopen referencecaches; players dagelijks bij recente/komende activiteit, anders maximaal wekelijks |
| football:sync live | elke minuut | alleen relevante fixtures, max 100 geselecteerd per run, batches van 20 |
| football:sync pre-match | elke 5 minuten | alleen toegestane lineup-pogingen |
| football:sync post-match | elke 5 minuten | alleen ontbrekende finale datasets met verstreken retrywachttijd |
| football:sync standings | ieder uur | maximaal uurlijks met fixtures binnen ±1 dag; anders eenmaal per dag |
| app:add-predictions | 02:00 dagelijks | komende 14 dagen |
| app:add-odds | iedere 6 uur | komende 14 dagen, bestaande --include-recent beschikbaar voor expliciet gebruik |
| app:generate-ai-predictions --days=3 | iedere 6 uur | bestaande AI-logica, geen API-Football-call |
| predictions:validate | iedere 4 uur | lokale scoring |

Referencecache: countries/leagues/bookmakers/venues/coaches 30 dagen; teams 7 dagen; spelers en squads 1 dag wanneer hun import daadwerkelijk draait. Buiten het activiteitvenster voert de nieuwe referencefase de spelersimport maximaal eens per week uit. Teammetadata wordt bewust wekelijks ververst; coaches blijven maandelijks. Odds 6 uur, predictions 24 uur; overige identieke requests hebben een cache van 10 seconden om kort opeenvolgende dubbele calls te voorkomen.

`withoutOverlapping()` en `onOneServer()` staan op alle schedulerentries. Football- en AI-importen draaien als achtergrondcommands om de hoofd-scheduler niet te blokkeren. Fase-locks beschermen ook handmatige runs; fixturelocks verbinden nieuwe commands, compatibiliteitscommands en historische detailsync. Een requestlock beschermt identieke HTTP-requests over processen. Definitieve basisdata wordt binnen een DB-transactie onder row-lock gecontroleerd.

Gebruik een centrale database-/Redis-cache op alle scheduler- en workerhosts. Een per-proces arraycache biedt deze productiegaranties niet. Servercron zelf is niet toegankelijk en is dus niet live gecontroleerd. `schedule:run` blijft het hoofdmechanisme. Verwijder in de deploymentconfig eventuele afzonderlijke cronregels die oude synccommands starten; de repo kan zulke serverinstellingen niet inspecteren.

Optioneel: `football:sync live|pre-match|post-match --queue`. Eén unieke job per fixture/fase, één jobpoging, timeout 300 seconden en dedicated database queue `football` met `retry_after=360`. De scheduler bepaalt vervolgpogingen op basis van persistente toestand. Queuegebruik offert batching over meerdere fixtures op voor workerisolatie; standaard gebruikt de scheduler efficiëntere batches.

## 6. Migratie

`2026_10_11_130730_add_dataset_sync_state_to_fixtures_table.php` voegt toe:

- `final_data_attempted_at`, `player_stats_attempted_at`: duurzame retrywachttijden, ook na fouten;
- `events_synced_at`, `statistics_synced_at`: afzonderlijke finale datasetvoltooiing;
- index `fixtures_sync_selection` op league, season, status en match_date.

De bestaande `has_lineups`, lineup-teller/timestamp, finale teller/timestamp en playerstats-teller/timestamp blijven behouden. Het playerstats-pogingbudget bewaakt de post-matchgroep met playerstats en ontbrekende lineups: bij reeds opgeslagen playerstats wordt alleen de ontbrekende lineup aangevuld. `final_data_synced_at` betekent finale events + teamstatistics, niet automatisch dat ook lineups en playerstats volledig zijn. Bestaande oude voltooiingsvlaggen worden niet massaal gereset of opnieuw geïnterpreteerd. De migratie verwijdert geen data en is reversibel.

## 7. Geschatte reductie

Geen productiegebruik gemeten. Met M live minuten en N gelijktijdige fixtures was de dominante component ongeveer `M × (1 + 3N)` calls: één seizoenfetch plus drie calls per fixture. Met volledige embedded datasets is dit ongeveer `M × ceil(N/20)` plus één dagelijkse kalendercall, lineups/finale aanvullingen en reference/prediction/odds-verkeer.

- N=1, M=100: circa 400 → 101 calls voor live + kalender, ongeveer **75% minder**.
- N=4, M=100: circa 1300 → 101, ongeveer **92% minder**.
- Historische predictions: van H calls per dag naar **nul** voor H afgelopen fixtures.
- Lineups zonder data: ongeveer 6–7 geplande calls → maximaal 4 pre-matchcalls; afzonderlijke begrensde post-matchaanvulling blijft mogelijk.
- Spelersimport buiten activiteit: circa 7(P+T) per week → P+T, ongeveer **86% minder** voor dat deel.
- Persistent 429: maximaal 6 onmiddellijke HTTP-pogingen → 1 en gedeelde pauze.

Dit zijn scenario's, geen beloofde totaalpercentages. Ontbrekende embedded datasets, queuegebruik, abonnementondersteuning, odds-pagination, aantal actieve teams en storageherstel beïnvloeden het echte resultaat. Meet het door `calls` uit `football_api.request` per endpoint/caller/dag op te tellen. Quotaheaders worden waar beschikbaar op elk werkelijk request vastgelegd.

## 8. Handmatige commando's en herstel

```bash
php artisan app:sync-competition-data
php artisan football:sync fixtures
php artisan football:sync reference-data
php artisan football:sync pre-match
php artisan football:sync live
php artisan football:sync post-match
php artisan football:sync standings
```

Historische import, met expliciete API-league en season:

```bash
php artisan app:seed-historical-season 1 2026 --only-finished
php artisan app:seed-historical-season 1 2026 --only-finished --skip-teams --skip-standings --retry-incomplete
```

De tweede variant geeft ontbrekende finale/playerstatdatasets opnieuw een begrensd pogingbudget. Complete finale datasets worden niet gewist of overschreven. Elke historische fixture wordt afzonderlijk verwerkt; ook zonder twintigvoudige batching vervangt één embedded request de oude drie detailcalls. Na een cacheflush kan reference-data opnieuw worden gevraagd; de database blijft de bron voor opgeslagen data.

## 9. Historie en toekomstige ML

- Fixture-, event-, statistics-, lineup- en playerstat-tabellen bevatten genormaliseerde bronobservaties. Niet ieder origineel API-responseveld wordt opgeslagen. De tijdelijke responsecache is geen duurzaam raw-data-archief.
- Bestaande `head_to_heads.raw_data` en `team_statistics.raw_data` blijven beschikbaar naast afgeleide samenvattingen. H2H is een actuele samenvatting, geen historische as-of snapshot.
- Gedateerde teamstatistieken met inhoud worden zonder expliciete `--force` niet opnieuw ververst. Nieuwe API-predictions stoppen na kickoff; bestaande historische predictions blijven behouden.
- Dit maakt afgeronde observaties stabieler maar reconstrueert geen oude beschikbaarheidsmomenten. Voor toekomstige pre-matchfeatures zijn append-only snapshots met `observed_at`, fixture-ID, bronversie en featureversie nodig. Gebruik finale stats en actuele H2H/squadgegevens niet ongemerkt als historische pre-matchfeatures.
- Er is geen ML-model, featurepipeline of nieuw raw-data-platform gebouwd. Predictionberekeningen en UI zijn niet gewijzigd.

## 10. Deployment en verificatie

```bash
php artisan migrate --force
php artisan config:cache
php artisan queue:restart
php artisan schedule:list
```

Zorg dat de migratie voltooid is voordat de nieuwe synchronisatie draait. Behoud één cronregel:

```cron
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

Stem `FOOTBALL_SYNC_REQUESTS_PER_MINUTE` af op het abonnement. `FOOTBALL_SYNC_BATCH_FIXTURES=false` schakelt de ids-batchrequest uit wanneer het abonnement die niet ondersteunt. Deze instellingen gaan via deploymentconfiguratie; `.env` is niet gewijzigd. Bij queuegebruik: `php artisan queue:work football --queue=football --tries=1 --timeout=300` onder de bestaande process supervisor.

Geen echte API-calls, lokale of productie-migraties of live serverwijzigingen uitgevoerd. De databasewijzigingen zijn uitsluitend in de testdatabase toegepast.

### Uitgevoerde controles

- Gerichte backendselectie: **72 tests geslaagd, 368 assertions**.
- Volledige backendtestsuite: **510 van 514 geslaagd**, 15.620 assertions; drie assertion failures en één error.
- De vier fouten zijn afzonderlijk gereproduceerd op de oorspronkelijke `HEAD`, zonder deze wijzigingen: `GroupsPageTest` (onafhankelijke paginering), twee `MondialiQDemoSeederTest`-tests (96 versus 32 fixtures), en `MondialiQDemoDataCommandTest` (bestaande duplicate email). De volledige suite is dus niet groen; deze bestaande problemen vallen buiten deze synchronisatieopdracht.
- `composer run lint:check`, `npm run types:check`, `npm run lint:check`, `npm run format:check` en `npm run build`: geslaagd.
- `composer run ci:check`: formatting en frontendcontroles geslaagd; backendteststap strandt op dezelfde bestaande fouten.
- `php artisan schedule:list`: de zes nieuwe synchronisatiefasen aanwezig met de bedoelde intervallen.
- `git diff --check`: geslaagd.

De tests gebruiken HTTP-fakes en een geïsoleerde database. Productiequota, response-inhoud van het actieve abonnement, de centrale cache en servercron zijn niet live gevalideerd. De reductiepercentages hierboven zijn berekende scenario's.

## 11. Reviewbare commitgroepen

Er zijn geen commits gemaakt. Onderstaande groepen vermelden alle gewijzigde en nieuwe bestanden; commit ze in deze volgorde. Paden zijn relatief aan de repositoryroot.

### 1. Analyse

Commitbericht: `Documenteer analyse van API-Football-synchronisatie`

```text
docs/football-sync-audit.md
```

### 2. HTTP-budget, caching en observability

Commitbericht: `Beperk en meet API-Football-verzoeken`

```text
app/Concerns/FootballApi/FixtureEndpoints.php
app/Concerns/FootballApi/OddsEndpoint.php
app/Services/Apis/FootballApiService.php
app/Services/Apis/FootballApiBudget.php
app/Services/Apis/FootballApiBudgetExceeded.php
app/Services/Apis/FootballApiContext.php
app/Providers/AppServiceProvider.php
config/football_sync.php
tests/Feature/FootballApiServiceTest.php
```

### 3. Wedstrijdstatussen, datasets en planning

Commitbericht: `Bundel wedstrijdsynchronisatie met begrensde retries`

```text
database/migrations/2026_10_11_130730_add_dataset_sync_state_to_fixtures_table.php
app/Models/Fixture.php
app/Models/Concerns/HasFixtureSync.php
app/Services/Football/FixtureSyncService.php
app/Services/Football/CompetitionSyncService.php
app/Services/Fixture/FixtureService.php
app/Console/Commands/SyncFootball.php
app/Console/Commands/AddFixtureData.php
app/Console/Commands/AddFixtureLineups.php
app/Console/Commands/AddFixturePlayerStats.php
app/Console/Commands/SeedHistoricalSeasonCommand.php
app/Jobs/SyncFootballFixture.php
config/queue.php
routes/console.php
tests/Feature/AddFixtureDataCommandTest.php
tests/Feature/AddFixtureLineupsCommandTest.php
tests/Feature/AddFixturePlayerStatsCommandTest.php
tests/Feature/FixtureDataSchedulerTest.php
```

### 4. Referentiedata en historische voorspellingen

Commitbericht: `Beperk imports en bescherm historische voorspellingen`

```text
app/Console/Commands/AddOdds.php
app/Console/Commands/AddPredictions.php
app/Console/Commands/Concerns/InteractsWithRelevantFixtures.php
app/Console/Commands/SyncCompetitionData.php
app/Services/Coach/CoachService.php
app/Services/Venue/VenueService.php
app/Services/TeamStatisticsService.php
tests/Feature/AddOddsCommandTest.php
tests/Feature/AddPredictionsCommandTest.php
tests/Feature/SyncCompetitionDataCommandTest.php
tests/Feature/TeamStatisticsServiceTest.php
```

### 5. Integratietests en beheerhandleiding

Commitbericht: `Test en documenteer de nieuwe football-sync`

```text
tests/Feature/FootballSyncTest.php
README.md
docs/football-sync-report.md
```

Bronnen voor endpointbundeling, quotaheaders en schedulerlocks: [API-Football optimalisatie](https://www.api-football.com/news/post/how-to-optimize-api-sports-calls-and-quota-usage), [API-Football fixturebundels](https://www.api-football.com/news/post/how-to-get-all-fixtures-data-from-one-league), [Laravel 13 scheduling](https://laravel.com/framework/docs/13.x/scheduling).
