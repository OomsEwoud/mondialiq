# API-Football: meerdere competities en quotabeleid

Afgerond op 12 oktober 2026. Dit rapport beschrijft de uitbreiding bovenop de eerdere synchronisatieoptimalisatie. De analyse vóór wijzigingen staat in [football-multicompetition-audit.md](football-multicompetition-audit.md); de volledige oorspronkelijke inventaris in [football-sync-audit.md](football-sync-audit.md).

## 1. Problemen en oplossing

| Aangetroffen | Nu |
| --- | --- |
| Imports en fixtureselecties gebruiken één globale league/season | Expliciete gevalideerde paren, toegepast op imports en fixtureselecties |
| Alleen noodstop bij uitgeput budget | Prioriteiten, percentagegrenzen, absolute reserve, atomische lokale reserveringen |
| Headers uitsluitend in logs | Laatste quotaobservatie in bestaande Laravel Cache, inclusief ouderdom |
| Eén queuejob per fixture | Maximaal twintig fixtures per unieke job, ook over competities heen |
| Dagelijks opnieuw een volledig seizoen | Eerste import volledig; daarna kalender van T−3 dagen tot T+14 dagen; volledige hercontrole na dertig dagen |
| Grote spelersimport kan steeds op dezelfde minuutlimiet stranden | Referentiefase controleert ieder uur; volledige pagina's blijven gecachet en worden hergebruikt |
| Standen gekoppeld op competitienaam | Externe league-ID als primaire identiteit; naamfallback alleen voor oudere payloads zonder ID |
| Eén schrijfquery per team/standrij | Upserts in blokken van maximaal 500, met bestaande unieke constraints |
| Geen status/dry-run | `football:api-status` en `football:sync [phase] --dry-run` |

Alle providerrequests blijven via `FootballApiService` lopen. Er zijn geen API-Football-calls vanuit normale controllers/pageviews gevonden. Er zijn geen frontend-, predictionberekenings- of ML-wijzigingen uitgevoerd.

## 2. Configuratie

```dotenv
API_FOOTBALL_BASE_URL=https://v3.football.api-sports.io
API_FOOTBALL_KEY=
API_FOOTBALL_COMPETITIONS=39:2026,140:2026,78:2026,135:2026,61:2026,144:2026,2:2026,3:2026,848:2026
API_FOOTBALL_QUOTA_WARNING_PERCENT=25
API_FOOTBALL_QUOTA_CRITICAL_PERCENT=10
API_FOOTBALL_QUOTA_RESERVE=500
API_FOOTBALL_MINUTE_RESERVE=2
API_FOOTBALL_LIVE_SYNC_ENABLED=true
FOOTBALL_SYNC_REQUESTS_PER_MINUTE=60
FOOTBALL_SYNC_BATCH_FIXTURES=true
```

`config/api-football.php` bevat de configuratie; `CompetitionConfig::configured()` levert een lijst getypeerde objecten met integer `leagueId` en `season`. Bijvoorbeeld `39:2026,140:2025` selecteert uitsluitend die twee paren. Er worden geen combinaties bij verzonnen. Dubbele paren worden verwijderd. Ongeldige waarden zoals `39`, `abc:2026` en een lege entry na een komma geven een configuratiefout.

Seizoenen gebruiken het startjaar: `39:2026` is 2026/27. De voorbeeldlijst moet passen bij de gewenste coverage en het abonnement. Er zijn bewust geen afzonderlijke `API_FOOTBALL_LEAGUES`/`API_FOOTBALL_SEASONS`-lijsten geïntroduceerd. Een lege `API_FOOTBALL_COMPETITIONS` behoudt de bestaande fallback `FOOTBALL_LEAGUE_ID` + `FOOTBALL_SEASON_YEAR`. De bestaande frontendstandaard voor het seizoen blijft ongewijzigd.

Alleen `.env.example` is aangepast. De echte `.env` en credentials zijn niet gelezen of gewijzigd. Bestaande base-URL/keynamen blijven behouden.

## 3. Quota en prioriteiten

`ApiQuota` leest `x-ratelimit-requests-limit`, `x-ratelimit-requests-remaining`, `X-RateLimit-Limit` en `X-RateLimit-Remaining`. Ontbrekende of ongeldige headerwaarden blijven onbekend. De observatie blijft maximaal twee dagen beschikbaar voor diagnose; dagbeleid gebruikt alleen de huidige UTC-dag. Lokale dagreserveringen vervallen om UTC-middernacht en minuutreserveringen na zestig seconden.

| Resterend dagbudget | Toegestaan |
| --- | --- |
| Boven warning (standaard 25%) | Alle prioriteiten |
| Hoogstens warning | Critical, High, Normal |
| Hoogstens critical (standaard 10%) | Critical, High |
| Hoogstens reserve (standaard 500) | Alleen Critical |
| Nul | Geen requests |

Live- en post-matchbundels zijn Critical, pre-matchlineups High, kalender/standen/predictions/odds Normal, spelers/coaches/venues Low, overige referentiedata en historische enrichment Background. Een complete fixturebundel gebruikt de prioriteit van zijn fase; dezelfde call levert meerdere datasets. Historische imports krijgen Background, ook als zij intern fixturebundels gebruiken.

Onbekend dagbudget blokkeert de eerste request niet; de lokale minuutlimiet blijft gelden. Stel bij een klein abonnement de absolute reserve lager in. De effectieve minuutlimiet is het minimum van de configuratie en de laatst bekende providerlimiet. Een kleine minuutreserve houdt ruimte vrij voor Critical. Reserveringen zijn met een cachelock beschermd; latere responses kunnen het effectieve resterende budget binnen hetzelfde venster niet verhogen. Dit is bewust conservatief bij parallel werk.

Een 429 krijgt geen onmiddellijke retry; de gedeelde pauze respecteert `Retry-After` als seconden of HTTP-datum, met minimaal zestig seconden en maximaal één dag. Connections/5xx krijgen hoogstens één extra poging; 400/401/403 niet. Elke werkelijke poging telt in de metrics. Bij ontbrekende headers kan alleen de lokale limiet het verbruik begrenzen; externe gebruikers van dezelfde sleutel kunnen uiteraard nog extra quota verbruiken.

Er is geen Redis, monitoringstack of nieuwe infrastructuur toegevoegd. Meerdere workers/servers moeten dezelfde bestaande persistente cache gebruiken. Een filecache op één server kan lokaal werken; losse filecaches op verschillende servers delen geen locks of quota.

## 4. Commands en scheduler

De zes bestaande `football:sync`-fasen blijven het reguliere toegangspunt. De oude `app:add-*`, bootstrap-, H2H-, teamstats- en historische importcommands blijven beschikbaar. Teams, fixtures, standings, players en de standaard teamstatsimport verwerken nu alle expliciete paren. Fixturegebaseerde imports gebruiken de gemeenschappelijke scope.

| Fase/command | Schema | Gedrag |
| --- | --- | --- |
| `football:sync fixtures` | Dagelijks 00:05 | Kalender per paar |
| `football:sync reference-data` | Ieder uur op minuut 10 | Alleen vervallen referentiedata; hervat uitgesteld werk |
| `football:sync live` | Elke minuut | Maximaal 100 kandidaten, bundels tot 20 |
| `football:sync pre-match` | Elke 5 minuten | Selectie met eigen retrywindow |
| `football:sync post-match` | Elke 5 minuten | Ontbrekende finale datasets |
| `football:sync standings` | Elk uur | Effectief actief 1 uur / inactief 1 dag per paar |
| `app:add-predictions` | Dagelijks 02:00 | Alleen toekomstige relevante fixtures |
| `app:add-odds` | Elke 6 uur | Relevante toekomstige fixtures, volledige pagination |
| AI-generatie / predictionvalidatie | Bestaande intervallen | Ongewijzigde functionaliteit |

Scheduler-events houden `withoutOverlapping` en `onOneServer`; syncfasen en fixtures hebben daarnaast eigen locks. De schema-uren volgen de bestaande Laravel schedulertimezone.

Nieuwe bediening:

```bash
php artisan football:api-status
php artisan football:sync --dry-run
php artisan football:sync standings --dry-run
php artisan football:sync live --queue
php artisan app:add-players --due
```

Status en dry-run maken geen API-call. Dry-run werkt zonder API-key en toont paren, endpoints, kandidaat-/primaire callschatting en quota. Het is geen exacte simulatie van cachehits, fallbackcalls en pagination. Status toont daglimiet, resterend/gebruik, minuutheaders, waarnemingstijd, ouderdom en calls per endpoint/caller van vandaag UTC. Voor een lokaal nog onbekende league wordt geen API-naamlookup gedaan.

Queuebatches behouden HTTP-batching. De oude `SyncFootballFixture` blijft beschikbaar voor reeds bestaande jobs. De nieuwe batchjob heeft één queuepoging, timeout 3300 seconden en unique-lock 3360 seconden; de databasequeue heeft `retry_after=3360`. De ruime bovengrens vangt trage fallbackrequests op. De standaard scheduler vereist geen nieuwe worker; `--queue` is optioneel.

## 5. Endpoints en verversing

| Endpoint | Gebruik en beleid |
| --- | --- |
| `/countries`, `/leagues`, `/odds/bookmakers` | Globale referentiedata; 30 dagen cache |
| `/teams` | Per expliciet paar; 7 dagen |
| `/coachs`, `/venues` | Alleen teams/venues van geselecteerde fixtures; 30 dagen responsecache; selectie opnieuw bekeken voor nieuw toegevoegde teams/venues |
| `/players` | League/season, alle pagina's; actieve competitie dagelijks, inactief wekelijks |
| `/players/squads` | Teamgebonden actuele selectie; responsecache 1 dag |
| `/fixtures` | Kalender per paar of IDs-bundels; korte deduplicatie 10 seconden |
| `/fixtures/lineups` | Begrensde pre-matchcontrole; stopt na complete lineups |
| `/fixtures/events`, `/fixtures/statistics`, `/fixtures/players` | Embedded data hergebruikt; losse fallback alleen wanneer een dataset ontbreekt |
| `/standings` | Uur/dagbeleid per paar |
| `/predictions` | 1 dag cache, geen nieuwe import na kickoff |
| `/odds` | 6 uur cache, alle benodigde pagina's |
| `/fixtures/headtohead` | Databasebron; bestaande 90-dagenpolicy |
| `/teams/statistics` | Bestaande refreshpolicy; gedateerde gevulde snapshots blijven zonder expliciete force behouden |
| `/injuries` | Bestaande clientmethode; geen reguliere schedulerimport toegevoegd |

API-predictions zijn nog nodig: `PredictionContextService`, `AiPredictionOutcomeResolver` en de frontend-predictionanalyse gebruiken ze. Daarom zijn ze behouden. H2H en teamstatistics worden niet op pageviews rechtstreeks uit de provider opgehaald.

Upserts voor teams en standen gebruiken de al aanwezige unieke sleutels. Fixture-opslag blijft transactioneel met bestaande scoringlogica; deze is bewust niet vervangen door een generieke bulk-upsert die modeleffecten zou omzeilen.

## 6. Officiële documentatie en afwegingen

Geraadpleegd: [officiële endpointgids](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide), [quota-/optimalisatiegids](https://www.api-football.com/news/post/how-to-optimize-api-sports-calls-and-quota-usage) en [WK-endpointgids](https://www.api-football.com/news/post/fifa-world-cup-2026-guide-to-using-data-with-api-sports). De [interactieve v3-referentie](https://www.api-football.com/documentation-v3) leverde geen tekst en blokkeerde de directe download met een browserchallenge; daarom is niet geclaimd dat de volledige interactieve specificatie automatisch is uitgelezen.

Gedocumenteerde mogelijkheden: maximaal twintig fixture-IDs per bundel, een livefilter over meerdere leagues, datumvensters, pagination en de vier quotaheaders. De provider werkt score/events vaker bij dan standings; onze polling kiest bewust minder vaak waar de UX dat toestaat. Lineups verschijnen doorgaans kort vóór kickoff en soms pas later. De bestaande statusgroepen FT/AET/PEN en livecodes blijven behouden; afgelaste/uitgestelde wedstrijden krijgen geen eindeloze detailpolling.

Een extra `live=...`-feed is niet toegevoegd: de applicatie gebruikt ook statistieken en moet net afgelopen fixtures detecteren. De bestaande IDs-bundels over alle geselecteerde competities leveren daarvoor in dit ontwerp minder gesplitste requests. Deze keuze is een implementatieafweging, geen providerverbod op livefeeds.

## 7. Calls per wedstrijd en geschatte reductie

Onderstaande aantallen gelden zonder HTTP-errors en met volledige embedded datasets. N is het aantal gelijktijdig geselecteerde fixtures en M het aantal live minuten.

| Fase | Primaire requests |
| --- | --- |
| Future | Geen detailrequests; één gedeelde kalendercall per competitie per dagelijkse run |
| Pre-match | Hoogstens 4 lineuprequests per fixture in het bestaande T−45 tot T+15 venster, minimaal 15 minuten tussen pogingen; minder bij embedded succes |
| Live | Per minuut `ceil(N/20)` bundelrequests, verdeeld over alle geselecteerde competities |
| Final | Meestal 1–2 bundelrondes rond de overgang; maximaal 3 pogingen per final-data/enrichmentgroep. Bij afzonderlijk opeenvolgende groepen maximaal 6 primaire rondes per fixture; daarna expliciet herstel nodig |
| Complete | Geen verdere detailrequests; kalenderresponses kunnen nog metadata bevatten die lokaal niet wordt overschreven |

Fallbacks voor ontbrekende embedded datasets verhogen deze aantallen. Lege embedded arrays leiden niet meteen tot een tweede identieke call. Een HTTP-retry kan een primaire poging verdubbelen. Oude voltooide vlaggen worden niet massaal gereset.

Ten opzichte van de oorspronkelijke laag blijven de eerder berekende scenario's circa 75–92% minder live-/kalendercalls geldig. Deze uitbreiding bespaart vooral bij meerdere competities en queuegebruik: twintig individuele queue-fixtures kunnen nu in één primaire batchrequest passen (95% minder voor dat deel). Datumvensters verminderen vooral responsevolume en databasewerk; één kalendercall blijft één call. Quota-uitstel verschuift werk en is op zichzelf geen gegarandeerde besparing. Er is geen productiegebruik gemeten.

## 8. Historie en grenzen voor ML

Voltooide fixturedata en historische API-predictions blijven beschermd zoals in de eerdere optimalisatie. Pogingen en succesvolle datasetmomenten worden bijgehouden. Bestaande H2H/teamstats raw-data blijft behouden, maar een cache is geen archief. Actuele squads, H2H en ongedateerde seizoensstatistieken zijn geen historische as-of snapshots. Gebruik ze later niet als bewijs dat informatie vóór kickoff bekend was.

Deze uitbreiding maakt geen nieuw ML-model of append-only snapshotplatform. Het bestaande finale retrywindow blijft zes uur na kickoff met begrensde pogingen. Data die de provider pas 24–72 uur later publiceert kan expliciet worden aangevuld met de bestaande historische import en `--retry-incomplete`; automatische langdurige enrichment is niet toegevoegd. Coverage ontbreekt soms definitief; leeg betekent daarom niet automatisch compleet.

## 9. Deployment

Er is **geen nieuwe migration** voor deze uitbreiding. De eerdere migration `2026_10_11_130730_add_dataset_sync_state_to_fixtures_table.php` moet al toegepast zijn. Geen migrations zijn in deze werksessie op de echte database uitgevoerd.

1. Stel gewenste paren en quotas in via deploymentconfiguratie; vergelijk `.env.example`. Kopieer geen voorbeeldsleutel.
2. Behoud de bestaande persistente cache en cachelocktabellen. Alle workers moeten dezelfde cache gebruiken.
3. Pas eventuele nog openstaande migrations toe vóór het hervatten van sync.
4. Herbouw configuratie en herstart bestaande queueworkers:

```bash
php artisan migrate --force
php artisan config:cache
php artisan queue:restart
php artisan schedule:list
php artisan football:api-status
php artisan football:sync --dry-run
```

Bij optionele queueverwerking:

```bash
php artisan queue:work football --queue=football --tries=1 --timeout=3300
```

Zet de supervisor shutdown-grace boven 3300 seconden. Behoud één `schedule:run`-cron; plan de oude imports niet daarnaast dubbel in. Status/dry-run zijn quota-vrij. Bootstrap/importcommands doen wel echte calls wanneer ze op productie worden uitgevoerd.

## 10. Verificatie en commitgroepen

Er zijn geen echte providerrequests, productie-ingrepen of Git-commits uitgevoerd.

- Gerichte controle vóór de laatste credential-regressietest: 74 tests, 299 assertions, allemaal geslaagd.
- Definitieve volledige suite: **552 tests, 548 geslaagd, 15.743 assertions**. Alle 38 nieuw toegevoegde tests slagen.
- De vier bestaande fouten blijven: één pagineringstest in `GroupsPageTest`, twee fixtureaantaltests in `MondialiQDemoSeederTest` en een duplicate-emailerror in `MondialiQDemoDataCommandTest`. Deze problemen zijn eerder op de oorspronkelijke code gereproduceerd; de volledige suite is dus niet groen.
- `composer run lint:check`, `npm run types:check`, `npm run lint:check`, `npm run format:check`, `npm run build` en `git diff --check`: geslaagd.
- De schedulerregistratie en overlapflags zijn met Pest gecontroleerd. `schedule:list` is daarnaast met een tijdelijke arraycache gecontroleerd: de sandbox blokkeert de lokale MySQL-cacheverbinding. De echte servercron/cache zijn niet gevalideerd.
- Tests gebruiken HTTP-fakes; coverage van het echte abonnement, productiebelasting en MySQL-concurrentie zijn niet live getest.

### Reviewbare commits

Onderstaande paden zijn relatief aan de repositoryroot. Commit de groepen in deze volgorde; er zijn nog geen commits gemaakt.

**1. `Ondersteun expliciete competitie-seizoenparen`**

```text
.env.example
config/api-football.php
app/Services/Football/CompetitionConfig.php
app/Console/Commands/Concerns/InteractsWithFootballApiConfig.php
app/Console/Commands/AddFixtures.php
app/Console/Commands/AddPlayers.php
app/Console/Commands/AddStandings.php
app/Console/Commands/AddTeams.php
app/Console/Commands/ImportTeamStatistics.php
app/Models/Concerns/HasFixtureSync.php
docs/football-multicompetition-audit.md
```

**2. `Bewaak API-quota met prioriteiten en diagnostiek`**

```text
app/Services/Apis/ApiPriority.php
app/Services/Apis/ApiQuota.php
app/Services/Apis/FootballApiBudget.php
app/Services/Apis/FootballApiContext.php
app/Services/Apis/FootballApiService.php
app/Console/Commands/FootballApiStatus.php
```

**3. `Bundel queuewerk en hervat uitgestelde synchronisaties`**

```text
app/Concerns/FootballApi/FixtureEndpoints.php
app/Services/Football/CompetitionSyncService.php
app/Services/Football/FixtureSyncService.php
app/Jobs/SyncFootballBatch.php
app/Console/Commands/SyncFootball.php
config/queue.php
routes/console.php
```

**4. `Importeer teams en standen met consistente bulk-upserts`**

```text
app/Services/Standing/StandingService.php
app/Services/Team/TeamService.php
```

**5. `Test en documenteer multi-competitie en quotabeleid`**

```text
tests/Feature/FootballQuotaTest.php
tests/Feature/FootballCompetitionConfigTest.php
tests/Feature/FootballSyncTest.php
tests/Feature/FixtureDataSchedulerTest.php
README.md
docs/football-multicompetition-report.md
```
