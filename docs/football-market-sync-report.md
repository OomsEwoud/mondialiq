# Derde optimalisatieronde — odds, predictions en standings

13 oktober 2026. Basiscommit: `5fd0391`. De voorafgaande audit staat in [football-market-sync-audit.md](football-market-sync-audit.md). Werkboom was schoon; er zijn geen commits gemaakt.

## 1. Audit en concrete verspilling

| Dataset | Voorheen | Werkelijke verspilling |
| --- | --- | --- |
| Odds | `app:add-odds`, iedere 6 uur, `/odds?fixture=ID&page=N`, alle pagina's, responsecache 6 uur | Alle NS-fixtures in de komende 14 dagen kwamen iedere run terug, ook wanneer kickoff nog ver weg was. Geen lokale freshnessmarker of gedeelde due/opslaglock. |
| Predictions | `app:add-predictions`, dagelijks 02:00, `/predictions?fixture=ID`, responsecache 24 uur | Dagelijks dezelfde verre fixtures; geen gebruik van recente lokale predictions om een request te vermijden. |
| Standings | `football:sync standings` ieder uur; `/standings?league=ID&season=YEAR`; active/idle-marker 1 uur/1 dag | Een fixture tussen gisteren en morgen maakte de competitie uurlijks actief, ook wanneer sinds de vorige refresh niets gebeurd kon zijn. Legacy `app:add-standings` deelde die due-marker niet. |

De centrale responsecache en scheduler-overlaplocks bestonden al. De bestaande selectie gebruikte exacte competitie-seizoenparen, de centrale client had maximaal twee HTTP-pogingen bij tijdelijke fouten en alle drie datasets hadden Normal-prioriteit. Odds en predictions vingen budgetuitstel echter op als commandfailure. Een lege response beschermde alleen zolang de ruwe responsecache geldig bleef. Leaguecoverage wordt niet lokaal opgeslagen; negatieve fixturewaarnemingen voorkomen extra coverage-requests. De expliciete historische standingsimport in `SeedHistoricalSeasonCommand` blijft ongewijzigd en is geen periodieke schedulerroute.

Bronnen gecontroleerd: [officiële v3-documentatie](https://www.api-football.com/documentation-v3), [actuele officiële endpointgids](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide) en [standings per league/season](https://www.api-football.com/news/post/how-to-get-standings-for-all-current-seasons). De JavaScript-documentatie gaf geen leesbare inhoud via de tekstbrowser; parameters zijn ook gecontroleerd in de officiële endpointgids. Odds ondersteunt fixture, league/season en datumfilters plus paginering. Predictions vereist één fixture; standings kan een volledige competitie/season in één request leveren. Geen ongedocumenteerde odds-datumrange, multifixture-predictionendpoint of extra coverage-call toegevoegd. Odds kan volgens de gids iedere drie uur wijzigen, predictions/standings ieder uur; vaker ophalen is geen doel op zichzelf.

## 2. Nieuwe strategie voor odds en predictions

| Afstand tot kickoff | Odds | Providerprediction |
| --- | ---: | ---: |
| Meer dan 14 dagen | Niet in automatische selectie | Niet in automatische selectie |
| Meer dan 7 tot 14 dagen | 24 uur | 72 uur |
| Meer dan 48 uur tot 7 dagen | 12 uur | 48 uur |
| Tot en met 48 uur | 6 uur | 24 uur |
| Gestart, finished, cancelled, postponed | Geen automatische prematchcall | Geen automatische prematchcall |

De grens op 48 uur is bewust eenvoudig. Odds binnen 24 uur blijft iedere zes uur, gelijk aan de eerdere actualiteit; predictions dichtbij kickoff blijft dagelijks. Er is geen bewezen productreden om vlak voor kickoff vaker te pollen. Schedulerfrequenties en ruwe responsecache-TTL's blijven ongewijzigd. Een overgang naar een dichterbij gelegen band gebruikt het kortere interval ten opzichte van de vorige waarneming.

`PrematchSyncService` bevat uitsluitend de gedeelde odds/predictionselectie, due-check, locks en opslagcoördinatie. Deze kleine servicesplitsing voorkomt dat command en dry-run elk andere selectie-/freshnessregels implementeren. Geen generiek syncframework of nieuwe quota-architectuur. De bestaande `FixtureOddsService` en `PredictionService` blijven de responseparsers/opslag uitvoeren.

- Kandidaten worden lokaal geselecteerd op de bestaande competitieparen en het Brussels-kickoffcontract. Voor provider-datumfilters wordt `kickoffAt()` naar UTC omgerekend. Daardoor vallen wedstrijden rond middernacht niet onder de verkeerde providerdatum.
- State staat in de bestaande Laravel-cache, per dataset, league, season en fixture-ID. State bevat kickoff, afstandsband, vorige waarneming, lege pogingen en foutbackoff. Bewaartermijn 30 dagen; geen migratie.
- Bij ontbrekende marker kan recente lokale `fixture_odds.updated_at` / `apiPrediction.updated_at` een request voorkomen. Als de fixture later is gewijzigd dan deze data is conservatief een eerste refresh toegestaan.
- Een marker wordt alleen na succesvolle verwerking bijgewerkt. Fouten hebben een afzonderlijke retrytijd; zij verversen geen geslaagde-datawaarneming.
- Datasetlocks omvatten due-check, request en opslag, ook tussen legacycommands en `football:sync`. Due/status worden onder de lock opnieuw gecontroleerd. Na de HTTP-response worden kickoff en status opnieuw bekeken om gewijzigde/gestarte fixtures niet alsnog te verversen.
- Een gewijzigde kickoff invalideert de due-state. Een nog geldige centrale responsecache kan wel hergebruikt worden; dan wordt de oude waarnemingsleeftijd behouden, zodat een cachehit de freshness niet kunstmatig verlengt.
- Een geldige lege response behoudt bestaande lokale data. Maximaal drie lege verwerkingen per kickoff/afstandsband; interval minstens twaalf uur en nooit korter dan de normale datasetfreshness. Een nieuwe band of kickoff geeft opnieuw kansen. Geen permanente league-coverageaanname op basis van één lege fixture.
- Tijdelijke technische fouten gebruiken de bestaande centrale HTTP-retry en daarna lokaal 1/2/4 uur backoff. Na drie mislukte verwerkingen stopt die kickoff/band. De bestaande scheduler kan het feitelijke interval langer maken. Logregels bevatten dataset, fixture-ID en exceptionklasse, geen responsebody of credentials.

Handmatige compatibiliteit: `app:add-odds --include-recent` kan expliciet de laatste zeven dagen, inclusief afgeronde wedstrijden, controleren; de scheduler gebruikt dit niet. `--days` blijft beschikbaar voor een expliciet ruimer venster, onder dezelfde freshnessregels. Automatisch blijft de horizon 14 dagen.

## 3. Odds per speeldag versus per fixture

Nieuwe methode `getCompetitionOdds(league, season, UTC-date)` gebruikt hetzelfde bestaande `/odds`-endpoint en dezelfde centrale `callAllPages`. Geen nieuwe providerroute, marktfilter of bookmakerfilter.

Een league/season/UTC-dategroep wordt samen opgehaald wanneer minstens twee fixtures due zijn en de volledige lokale groep due is. Zodra één lokale fixture nog vers is of een uitgesloten status heeft, gebruiken alleen de due fixtures hun individuele query. Onder de locks wordt ook gecontroleerd dat alle fixtures nog bij dezelfde datumgroep horen.

Responsemapping gebeurt op `fixture.id`, onafhankelijk van volgorde. Onverwachte IDs worden niet in andere lokale fixtures opgeslagen. Alle pagina's moeten binnen zijn voordat de groep wordt verwerkt. Ontbrekende fixtures in de afgeronde response krijgen een negatieve waarneming. Eén opslagfout markeert geen andere geslaagde fixture als mislukt. Quota-uitstel tijdens paginering schrijft geen completion/retry-state; de volgende run hergebruikt beschikbare gecachete pagina's.

De gerichte regressie bewijst tien lokale due fixtures → één matchdayrequest bij één responsepagina, in plaats van tien individuele requests. Dit is geen universele productiemeting: het werkelijke pagina-aantal en volledigheid van de lokale kalender bepalen de winst. Bij onverwacht veel providerrecords op één datum kan de besparing kleiner zijn. Iedere echte pagina blijft zichtbaar in de bestaande endpoint-/callermetrics.

## 4. Conditionele standings

Standings blijven in `CompetitionSyncService`; uitsluitend de standingsmethodes zijn gewijzigd. De kalenderlogica in dezelfde klasse is ongewijzigd.

Het plan leest lokale fixtures tussen zeven dagen geleden en zeven dagen vooruit en maakt een fingerprint van afgeronde fixture-ID's, statussen en scores. Geen request nodig voor deze beslissing. De bestaande league/season-parameters blijven behouden.

| Situatie | Minimuminterval |
| --- | ---: |
| Nieuw/gewijzigd definitief resultaat ten opzichte van marker | 1 uur |
| Live/finished met kickoff in afgelopen 4 uur | 1 uur |
| Nog te starten binnen 24 uur | 6 uur |
| Overige actieve competitie met relevante fixture binnen ±7 dagen | 24 uur |
| Inactief / geen relevante lokale fixtures | 168 uur |

De scheduler blijft ieder uur draaien. Een nieuw resultaat wordt daardoor normaal bij de eerstvolgende toegelaten uurcontrole verwerkt; de lokale minimumleeftijd kan de grens nog opschuiven. De provider kan zelf later actualiseren, daarom blijven er rond de wedstrijd vervolgchecks. Een eerste resultaat krijgt ook na lege preseasoncoverage opnieuw een kans.

Lege standingsresponses wachten normaal 24 uur bij actieve competities, zeven dagen bij inactieve. Een veranderd eindresultaat kan dat doorbreken. Technische fouten krijgen eerst één uur backoff en vanaf de derde fout 24 uur, zonder geslaagde marker te vernieuwen. Bij succesvolle verwerking reset dit. Safety-refresh blijft bestaan voor correcties zonder herkenbaar lokaal wedstrijdsignaal.

Legacy `app:add-standings` en `football:sync standings` gebruiken dezelfde due-state en lock. Er is geen tweede synchronisatiepad meer dat onbedoeld opnieuw dezelfde standings opvraagt.

## 5. Quota en dry-run

Prioriteit blijft voor alle drie datasets **Normal**. De centrale budgetklasse, reserveberekening, prioriteitsenum en client zijn ongewijzigd.

| Zone | Gedrag |
| --- | --- |
| UNKNOWN / NORMAL | Toegestaan binnen de bestaande minuutlimiet en eventuele pause |
| WARNING | Normal blijft toegestaan |
| CRITICAL / RESERVE / EXHAUSTED | Geen nieuwe HTTP; geen datasetretry of freshnessmarker; command eindigt succesvol met uitstel |

De centrale controle blijft vóór iedere daadwerkelijke pagina/poging actief, zodat een run die halverwege de grens bereikt stopt. Geen extra Critical-toewijzing of reserve-omzeiling.

Beschikbaar:

```bash
php artisan football:sync odds --dry-run
php artisan football:sync predictions --dry-run
php artisan football:sync standings --dry-run
```

Dry-run gebruikt dezelfde due-logica en toont geselecteerde paren, lokale kandidaten, due, freshness/backoff-overgeslagen, status-overgeslagen, eerste requests, Normal/quota en uitgestelde taken. Voor standings geldt statusselectie voor lokale activiteit, niet als exclusion van het competitiebrede endpoint; dat is expliciet vermeld. Odds-paginering is onbekend vooraf en wordt niet als exact aantal gepresenteerd. Eerste requests besparen is niet hetzelfde als totale paginacalls besparen. Standings toont tevens de oude dagfrequentie en nieuwe intervalkeuze.

Dry-run doet geen HTTP, budgetreservering, dispatch of expliciete marker-/databasewijziging. De regressies controleren muterende queries, HTTP, queue en onveranderde due-selectie.

## 6. Requestschatting en besparing

Dit zijn ramingen bij gezonde quota, bestaande data en gespreide refreshmomenten; geen gemeten productiegebruik. Rustige/gewone/drukke dagen verschillen zowel in actuele wedstrijden als in de verdeling van de volgende veertien dagen. Per competitie:

| Scenario | Fixtures 7–14 dagen | Fixtures 2–7 dagen | Fixtures ≤48 uur | Totaal |
| --- | ---: | ---: | ---: | ---: |
| Rustig | 14 | 6 | 0 | 20 |
| Normaal | 12 | 12 | 6 | 30 |
| Druk | 10 | 18 | 12 | 40 |

De drukke bovengrens past bij meerdere speelrondes/toernooi- of midweekblokken; niet iedere nationale competitie heeft veertig fixtures in twee weken. Odds wordt conservatief op 1–2 betaalde pagina's per fixture gerekend, zowel oud als nieuw. **Extra voordeel door matchdaygroepering is niet in de volgende tabellen verrekend.** Geen korting door quota blokkades, ontbrekende coverage of cachehits gerekend.

### Odds — calls per dag

Oud: `4 × totaal × pagina's`. Nieuw: `(far + 2 × week + 4 × near) × pagina's`. De twee pagina-uiteinden moeten onder dezelfde aanname worden vergeleken; je mag niet de laagste oude met de hoogste nieuwe waarde vergelijken.

| Dag | Competities | Oud | Nieuw, zonder groepswinst | Minder | Besparing |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rustig | 5 | 400–800 | 130–260 | 270–540 | 67,5% |
| Rustig | 10 | 800–1.600 | 260–520 | 540–1.080 | 67,5% |
| Rustig | 15 | 1.200–2.400 | 390–780 | 810–1.620 | 67,5% |
| Normaal | 5 | 600–1.200 | 300–600 | 300–600 | 50% |
| Normaal | 10 | 1.200–2.400 | 600–1.200 | 600–1.200 | 50% |
| Normaal | 15 | 1.800–3.600 | 900–1.800 | 900–1.800 | 50% |
| Druk | 5 | 800–1.600 | 470–940 | 330–660 | 41,25% |
| Druk | 10 | 1.600–3.200 | 940–1.880 | 660–1.320 | 41,25% |
| Druk | 15 | 2.400–4.800 | 1.410–2.820 | 990–1.980 | 41,25% |

De vorige circa 4.800 oddsrequests bij vijftien drukke competities daalt dus in dezelfde conservatieve verdeling naar circa 2.820, vóór groepswinst. Een complete groep van tien fixtures die op één pagina past kan daarbovenop tien eerste fixturecalls vervangen door één. Hoeveel groepen zo passen moet uit echte paginering/metrics blijken; er wordt geen fictieve vaste reductiefactor toegepast.

### Predictions — gemiddeld per dag over meerdere runs

Oud: één per fixture/dag. Nieuw: `far / 3 + week / 2 + near`. Afgerond naar boven op hele calls; 72/48-uursintervallen veroorzaken schommelingen per kalenderdag.

| Dagprofiel | Competities | Oud | Nieuw gemiddeld | Minder gemiddeld | Besparing |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rustig | 5 | 100 | 39 | 61 | 61% |
| Rustig | 10 | 200 | 77 | 123 | 61,5% |
| Rustig | 15 | 300 | 115 | 185 | 61,7% |
| Normaal | 5 | 150 | 80 | 70 | 46,7% |
| Normaal | 10 | 300 | 160 | 140 | 46,7% |
| Normaal | 15 | 450 | 240 | 210 | 46,7% |
| Druk | 5 | 200 | 122 | 78 | 39% |
| Druk | 10 | 400 | 244 | 156 | 39% |
| Druk | 15 | 600 | 365 | 235 | 39,2% |

### Standings — calls per dag

Rustig betekent hier geen fixture binnen ±24 uur, wel een actieve competitie binnen ±7 dagen: oud én nieuw één per dag. Normaal zijn enkele kickoffblokken met ongeveer 6–10 checks, druk veel gespreide wedstrijden met ongeveer 10–16 checks. Niet geforceerd een besparing op rustige dagen claimen waar de oude implementatie al dagelijks was.

| Dag | Competities | Oud | Nieuw | Minder | Besparing |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rustig | 5 | 5 | 5 | 0 | 0% |
| Rustig | 10 | 10 | 10 | 0 | 0% |
| Rustig | 15 | 15 | 15 | 0 | 0% |
| Normaal | 5 | 120 | 30–50 | 70–90 | 58,3–75% |
| Normaal | 10 | 240 | 60–100 | 140–180 | 58,3–75% |
| Normaal | 15 | 360 | 90–150 | 210–270 | 58,3–75% |
| Druk | 5 | 120 | 50–80 | 40–70 | 33,3–58,3% |
| Druk | 10 | 240 | 100–160 | 80–140 | 33,3–58,3% |
| Druk | 15 | 360 | 150–240 | 120–210 | 33,3–58,3% |

Voor werkelijk inactieve competities is de safety-refresh gemiddeld één per zeven dagen in plaats van dagelijks: circa 85,7% minder.

### Echte bovengrenzen

- Als alle veertig toekomstige fixtures per competitie binnen 48 uur liggen, blijft odds viermaal per dag verversen: bij vijftien competities en twee pagina's kan dat nog altijd 4.800 requests zijn vóór groepswinst. **Geen universele garantie dat duizenden calls verdwijnen.** De verbetering zit in leeftijdsverdeling en bundelbare data, niet in lagere actualiteit van nabije wedstrijden.
- Bij eerste import of gelijklopende predictionmarkers kunnen alle fixtures op dezelfde dag due zijn: tot 600 predictioncalls in het drukke voorbeeld. De tabel geeft een gemiddelde, geen harde dagcap.
- Bij onafgebroken verspreide wedstrijden kan standings nog steeds 24 keer per competitie per dag due zijn.
- Providerpaginering boven twee pagina's, technische HTTP-retries, nieuwe fixtures, gewijzigde kickoffs en cacheverlies kunnen de raming verhogen. De centrale quotabeveiliging blijft de werkelijke grens bewaken.

## 7. Tests en verificatie

43 nieuwe HTTP-fake-regressies in `FootballMarketSyncTest` dekken:

- Alle odds/predictionfreshnessgrenzen, overgang naar dichterbij en hergebruik van recente lokale data.
- Start/finish/cancel/postpone, nieuwe kickoff, meerdere paren/seizoenen en UTC-datumgroepering.
- Lege antwoorden met maximaal drie bandpogingen, technische backoff en behoud van bestaande data.
- UNKNOWN/WARNING toelating en CRITICAL/RESERVE/EXHAUSTED zonder marker- of retryverlies.
- Gemeenschappelijke datasetlocks, volledig due matchday, individuele fallback bij deels verse groep, responsemapping, alle pagina's en hervatting van een gecachete pagina na budgetuitstel.
- Standings bij inactiviteit, safety-TTL, wedstrijdactiviteit, nieuw resultaat, lege coverage en onafhankelijke markers.
- Dry-run zonder HTTP, jobs, muterende SQL of changed due-state.

De bestaande regression voor het bewaren van oude predictions kreeg een expliciet twee dagen oude predictiontimestamp: een verse prediction hoort nu geen providerrequest te veroorzaken. De oorspronkelijke assertie over behoud bij een lege providerresponse blijft getest. Geen tests overgeslagen of unrelated baselinewijzigingen.

Definitieve verificatie:

- `php artisan test --compact`: **608 tests geslaagd, 16.186 assertions** (volledige suite).
- `composer run lint:check`: geslaagd.
- `npm run types:check`, `npm run lint:check`, `npm run format:check`: geslaagd.
- `npm run build`: geslaagd; alleen informatieve plugin-timingmelding.
- `git diff --check`: geslaagd; Git meldt uitsluitend normale CRLF/LF-conversie.

Geen echte API-Football-calls of productiedatabasewijzigingen uitgevoerd. API-functionaliteit berust op officiële documentatie en gefakete contracttests; actuele abonnementcoverage en echte pagina-aantallen zijn niet live gemeten.

## 8. Resterende beperkingen

- De lokale agenda bepaalt de efficiency van groepsqueries; ontbrekende lokale fixtures kunnen extra providerpagina's betekenen. Payloads voor onbekende IDs worden niet aan verkeerde fixtures gekoppeld.
- Een driepogingenlimiet kan ontbrekende data tot de volgende band/kickoff laten wachten. Dit is de bewuste afweging tegen eindeloos pollen; reeds opgeslagen data blijft staan.
- Standingsupdate na een resultaat hangt ook af van providervertraging en quota. Lang uitlopende matches buiten het vieruursactiviteitsvenster vallen op de safety-/resultaatdetectie terug.
- Cacheverlies wist negatieve state en markers. Geen cacheflush als deployroutine. Recente lokale odds/predictions beperken de cold start waar hun timestamp betrouwbaar bruikbaar is.
- Handmatige oddsvensters kunnen de automatische requestraming overschrijden. Legacy standingsimport respecteert nu freshness en is geen impliciete force-refresh meer.
- Commands tonen nu een compacte due-/uitstelsamenvatting in plaats van de oude per-fixturevoortgangsbalk. Technische foutdetails staan veilig in de bestaande logs; de exitcode blijft failure bij echte fouten.

## 9. Deployment

Geen migrations, nieuwe dependencies of schedulerwijzigingen. Deploy uitsluitend de wijzigingen van deze ronde na de vorige baseline. Cachemarkers voor standings zijn versiegebonden; per pair is bij de eerste run één nieuwe verificatie nodig.

```bash
php artisan config:cache
# Alleen wanneer bestaande queueworkers gebruikt worden:
php artisan queue:restart
php artisan football:api-status
php artisan football:sync odds --dry-run
php artisan football:sync predictions --dry-run
php artisan football:sync standings --dry-run
```

Behoud de bestaande schedulercron, gedeelde cache en workers. `config:cache` is het bestaande deploymentproces; er zijn geen gewijzigde configuratiewaarden nodig. Geen `cache:clear`/`optimize:clear` uitvoeren om de nieuwe refreshstate te behouden. Controleer na reguliere runs `football_api.request` per `/odds`, `/predictions`, `/standings` en caller. Vergelijk over minstens zeven dagen; één lege of drukke dag is geen representatieve meting. Dry-run/status kosten geen providerquota.

## 10. Bestanden en commitgroepen

### A — `Ververs odds en predictions alleen wanneer nodig`

- `app/Services/Football/PrematchSyncService.php`: gedeelde lokale selectie/freshness, negative caching, budgetdeferral, locks, gerichte groepsqueries en opslagcoördinatie.
- `app/Concerns/FootballApi/OddsEndpoint.php`: league/season/datevariant van hetzelfde gepagineerde oddsendpoint.
- `app/Console/Commands/AddOdds.php`: dun command, bestaande opties en opslagssamenvatting, gedeelde syncservice.
- `app/Console/Commands/AddPredictions.php`: dun command met dezelfde due-/deferrallogica.
- `tests/Feature/FootballSyncTest.php`: bestaande lege-predictiontest gebruikt aantoonbaar stale lokale data.

### B — `Ververs standings op lokale wedstrijdactiviteit`

- `app/Services/Football/CompetitionSyncService.php`: alleen standings-dueplan, resultaatfingerprint, safety-TTL, eigen bestaande-cachelock en deferral/backoff; calendaronderdeel ongewijzigd.
- `app/Console/Commands/AddStandings.php`: gebruikt hetzelfde standingspad en dezelfde markers.

### C — `Toon freshness en requestbesparing in syncdryrun`

- `app/Console/Commands/SyncFootball.php`: odds/predictions als expliciete fasen, read-only marktpreview, standingsfailure-exitcode doorgeven. Bestaande live-/calendar-/enrichmentfasen behouden hun uitvoering.
- `tests/Feature/FootballMarketSyncTest.php`: 43 nieuwe regressies voor A/B/C. Stage bij voorkeur de bijbehorende tests per commit, of houd deze als afzonderlijke testcommit direct na A/B/C.

### D — `Documenteer requestbesparing van marktdata`

- `README.md`: freshnessbeleid, manualopties en dry-run/deploymentverwijzing.
- `docs/football-market-sync-audit.md`: audit vóór implementatie.
- `docs/football-market-sync-report.md`: keuzes, ramingen, grenzen, tests en deployment.

Er is geen code gewijzigd aan live score/events/statistics, enrichment, lineups, spelers/squads, calendar/rescheduling, coaches/teams/venues/leagues/countries/bookmakers, AI, scoring, authenticatie of frontend. De gedeelde bestanden hierboven zijn uitsluitend aangepast om de drie gevraagde datasets en hun dry-run aan te sluiten. De centrale client, budgetregels en scheduler zijn ongewijzigd.
