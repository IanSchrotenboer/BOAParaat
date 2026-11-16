-- Klassen en docenten.
-- De beheerder maakt een klas aan met leerlingcodes en één docentcode. Een leerling vult zijn code in de app in en
-- komt in de klas; een docent vult de docentcode in op app.boaparaat.nl/docent en ziet dan de oefenresultaten van
-- de leerlingen in die klas. Alle tabellen hebben row level security zonder regels: alleen de functies hieronder
-- (security definer) lezen en schrijven ze, en die controleren steeds wie de vraag stelt.

create table if not exists public.klassen (
  id uuid primary key default gen_random_uuid(),
  naam text not null check (char_length(naam) between 2 and 80),
  start text check (start is null or char_length(start) <= 40),
  aangemaakt timestamptz not null default now(),
  aangemaakt_door uuid references auth.users (id) on delete set null
);

create table if not exists public.klascodes (
  code_hash text primary key,
  klas_id uuid not null references public.klassen (id) on delete cascade,
  rol text not null check (rol in ('leerling', 'docent')),
  hint text not null,
  aangemaakt timestamptz not null default now(),
  gebruikt_door uuid references auth.users (id) on delete set null,
  gebruikt_op timestamptz
);
create index if not exists klascodes_klas on public.klascodes (klas_id);

create table if not exists public.klas_leden (
  klas_id uuid not null references public.klassen (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  rol text not null check (rol in ('leerling', 'docent')),
  sinds timestamptz not null default now(),
  primary key (klas_id, user_id)
);
create index if not exists klas_leden_user on public.klas_leden (user_id);

create table if not exists public.beheerders (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.klassen enable row level security;
alter table public.klascodes enable row level security;
alter table public.klas_leden enable row level security;
alter table public.beheerders enable row level security;
revoke all on public.klassen, public.klascodes, public.klas_leden, public.beheerders from anon, authenticated;

-- naam zoals de docent hem ziet: uit het profiel in de app, anders van Google, anders het begin van het e-mailadres
create or replace function public.klas_naam_van(uid uuid)
returns text language sql stable security definer set search_path = '' as $$
  select coalesce(
    nullif(btrim((select v.data -> 'p' ->> 'naam' from public.voortgang v where v.user_id = uid)), ''),
    nullif(btrim((select coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name') from auth.users u where u.id = uid)), ''),
    (select split_part(u.email, '@', 1) from auth.users u where u.id = uid),
    'Onbekend')
$$;

-- leerling- of docentcode inwisselen (maximaal 10 mislukte pogingen per uur, net als licentiecodes)
create or replace function public.klascode_inwisselen(code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  h text;
  r public.klascodes;
  k public.klassen;
  n int;
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  select count(*) into n from public.licentie_pogingen where user_id = uid and op > now() - interval '1 hour';
  if n >= 10 then return jsonb_build_object('ok', false, 'reden', 'te_vaak'); end if;
  h := public.licentie_hash(code);
  update public.klascodes set gebruikt_door = uid, gebruikt_op = now()
   where code_hash = h and gebruikt_op is null
   returning * into r;
  if not found then
    select * into r from public.klascodes where code_hash = h;
    if not found or r.gebruikt_door is distinct from uid then
      insert into public.licentie_pogingen (user_id) values (uid);
      return jsonb_build_object('ok', false, 'reden', case when r.code_hash is not null then 'gebruikt' else 'onbekend' end);
    end if;
  end if;
  insert into public.klas_leden (klas_id, user_id, rol) values (r.klas_id, uid, r.rol)
    on conflict (klas_id, user_id) do update set rol = case when public.klas_leden.rol = 'docent' then 'docent' else excluded.rol end;
  select * into k from public.klassen where id = r.klas_id;
  return jsonb_build_object('ok', true, 'rol', r.rol, 'klas', jsonb_build_object('id', k.id, 'naam', k.naam, 'start', k.start));
end;
$$;

-- de klassen van de ingelogde gebruiker (als leerling en als docent), met de docenten erbij
create or replace function public.mijn_klassen()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', k.id, 'naam', k.naam, 'start', k.start, 'rol', l.rol,
      'docenten', (select coalesce(jsonb_agg(public.klas_naam_van(d.user_id) order by d.sinds), '[]'::jsonb)
                     from public.klas_leden d where d.klas_id = k.id and d.rol = 'docent'),
      'leerlingen', case when l.rol = 'docent' then (select count(*) from public.klas_leden x where x.klas_id = k.id and x.rol = 'leerling') end
    ) order by k.aangemaakt desc)
    from public.klas_leden l join public.klassen k on k.id = l.klas_id where l.user_id = uid), '[]'::jsonb);
end;
$$;

-- een klas verlaten (leerling) of uit je lijst halen (docent)
create or replace function public.klas_verlaten(klas uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  delete from public.klas_leden where klas_id = klas and user_id = uid;
  return jsonb_build_object('ok', true);
end;
$$;

-- alles wat een docent van één klas mag zien: per leerling de naam, het e-mailadres en de oefenresultaten
-- (per vraag, de oefensessies en examens, de casussen en gesprekken, de oefendagen); geen andere profielgegevens
create or replace function public.docent_klas(klas uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := auth.uid(); k public.klassen;
begin
  if uid is null then raise exception 'niet ingelogd' using errcode = '28000'; end if;
  if not exists (select 1 from public.klas_leden where klas_id = klas and user_id = uid and rol = 'docent') then
    raise exception 'geen docent van deze klas' using errcode = '42501';
  end if;
  select * into k from public.klassen where id = klas;
  return jsonb_build_object(
    'klas', jsonb_build_object('id', k.id, 'naam', k.naam, 'start', k.start),
    'leerlingen', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', l.user_id,
        'naam', public.klas_naam_van(l.user_id),
        'email', (select u.email from auth.users u where u.id = l.user_id),
        'sinds', l.sinds,
        'bijgewerkt', v.bijgewerkt,
        's', coalesce(v.data -> 's', '{}'::jsonb),
        'h', coalesce(v.data -> 'h', '[]'::jsonb),
        'k', coalesce(v.data -> 'k', '[]'::jsonb),
        'd', coalesce(v.data -> 'd', '{}'::jsonb)
      ) order by public.klas_naam_van(l.user_id))
      from public.klas_leden l left join public.voortgang v on v.user_id = l.user_id
      where l.klas_id = klas and l.rol = 'leerling'), '[]'::jsonb),
    'codes', jsonb_build_object(
      'leerling', (select count(*) from public.klascodes c where c.klas_id = klas and c.rol = 'leerling'),
      'gebruikt', (select count(*) from public.klascodes c where c.klas_id = klas and c.rol = 'leerling' and c.gebruikt_op is not null)));
end;
$$;

-- ----- beheer (alleen voor wie in public.beheerders staat) -----
create or replace function public.ben_ik_beheerder()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.beheerders where user_id = auth.uid())
$$;

create or replace function public.klascode_nieuw(klas uuid, rol text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  abc constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  b bytea; c text; i int;
begin
  loop
    b := extensions.gen_random_bytes(8);
    c := case when rol = 'docent' then 'DOC-' else 'KLAS-' end;
    for i in 0..7 loop
      c := c || substr(abc, (get_byte(b, i) % 32) + 1, 1);
      if i = 3 then c := c || '-'; end if;
    end loop;
    exit when not exists (select 1 from public.klascodes where code_hash = public.licentie_hash(c))
          and not exists (select 1 from public.licentiecodes where code_hash = public.licentie_hash(c));
  end loop;
  insert into public.klascodes (code_hash, klas_id, rol, hint) values (public.licentie_hash(c), klas, rol, right(c, 4));
  return c;
end;
$$;
revoke all on function public.klascode_nieuw(uuid, text) from public, anon, authenticated;

-- nieuwe klas met leerlingcodes en één docentcode; de codes zijn alleen nu te zien (de database bewaart een controlegetal)
create or replace function public.beheer_klas_maken(naam text, start text, aantal int)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare k uuid; codes jsonb := '[]'::jsonb; doc text; i int;
begin
  if not public.ben_ik_beheerder() then raise exception 'alleen voor de beheerder' using errcode = '42501'; end if;
  if aantal < 1 or aantal > 60 then raise exception 'aantal leerlingen: 1 tot 60'; end if;
  insert into public.klassen (naam, start, aangemaakt_door) values (btrim(naam), nullif(btrim(start), ''), auth.uid()) returning id into k;
  for i in 1..aantal loop codes := codes || to_jsonb(public.klascode_nieuw(k, 'leerling')); end loop;
  doc := public.klascode_nieuw(k, 'docent');
  return jsonb_build_object('id', k, 'naam', btrim(naam), 'docent', doc, 'leerlingen', codes);
end;
$$;

-- extra codes voor een bestaande klas (meer leerlingen, of een tweede docent)
create or replace function public.beheer_codes_erbij(klas uuid, rol text, aantal int)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare codes jsonb := '[]'::jsonb; i int;
begin
  if not public.ben_ik_beheerder() then raise exception 'alleen voor de beheerder' using errcode = '42501'; end if;
  if rol not in ('leerling', 'docent') then raise exception 'rol: leerling of docent'; end if;
  if aantal < 1 or aantal > 60 then raise exception 'aantal: 1 tot 60'; end if;
  if not exists (select 1 from public.klassen where id = klas) then raise exception 'onbekende klas'; end if;
  for i in 1..aantal loop codes := codes || to_jsonb(public.klascode_nieuw(klas, rol)); end loop;
  return jsonb_build_object('rol', rol, 'codes', codes);
end;
$$;

create or replace function public.beheer_klassen()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.ben_ik_beheerder() then raise exception 'alleen voor de beheerder' using errcode = '42501'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', k.id, 'naam', k.naam, 'start', k.start, 'aangemaakt', k.aangemaakt,
      'leerlingcodes', (select count(*) from public.klascodes c where c.klas_id = k.id and c.rol = 'leerling'),
      'leerlingcodes_gebruikt', (select count(*) from public.klascodes c where c.klas_id = k.id and c.rol = 'leerling' and c.gebruikt_op is not null),
      'docenten', (select coalesce(jsonb_agg(public.klas_naam_van(d.user_id)), '[]'::jsonb) from public.klas_leden d where d.klas_id = k.id and d.rol = 'docent'),
      'docentcode_open', exists (select 1 from public.klascodes c where c.klas_id = k.id and c.rol = 'docent' and c.gebruikt_op is null)
    ) order by k.aangemaakt desc) from public.klassen k), '[]'::jsonb);
end;
$$;

create or replace function public.beheer_klas_verwijderen(klas uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if not public.ben_ik_beheerder() then raise exception 'alleen voor de beheerder' using errcode = '42501'; end if;
  delete from public.klassen where id = klas;
  return jsonb_build_object('ok', true);
end;
$$;

-- alleen ingelogde gebruikers mogen de functies aanroepen (de functies controleren zelf de rol)
revoke all on function public.klas_naam_van(uuid) from public, anon, authenticated;
do $$
declare f text;
begin
  foreach f in array array['klascode_inwisselen(text)', 'mijn_klassen()', 'klas_verlaten(uuid)', 'docent_klas(uuid)',
                           'ben_ik_beheerder()', 'beheer_klas_maken(text, text, integer)', 'beheer_codes_erbij(uuid, text, integer)',
                           'beheer_klassen()', 'beheer_klas_verwijderen(uuid)'] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
