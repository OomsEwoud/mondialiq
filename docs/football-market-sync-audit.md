# Audit derde ronde — 13 oktober 2026

Basiscommit `5fd0391`, schone werkboom. Alleen odds, providerpredictions en standings worden gewijzigd.

| Dataset | Command/scheduler | Endpoint en parameters | Bestaande state |
| --- | --- | --- | --- |
| Odds | app:add-odds, iedere 6 uur | /odds?fixture=ID&page=N, alle pagina's | responsecache 6 uur, geen freshnessmarker; lokale fixture_odds.updated_at/api_updated_at; handmatige include-recent/days opties |
| Predictions | app:add-predictions, dagelijks 02:00 | /predictions?fixture=ID | responsecache 24 uur; geen freshnessmarker; bestaande apiPrediction.updated_at |
| Standings | football:sync standings, ieder uur; app:add-standings handmatig | /standings?league=ID&season=YEAR | active/idle-cachemarker 1 uur/1 dag; responsecache standaard 10 seconden |

Alle drie gebruiken Normal, de centrale budgetcontrole en maximaal twee HTTP-pogingen bij tijdelijke transport/serverfouten. Alle competitie-seizoenparen worden exact geselecteerd. Scheduler overlaplocks en centrale responsecachelocks bestaan, maar odds/predictions hebben geen lock rond due-check én opslag. De gewone odds- en predictionselectie omvat NS-fixtures tot 14 dagen vooruit. Odds gebruikt UTC-grenzen waar de opgeslagen fixtureklok Brussels is; deze datasetselectie moet consequent de bestaande kickoffAt-contract gebruiken. De expliciete historische oddsoptie blijft behouden.

Concrete verspilling: odds iedere zes uur ook bij wedstrijden over tien dagen; predictions dagelijks ook bij verre fixtures; standings uurlijks terwijl de wedstrijd pas morgen is of gisteren reeds verwerkt werd. Lege responses worden opnieuw gekocht zodra de responsecache verloopt. Commands rekenen quota-uitstel ten onrechte tot failures.

Officiële controle: [v3-documentatie](https://www.api-football.com/documentation-v3), [actuele endpointgids](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide), [standingsgids](https://www.api-football.com/news/post/how-to-get-standings-for-all-current-seasons). Odds ondersteunt league/season/date/fixture en paginering; prediction vereist fixture; standings ondersteunt league/season. Geen gedocumenteerde odds-from/to-range of prediction-multifixturebundel verondersteld. De gids beschrijft oddsverversing iedere drie uur, voorspellingen/standings ieder uur. Onze lagere frequentie sluit aan op de bestaande productactualiteit.

Plan: één kleine gedeelde prematchservice voor dezelfde uitvoer- en dry-runselectie, freshnessmarkers, begrensde lege/foutresponses en datasetlocks; bestaande parsers hergebruiken. Odds 24/12/6 uur, predictions 72/48/24 uur volgens afstand tot kickoff. Responsecache-TTL's behouden; geen centrale clientrefactor. Lege responses maximaal drie per afstandsband, nieuwe kickoff/band geeft nieuwe kans. Alleen bij volledig due lokale league/season/UTC-dategroepen meerdere oddsfixtures samen ophalen. Overige fixtures individueel; geen markets/bookmakers weglaten. Standings blijft in CompetitionSyncService: lokaal resultaatfingerprint, minstens één uur, rondom gespeelde wedstrijden uurlijks, verder dag-/weekveiligheidsrefresh. Schedulerfrequenties blijven ongewijzigd. Dry-run voor deze drie fasen gebruikt dezelfde due-logica zonder mutaties.

Aanvullende callsitecontrole: SeedHistoricalSeasonCommand heeft een expliciete historische standingsbootstrap via dezelfde centrale client. Die handmatige historische route blijft intact. League heeft geen opgeslagen coveragevelden; er wordt geen extra referentiesync of schemawijziging toegevoegd.
