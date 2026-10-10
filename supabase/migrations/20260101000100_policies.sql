-- ═══════════════════════════════════════════════════════════════
-- Políticas RLS: visitantes leem apenas conteúdo publicado;
-- somente administradores alteram dados e leem solicitações.
-- ═══════════════════════════════════════════════════════════════
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.team_members enable row level security;
alter table public.articles enable row level security;
alter table public.quote_requests enable row level security;

-- admins: cada usuário enxerga apenas o próprio registro. Inclusões são feitas via SQL (painel do Supabase).
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins for select to authenticated using (user_id = auth.uid());

-- Conteúdo público
drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings for select using (true);
drop policy if exists "settings_admin_write" on public.site_settings;
create policy "settings_admin_write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories_public_read" on public.service_categories;
create policy "categories_public_read" on public.service_categories for select using (true);
drop policy if exists "categories_admin_write" on public.service_categories;
create policy "categories_admin_write" on public.service_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "services_public_read" on public.services;
create policy "services_public_read" on public.services for select using (is_active or public.is_admin());
drop policy if exists "services_admin_write" on public.services;
create policy "services_admin_write" on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects for select using (is_published or public.is_admin());
drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "team_public_read" on public.team_members;
create policy "team_public_read" on public.team_members for select using (is_active or public.is_admin());
drop policy if exists "team_admin_write" on public.team_members;
create policy "team_admin_write" on public.team_members for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles for select using (is_published or public.is_admin());
drop policy if exists "articles_admin_write" on public.articles;
create policy "articles_admin_write" on public.articles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Solicitações: NENHUMA política de insert para anon. A inclusão acontece
-- exclusivamente pela função submit_quote_request (validação + limite).
drop policy if exists "quotes_admin_read" on public.quote_requests;
create policy "quotes_admin_read" on public.quote_requests for select to authenticated using (public.is_admin());
drop policy if exists "quotes_admin_update" on public.quote_requests;
create policy "quotes_admin_update" on public.quote_requests for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "quotes_admin_delete" on public.quote_requests;
create policy "quotes_admin_delete" on public.quote_requests for delete to authenticated using (public.is_admin());

-- ── Envio de solicitação com validação e limite de envios ─────────
create or replace function public.submit_quote_request(
  p_name text,
  p_company text,
  p_email text,
  p_phone text,
  p_service_id text,
  p_service_name text,
  p_message text,
  p_consent_privacy boolean,
  p_consent_marketing boolean,
  p_fingerprint text default null,
  p_source text default 'site'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_email text := lower(trim(coalesce(p_email, '')));
  v_service_id text := nullif(trim(coalesce(p_service_id, '')), '');
begin
  if char_length(trim(coalesce(p_name, ''))) not between 3 and 120 then raise exception 'invalid_name'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(v_email) > 160 then raise exception 'invalid_email'; end if;
  if char_length(trim(coalesce(p_message, ''))) not between 20 and 3000 then raise exception 'invalid_message'; end if;
  if char_length(coalesce(p_company, '')) > 120 or char_length(coalesce(p_phone, '')) > 20 then raise exception 'invalid_field'; end if;
  if coalesce(p_consent_privacy, false) is not true then raise exception 'consent_required'; end if;

  -- Limites: 3 por e-mail/hora, 5 por origem/hora, 100 no total/hora.
  if (select count(*) from quote_requests where lower(email) = v_email and created_at > now() - interval '1 hour') >= 3
     or (p_fingerprint is not null and (select count(*) from quote_requests where fingerprint = p_fingerprint and created_at > now() - interval '1 hour') >= 5)
     or (select count(*) from quote_requests where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'rate_limited';
  end if;

  if v_service_id is not null and not exists (select 1 from services where id = v_service_id and is_active) then
    v_service_id := null;
  end if;

  insert into quote_requests (name, company, email, phone, service_id, service_name, message,
                              consent_privacy, consent_marketing, fingerprint, source)
  values (trim(p_name), nullif(trim(coalesce(p_company, '')), ''), v_email, nullif(trim(coalesce(p_phone, '')), ''),
          v_service_id, left(nullif(trim(coalesce(p_service_name, '')), ''), 160), trim(p_message),
          true, coalesce(p_consent_marketing, false), left(p_fingerprint, 128), left(coalesce(p_source, 'site'), 40))
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_quote_request(text, text, text, text, text, text, text, boolean, boolean, text, text) from public;
grant execute on function public.submit_quote_request(text, text, text, text, text, text, text, boolean, boolean, text, text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
