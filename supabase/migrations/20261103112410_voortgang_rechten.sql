-- Zonder inloggen (anon) geen enkele toegang tot de voortgang.
revoke all on public.voortgang from anon;
grant select, insert, update, delete on public.voortgang to authenticated;
-- Account verwijderen gaat via de Edge Function supabase/functions/verwijder-account.
