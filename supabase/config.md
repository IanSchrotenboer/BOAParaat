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
