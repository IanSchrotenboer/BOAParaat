-- Boa Paraat, PROEFVERSIE: 7 dagen gratis proberen en daarna een abonnement van 1, 3, 6 of 12 maanden.
-- Alleen de proefversie (betaalmuur) gebruikt deze functies; de gewone app merkt er niets van.
--
-- Proefweek
--   * Begint de eerste keer dat een account de proefversie opent (mijn_rechten), niet bij het aanmaken van
--     het account. Zo krijgt ook wie al een account had zijn eigen 7 dagen.
--   * Eén proefweek per account: opnieuw installeren of op een ander apparaat inloggen start hem niet opnieuw.
--
-- Abonnementen (nagebootst, er wordt niet echt betaald)
--   * plan = aantal maanden: 1 (€ 5,99), 3 (€ 15,99), 6 (€ 28,99) of 12 (€ 47,99).
--   * Een actief abonnement verlengt zich met hetzelfde plan. Een ander plan kiezen terwijl het abonnement
--     loopt: het nieuwe plan gaat in als de huidige periode afloopt.
--   * Toegang zonder abonnement: een licentie van de werkgever of lid van een klas van een opleider.
--   * LET OP: verwijder proef_abonnement voordat er echt betaald wordt.

create table if not exists public.proefperiodes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  start   timestamptz not null default now()
);
comment on table public.proefperiodes is 'Gratis proefweek per account (proefversie met betaalmuur). Begint bij het eerste gebruik.';
alter table public.proefperiodes enable row level security;
revoke all on public.proefperiodes from anon, authenticated;

alter table public.abonnementen add column if not exists plan int not null default 1;
alter table public.abonnementen add column if not exists volgend_plan int;
do $$ begin
  alter table public.abonnementen add constraint abonnementen_plan check (plan in (1, 3, 6, 12) and (volgend_plan is null or volgend_plan in (1, 3, 6, 12)));
exception when duplicate_object then null; end $$;

create or replace function public.mijn_rechten()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  l text;
  a public.abonnementen;
  ps timestamptz;
  klas boolean;
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  insert into public.proefperiodes (user_id) values (uid) on conflict (user_id) do nothing;
  select start into ps from public.proefperiodes where user_id = uid;
  select lic into l from public.licenties where user_id = uid and actief;
  klas := exists (select 1 from public.klas_leden k where k.user_id = uid);
  select * into a from public.abonnementen where user_id = uid;
  -- nagebootst: een actief abonnement wordt aan het eind van elke periode 'betaald' en verlengd
  if found and a.status = 'actief' and a.bron = 'nagebootst' and a.tot <= now() then
    while a.tot <= now() loop
      update public.abonnementen
         set plan = coalesce(volgend_plan, plan), volgend_plan = null,
             tot = tot + make_interval(months => coalesce(volgend_plan, plan))
       where user_id = uid returning * into a;
    end loop;
  end if;
  return jsonb_build_object(
    'lic', l,
    'klas', klas,
    'proef', jsonb_build_object('start', ps, 'tot', ps + interval '7 days'),
    'abo', case when a.user_id is null then null else jsonb_build_object(
      'status', a.status, 'start', a.start, 'tot', a.tot, 'bron', a.bron, 'plan', a.plan, 'volgend', a.volgend_plan) end);
end;
$$;

-- PROEF: nagebootst abonnement starten, wijzigen of opzeggen (geen echte betaling)
drop function if exists public.proef_abonnement(text);
create or replace function public.proef_abonnement(actie text, maanden int default 1)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  a public.abonnementen;
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  if maanden not in (1, 3, 6, 12) then raise exception 'plan: 1, 3, 6 of 12 maanden'; end if;
  select * into a from public.abonnementen where user_id = uid;
  if actie = 'start' then
    if found and a.tot > now() then
      -- loopt nog: doorlaten lopen, een ander plan gaat in na deze periode
      update public.abonnementen set status = 'actief', bron = 'nagebootst', bijgewerkt = now(),
             volgend_plan = case when maanden = a.plan then null else maanden end
       where user_id = uid;
    else
      insert into public.abonnementen (user_id, status, start, tot, bron, plan)
        values (uid, 'actief', now(), now() + make_interval(months => maanden), 'nagebootst', maanden)
      on conflict (user_id) do update
        set status = 'actief', start = now(), tot = now() + make_interval(months => maanden),
            bron = 'nagebootst', plan = maanden, volgend_plan = null, bijgewerkt = now();
    end if;
  elsif actie = 'hervat' then
    update public.abonnementen set status = 'actief', bijgewerkt = now() where user_id = uid and tot > now();
  elsif actie = 'opzeggen' then
    update public.abonnementen set status = 'opgezegd', volgend_plan = null, bijgewerkt = now() where user_id = uid;
  else
    raise exception 'onbekende actie';
  end if;
  return public.mijn_rechten();
end;
$$;

revoke all on function public.mijn_rechten() from public, anon;
revoke all on function public.proef_abonnement(text, int) from public, anon;
grant execute on function public.mijn_rechten() to authenticated;
grant execute on function public.proef_abonnement(text, int) to authenticated;
