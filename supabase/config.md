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
