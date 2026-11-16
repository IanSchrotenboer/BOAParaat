-- klascode_inwisselen met de verwachte soort code: in de docentenomgeving alleen docentcodes, zodat een docent
-- niet per ongeluk een leerlingcode opmaakt (die blijft dan ongebruikt).
drop function if exists public.klascode_inwisselen(text);
create or replace function public.klascode_inwisselen(code text, verwacht text default null)
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
  -- verkeerde soort code (bijvoorbeeld een leerlingcode in de docentenomgeving): niets veranderen
  if verwacht is not null and exists (select 1 from public.klascodes c where c.code_hash = h and c.rol <> verwacht) then
    return jsonb_build_object('ok', false, 'reden', 'soort', 'rol', (select c.rol from public.klascodes c where c.code_hash = h));
  end if;
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
revoke all on function public.klascode_inwisselen(text, text) from public, anon;
grant execute on function public.klascode_inwisselen(text, text) to authenticated;
