-- Boa Paraat: voortgang per gebruiker in de cloud.
-- Eén rij per gebruiker met de volledige opslag van de app (jsonb). Row level security zorgt dat iedereen
-- alleen zijn eigen rij kan lezen, toevoegen, wijzigen en verwijderen. De publishable key in de app geeft
-- zonder ingelogde gebruiker dus nergens toegang toe.
create table if not exists public.voortgang (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  app_versie text,
  aangemaakt timestamptz not null default now(),
  bijgewerkt timestamptz not null default now(),
  constraint voortgang_grootte check (pg_column_size(data) < 2000000)
);

comment on table public.voortgang is 'Oefenvoortgang, examens en verslagen van een gebruiker van Boa Paraat (de opslag van de app als jsonb).';

alter table public.voortgang enable row level security;

create policy "eigen voortgang lezen" on public.voortgang
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "eigen voortgang toevoegen" on public.voortgang
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigen voortgang wijzigen" on public.voortgang
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eigen voortgang verwijderen" on public.voortgang
  for delete to authenticated using ((select auth.uid()) = user_id);

-- bijgewerkt automatisch bijhouden
create or replace function public.voortgang_bijgewerkt()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.bijgewerkt := now();
  return new;
end;
$$;

create trigger voortgang_bijgewerkt before update on public.voortgang
  for each row execute function public.voortgang_bijgewerkt();
