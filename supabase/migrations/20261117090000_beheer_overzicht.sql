-- Beheeroverzicht: wie de app gebruikt, waar ze mee bezig zijn en welke codes er zijn uitgegeven.
-- Te zien op app.boaparaat.nl/beheer (de docentenomgeving, onderdeel Overzicht) en via Profiel in de app.
-- Alleen voor wie in public.beheerders staat: de functie controleert dat zelf, net als de andere beheerfuncties.
-- Van codes komen alleen de laatste vier tekens mee; de database kent de volledige codes niet.

create or replace function public.beheer_overzicht()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  vandaag date := (now() at time zone 'Europe/Amsterdam')::date;
begin
  if not public.ben_ik_beheerder() then raise exception 'alleen voor de beheerder' using errcode = '42501'; end if;
  return jsonb_build_object(
    'nu', now(),

    'kpi', (select jsonb_build_object(
      'gebruikers', (select count(*) from auth.users),
      'nu_actief', (select count(*) from auth.users u left join public.voortgang v on v.user_id = u.id
                     where greatest(coalesce(v.bijgewerkt, 'epoch'), coalesce(u.last_sign_in_at, 'epoch')) > now() - interval '15 minutes'),
      'actief_vandaag', (select count(*) from auth.users u left join public.voortgang v on v.user_id = u.id
                     where (greatest(coalesce(v.bijgewerkt, 'epoch'), coalesce(u.last_sign_in_at, 'epoch')) at time zone 'Europe/Amsterdam')::date = vandaag),
      'actief_7d', (select count(*) from auth.users u left join public.voortgang v on v.user_id = u.id
                     where greatest(coalesce(v.bijgewerkt, 'epoch'), coalesce(u.last_sign_in_at, 'epoch')) > now() - interval '7 days'),
      'nieuw_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
      'klassen', (select count(*) from public.klassen),
      'leerlingcodes', (select count(*) from public.klascodes where rol = 'leerling'),
      'leerlingcodes_gebruikt', (select count(*) from public.klascodes where rol = 'leerling' and gebruikt_op is not null),
      'docentcodes', (select count(*) from public.klascodes where rol = 'docent'),
      'docentcodes_gebruikt', (select count(*) from public.klascodes where rol = 'docent' and gebruikt_op is not null),
      'licentiecodes', (select count(*) from public.licentiecodes),
      'licentiecodes_gebruikt', (select count(*) from public.licentiecodes where gebruikt_op is not null))),

    -- per dag (laatste 30 dagen): hoeveel mensen actief waren en hoeveel vragen ze beantwoordden
    'activiteit', (with dagen as (select generate_series(vandaag - 29, vandaag, '1 day')::date as dag),
      s as (select v.user_id, (to_timestamp((x.value ->> 3)::bigint / 1000) at time zone 'Europe/Amsterdam')::date as dag
            from public.voortgang v, jsonb_each(coalesce(v.data -> 's', '{}'::jsonb)) x
            where jsonb_typeof(x.value) = 'array' and (x.value ->> 3) ~ '^\d+$'),
      d as (select v.user_id, x.key::date as dag, (case when jsonb_typeof(x.value) = 'number' then x.value::text::numeric else 0 end) as n
            from public.voortgang v, jsonb_each(coalesce(v.data -> 'd', '{}'::jsonb)) x where x.key ~ '^\d{4}-\d{2}-\d{2}$'),
      act as (select user_id, dag from s union select user_id, dag from d
              union select user_id, (bijgewerkt at time zone 'Europe/Amsterdam')::date from public.voortgang
              union select id, (last_sign_in_at at time zone 'Europe/Amsterdam')::date from auth.users where last_sign_in_at is not null)
      select coalesce(jsonb_agg(jsonb_build_object(
        'dag', to_char(dagen.dag, 'YYYY-MM-DD'),
        'gebruikers', (select count(distinct a.user_id) from act a where a.dag = dagen.dag),
        'vragen', greatest(coalesce((select sum(n) from d where d.dag = dagen.dag), 0), (select count(*) from s where s.dag = dagen.dag))
      ) order by dagen.dag), '[]'::jsonb) from dagen),

    -- oefensessies per module of vak (laatste 30 dagen)
    'modules', (select coalesce(jsonb_agg(r order by (r ->> 'sessies')::int desc), '[]'::jsonb) from (
      select jsonb_build_object('module', coalesce(e ->> 'm', '?'), 'sessies', count(*), 'gebruikers', count(distinct v.user_id),
        'gem_score', round(100 * avg(case when (e ->> 'n')::numeric > 0 then (e ->> 'g')::numeric / (e ->> 'n')::numeric end))) as r
      from public.voortgang v, jsonb_array_elements(coalesce(v.data -> 'h', '[]'::jsonb)) e
      where (e ->> 'd') ~ '^\d+$' and (e ->> 'n') ~ '^\d+$' and (e ->> 'g') ~ '^\d+$'
        and to_timestamp((e ->> 'd')::bigint / 1000) > now() - interval '30 days'
      group by coalesce(e ->> 'm', '?')) x),

    -- alle gebruikers, wie het laatst actief was bovenaan
    'gebruikers', (select coalesce(jsonb_agg(r order by (r ->> 'laatst') desc nulls last), '[]'::jsonb) from (
      select jsonb_build_object(
        'naam', public.klas_naam_van(u.id),
        'email', u.email,
        'inlog', coalesce(u.raw_app_meta_data ->> 'provider', ''),
        'rol', case when v.data -> 'p' ->> 'rol' = 'scholier' or exists (select 1 from public.klas_leden l where l.user_id = u.id and l.rol = 'leerling') then 'scholier'
                    when exists (select 1 from public.klas_leden l where l.user_id = u.id and l.rol = 'docent') then 'docent'
                    when v.data -> 'p' ->> 'rol' = 'werkend' then 'werkend' else '' end,
        'domein', coalesce(v.data -> 'p' ->> 'dom', ''),
        'sinds', u.created_at,
        'laatst', nullif(greatest(coalesce(v.bijgewerkt, 'epoch'), coalesce(u.last_sign_in_at, 'epoch')), 'epoch'),
        'vragen', (select count(*) from jsonb_each(coalesce(v.data -> 's', '{}'::jsonb)) x where jsonb_typeof(x.value) = 'array'),
        'pct_goed', (select case when sum((x.value ->> 0)::numeric) > 0 then round(100 * sum((x.value ->> 1)::numeric) / sum((x.value ->> 0)::numeric)) end
                     from jsonb_each(coalesce(v.data -> 's', '{}'::jsonb)) x
                     where jsonb_typeof(x.value) = 'array' and (x.value ->> 0) ~ '^\d+$' and (x.value ->> 1) ~ '^\d+$'),
        'week', (select coalesce(sum(case when jsonb_typeof(x.value) = 'number' then x.value::text::numeric else 0 end), 0)
                 from jsonb_each(coalesce(v.data -> 'd', '{}'::jsonb)) x where x.key ~ '^\d{4}-\d{2}-\d{2}$' and x.key::date > vandaag - 7),
        'examens', (select count(*) from jsonb_array_elements(coalesce(v.data -> 'h', '[]'::jsonb)) e where e ->> 'k' = 'examen'),
        'bezig', case when jsonb_typeof(v.data -> 'h' -> 0) = 'object' then jsonb_build_object(
                   't', left(v.data -> 'h' -> 0 ->> 't', 80), 'm', v.data -> 'h' -> 0 ->> 'm', 'k', v.data -> 'h' -> 0 ->> 'k',
                   'd', case when (v.data -> 'h' -> 0 ->> 'd') ~ '^\d+$' then (v.data -> 'h' -> 0 ->> 'd')::bigint end,
                   'g', v.data -> 'h' -> 0 -> 'g', 'n', v.data -> 'h' -> 0 -> 'n') end,
        'klas', coalesce((select string_agg(k.naam, ', ' order by k.naam) from public.klas_leden l join public.klassen k on k.id = l.klas_id where l.user_id = u.id), ''),
        'licentie', coalesce((select string_agg(upper(li.lic), ', ') from public.licenties li where li.user_id = u.id and li.actief), ''),
        'versie', coalesce(v.app_versie, '')) as r
      from auth.users u left join public.voortgang v on v.user_id = u.id) x),

    -- uitgegeven codes: docentcodes (opleiders), leerlingcodes (studenten) en licentiecodes (organisaties)
    'codes', (select coalesce(jsonb_agg(r order by r ->> 'aangemaakt' desc, r ->> 'soort'), '[]'::jsonb) from (
      select jsonb_build_object('soort', c.rol, 'aan', k.naam, 'hint', c.hint, 'aangemaakt', c.aangemaakt, 'gebruikt_op', c.gebruikt_op,
        'door', case when c.gebruikt_door is not null then public.klas_naam_van(c.gebruikt_door) else '' end,
        'email', coalesce(u.email, '')) as r
      from public.klascodes c join public.klassen k on k.id = c.klas_id left join auth.users u on u.id = c.gebruikt_door
      union all
      select jsonb_build_object('soort', 'licentie', 'aan', upper(l.lic) || coalesce(' · ' || l.notitie, ''), 'hint', l.hint, 'aangemaakt', l.aangemaakt, 'gebruikt_op', l.gebruikt_op,
        'door', case when l.gebruikt_door is not null then public.klas_naam_van(l.gebruikt_door) else '' end,
        'email', coalesce(u.email, ''))
      from public.licentiecodes l left join auth.users u on u.id = l.gebruikt_door) x),

    'klassen', (select coalesce(jsonb_agg(jsonb_build_object(
        'naam', k.naam, 'start', coalesce(k.start, ''), 'aangemaakt', k.aangemaakt,
        'leerlingcodes', (select count(*) from public.klascodes c where c.klas_id = k.id and c.rol = 'leerling'),
        'leerlingcodes_gebruikt', (select count(*) from public.klascodes c where c.klas_id = k.id and c.rol = 'leerling' and c.gebruikt_op is not null),
        'leerlingen', (select count(*) from public.klas_leden l where l.klas_id = k.id and l.rol = 'leerling'),
        'actief_7d', (select count(*) from public.klas_leden l join public.voortgang v on v.user_id = l.user_id
                      where l.klas_id = k.id and l.rol = 'leerling' and v.bijgewerkt > now() - interval '7 days'),
        'docenten', (select coalesce(jsonb_agg(public.klas_naam_van(l.user_id)), '[]'::jsonb) from public.klas_leden l where l.klas_id = k.id and l.rol = 'docent')
      ) order by k.aangemaakt desc), '[]'::jsonb) from public.klassen k));
end;
$$;

revoke all on function public.beheer_overzicht() from public, anon;
grant execute on function public.beheer_overzicht() to authenticated;
