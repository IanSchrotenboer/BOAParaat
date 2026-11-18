-- Tweestapsverificatie (vrijwillig, authenticator-app): wie het aanzet, kan zijn voortgang alleen nog lezen en
-- bewaren met een sessie waarin de tweede stap is gedaan (aal2). Wie het niet aanzet, merkt niets.
-- Zonder deze regel zou de tweede stap alleen in de app zitten; met alleen een wachtwoord kon iemand dan nog
-- rechtstreeks bij de database.
-- auth.mfa_factors is niet leesbaar voor ingelogde gebruikers, daarom een functie met security definer.

create or replace function public.mfa_ok()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified');
$$;
revoke all on function public.mfa_ok() from public, anon;
grant execute on function public.mfa_ok() to authenticated;

drop policy if exists "tweestapsverificatie" on public.voortgang;
create policy "tweestapsverificatie" on public.voortgang as restrictive for all to authenticated
  using ((select public.mfa_ok())) with check ((select public.mfa_ok()));
