# Aanvullende analyse vóór implementatie — 11 oktober 2026

De werkboom is schoon; de eerdere optimalisatie is inmiddels onderdeel van HEAD. De volledige command/endpointinventaris staat in `football-sync-audit.md`. Deze vervolgopdracht bouwt daarop voort.

## Geconstateerde resterende problemen

- `InteractsWithFootballApiConfig`, `CompetitionSyncService`, `HasFixtureSync` en de player-refreshmarker gebruiken één globale league/season. Teams, fixtures, spelers en standen moeten per expliciet paar worden verwerkt; fixtureselecties moeten een OR van volledige paren gebruiken, geen cartesisch product.
- Alle providerrequests lopen al via `FootballApiService`. Geen API-Football HTTP-calls gevonden in controllers/pages. Predictions worden nog gebruikt door resources en predictionfunctionaliteit; niet verwijderen. H2H/teamstats worden via importservices in de database bewaard.
- Batching (maximaal twintig IDs), pagination voor players/odds, korte requestdeduplicatie, datasetcompleteness, locks en begrensde retries zijn aanwezig. Die blijven behouden.
- `FootballApiBudget` bewaakt uitsluitend een lokale minuutlimiet en een pauzesleutel. Headers worden gelogd, maar limieten, resterend budget en ouderdom zijn niet centraal uitleesbaar. Er zijn geen prioriteitsgrenzen, durationmetrics of statuscommand.
- `football:sync --queue` maakt één job per fixture en verliest daardoor batching. Een beperkte batchjob past beter bij meerdere competities.
- De dagelijkse fixturesfase haalt opnieuw het hele seizoen op. Behoud expliciete volledige imports voor bootstrap; gebruik voor reguliere kalenderverversing een datumvenster na de eerste geslaagde import.
- `StandingService` zoekt leagues op naam. Bij meerdere landen/leagues is external_id de juiste identiteit.
- Het bestaande lineuppollingvenster is begrensd, maar latere beschikbaarheid van finale enrichment verdient een ruimere, gespreide herstelperiode.

## Gecontroleerde officiële bronnen en keuze

- [Officiële v3-referentie](https://www.api-football.com/documentation-v3) is client-rendered; tekstextractie levert geen inhoud. De actuele officiële endpointgidsen hieronder zijn aanvullend geraadpleegd.
- [API-Football endpointgids, maart 2026](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide): parameters, statuscodes, updatefrequenties, lineups, pagination en errors.
- [API-Sports optimalisatie, 2026](https://www.api-football.com/news/post/how-to-optimize-api-sports-calls-and-quota-usage): vier quotaheaders, batching, datumfilters en cachebeleid.
- [WK 2026 endpointgids](https://www.api-football.com/news/post/fifa-world-cup-2026-guide-to-using-data-with-api-sports): livefilter en embedded fixturedata.

Een livefilter over meerdere leagues is gedocumenteerd, maar vervangt geen statistiekenbundels en mist wedstrijden die net uit live verdwijnen. De bestaande cross-league IDs-batches behouden daarom score/status/events/statistics en finaledetectie in dezelfde call. Een extra live-call zou hier meestal dubbel werk toevoegen.

## Implementatieplan

1. Expliciete gevalideerde competitionconfig, met compatibele fallback naar bestaande single-leagueconfig; geen `.env`-wijziging.
2. Bestaande budgetservice uitbreiden met quotaobject, prioriteiten, atomische reserveringen, cachemetrics en diagnose.
3. Commands/scopes geschikt maken voor alle paren, queuewerk in batches en gerichte kalenderverversing.
4. Fakes-only regressietests, eindrapport, `.env.example` en deploymentdocumentatie. Geen ML, nieuwe infrastructuur of frontendherbouw.
