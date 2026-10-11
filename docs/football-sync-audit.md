# API-Football synchronisatie: analyse vóór implementatie

Geanalyseerd op 11 oktober 2026, met schone Git-worktree. Geen productie-API aangeroepen. Servercron en daadwerkelijk API-abonnement zijn niet toegankelijk vanuit deze checkout; volumes hieronder zijn formules, geen gemeten verbruik.

## Bestaande inventaris

`L/S` = `services.api_football.league_id/season`; `F` = aantal lokale fixtures; `T` = teams; `V` = venues; `P` = pagina's spelersdata.

| Command | Endpoint(s) / data | Selectie | Bestaande planning / overlap |
|---|---|---|---|
| app:add-countries | /countries | alle landen | maandelijks; ook bootstrap |
| app:add-leagues | /leagues, inclusief seasons | alle leagues | maandelijks; ook bootstrap |
| app:add-teams | /teams, team/venue metadata | L/S | maandelijks; historische import ook |
| app:add-players | /players (alle pagina's), /players/squads | L/S, teams uit fixtures | dagelijks P+T calls; bootstrap herhaalt |
| app:add-coaches | /coachs | alle lokale teams met external_id | maandelijks T calls, ook historische teams |
| app:add-venues | /venues | alle lokale venues met external_id | maandelijks V calls |
| app:add-bookmakers | /odds/bookmakers | alle bookmakers | maandelijks |
| app:add-fixtures | /fixtures?league&season | volledig L/S | elke minuut met relevante fixture; anders dagelijks |
| app:add-fixture-data | /fixtures?id, /fixtures/statistics, /fixtures/events | live, NS rond kickoff, recent FT/AET/PEN | elke minuut; seizoenimport bevat dezelfde basisdata |
| app:add-fixture-lineups | /fixtures/lineups | -45 tot +15 min kickoff; ontbrekende lineups | elke 10 min; retryhelper wordt niet gebruikt |
| app:add-fixture-player-stats | /fixtures/players | finale fixtures tot 6 uur oud | elke minuut bij kandidaat, anders dagelijks |
| app:add-standings | /standings | L/S | uur tijdens hardcoded WK-periode, anders dagelijks |
| app:add-predictions | /predictions | ALLE lokale fixtures met external_id | dagelijks F calls, inclusief historie |
| app:add-odds | /odds | komende 14 dagen, optioneel 7 dagen terug | elke 6 uur; bootstrap 90 dagen |
| app:import-head-to-head | /fixtures/headtohead | unieke teamparen; komende fixtures, --fixture_id of --force | handmatig/bootstrap; 90-daagse freshness wordt in bootstrap geforceerd omzeild |
| app:import-team-statistics | /teams/statistics | L/S teams, optioneel team/league/season/date | handmatig/bootstrap; 24 uur/7 dagen freshness wordt geforceerd omzeild |
| app:seed-historical-season | /teams, /fixtures, per fixture events/statistics/lineups, /standings | expliciete league/season | handmatig; 3F detailcalls bij iedere herhaling; geen playerstats |
| app:sync-competition-data | bovenstaande via subcommands | gemengde selectie | handmatige bootstrap; force H2H/teamstats, odds 90 dagen |

AI generation/preview/context commands en `predictions:validate` gebruiken lokale football-data; geen indirecte API-Football-calls gevonden. `getInjuries()` bestaat zonder caller. Geen football-queuejobs of repositories gevonden. Indirecte externe calls zitten in PlayerService, CoachService, VenueService, HeadToHeadService en TeamStatisticsService. LiveFixturesController leest lokale/cachedata. README noemt bovendien het niet-bestaande `app:sync-all-data`.

## Problemen en potentiële kosten

1. Volledig seizoen elke live minuut naast drie calls per live fixture: `M × (1 + 3N)` voor M minuten met N gelijktijdige wedstrijden. Finale fixturebasis wordt daarbij opnieuw overschreven.
2. `/fixtures?id` kan al detaildatasets bevatten; deze worden genegeerd. `/fixtures?ids` ondersteunt maximaal 20 IDs met details: theoretisch `M × ceil(N/20)` plus kalenderrefresh en eventuele ontbrekende-datasetfallbacks.
3. Final/playerstats tellers verhogen uitsluitend na succes. Bij storing maximaal een poging per minuut gedurende selectievenster, met meerdere HTTP-retries per poging. Lege/mislukte inhoud wordt ten onrechte als voltooid gemarkeerd.
4. Lineup-query negeert `lineups_synced_at` en poginglimiet: circa 6–7 calls per wedstrijd, en iedere handmatige herhaling extra. `has_lineups` kan al waar zijn bij één team/formation.
5. Voorspellingen: F calls/dag, dus 365H calls/jaar voor H historische wedstrijden. Bestaande pre-matchdata wordt achteraf overschreven; ongeschikt als point-in-time ML-feature.
6. Reference: dagelijks P+T calls zonder cache; maandelijks alle coaches/venues inclusief irrelevante seizoenen. Paginated odds haalt slechts eerste pagina op: optimalisatie mag dit datagat niet bewaren.
7. HTTP 429: geneste retries veroorzaken maximaal 6 requests, plus onnodige laatste sleep. HTTP 200 met `errors` of ongeldige JSON wordt als lege succesvolle response behandeld. Geen quota/callregistratie.
8. `withoutOverlapping` geldt per scheduled event, niet voor verschillende commands of handmatige runs. Geen gedeelde fixturelock; historische import kan dezelfde detailrecords wijzigen.
9. `SUSP`/`INT` via status_long blijven potentieel oneindig live. Bestaande kickoffdetectie kan door 60-minuten basisfreshness vertraagd zijn.
10. AddPredictions vangt `$failed` per waarde; verscheidene andere commands rapporteren succes na gedeeltelijke fouten.

## Ontwerpbesluit

- Eén herkenbare ingang `football:sync <phase>` met reference-data, fixtures, live, pre-match, post-match en standings. Bestaande commands blijven compatibel beschikbaar; fixturecommands delegeren naar gedeelde synchronisatieservices.
- Fixture-ID batching (max 20), gedeelde fixturelocks, responsehergebruik; fallback alleen voor ontbrekende detailkeys. Instelbare batchmodus voor abonnementen zonder ids-ondersteuning.
- Bestaande eindstatuscodes, bestaande opslagservices en predictionberekeningen behouden. Succes, lege data en uitgeputte retries onderscheiden. Persistente pogingstimestamps en per-dataset succesmetadata waar nodig.
- Begrensde retries: lineup binnen -45/+15, maximaal vier pogingen met minimaal 15 minuten ertussen; finale datasets maximaal drie met backoff. Historische correctie expliciet, nooit stilzwijgend vanuit scheduler.
- Kalender dagelijks; live per minuut; pre-match iedere vijf minuten; post-match iedere vijf minuten; standings uurlijks met activiteit/freshnesscontrole. Reference per dataset verversbeleid en cache; dagelijkse orchestration hoeft niet dagelijks externe calls te betekenen.
- Eén logevent per daadwerkelijke HTTP-poging: endpoint, caller, UTC-tijd, status, poging, quota. Geen headers met secrets of responsebody. Stop bij quota-uitputting; maximaal twee netwerkpogingen voor tijdelijke fouten.
- Zware fixturebatches optioneel queuebaar; scheduler houdt `schedule:run`. Centrale cache vereist voor locks over processen/servers.
- Geen ML-model. Bestaande raw/derived tabellen documenteren; historische predictions beschermen; toekomstige features vereisen expliciete as-of snapshots.

Bronnen gecontroleerd vóór implementatie:
- https://www.api-football.com/news/post/how-to-optimize-api-sports-calls-and-quota-usage
- https://www.api-football.com/news/post/how-to-get-all-fixtures-data-from-one-league
- https://laravel.com/framework/docs/13.x/scheduling

Dit is de uitgangsanalyse; het eindrapport beschrijft de daadwerkelijk gerealiseerde wijzigingen en verificatie.
