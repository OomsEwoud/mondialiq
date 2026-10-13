# Tweede optimalisatieronde API-Football — 12 oktober 2026

## Uitkomst en afbakening

De bestaande centrale client, competitieparen, quota-architectuur, scheduler, locks en datasetstatussen zijn behouden. De voorafgaande audit staat in [football-sync-refinement-audit.md](football-sync-refinement-audit.md). Basis: `3383e64`; de werkboom was schoon vóór deze ronde.

De concrete gaten waren dagelijkse volledige spelerspaginering, te brede Critical-prioriteit, een te kort enrichmentvenster na quota-uitstel en verdwenen/verplaatste fixtures buiten de kalenderresponse. Geen nieuwe endpoints, packages, migrations, frontendwijzigingen of wijzigingen aan scoring, AI-generatie en authenticatie.

## Spelers

| Dataset | Voorheen | Nu |
| --- | --- | --- |
| Volledige `/players`, actieve competitie | 1 dag | 7 dagen |
| Volledige `/players`, inactieve competitie | 7 dagen | 28 dagen |
| Squads actief | Gekoppeld aan volledige import | Zelfstandig dagelijks |
| Squads inactief | Gekoppeld aan volledige import | Zelfstandig iedere 7 dagen |

Actief betekent een lokale wedstrijd tussen gisteren en over 14 dagen. De eerste import haalt nog steeds alle pagina's op. Succesmarkers worden pas na opslag geschreven; de spelersmarker staat vóór de afzonderlijke squadsync, zodat een onderbroken squadsync geen nieuwe volledige spelersimport veroorzaakt. Bestaande responsecache en gedeeltelijk hervatbare paginering blijven behouden. `app:add-players` zonder `--due` doorloopt de volledige import; de bestaande responsecache van één dag wordt daarbij niet omzeild. Er bestond geen afzonderlijke cache-bypass/forceoptie.

Het bestaande `/players/squads` maakt nieuwe profielen en teamkoppelingen aan zonder historische seizoensstatistieken te verzinnen. Het endpoint levert actuele squads, geen selectie op historisch seizoen. Clubs die in verschillende geselecteerde competities voorkomen delen de responsecache. Een overgang tussen actief/inactief kan één extra volledige import geven omdat beide markers afzonderlijk blijven.

Officiële onderbouwing: de [API-Football endpointgids](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide) beschrijft spelerspaginering en actuele squads; de [quota- en batchgids](https://www.api-football.com/news/post/how-to-optimize-api-sports-calls-and-quota-usage) beschrijft fixturebundels van maximaal twintig IDs. Het project gebruikte beide endpoints al.

### Geschatte besparing volledige spelersimport

Aanname: 25–50 pagina's per competitie (500–1.000 spelerrecords bij twintig per pagina). Werkelijke aantallen hangen af van competitie, transfers en dekking. Dit zijn gemiddelden over een week, geen uniforme dagbelasting.

| Actieve competities | Oud per dag | Nieuw gemiddeld per dag | Besparing |
| --- | ---: | ---: | ---: |
| 5 | 125–250 | 18–36 | circa 86% |
| 10 | 250–500 | 36–72 | circa 86% |
| 15 | 375–750 | 54–108 | circa 86% |

Squads komen hier bovenop; hun dagelijkse actualiteit blijft behouden. De eerste import en de wekelijkse verversdag blijven pieken. Voor inactieve competities daalt de gemiddelde volledige-importbelasting met 75%.

## Prioriteiten en reservebescherming

| Prioriteit | Werk |
| --- | --- |
| Critical | Live score/status, live events, detectie en opslag van definitief resultaat |
| High | Pre-match lineups, finale statistics/events, player statistics, post-match enrichment, afzonderlijke live statistics-fallback |
| Normal | Kalender inclusief ID-hercontrole, standings, predictions, odds |
| Low | Players, squads, coaches, venues, countries, leagues, teams, bookmakers |
| Background | Historische enrichment; onbekende niet-geclassificeerde endpoints behouden conservatieve fallback |

Een bekende FT/AET/PEN met beide scores hoeft niet meer via de Critical-livefase alleen vanwege ontbrekende enrichment. De livefase bewaart eerst fixturebasics en score. Nieuwe aanvullende requests krijgen hun eigen prioriteit; gratis embedded data mag worden hergebruikt. Live events worden vóór statistics verwerkt en falende aanvullende data verhindert het opslaan van de score niet. Historische calls behouden Background, ook binnen een datasetfallback.

Vanaf 25% resterend pauzeert Low/Background, vanaf 10% blijft High/Critical over. Bij de absolute reserve (standaard 500) blijft alleen Critical over; nul betekent EXHAUSTED. Deze bestaande grenzen zijn configureerbaar. Onbekende quota blijven UNKNOWN met lokale minuutbegrenzing. De kalender-ID-controle krijgt expliciet Normal en kan daardoor niet via het generieke ID-endpoint de reserve aanspreken.

Quota-uitstel is geen commandfout. Een vóór HTTP geblokkeerde enrichmentpoging verbruikt geen datasetretry. Echte HTTP-/datasetfouten blijven zichtbaar als fouten. Uitstel wordt bij volgende geplande runs hervat.

## Kalender en rescheduling

Na de eerste seizoensimport blijft de dagelijkse query T−3 tot T+14. Niet-afgesloten lokale fixtures in dat venster die ontbreken in de providerresponse, plus openstaande PST-fixtures ongeacht ouderdom, worden via hun IDs gecontroleerd, maximaal twintig per request. Bij uitgeschakelde batching gebruikt dit bestaande individuele fixturecalls.

| Situatie | Afhandeling |
| --- | --- |
| Wedstrijd verdwijnt uit venster door verplaatsing >14 dagen of maanden | Gerichte ID-hercontrole verwerkt nieuwe datum |
| Kickoffwijziging terwijl oude én nieuwe datum buiten het venster liggen | Volledige periodieke refresh |
| Oude postponed fixture krijgt nieuwe datum | PST wordt ook buiten het datumvenster op ID gecontroleerd |
| Cancelled | Status wordt uit windowresponse of ID-hercontrole overgenomen; bekende CANC wordt niet dagelijks als ontbrekend herhaald |
| Nieuwe fixture na eerste import | Direct binnen het window; anders periodieke volledige refresh |

De volledige hercontrole verandert van 30 naar 7 dagen. Die vervangt de windowcall op de verversdag, in plaats van iedere dag een volledige payload op te halen. Dat verkort de vertraging voor buitenliggende wijzigingen/nieuwe fixtures zonder extra reguliere primaire calls per competitie. Quota-uitstel kan deze termijn verlengen. Een versie in de kalendercachemarker zorgt dat oude markers met een TTL van 30 dagen de verbetering niet uitstellen; na deployment volgt eenmaal een volledige import per paar.

Geen extra endpoint of generieke reconciliatie-infrastructuur. Een provider die een ID helemaal niet meer retourneert veroorzaakt geen lokale verwijdering; de bestaande gegevens blijven behouden.

## Onafhankelijke enrichment en batching

De bestaande flags voor statistics, events, player stats en lineups blijven leidend. Een al complete dataset wordt bij volgende pogingen niet opnieuw opgeslagen of afzonderlijk opgehaald. Eindscore en resultaat blijven beschikbaar terwijl andere datasets ontbreken. De selectie voor finale enrichment verruimt van 6 naar 72 uur sinds kickoff, zodat een dagquotapauze kan worden overbrugd. De bestaande drie automatische pogingen met vijftien minuten tussentijd blijven begrensd; pre-match behoudt maximaal vier pogingen. Statistics/events delen hun bestaande poginggroep en lineups/player stats delen de andere groep: geen nieuwe statuskolommen nodig.

Een geldige maar lege/onvolledige response kan een poging verbruiken. Een dataset die na de limiet nog ontbreekt wordt niet oneindig gepolld. Voor langer uitgestelde historische verwerking bestaat de bestaande expliciete historische route met Background-prioriteit. Compleet gemarkeerde eindgegevens blijven volgens het bestaande immutable-contract behouden.

Batching was al correct over meerdere competitie-seizoenparen: sortering op matchdatum en lokale ID, maximaal twintig unieke fixture-IDs, responsemapping op provider-ID. Daarom is de batcharchitectuur niet gewijzigd. Een nieuwe regressie gebruikt 21 fixtures over twee competities en verschillende seizoenen, omgekeerde responsevolgorde en één ontbrekende fixture. Alleen de ontbrekende fixture blijft daarna kandidaat; de twintig successen worden niet opnieuw verrijkt. Ontbrekende embedded keys blijven bestaande fallbacks gebruiken; expliciet lege arrays gelden niet als ontbrekende keys.

## Status, dry-run en centralisatie

`football:api-status` toont daglimiet, waargenomen resterend/gebruikt, resterend percentage, NORMAL (interne naam HEALTHY)/WARNING/CRITICAL/RESERVE/EXHAUSTED of UNKNOWN, laatste observatie met ouderdom, effectieve lokale rest en calls vóór de reserve. Naast endpoint/caller-combinaties verschijnen afzonderlijke totalen per endpoint en per caller. Geen providercall.

Cumulatieve lokale reserverings- en blokkeertellers zijn niet toegevoegd: bestaande metrics tellen echte HTTP-pogingen, inclusief retries; een verschil met providerheaders is geen betrouwbare teller voor alle geblokkeerde taken. De effectieve lokale rest is wel beschikbaar. Cacheflush wist tijdelijke quota-/gebruikmetrics; oude observaties worden als waarneming met tijdstip getoond en blokkeren de volgende UTC-dag niet.

`football:sync PHASE --dry-run` toont paren, exacte kandidaatselectie en begrensde selectie, primaire requestbatches vóór locks/cache, geraamde primaire calls, fallbackrange apart, prioriteit en actuele toelating/uitstel. Voor competitiegerichte fasen toont het lokale fixtureaantal en competitieparen; onbekende aantallen door pagination, cache en kalenderafwijkingen worden expliciet onbekend genoemd. Het reserveert geen budget, verstuurt geen HTTP, schrijft geen fixturedata en dispatcht geen jobs. Een regressie controleert afwezigheid van muterende databasequeries. De limitercheck gebruikt alleen lezende limiteroperaties.

Een nieuwe scan van controllers, Inertia/frontend, modellen, resources en routes vond geen directe API-Football-requests. Statische teamlogo-URLs en de onafhankelijke feedbackclient zijn geen football-dataverzoeken. Alle footballrequests blijven via `FootballApiService` lopen; gewone pageviews verbruiken geen providerdataquota.

## Scheduler en requestschattingen

De scheduler zelf verandert niet: kalender dagelijks, reference-data ieder uur als due-check, live per minuut, pre/post iedere vijf minuten, standings ieder uur, predictions dagelijks en odds iedere zes uur. Geen worker-, Redis- of deploymentarchitectuurwijziging.

Onderstaand voorbeeld betreft een drukke wedstrijddag met 4–10 wedstrijden per competitie, 2–5 kickoffblokken van circa 120 minuten, 20–40 toekomstige fixtures per competitie in 14 dagen, 16–20 teams, 25–50 spelerspagina's en 1–2 oddspagina's per fixture. Peak gelijktijdige live-selectie blijft binnen de bestaande runlimiet van 100 fixtures. Het zijn ongeknepen HTTP-ramingen vóór quota-uitstel en cachehits, geen meting van de productieagenda.

| Requests per dag / categorie | 5 actief | 10 actief | 15 actief |
| --- | ---: | ---: | ---: |
| Fixtures/calendar | 5–10 | 10–20 | 15–30 |
| Players inclusief squads, weekgemiddelde | 98–136 | 196–272 | 294–408 |
| Live primaire bundels | 240–600 | 240–960 | 360–1.200 |
| Pre-match | 20–200 | 40–400 | 60–600 |
| Post-match, één enrichmentronde | 2–205 | 2–408 | 3–610 |
| Standings, alle competities actief | 120 | 240 | 360 |
| Predictions | 100–200 | 200–400 | 300–600 |
| Odds | 400–1.600 | 800–3.200 | 1.200–4.800 |

Formules en grenzen:

- Calendar: één call per competitie, plus `ceil(ontbrekende/PST IDs / 20)` per competitie. De tabel neemt maximaal één aanvullende batch per paar aan; meer afwijkingen verhogen dit. De wekelijkse volledige refresh vervangt die dag het window.
- Players: `competities × (pagina's / 7 + teams)`; gedeelde teams/cachehits kunnen dit verlagen. Op een volle importdag geldt `competities × (pagina's + teams)` in plaats van het gemiddelde.
- Live: `som per minuut ceil(geselecteerde fixtures / 20)`. De tabel is een kickoffblokkenschatting; uitlopen, verlenging en verspreide aftrappen verhogen het. Ontbrekende embedded events/statistics kosten maximaal twee aanvullende requests per geselecteerde fixture en tick, zolang hun prioriteit toegelaten is. Deze fallbacks zijn niet in de livekolom opgenomen en kunnen dominant worden.
- Pre-match: één tot vier lineuprequests per wedstrijd; succesvolle embedded lineups kunnen dit verlagen.
- Post-match: één primaire bundel per maximaal twintig fixtures per blok, plus nul tot vier ontbrekende datasets per fixture. Drie onvolledige rondes kunnen de bovengrens maximaal verdrievoudigen; complete datasets worden overgeslagen.
- Standings: maximaal 24 calls per actieve competitie per dag, één voor inactieve competitie.
- Predictions: één call per toekomstige fixture per dag; odds: vier runs × toekomstige fixtures × pagina's. Lege responses en actuele dekking beïnvloeden de werkelijke aantallen.

Deze ronde verlaagt vooral volledige spelersimports en beschermt de reserve. Bij 15 drukke competities kunnen odds en fallbacks nog steeds veel budget vragen; lagere prioriteiten wijken automatisch. Er is bewust geen ongeautoriseerde herziening van odds/predictionfrequenties gedaan.

## Vier baselinefouten

- `GroupsPageTest`: de bestaande directory gebruikt tien items per pagina; zes testrecords konden nooit een tweede pagina maken. De test gebruikt nu elf records, controleert tien plus één en behoudt onafhankelijke paginering en zoekasserties. Productpaginering ongewijzigd.
- Twee `MondialiQDemoSeederTest`-fouten betroffen feitelijk `PlayerSeasonStat`, niet het fixtureaantal. De seeder levert bewust 32 spelers over drie seizoenen. Tests controleren nu 96 records én 32 per seizoen, ook na twee keer seeden; het fixtureaantal blijft 45.
- `MondialiQDemoDataCommandTest`: de migratie had het gereserveerde AI-account al aangemaakt. Een tweede factoryrecord met dat unieke e-mailadres crashte vóór de commandtest. De test maakt het bestaande record tot een menselijk collisiongeval en controleert dat het command faalt zonder promotie of seeding. Geen auth- of migratiewijziging.

Daarnaast is de legacy-live-test aangepast om expliciet te bewijzen dat bekende eindscores buiten live-enrichment blijven en post-match lege statistics niet compleet markeert. De budgetdeferral-test verwacht nu een succesvolle uitstelstatus in plaats van een technische fout. Geen tests overgeslagen en geen test-only productiecode.

## Verificatie

- Volledige `php artisan test --compact`: 565 tests groen, 15.961 assertions (volledige suite, geen filter).
- `composer run lint:check`: geslaagd (projectbrede Pint-controle).
- `npm run types:check`, `npm run lint:check`, `npm run format:check`: geslaagd.
- `npm run build`: geslaagd; uitsluitend informatieve plugin-timingmelding.
- `git diff --check`: geslaagd.
- HTTP in regressietests is gefaket; geen betaald providerverkeer of productiedatabasewijzigingen uitgevoerd. Echte providerdekking, servercron, gedeelde productielocks en abonnementslimieten zijn niet live gevalideerd.

Nieuwe dekking omvat weekly/idle/manual player-refresh, eerste import en bestaande paginatiehervatting, nieuwe squadspelers, Critical versus High/reserve, score zonder enrichment, hervatting de volgende dag, afzonderlijke datasetcompletion, meerdere kalenderverplaatsingen, nieuwe fixtures via full refresh, gemengde batches/responsemapping, dry-run zonder writes en statusinzicht. De bestaande quota-zonedatasets blijven meedraaien.

## Resterende grenzen en deployment

- De veiligheidsrefresh geeft buiten het window maximaal ongeveer zeven dagen vertraging bij gezonde quota. De provider kan data later of helemaal niet leveren. Vermiste IDs worden niet verwijderd.
- Automatische enrichment stopt na drie pogingen of 72 uur. Een langdurige storing vraagt later expliciet herstel; niet eindeloos pollen.
- De live-runlimiet van 100 blijft behouden. Bij meer gelijktijdige kandidaten moet capaciteit/selectie apart worden geëvalueerd.
- Warmcache en shared-cachelocks blijven nodig. Een cacheflush veroorzaakt opnieuw imports en wist quotaobservaties. Geen flush als normale deploystap.
- Deze ronde voegt geen migration of dependency toe. Deploy na de vorige architectuurronde; voer eventuele nog niet toegepaste migrations van die ronde uit via het bestaande deploymentproces.
- Vernieuw gecompileerde configuratie met `php artisan config:cache` en herstart bestaande queueworkers met `php artisan queue:restart` indien gebruikt. Behoud de bestaande schedulercron.
- Controleer daarna `php artisan football:api-status` en `php artisan football:sync live --dry-run`, plus post-match/fixtures/reference-data met `--dry-run`. Controleer requestlogs na de eerste reguliere runs. De nieuwe kalendermarker veroorzaakt eenmaal een volledige hercontrole per paar, binnen Normal-quota.

## Reviewbare commitgroepen

1. **`Verfijn voetbalrefresh en bescherm livequota`**: `app/Console/Commands/AddPlayers.php`, `app/Models/Concerns/HasFixtureSync.php`, `app/Services/Apis/ApiPriority.php`, `app/Services/Football/CompetitionSyncService.php`, `app/Services/Football/FixtureSyncService.php`, `config/football_sync.php`, `tests/Feature/FootballSyncTest.php`, `tests/Feature/AddFixtureDataCommandTest.php`. De dry-run-test in FootballSyncTest hoort bij groep 2; stage die hunk daar.
2. **`Verduidelijk quotastatus en syncdryrun`**: `app/Console/Commands/FootballApiStatus.php`, `app/Console/Commands/SyncFootball.php`, `app/Services/Apis/FootballApiBudget.php`, `tests/Feature/FootballQuotaTest.php`, de dry-run-testhunk uit `tests/Feature/FootballSyncTest.php`.
3. **`Herstel paginering en demodataregressies`**: `tests/Feature/GroupsPageTest.php`, `tests/Feature/MondialiQDemoSeederTest.php`, `tests/Feature/MondialiQDemoDataCommandTest.php`.
4. **`Documenteer verfijnde voetbalsynchronisatie`**: `README.md`, `docs/football-sync-refinement-audit.md`, `docs/football-sync-refinement-report.md`.

Er zijn geen commits aangemaakt.
