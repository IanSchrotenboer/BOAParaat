-- Boa Paraat, PROEFVERSIE: abonnement (Boa Paraat Plus) en eenmalige licentiecodes.
-- Alles gaat via functies; de tabellen zelf zijn voor gebruikers van de app niet te lezen of te wijzigen.
--
-- Licentiecodes
--   * In de database staat alleen een controlegetal (sha256) van de code, nooit de code zelf.
--   * Een code werkt één keer: bij het inwisselen wordt hij in één stap gekoppeld aan het account.
--     Daarna kan niemand anders hem gebruiken.
--   * De licentie hoort bij het account (tabel licenties). Op een ander apparaat log je in met hetzelfde
--     Google-account en krijg je de licentie automatisch weer (functie mijn_rechten).
--   * Dezelfde gebruiker kan zijn eigen code opnieuw invullen (bijvoorbeeld na 'licentie verwijderen').
--   * Hooguit 10 mislukte pogingen per gebruiker per uur.
--   * Codes maken: alleen de beheerder, in de SQL-editor van Supabase:
--       select * from public.licentiecodes_maken('ns', 10, 'NS proef november');
--     De codes staan alleen in die uitkomst: bewaar ze meteen.
--
-- Abonnement (nagebootst)
--   * proef_abonnement('start' | 'opzeggen') zet een abonnement van een maand aan of zegt het op, zonder
--     echte betaling. Een actief nagebootst abonnement verlengt zichzelf per maand.
--   * LET OP: verwijder proef_abonnement voordat er echt betaald wordt (dan komt er een koppeling met een
--     betaalaanbieder die het abonnement via een webhook bijwerkt).

create table if not exists public.licentiecodes (
  code_hash     text primary key check (code_hash ~ '^[0-9a-f]{64}$'),
  lic           text not null check (lic ~ '^[a-z0-9]{2,20}$'),
  hint          text,
  notitie       text,
  aangemaakt    timestamptz not null default now(),
  gebruikt_door uuid references auth.users (id) on delete set null,
  gebruikt_op   timestamptz
);
comment on table public.licentiecodes is 'Eenmalige licentiecodes (alleen het sha256-controlegetal). Gebruikt = gebruikt_op is gevuld.';

create table if not exists public.licenties (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  lic       text not null,
  code_hash text references public.licentiecodes (code_hash),
  actief    boolean not null default true,
  sinds     timestamptz not null default now()
);
comment on table public.licenties is 'Licentie per account (meegenomen naar elk apparaat waarop de gebruiker inlogt).';

create table if not exists public.abonnementen (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  status     text not null check (status in ('actief', 'opgezegd')),
  start      timestamptz not null default now(),
  tot        timestamptz not null,
  bron       text not null default 'nagebootst',
  bijgewerkt timestamptz not null default now()
);
comment on table public.abonnementen is 'Boa Paraat Plus per account. In de proefversie alleen nagebootst (bron = nagebootst).';

create table if not exists public.licentie_pogingen (
  user_id uuid not null references auth.users (id) on delete cascade,
  op      timestamptz not null default now()
);
create index if not exists licentie_pogingen_user_op on public.licentie_pogingen (user_id, op);
create index if not exists licenties_code_hash on public.licenties (code_hash);
create index if not exists licentiecodes_gebruikt_door on public.licentiecodes (gebruikt_door);

alter table public.licentiecodes enable row level security;
alter table public.licenties enable row level security;
alter table public.abonnementen enable row level security;
alter table public.licentie_pogingen enable row level security;
revoke all on public.licentiecodes, public.licenties, public.abonnementen, public.licentie_pogingen from anon, authenticated;

-- code normaliseren zoals de app dat doet: alleen letters en cijfers, hoofdletters
create or replace function public.licentie_hash(code text)
returns text language sql immutable set search_path = '' as $$
  select encode(pg_catalog.sha256(convert_to(upper(regexp_replace(coalesce(code, ''), '[^A-Za-z0-9]', '', 'g')), 'UTF8')), 'hex')
$$;

-- rechten van de ingelogde gebruiker: licentie en abonnement
create or replace function public.mijn_rechten()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  l text;
  a public.abonnementen;
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  select lic into l from public.licenties where user_id = uid and actief;
  select * into a from public.abonnementen where user_id = uid;
  -- nagebootst: een actief abonnement wordt elke maand 'betaald' en verlengd
  if found and a.status = 'actief' and a.bron = 'nagebootst' and a.tot <= now() then
    while a.tot <= now() loop
      update public.abonnementen set tot = tot + interval '1 month' where user_id = uid returning * into a;
    end loop;
  end if;
  return jsonb_build_object(
    'lic', l,
    'abo', case when a.user_id is null then null else jsonb_build_object('status', a.status, 'start', a.start, 'tot', a.tot, 'bron', a.bron) end);
end;
$$;

-- eenmalige licentiecode inwisselen en koppelen aan het account
create or replace function public.licentie_inwisselen(code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  h text;
  r public.licentiecodes;
  n int;
  bestaat boolean;
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  select count(*) into n from public.licentie_pogingen where user_id = uid and op > now() - interval '1 hour';
  if n >= 10 then return jsonb_build_object('ok', false, 'reden', 'te_vaak'); end if;
  h := public.licentie_hash(code);
  -- in één stap: alleen een ongebruikte code wordt van deze gebruiker
  update public.licentiecodes set gebruikt_door = uid, gebruikt_op = now()
   where code_hash = h and gebruikt_op is null
   returning * into r;
  if not found then
    select * into r from public.licentiecodes where code_hash = h;
    bestaat := found;
    if not (bestaat and r.gebruikt_door = uid) then
      insert into public.licentie_pogingen (user_id) values (uid);
      return jsonb_build_object('ok', false, 'reden', case when bestaat then 'gebruikt' else 'onbekend' end);
    end if;
  end if;
  insert into public.licenties (user_id, lic, code_hash) values (uid, r.lic, h)
    on conflict (user_id) do update set lic = excluded.lic, code_hash = excluded.code_hash, actief = true, sinds = now();
  return jsonb_build_object('ok', true, 'lic', r.lic);
end;
$$;

-- licentie van dit account loskoppelen (de code blijft van deze gebruiker en kan door hem opnieuw worden ingevuld)
create or replace function public.licentie_loskoppelen()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  update public.licenties set actief = false where user_id = uid;
  return jsonb_build_object('ok', true);
end;
$$;

-- PROEF: nagebootst abonnement starten of opzeggen (geen echte betaling)
create or replace function public.proef_abonnement(actie text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  if actie = 'start' then
    insert into public.abonnementen (user_id, status, start, tot, bron)
      values (uid, 'actief', now(), now() + interval '1 month', 'nagebootst')
    on conflict (user_id) do update
      set status = 'actief',
          start = case when public.abonnementen.tot > now() then public.abonnementen.start else now() end,
          tot = case when public.abonnementen.tot > now() then public.abonnementen.tot else now() + interval '1 month' end,
          bron = 'nagebootst', bijgewerkt = now();
  elsif actie = 'opzeggen' then
    update public.abonnementen set status = 'opgezegd', bijgewerkt = now() where user_id = uid;
  else
    raise exception 'onbekende actie';
  end if;
  return public.mijn_rechten();
end;
$$;

-- BEHEER: nieuwe codes maken. Niet aan te roepen vanuit de app.
create or replace function public.licentiecodes_maken(lic text, aantal int default 1, notitie text default null)
returns table (code text) language plpgsql security definer set search_path = '' as $$
declare
  abc constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  b bytea; c text; i int; k int;
begin
  if lic !~ '^[a-z0-9]{2,20}$' then raise exception 'licentie-id: kleine letters en cijfers'; end if;
  if aantal < 1 or aantal > 500 then raise exception 'aantal: 1 tot 500'; end if;
  for i in 1..aantal loop
    loop
      b := extensions.gen_random_bytes(12);
      c := upper(lic) || '-';
      for k in 0..11 loop
        c := c || substr(abc, (get_byte(b, k) % 32) + 1, 1);
        if k in (3, 7) then c := c || '-'; end if;
      end loop;
      exit when not exists (select 1 from public.licentiecodes where code_hash = public.licentie_hash(c));
    end loop;
    insert into public.licentiecodes (code_hash, lic, hint, notitie) values (public.licentie_hash(c), lic, right(c, 4), notitie);
    code := c;
    return next;
  end loop;
end;
$$;

revoke all on function public.licentie_hash(text) from public, anon, authenticated;
revoke all on function public.mijn_rechten() from public, anon;
revoke all on function public.licentie_inwisselen(text) from public, anon;
revoke all on function public.licentie_loskoppelen() from public, anon;
revoke all on function public.proef_abonnement(text) from public, anon;
revoke all on function public.licentiecodes_maken(text, int, text) from public, anon, authenticated;
grant execute on function public.mijn_rechten() to authenticated;
grant execute on function public.licentie_inwisselen(text) to authenticated;
grant execute on function public.licentie_loskoppelen() to authenticated;
grant execute on function public.proef_abonnement(text) to authenticated;
