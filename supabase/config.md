# Supabase-project Boa Paraat

- Project: `xtrrubficvtvkqxdrfgr` (regio eu-central-1, Frankfurt), organisatie IanSchrotenboer's Org.
- API: https://xtrrubficvtvkqxdrfgr.supabase.co, publishable key staat in `bron/cloud.json` (openbaar).
- Database: `migrations/` (tabel `voortgang` met row level security).
- Edge Function: `functions/verwijder-account` (account verwijderen; verify_jwt uit, de functie controleert het toegangsbewijs zelf).

## Handmatig ingesteld in het dashboard

1. Authentication → Sign In / Providers → Google: aan, met Client ID en Client Secret uit Google Cloud.
2. Authentication → URL Configuration:
   - Site URL: `nl.boa.phbtrainer://login`
   - Redirect URLs: `nl.boa.phbtrainer://login` (en later het adres van de website, als die online staat).
3. Google Cloud Console → OAuth-client (type Webapplicatie) met als geautoriseerde omleidings-URI:
   `https://xtrrubficvtvkqxdrfgr.supabase.co/auth/v1/callback`

## Inloggen met Apple

De knop "Inloggen met Apple" verschijnt pas als in `bron/cloud.json` `"apple": true` staat. Zet dat pas aan als Apple in Supabase werkt.

1. Apple Developer (betaald lidmaatschap) → Certificates, Identifiers & Profiles:
   - App ID `nl.boa.phbtrainer` met de capability Sign in with Apple.
   - Services ID `nl.boa.phbtrainer.web` met Sign in with Apple; Domains: `xtrrubficvtvkqxdrfgr.supabase.co`; Return URL: `https://xtrrubficvtvkqxdrfgr.supabase.co/auth/v1/callback`.
   - Key met Sign in with Apple. Het `.p8`-bestand kun je maar één keer downloaden; bewaar het veilig en zet het nooit in deze repository.
2. Maak met de generator op https://supabase.com/docs/guides/auth/social-sign-in/auth-apple (in Chrome of Firefox) het geheim (JWT) uit Team ID, Key ID, Services ID en het `.p8`-bestand.
3. Supabase → Authentication → Sign In / Providers → Apple: aan, Client IDs `nl.boa.phbtrainer.web`, Secret Key het geheim uit stap 2.
4. **Elke 6 maanden** verloopt het geheim: maak dan met hetzelfde `.p8`-bestand een nieuw geheim en vul dat in bij stap 3. Anders werkt inloggen met Apple niet meer.

Apple geeft geen naam mee; die vult de gebruiker zelf in op het welkomstscherm. Kiest iemand "Verberg mijn e-mailadres", dan staat er een doorstuuradres van Apple (`…@privaterelay.appleid.com`) in het account.

## Inloggen met e-mail (code per mail)

De knop "Inloggen met e-mail" verschijnt pas als in `bron/cloud.json` `"email": true` staat. De gebruiker krijgt een code van 6 cijfers en typt die in de app (een link zou op de iPhone in Safari openen in plaats van in de app op het beginscherm).

1. Resend: domein `boaparaat.nl` toevoegen (regio EU), de DNS-records bij STRATO zetten en een API-sleutel maken (alleen verzenden).
2. Supabase → Authentication → Emails → SMTP Settings: host `smtp.resend.com`, poort `465`, gebruikersnaam `resend`, wachtwoord de API-sleutel van Resend, afzender `inloggen@boaparaat.nl`, naam `Boa Paraat`.
3. Supabase → Authentication → Sign In / Providers → Email: aan, Email OTP Length `6`.
4. Supabase → Authentication → Emails → Templates: in **Magic Link** én **Confirm signup** de code tonen met `{{ .Token }}` (geen link).
   **Er mag helemaal geen link in staan** (geen `{{ .ConfirmationURL }}`, ook niet als "of klik hier"). Beveiligingsscanners van school- en werkmail (bijvoorbeeld Microsoft Defender bij een ROC) openen links in binnenkomende mail automatisch; daarmee is de eenmalige code meteen verbruikt en werkt de code die de gebruiker intypt niet meer. Gezien op 17 nov: een nieuwe gebruiker met schoolmail, 18 seconden na het versturen werd de link al geopend (`GET /verify`), daarna lukte inloggen niet. Sjabloon (voor beide):
   Kant-en-klare sjablonen (alleen de code, geen enkele link): `supabase/mail/confirm-signup.html` (onderwerp `Je code voor Boa Paraat: welkom!`) en `supabase/mail/magic-link-otp.html` (onderwerp `Je inlogcode voor Boa Paraat`). Er staat "1 uur geldig" in: zet onder Authentication → Sign In / Providers → Email de **Email OTP Expiration** op 3600.
   Eenvoudige versie:
   - Onderwerp: `Je inlogcode voor Boa Paraat`
   - Inhoud: `<h2>Je inlogcode</h2><p>Vul deze code in de app in:</p><p style="font-size:30px;font-weight:700;letter-spacing:6px">{{ .Token }}</p><p>De code is een uur geldig. Heb je geen code aangevraagd? Dan kun je deze mail negeren.</p><p>Boa Paraat</p>`
5. Supabase → Authentication → Rate Limits: **Rate limit for sending emails** staat op 30 per uur voor het hele project. Bij een klas die tegelijk inlogt is dat te weinig; zet hem op 100 (maar niet hoger dan wat je Resend-abonnement per dag toestaat; gratis: 100 per dag, 3.000 per maand).
6. Resend → Domains: `boaparaat.nl` moet op **Verified** staan (SPF en DKIM). Voeg bij STRATO ook een DMARC-record toe (`_dmarc` TXT `v=DMARC1; p=none;`); zonder DMARC zet Microsoft (Outlook, school- en werkmail) mail vaker in ongewenst of quarantaine. Of een mail echt is afgeleverd, zie je per mail in Resend → Emails (Delivered, Delayed, Bounced).
7. De app vangt het op als iemand toch een link uit een (oude) mail gebruikt: op de website logt de link gewoon in, en is hij al gebruikt dan krijgt de gebruiker uitleg en meteen het veld om een nieuwe code te vragen (`loginLink` in `bron/cloud.js`). Na 30 seconden zonder code legt de app uit dat schoolmail kan vertragen en biedt hij Google aan.

## Inloggen met e-mail en wachtwoord (zonder mail)

Voor wie werk- of schoolmail heeft die de code tegenhoudt. In de app: Inloggen met e-mail → **Inloggen met wachtwoord** (account maken, inloggen, wachtwoord vergeten), en Profiel → Account → **Wachtwoord instellen of wijzigen** voor wie al met Google of een code inlogt.

Instellingen in Supabase → Authentication → Sign In / Providers → **Email**:
- **Enable Email provider** en **Allow new users to sign up**: aan.
- **Confirm email**: **uit**. Anders moet een nieuw account eerst een code uit de mail invullen, en dat lukt juist niet bij werk- en schoolmail. (De app vangt het op als hij toch aan staat: dan volgt de code-stap.)
- **Secure password change**: uit (anders moet je opnieuw inloggen voordat je je wachtwoord mag wijzigen).
- **Minimum password length**: 8; **Password requirements**: letters en cijfers (de app eist hetzelfde).
- Mailsjabloon **Reset password**: `supabase/mail/reset-password.html` (onderwerp `Je code voor een nieuw wachtwoord`), ook alleen met `{{ .Token }}` en zonder link.

Afweging: met 'Confirm email' uit controleert niemand of het e-mailadres van een wachtwoordaccount echt van die persoon is. Voor een oefenapp zonder gevoelige gegevens is dat acceptabel; wachtwoord vergeten werkt wel alleen als de mail aankomt.

Tweestapsverificatie (onderzocht 18 nov): Supabase kan een tweede stap met een authenticator-app (TOTP, gratis) of sms (betaalde add-on). Nog niet gebouwd.

## Inloggen met Microsoft (school- en werkaccounts)

Voor leerlingen en medewerkers met Microsoft 365 (zoals een ROC): ze loggen in met hun schoolaccount, zonder mail. De knop "Inloggen met Microsoft – school- of werkaccount" verschijnt pas als in `bron/cloud.json` `"microsoft": true` staat; de app gebruikt provider `azure` met `scopes=email`.

1. portal.azure.com (gratis, met een Microsoft-account) → **Microsoft Entra ID → App registrations → New registration**: naam `Boa Paraat`; Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**; Redirect URI (Web): `https://xtrrubficvtvkqxdrfgr.supabase.co/auth/v1/callback`.
2. **Certificates & secrets → New client secret** (24 maanden; zet een herinnering om hem te vernieuwen). Kopieer de **Value** meteen; die zie je maar één keer. Niet naar Claude sturen.
3. **Token configuration → Add optional claim → ID**: `email` en `xms_edov` (zo weet Supabase zeker dat het e-mailadres echt is).
4. **API permissions**: Microsoft Graph, delegated: `openid`, `email`, `profile` (User.Read staat er al). Niets anders.
5. **Branding & properties → Publisher domain**: `app.boaparaat.nl`. Microsoft vraagt dan een bestand op `https://app.boaparaat.nl/.well-known/microsoft-identity-association.json` met het Application (client) ID; dat ID is niet geheim, Claude zet het bestand in de app.
6. Supabase → Authentication → Sign In / Providers → **Azure**: aan, Application (client) ID, Secret Value; Azure Tenant URL leeg laten (= `common`, alle scholen en persoonlijke accounts).
7. `bron/cloud.json`: `"microsoft": true`, release.

**Toestemming van de school:** Microsoft laat leerlingen niet zelf toestemming geven aan een app van een *niet-geverifieerde uitgever*. Zonder verificatie ziet een leerling "Goedkeuring van beheerder vereist". Twee oplossingen:
- **Per school:** de ICT-afdeling geeft één keer toestemming voor de hele school (admin consent). Link voor de beheerder: `https://login.microsoftonline.com/organizations/adminconsent?client_id=<Application ID>`.
- **Voor alle scholen:** uitgeversverificatie (blauw vinkje) via het Microsoft AI Cloud Partner Program (gratis, vraagt een KvK-geregistreerd bedrijf en een mailadres op boaparaat.nl).

## Schoolmail die de code tegenhoudt (aan de ICT-afdeling vragen)

Als een school de code-mail vertraagt of in quarantaine zet, kan de ICT-afdeling (Microsoft 365) dit doen:
- `inloggen@boaparaat.nl` / domein `boaparaat.nl` toevoegen aan de **Tenant Allow/Block List** (toegestane afzenders) in Microsoft Defender.
- Mail van `boaparaat.nl` uitzonderen van **Safe Attachments / Dynamic Delivery** (die houdt mail minuten vast) en **Safe Links** (die opent links).

## Beheer

- **Beheerders** staan in `public.beheerders` (nu de twee accounts van Ian). Een beheerder toevoegen: `insert into public.beheerders (user_id) select id from auth.users where email = '…';`
- **Beheeroverzicht:** `beheer_overzicht()` (migratie `20261117090000_beheer_overzicht.sql`, al toegepast) geeft de beheerder in één keer de kerncijfers, activiteit per dag, oefensessies per module, alle gebruikers met hun laatste oefening, alle uitgegeven codes (laatste vier tekens) en de klassen. Weigert iedereen die niet in `public.beheerders` staat; `anon` mag hem niet aanroepen. Te zien op app.boaparaat.nl/beheer (bron `bron/beheer.html`, test `tests/beheer.js`).
