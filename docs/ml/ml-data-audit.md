# ML-data-audit — 13 oktober 2026

## Methode en conclusie

Modellen, migraties, fixture-importmapping, statuslogica, bestaande predictionmodellen
en de lokale MySQL-database zijn onderzocht. Alleen SELECT-queries en een private
bestandsexport zijn uitgevoerd. Geen sync, API-aanroep, migratie of databasewrite.

**Alle 45 lokale fixtures zijn afkomstig uit de demoseeder**: external IDs vallen
binnen `99_000_000..99_000_999`, zoals vastgelegd in `MondialiQDemoSeeder`.
De vier competitienamen bevatten ook `(Demo)`. Van de fixtures zijn er 20 FT,
24 NS en één 2H. Geen echte trainingsrijen beschikbaar.

## Data en bruikbaarheid

| Data | Werkelijk lokaal beschikbaar | Bruikbaar vóór kickoff? | Potentiële feature | Leakage-risico / beslissing |
|---|---|---|---|---|
| Fixtures | 45, waarvan 20 FT | Metadata soms; resultaat pas achteraf | Historische rolling results | Alleen eerdere FT-resultaten, strikt tijdsfilter; demo uitgesloten |
| Teams | 16 | Identiteit wel | Groeperen historie | Geen numerieke team-ID-feature; attributen kunnen veranderen |
| Leagues | 4 | Identiteit/type wel | Competitiecontext | Geen league-ID als numerieke feature; nu uitgesteld |
| Seasons | Alle fixtures 2026; geen aparte seasontabel | Ja | Split/auditmetadata | Niet numeriek als shortcut; meerdere seizoenen ontbreken |
| Goals / thuis-uitresultaten | 20 FT met beide fulltime-scores, nul ontbrekende FT-scores | Alleen van eerdere afgeronde fixtures | Vorm, scoring, tegengoals | Zelfde wedstrijd alleen target; nul-defaults en live-scorefallback zijn risico's |
| Standings | 16 | Huidige stand niet historisch reconstrueerbaar | Positie/PPG later | Unieke league/season/group/team-rij wordt overschreven; volledig uitgesloten |
| Fixture statistics | 168 | Eigen match: nee | Eerdere shots/xG later | Geen historische observatieversies; uitgesloten |
| Team statistics | 16 | Alleen bewezen snapshot zou kunnen | Seizoensvorm later | statistics_date/fetched_at bestaan, maar unique statistics_key met updates; geen bewijs van as-of volledigheid |
| Events | 3 | Eigen match: nee | Eerdere gebeurtenissen later | Tijdens/na match; uitgesloten |
| Lineups / fixture players | 0 / 0 | Soms kort vóór kickoff | Beschikbaarheid later | Geen beschikbare snapshots; uitgesloten |
| Player fixture stats | 0 | Eigen match: nee | Eerdere spelersvorm later | Post-match; uitgesloten |
| Player season stats | 32 | Actuele aggregaten niet historisch | Spelersvorm later | Overschreven seizoenstotalen; uitgesloten |
| Injuries | Geen eigen model/tabel aangetroffen | Niet vast te stellen | Beschikbaarheid later | Niet beschikbaar |
| Coaches | 4 | Historische aanstelling niet vastgelegd | Coachwissel later | Actuele teamkoppeling; uitgesloten |
| Bookmakers / odds | 0 / 0 | Alleen bewezen pre-match snapshot | Alleen externe benchmark later | api_updated_at en updated_at bestaan, geen oddsversiehistorie; geen benchmark mogelijk |
| Predictions | 45, gemengde bestaande prediction-infrastructuur | Alleen bewaarde pre-match versie | Geen fase-1-feature | User/API/AI-data, latere updates en scoring; volledig uitgesloten |
| API predictions | Source `api` ondersteund in predictions | Niet zonder betrouwbare snapshot | Geen fase-1-feature | Provider kan voorspelling achteraf wijzigen |
| Head-to-head | 0 | Alleen historische uitslagen as-of | Eventueel eigen rolling H2H | raw_data/aggregaten per pair_key overschreven; niet gebruikt |
| Timestamps | created_at/updated_at en syncvelden aanwezig | Observatietijd is nuttig | Alleen beschikbaarheidsfilter | Geen exact final-whistle- of result-observed-at-archief |
| Fixture statuses | FT/NS/2H lokaal | Definitieve status niet pre-match | Alleen eligibility/targetcontrole | Geen status als predictor |

`Prediction` heeft bestaande `home_chance`, `draw_chance`, `away_chance`, `source`,
`fixture_id`, `user_id`, score- en adviesvelden. De unique `(user_id, fixture_id)`
en scoring hooks maken blind hergebruik voor modelversies onveilig. Zie integratievoorstel.

## Datasetgrootte

| League, seizoen 2026 | Totaal | FT | NS | Live | Echte bruikbare training |
|---|---:|---:|---:|---:|---:|
| Jupiler Pro League (Demo) | 13 | 7 | 6 | 0 | 0 |
| Premier League (Demo) | 13 | 5 | 7 | 1 | 0 |
| Champions League (Demo) | 9 | 4 | 5 | 0 | 0 |
| La Liga (Demo) | 10 | 4 | 6 | 0 | 0 |
| Totaal | 45 | 20 | 24 | 1 | 0 |

Demo-FT-verdeling: H=10 (50%), D=6 (30%), A=4 (20%). Dit is **geen schatting van
echte voetbaluitkomsten**. Echte H/D/A-verdeling en feature-missingness zijn niet
berekenbaar: de echte dataset is leeg. Ook baselinepercentages worden hieruit niet geleerd.
Opgeslagen FT-kickoffs lopen van 22 september tot 6 oktober 2026, alle fixtures van
22 september tot 13 oktober 2026 (opgeslagen Brussels-wall-clock).

## Leakagebeveiliging

- De huidige fixture en alle gelijktijdige/toekomstige fixtures worden uit historie gehouden.
- `available_at = max(created_at, updated_at, fixture_basics_synced_at, kickoff + 4 uur)`;
  `updated_at` is verplicht, beschikbaarheid moet **strikt vóór** de cutoff liggen.
  De vier uur is een conservatieve veiligheidsbuffer, geen echte eindtijd.
- Een latere update kan een oude uitslag onbruikbaar maken voor historische features.
  We raden geen oude waarde en reconstrueren geen ontbrekende versies.
- Alleen FT, niet AET/PEN: de importer gebruikt `score.fulltime` met fallback naar
  `goals`. Bij verlenging kan die fallback een andere doeldefinitie bevatten.
- Live-/cancelled-/postponed-/awarded-/abandoned-statussen en onvolledige scores
  worden niet als resultaat gebruikt. Een later correct herschikte FT-fixture kan
  op basis van haar actuele kickoff meetellen; oorspronkelijke schemahistorie ontbreekt.
- Het target is H/D/A op basis van de twee FT-scores. De scores, status, IDs,
  seizoennummers, odds en provider predictions komen niet in de featurematrix.
- Training- en validationlabels worden verwijderd als hun beschikbare versie pas
  na de volgende splitgrens bestaat. Preprocessing leert uitsluitend op training.

## Wat strikt niet bewezen kan worden

`updated_at` is een generieke mutatietijd en geen bitemporeel archief. Oude correcties,
gewijzigde kickoff/tweede teamkoppeling en historische coverage kunnen zonder snapshots
niet exact gereconstrueerd worden. De pipeline is bewust conservatief en claimt geen
perfecte reconstructie van niet-opgeslagen geschiedenis.

Een vandaag geïmporteerd seizoen uit 2024 krijgt vandaag observatietijden. Binnen
dat seizoen zijn die uitslagen daarom **geen** beschikbare historie. Alleen meer
historische fixtures importeren heft deze blokkade niet op. Nodig: betrouwbare
historische result-observed-at-bronnen of bewaarde lokale snapshots, of prospectief
voldoende historie verzamelen. Een lossere retrospectieve policy vereist apart
onderzoek en mag niet stilzwijgend deze policy vervangen.

De huidige fixture API-endpoints vragen Europe/Brussels; `FixtureService` schrijft
de ontvangen wall-clockdatum en `Fixture::kickoffAt()` leest Brussels. Generieke
Laravel-audittimestamps gebruiken UTC. De export vereist daarom een expliciete
kickoff-timezone. Gemengde legacy-imports eerst onderzoeken; de sync is niet aangepast.
