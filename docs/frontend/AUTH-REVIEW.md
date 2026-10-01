# Toegangscontrole — 1 oktober 2026

Deze wijziging volgt op de redesign en vervangt de eerdere publieke toegang tot applicatiepagina's.

## Gedrag

- De navigatie op `/` bevat alleen inloggen en account aanmaken. De eerder gecorrigeerde hoogte en logo-afmetingen blijven behouden.
- Wedstrijden, wedstrijddetails, teams, spelers, groepsstanden en beide voorspellingenoverzichten vereisen nu een ingelogde gebruiker. Dashboard, ranglijsten, competities, persoonlijke voorspellingen en instellingen waren al afgeschermd.
- Gasten worden naar login verwezen; JSON-verzoeken krijgen `401`. Na succesvolle login of registratie gaan gebruikers altijd naar `/dashboard`, ook na sociale login of een 2FA-challenge. Een eerdere of meegestuurde `intended`-URL overschrijft die bestemming niet en wordt uit de sessie verwijderd.
- De live-wedstrijdenroute vereist eveneens authenticatie, met de bestaande browser-/sessieguard. Er is geen nieuwe tokenauthenticatie geïntroduceerd.
- De publieke homepage stuurt geen echte live- of komende wedstrijdgegevens meer mee in de Inertia-props voor gasten. De statische voorbeeldanalyse blijft beschikbaar.
- Homepage, authenticatie/herstel en de informatiepagina's privacy, contact, uitleg en puntentelling blijven publiek. Feedback verzenden vereist nog steeds login.
- Sociale login respecteert ingeschakelde tweestapsverificatie: de gebruiker blijft gast tot de Fortify-challenge is voltooid. Een reeds ingelogde gebruiker kan geen tweede sociale login starten.

## Controle

De bestaande policies en Form Requests voor competitie-eigenaars, ledenbeheer, privévoorspellingen en accountwijzigingen zijn gecontroleerd. Beheeracties vereisen eigenaarschap; accountwijzigingen gebruiken de huidige gebruiker; individuele privévoorspellingen blijven gefilterd. Het adminpaneel vereist een adminrol en ingeschakelde 2FA. De gevonden omzeiling van 2FA via sociale login is hersteld.

Regressietests controleren de gast-/JSON-toegangsmatrix, publieke pagina's, sessieauthenticatie van live-data, de dashboardbestemming na login/registratie, normale sociale login, verplichte 2FA, ongeldige en geldige herstelcodes en blokkering van sociale login tijdens een bestaande sessie. Bestaande paginatests voeren inhoudelijke assertions nu met een ingelogde gebruiker uit.

Playwright heeft op de lokale applicatie bevestigd dat de homepage-navigatie op desktop en mobiel slechts de twee accountacties toont, dat `/matches` gasten naar `/login` verwijst en dat de live-dataroute `401` teruggeeft. Mobiel heeft geen horizontale overflow. Screenshots staan in de genegeerde map `output/playwright/`.

## Afzonderlijke commits

Verificatie: volledige Pest-suite 437/437 geslaagd; de zes gerichte sociale-logintests inclusief twee daarna toegevoegde sessieregressies slagen eveneens. TypeScript, ESLint, Prettier, Pint, productiebuild en `git diff --check` slagen. Wayfinder is opnieuw gegenereerd. De volledige tests draaiden met 512 MB procesgeheugen; er is geen `.env` gewijzigd. De build meldt alleen de bestaande niet-blokkerende font- en plugin-timingwaarschuwingen.

Geen commits automatisch aangemaakt. Onderstaande lijsten bevatten de exacte bestanden, inclusief tests.

### `Vereenvoudig de homepage-navigatie`

- `resources/js/components/home/public-header.tsx`

### `Beveilig applicatiepagina's en respecteer tweestapsverificatie`

- `routes/web.php`
- `routes/api.php`
- `app/Http/Controllers/Pages/HomeController.php`
- `app/Http/Controllers/Socialite/CallbackController.php`
- `tests/Feature/PageAuthenticationTest.php`
- `tests/Feature/Auth/SocialiteCallbackTest.php`
- `tests/Feature/GroupsPageTest.php`
- `tests/Feature/HomePageTest.php`
- `tests/Feature/LiveFixturesApiTest.php`
- `tests/Feature/MatchDetailsPageTest.php`
- `tests/Feature/MatchesPageTest.php`
- `tests/Feature/PlayerDetailsPageTest.php`
- `tests/Feature/PredictionsPageTest.php`

### `Documenteer de toegangscontrole`

- `docs/frontend/AUTH-REVIEW.md`

## Vervolgwijziging: dashboard na authenticatie

Commitbericht: `Stuur gebruikers na aanmelden altijd naar het dashboard`

73 gerichte authenticatie- en toegangstests slagen. Inclusief wachtwoordlogin, registratie, nieuwe en bestaande Google/Facebook-accounts, authenticatorcodes, herstelcodes en genegeerde redirectparameters. JSON-responseformaten blijven behouden. Wachtwoordbevestiging tijdens een bestaande sessie behoudt zijn eigen vervolgactie.

- `app/Http/Controllers/Socialite/CallbackController.php`
- `app/Http/Controllers/Socialite/RedirectController.php`
- `app/Http/Responses/LoginResponse.php`
- `app/Http/Responses/RegisterResponse.php`
- `app/Http/Responses/TwoFactorLoginResponse.php`
- `app/Providers/FortifyServiceProvider.php`
- `config/fortify.php`
- `docs/frontend/AUTH-REVIEW.md`
- `resources/js/pages/auth/login.tsx`
- `tests/Feature/Auth/AuthenticationTest.php`
- `tests/Feature/Auth/EmailVerificationTest.php`
- `tests/Feature/Auth/RegistrationTest.php`
- `tests/Feature/Auth/SocialiteCallbackTest.php`
- `tests/Feature/Auth/TwoFactorChallengeTest.php`
- `tests/Feature/Auth/VerificationNotificationTest.php`
- `tests/Feature/PageAuthenticationTest.php`
