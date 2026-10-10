-- ═══════════════════════════════════════════════════════════════
-- MJ Gestão & Ambiental — INSTALAÇÃO COMPLETA DO BANCO (gerado automaticamente)
-- Cole TODO este arquivo no Supabase → SQL Editor → New query → Run.
-- Pode ser executado mais de uma vez com segurança.
-- ═══════════════════════════════════════════════════════════════

-- ▼▼▼ 20260101000000_schema.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════
-- MJ Gestão & Ambiental — esquema do banco de dados
-- ═══════════════════════════════════════════════════════════════
create extension if not exists pgcrypto;

-- Administradores: usuários do Supabase Auth autorizados a usar o /admin.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Atualização automática de updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Configurações do site (linha única)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.service_categories (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  name text not null check (char_length(name) between 2 and 120),
  description text not null default '',
  icon text not null default 'leaf',
  sort_order int not null default 0
);

create table if not exists public.services (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  category_id text not null references public.service_categories (id) on delete restrict,
  name text not null check (char_length(name) between 2 and 160),
  summary text not null default '',
  description text not null default '',
  icon text not null default 'leaf',
  image_url text,
  benefits text[] not null default '{}',
  steps text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'approved')),
  is_active boolean not null default true,
  sort_order int not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  title text not null check (char_length(title) between 2 and 200),
  client_name text,
  client_authorized boolean not null default false,
  category_id text references public.service_categories (id) on delete set null,
  description text not null default '',
  problem text not null default '',
  solution text not null default '',
  results text not null default '',
  images text[] not null default '{}',
  executed_at date,
  status text not null default 'concluido' check (status in ('planejado', 'em_andamento', 'concluido')),
  is_featured boolean not null default false,
  is_published boolean not null default false,
  is_illustrative boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- O nome do cliente só pode ser publicado com autorização registrada.
  constraint client_name_requires_authorization check (client_name is null or client_authorized)
);

create table if not exists public.team_members (
  id text primary key default gen_random_uuid()::text,
  name text not null check (char_length(name) between 2 and 160),
  role text not null default '',
  bio text not null default '',
  credentials text,
  photo_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  title text not null check (char_length(title) between 2 and 200),
  excerpt text not null default '',
  content text not null default '',
  image_url text,
  is_published boolean not null default false,
  published_at timestamptz,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  service_id text references public.services (id) on delete set null,
  service_name text,
  message text not null,
  consent_privacy boolean not null,
  consent_marketing boolean not null default false,
  status text not null default 'novo' check (status in ('novo', 'em_atendimento', 'proposta_enviada', 'concluido')),
  internal_notes text,
  source text not null default 'site',
  fingerprint text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quote_requests_created_at_idx on public.quote_requests (created_at desc);
create index if not exists quote_requests_email_idx on public.quote_requests (lower(email), created_at desc);
create index if not exists quote_requests_fingerprint_idx on public.quote_requests (fingerprint, created_at desc);
create index if not exists services_category_idx on public.services (category_id, sort_order);

do $$
declare t text;
begin
  foreach t in array array['site_settings', 'services', 'projects', 'team_members', 'articles', 'quote_requests'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

insert into public.site_settings (id, data) values (1, '{}'::jsonb) on conflict (id) do nothing;

-- ▼▼▼ 20260101000100_policies.sql ▼▼▼
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

-- ▼▼▼ 20260101000200_storage.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════
-- Supabase Storage: bucket público "media" para imagens do site.
-- Leitura pública; envio/alteração/exclusão apenas por administradores.
-- ═══════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ▼▼▼ seed.sql ▼▼▼
-- ═══════════════════════════════════════════════════════════════
-- DADOS DE DEMONSTRAÇÃO (gerado por scripts/generate-seed-sql.ts)
-- Serviços em RASCUNHO e projetos ILUSTRATIVOS (is_demo = true).
-- Para remover: painel /admin → Configurações → "Remover dados de demonstração"
-- ou: delete from projects where is_demo; delete from articles where is_demo; delete from services where is_demo;
-- ═══════════════════════════════════════════════════════════════

insert into public.service_categories (id, slug, name, description, icon, sort_order) values
  ('cat-gestao-empresarial', 'gestao-empresarial', 'Gestão Empresarial', 'Organização administrativa, planejamento e melhoria de processos para empresas mais eficientes.', 'briefcase', 1),
  ('cat-gestao-ambiental', 'gestao-ambiental', 'Gestão Ambiental', 'Planejamento e boas práticas ambientais integradas à rotina e à estratégia da empresa.', 'leaf', 2),
  ('cat-sustentabilidade-esg', 'sustentabilidade-esg', 'Sustentabilidade e ESG', 'Diagnóstico, planejamento e indicadores para uma atuação socioambiental responsável.', 'sprout', 3),
  ('cat-assessoria-regularizacao', 'assessoria-regularizacao', 'Assessoria e Regularização', 'Apoio na organização documental e no acompanhamento administrativo de demandas.', 'files', 4)
on conflict (id) do nothing;

insert into public.services (id, slug, category_id, name, summary, description, icon, image_url, benefits, steps, status, is_active, sort_order, is_demo) values
  ('srv-consultoria-administrativa', 'consultoria-administrativa', 'cat-gestao-empresarial', 'Consultoria administrativa', 'Análise e orientação sobre a rotina administrativa para ganhar organização, controle e eficiência.', 'Análise e orientação sobre a rotina administrativa para ganhar organização, controle e eficiência. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'briefcase', null, array['Rotinas mais organizadas', 'Maior controle gerencial', 'Decisões baseadas em informação']::text[], array['Reunião inicial para entender o contexto e os objetivos da empresa.', 'Levantamento de informações, processos e rotinas atuais.', 'Elaboração de diagnóstico e plano de ação com prioridades.', 'Apoio na implantação e acompanhamento dos resultados.']::text[], 'draft', true, 1, true),
  ('srv-planejamento-estrategico', 'planejamento-estrategico', 'cat-gestao-empresarial', 'Planejamento estratégico', 'Definição de objetivos, metas e ações para orientar o crescimento da empresa com clareza.', 'Definição de objetivos, metas e ações para orientar o crescimento da empresa com clareza. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'target', null, array['Direcionamento claro', 'Equipe alinhada às metas', 'Uso eficiente de recursos']::text[], array['Reunião inicial para entender o contexto e os objetivos da empresa.', 'Levantamento de informações, processos e rotinas atuais.', 'Elaboração de diagnóstico e plano de ação com prioridades.', 'Apoio na implantação e acompanhamento dos resultados.']::text[], 'draft', true, 2, true),
  ('srv-organizacao-de-processos', 'organizacao-de-processos', 'cat-gestao-empresarial', 'Organização de processos', 'Mapeamento e padronização dos processos internos para reduzir retrabalho e falhas.', 'Mapeamento e padronização dos processos internos para reduzir retrabalho e falhas. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'workflow', null, array['Menos retrabalho', 'Padronização de atividades', 'Facilidade no treinamento']::text[], array['Reunião inicial para entender o contexto e os objetivos da empresa.', 'Levantamento de informações, processos e rotinas atuais.', 'Elaboração de diagnóstico e plano de ação com prioridades.', 'Apoio na implantação e acompanhamento dos resultados.']::text[], 'draft', true, 3, true),
  ('srv-gestao-organizacional', 'gestao-organizacional', 'cat-gestao-empresarial', 'Gestão organizacional', 'Apoio na estruturação de áreas, responsabilidades e fluxos de comunicação.', 'Apoio na estruturação de áreas, responsabilidades e fluxos de comunicação. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'building-2', null, array['Papéis bem definidos', 'Comunicação mais fluida', 'Estrutura preparada para crescer']::text[], array['Reunião inicial para entender o contexto e os objetivos da empresa.', 'Levantamento de informações, processos e rotinas atuais.', 'Elaboração de diagnóstico e plano de ação com prioridades.', 'Apoio na implantação e acompanhamento dos resultados.']::text[], 'draft', true, 4, true),
  ('srv-assessoria-empresarial', 'assessoria-empresarial', 'cat-gestao-empresarial', 'Assessoria empresarial', 'Acompanhamento contínuo para apoiar a gestão nas decisões do dia a dia.', 'Acompanhamento contínuo para apoiar a gestão nas decisões do dia a dia. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'handshake', null, array['Apoio próximo à gestão', 'Visão externa e imparcial', 'Agilidade nas decisões']::text[], array['Reunião inicial para entender o contexto e os objetivos da empresa.', 'Levantamento de informações, processos e rotinas atuais.', 'Elaboração de diagnóstico e plano de ação com prioridades.', 'Apoio na implantação e acompanhamento dos resultados.']::text[], 'draft', true, 5, true),
  ('srv-diagnostico-administrativo', 'diagnostico-administrativo', 'cat-gestao-empresarial', 'Diagnóstico administrativo', 'Avaliação da situação atual da empresa com identificação de pontos fortes e oportunidades.', 'Avaliação da situação atual da empresa com identificação de pontos fortes e oportunidades. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'clipboard-check', null, array['Visão completa do negócio', 'Prioridades bem definidas', 'Base para o planejamento']::text[], array['Reunião inicial para entender o contexto e os objetivos da empresa.', 'Levantamento de informações, processos e rotinas atuais.', 'Elaboração de diagnóstico e plano de ação com prioridades.', 'Apoio na implantação e acompanhamento dos resultados.']::text[], 'draft', true, 6, true),
  ('srv-gestao-de-indicadores', 'gestao-de-indicadores', 'cat-gestao-empresarial', 'Gestão de indicadores', 'Definição e acompanhamento de indicadores de desempenho alinhados aos objetivos.', 'Definição e acompanhamento de indicadores de desempenho alinhados aos objetivos. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'chart-column', null, array['Acompanhamento objetivo', 'Identificação rápida de desvios', 'Cultura orientada a resultados']::text[], array['Reunião inicial para entender o contexto e os objetivos da empresa.', 'Levantamento de informações, processos e rotinas atuais.', 'Elaboração de diagnóstico e plano de ação com prioridades.', 'Apoio na implantação e acompanhamento dos resultados.']::text[], 'draft', true, 7, true),
  ('srv-melhoria-de-processos-internos', 'melhoria-de-processos-internos', 'cat-gestao-empresarial', 'Melhoria de processos internos', 'Revisão de processos existentes com foco em simplificação e produtividade.', 'Revisão de processos existentes com foco em simplificação e produtividade. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'settings-2', null, array['Processos mais simples', 'Ganho de produtividade', 'Redução de custos operacionais']::text[], array['Reunião inicial para entender o contexto e os objetivos da empresa.', 'Levantamento de informações, processos e rotinas atuais.', 'Elaboração de diagnóstico e plano de ação com prioridades.', 'Apoio na implantação e acompanhamento dos resultados.']::text[], 'draft', true, 8, true),
  ('srv-consultoria-em-gestao-ambiental', 'consultoria-em-gestao-ambiental', 'cat-gestao-ambiental', 'Consultoria em gestão ambiental', 'Orientação para integrar a gestão ambiental às rotinas e à estratégia da empresa.', 'Orientação para integrar a gestão ambiental às rotinas e à estratégia da empresa. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'leaf', null, array['Gestão ambiental estruturada', 'Prevenção de riscos', 'Imagem institucional fortalecida']::text[], array['Conversa inicial sobre as atividades e a realidade da empresa.', 'Levantamento de aspectos ambientais e práticas atuais.', 'Proposta de plano de ação ambiental com metas e responsáveis.', 'Acompanhamento periódico e revisão das ações.']::text[], 'draft', true, 1, true),
  ('srv-planejamento-ambiental-empresarial', 'planejamento-ambiental-empresarial', 'cat-gestao-ambiental', 'Planejamento ambiental empresarial', 'Elaboração de planos de ação ambientais com metas, prazos e responsáveis.', 'Elaboração de planos de ação ambientais com metas, prazos e responsáveis. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'map', null, array['Metas ambientais claras', 'Ações organizadas no tempo', 'Integração com o negócio']::text[], array['Conversa inicial sobre as atividades e a realidade da empresa.', 'Levantamento de aspectos ambientais e práticas atuais.', 'Proposta de plano de ação ambiental com metas e responsáveis.', 'Acompanhamento periódico e revisão das ações.']::text[], 'draft', true, 2, true),
  ('srv-gestao-de-residuos-solidos', 'gestao-de-residuos-solidos', 'cat-gestao-ambiental', 'Gestão de resíduos sólidos', 'Apoio na organização da segregação, armazenamento e destinação adequada dos resíduos.', 'Apoio na organização da segregação, armazenamento e destinação adequada dos resíduos. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'recycle', null, array['Redução de desperdícios', 'Destinação adequada', 'Possível redução de custos']::text[], array['Conversa inicial sobre as atividades e a realidade da empresa.', 'Levantamento de aspectos ambientais e práticas atuais.', 'Proposta de plano de ação ambiental com metas e responsáveis.', 'Acompanhamento periódico e revisão das ações.']::text[], 'draft', true, 3, true),
  ('srv-programas-de-sustentabilidade', 'programas-de-sustentabilidade', 'cat-gestao-ambiental', 'Programas de sustentabilidade', 'Estruturação de programas internos voltados a práticas sustentáveis.', 'Estruturação de programas internos voltados a práticas sustentáveis. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'sprout', null, array['Engajamento da equipe', 'Uso consciente de recursos', 'Ações contínuas e mensuráveis']::text[], array['Conversa inicial sobre as atividades e a realidade da empresa.', 'Levantamento de aspectos ambientais e práticas atuais.', 'Proposta de plano de ação ambiental com metas e responsáveis.', 'Acompanhamento periódico e revisão das ações.']::text[], 'draft', true, 4, true),
  ('srv-gestao-de-indicadores-ambientais', 'gestao-de-indicadores-ambientais', 'cat-gestao-ambiental', 'Gestão de indicadores ambientais', 'Definição e monitoramento de indicadores de consumo, resíduos e desempenho ambiental.', 'Definição e monitoramento de indicadores de consumo, resíduos e desempenho ambiental. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'chart-line', null, array['Dados para decisões', 'Acompanhamento de metas', 'Transparência nos resultados']::text[], array['Conversa inicial sobre as atividades e a realidade da empresa.', 'Levantamento de aspectos ambientais e práticas atuais.', 'Proposta de plano de ação ambiental com metas e responsáveis.', 'Acompanhamento periódico e revisão das ações.']::text[], 'draft', true, 5, true),
  ('srv-assessoria-em-processos-de-conformidade-ambiental', 'assessoria-em-processos-de-conformidade-ambiental', 'cat-gestao-ambiental', 'Assessoria em processos de conformidade ambiental', 'Apoio na organização das rotinas internas relacionadas às obrigações ambientais da empresa.', 'Apoio na organização das rotinas internas relacionadas às obrigações ambientais da empresa. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'shield-check', null, array['Rotinas organizadas', 'Prazos acompanhados', 'Menor risco de pendências']::text[], array['Conversa inicial sobre as atividades e a realidade da empresa.', 'Levantamento de aspectos ambientais e práticas atuais.', 'Proposta de plano de ação ambiental com metas e responsáveis.', 'Acompanhamento periódico e revisão das ações.']::text[], 'draft', true, 6, true),
  ('srv-apoio-a-implantacao-de-sistemas-de-gestao-ambiental', 'apoio-a-implantacao-de-sistemas-de-gestao-ambiental', 'cat-gestao-ambiental', 'Apoio à implantação de sistemas de gestão ambiental', 'Suporte na estruturação de procedimentos e registros de um sistema de gestão ambiental.', 'Suporte na estruturação de procedimentos e registros de um sistema de gestão ambiental. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'layers', null, array['Procedimentos documentados', 'Melhoria contínua', 'Preparação para auditorias']::text[], array['Conversa inicial sobre as atividades e a realidade da empresa.', 'Levantamento de aspectos ambientais e práticas atuais.', 'Proposta de plano de ação ambiental com metas e responsáveis.', 'Acompanhamento periódico e revisão das ações.']::text[], 'draft', true, 7, true),
  ('srv-orientacao-empresarial-sobre-boas-praticas-ambientais', 'orientacao-empresarial-sobre-boas-praticas-ambientais', 'cat-gestao-ambiental', 'Orientação empresarial sobre boas práticas ambientais', 'Orientações práticas para gestores e equipes adotarem condutas ambientalmente responsáveis.', 'Orientações práticas para gestores e equipes adotarem condutas ambientalmente responsáveis. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'book-open', null, array['Equipe capacitada', 'Práticas simples e aplicáveis', 'Cultura de responsabilidade']::text[], array['Conversa inicial sobre as atividades e a realidade da empresa.', 'Levantamento de aspectos ambientais e práticas atuais.', 'Proposta de plano de ação ambiental com metas e responsáveis.', 'Acompanhamento periódico e revisão das ações.']::text[], 'draft', true, 8, true),
  ('srv-diagnostico-de-praticas-sustentaveis', 'diagnostico-de-praticas-sustentaveis', 'cat-sustentabilidade-esg', 'Diagnóstico de práticas sustentáveis', 'Levantamento das práticas atuais da empresa sob a ótica da sustentabilidade.', 'Levantamento das práticas atuais da empresa sob a ótica da sustentabilidade. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'search', null, array['Ponto de partida claro', 'Oportunidades identificadas', 'Prioridades realistas']::text[], array['Alinhamento de expectativas e escopo com a liderança.', 'Diagnóstico das práticas ambientais, sociais e de governança.', 'Definição de indicadores, metas e plano de comunicação.', 'Monitoramento e ciclos de melhoria contínua.']::text[], 'draft', true, 1, true),
  ('srv-planejamento-de-sustentabilidade-corporativa', 'planejamento-de-sustentabilidade-corporativa', 'cat-sustentabilidade-esg', 'Planejamento de sustentabilidade corporativa', 'Construção de um plano de sustentabilidade alinhado à estratégia do negócio.', 'Construção de um plano de sustentabilidade alinhado à estratégia do negócio. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'compass', null, array['Estratégia integrada', 'Metas de longo prazo', 'Posicionamento responsável']::text[], array['Alinhamento de expectativas e escopo com a liderança.', 'Diagnóstico das práticas ambientais, sociais e de governança.', 'Definição de indicadores, metas e plano de comunicação.', 'Monitoramento e ciclos de melhoria contínua.']::text[], 'draft', true, 2, true),
  ('srv-gestao-de-indicadores-esg', 'gestao-de-indicadores-esg', 'cat-sustentabilidade-esg', 'Gestão de indicadores ESG', 'Estruturação de indicadores ambientais, sociais e de governança.', 'Estruturação de indicadores ambientais, sociais e de governança. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'gauge', null, array['Informações organizadas', 'Base para relatórios', 'Acompanhamento de evolução']::text[], array['Alinhamento de expectativas e escopo com a liderança.', 'Diagnóstico das práticas ambientais, sociais e de governança.', 'Definição de indicadores, metas e plano de comunicação.', 'Monitoramento e ciclos de melhoria contínua.']::text[], 'draft', true, 3, true),
  ('srv-apoio-a-elaboracao-de-politicas-ambientais', 'apoio-a-elaboracao-de-politicas-ambientais', 'cat-sustentabilidade-esg', 'Apoio à elaboração de políticas ambientais', 'Apoio na redação e revisão de políticas ambientais internas.', 'Apoio na redação e revisão de políticas ambientais internas. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'file-text', null, array['Diretrizes formalizadas', 'Compromisso público', 'Alinhamento interno']::text[], array['Alinhamento de expectativas e escopo com a liderança.', 'Diagnóstico das práticas ambientais, sociais e de governança.', 'Definição de indicadores, metas e plano de comunicação.', 'Monitoramento e ciclos de melhoria contínua.']::text[], 'draft', true, 4, true),
  ('srv-programas-de-conscientizacao-ambiental', 'programas-de-conscientizacao-ambiental', 'cat-sustentabilidade-esg', 'Programas de conscientização ambiental', 'Ações educativas para colaboradores sobre temas ambientais e sustentabilidade.', 'Ações educativas para colaboradores sobre temas ambientais e sustentabilidade. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'users', null, array['Equipe engajada', 'Mudança de hábitos', 'Fortalecimento da cultura']::text[], array['Alinhamento de expectativas e escopo com a liderança.', 'Diagnóstico das práticas ambientais, sociais e de governança.', 'Definição de indicadores, metas e plano de comunicação.', 'Monitoramento e ciclos de melhoria contínua.']::text[], 'draft', true, 5, true),
  ('srv-consultoria-em-responsabilidade-socioambiental', 'consultoria-em-responsabilidade-socioambiental', 'cat-sustentabilidade-esg', 'Consultoria em responsabilidade socioambiental', 'Orientação para iniciativas que conciliam impacto social, ambiental e o negócio.', 'Orientação para iniciativas que conciliam impacto social, ambiental e o negócio. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'heart-handshake', null, array['Relação com a comunidade', 'Reputação fortalecida', 'Impacto positivo planejado']::text[], array['Alinhamento de expectativas e escopo com a liderança.', 'Diagnóstico das práticas ambientais, sociais e de governança.', 'Definição de indicadores, metas e plano de comunicação.', 'Monitoramento e ciclos de melhoria contínua.']::text[], 'draft', true, 6, true),
  ('srv-assessoria-documental-empresarial', 'assessoria-documental-empresarial', 'cat-assessoria-regularizacao', 'Assessoria documental empresarial', 'Organização e controle da documentação empresarial do dia a dia.', 'Organização e controle da documentação empresarial do dia a dia. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'folder-open', null, array['Documentos localizáveis', 'Controle de vencimentos', 'Menos retrabalho']::text[], array['Entendimento da demanda e da documentação existente.', 'Organização e conferência dos documentos administrativos.', 'Elaboração de cronograma e checklist de pendências.', 'Acompanhamento administrativo junto à empresa e aos profissionais habilitados envolvidos.']::text[], 'draft', true, 1, true),
  ('srv-organizacao-de-documentacao-administrativa', 'organizacao-de-documentacao-administrativa', 'cat-assessoria-regularizacao', 'Organização de documentação administrativa', 'Estruturação de arquivos físicos e digitais com critérios claros de organização.', 'Estruturação de arquivos físicos e digitais com critérios claros de organização. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'files', null, array['Arquivo padronizado', 'Acesso rápido à informação', 'Segurança documental']::text[], array['Entendimento da demanda e da documentação existente.', 'Organização e conferência dos documentos administrativos.', 'Elaboração de cronograma e checklist de pendências.', 'Acompanhamento administrativo junto à empresa e aos profissionais habilitados envolvidos.']::text[], 'draft', true, 2, true),
  ('srv-apoio-a-processos-de-regularizacao', 'apoio-a-processos-de-regularizacao', 'cat-assessoria-regularizacao', 'Apoio a processos de regularização', 'Apoio administrativo na organização de etapas e documentos de processos de regularização.', 'Apoio administrativo na organização de etapas e documentos de processos de regularização. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'file-check', null, array['Etapas organizadas', 'Pendências mapeadas', 'Acompanhamento de prazos']::text[], array['Entendimento da demanda e da documentação existente.', 'Organização e conferência dos documentos administrativos.', 'Elaboração de cronograma e checklist de pendências.', 'Acompanhamento administrativo junto à empresa e aos profissionais habilitados envolvidos.']::text[], 'draft', true, 3, true),
  ('srv-acompanhamento-administrativo-de-demandas-ambientais', 'acompanhamento-administrativo-de-demandas-ambientais', 'cat-assessoria-regularizacao', 'Acompanhamento administrativo de demandas ambientais', 'Controle administrativo de prazos, documentos e comunicações de demandas ambientais.', 'Controle administrativo de prazos, documentos e comunicações de demandas ambientais. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'clipboard-check', null, array['Prazos sob controle', 'Histórico organizado', 'Comunicação centralizada']::text[], array['Entendimento da demanda e da documentação existente.', 'Organização e conferência dos documentos administrativos.', 'Elaboração de cronograma e checklist de pendências.', 'Acompanhamento administrativo junto à empresa e aos profissionais habilitados envolvidos.']::text[], 'draft', true, 4, true),
  ('srv-apoio-a-organizacao-de-documentos-para-processos-de-licenciamento', 'apoio-a-organizacao-de-documentos-para-processos-de-licenciamento', 'cat-assessoria-regularizacao', 'Apoio à organização de documentos para processos de licenciamento', 'Apoio na reunião e organização de documentos administrativos solicitados em processos de licenciamento, em conjunto com os profissionais habilitados responsáveis.', 'Apoio na reunião e organização de documentos administrativos solicitados em processos de licenciamento, em conjunto com os profissionais habilitados responsáveis. O escopo, a abrangência e os prazos são definidos após uma conversa inicial, de acordo com a realidade e as necessidades de cada empresa.', 'scale', null, array['Documentação reunida', 'Checklist de pendências', 'Interlocução facilitada']::text[], array['Entendimento da demanda e da documentação existente.', 'Organização e conferência dos documentos administrativos.', 'Elaboração de cronograma e checklist de pendências.', 'Acompanhamento administrativo junto à empresa e aos profissionais habilitados envolvidos.']::text[], 'draft', true, 5, true)
on conflict (id) do nothing;

insert into public.projects (id, slug, title, client_name, client_authorized, category_id, description, problem, solution, results, images, executed_at, status, is_featured, is_published, is_illustrative, is_demo) values
  ('prj-exemplo-processos', 'exemplo-organizacao-de-processos-administrativos', 'Organização de processos administrativos', null, false, 'cat-gestao-empresarial', 'Exemplo ilustrativo criado para demonstrar a apresentação de projetos. Não representa um trabalho realizado nem um cliente real. Cenário: empresa de serviços com rotinas administrativas pouco padronizadas.', 'Atividades executadas de formas diferentes por cada colaborador, gerando retrabalho e dificuldade de controle.', 'Mapeamento dos processos principais, definição de responsáveis e criação de procedimentos padronizados.', 'Em um projeto real, esta seção apresentaria os resultados efetivamente medidos e autorizados pelo cliente.', array['/images/projects/processos.svg']::text[], null, 'concluido', true, true, true, true),
  ('prj-exemplo-residuos', 'exemplo-programa-de-gestao-de-residuos', 'Programa interno de gestão de resíduos', null, false, 'cat-gestao-ambiental', 'Exemplo ilustrativo criado para demonstrar a apresentação de projetos. Não representa um trabalho realizado nem um cliente real. Cenário: unidade comercial que deseja organizar a segregação de resíduos.', 'Resíduos descartados sem separação adequada e sem registro das quantidades geradas.', 'Plano de segregação, sinalização dos pontos de coleta, orientação da equipe e planilha de controle.', 'Em um projeto real, esta seção apresentaria indicadores medidos antes e depois da implantação.', array['/images/projects/residuos.svg']::text[], null, 'concluido', true, true, true, true),
  ('prj-exemplo-esg', 'exemplo-diagnostico-de-praticas-sustentaveis', 'Diagnóstico de práticas sustentáveis', null, false, 'cat-sustentabilidade-esg', 'Exemplo ilustrativo criado para demonstrar a apresentação de projetos. Não representa um trabalho realizado nem um cliente real. Cenário: empresa interessada em iniciar sua jornada ESG.', 'Ausência de informações organizadas sobre práticas ambientais, sociais e de governança.', 'Questionário estruturado, entrevistas com gestores e matriz de priorização de ações.', 'Em um projeto real, esta seção apresentaria as entregas e os avanços confirmados pelo cliente.', array['/images/projects/esg.svg']::text[], null, 'em_andamento', true, true, true, true),
  ('prj-exemplo-documentos', 'exemplo-organizacao-documental', 'Organização documental administrativa', null, false, 'cat-assessoria-regularizacao', 'Exemplo ilustrativo criado para demonstrar a apresentação de projetos. Não representa um trabalho realizado nem um cliente real. Cenário: empresa com documentos dispersos em pastas físicas e digitais.', 'Dificuldade para localizar documentos e acompanhar vencimentos.', 'Estrutura padronizada de arquivos, nomenclatura definida e controle de vencimentos.', 'Em um projeto real, esta seção apresentaria os resultados efetivamente obtidos.', array['/images/projects/documentos.svg']::text[], null, 'planejado', false, true, true, true)
on conflict (id) do nothing;

insert into public.articles (id, slug, title, excerpt, content, image_url, is_published, published_at, is_demo) values
  ('art-importancia-gestao-ambiental', 'a-importancia-da-gestao-ambiental-nas-empresas', 'A importância da gestão ambiental nas empresas', 'Como integrar a variável ambiental à gestão ajuda a prevenir riscos e a gerar valor para o negócio.', 'A gestão ambiental reúne práticas e procedimentos que permitem à empresa conhecer, controlar e reduzir os impactos de suas atividades sobre o meio ambiente.

Mais do que uma obrigação, ela contribui para o uso eficiente de recursos, a prevenção de riscos, a organização interna e o fortalecimento da imagem da organização perante clientes, parceiros e comunidade.

Um bom ponto de partida é conhecer os principais aspectos ambientais da operação — consumo de água e energia, geração de resíduos, emissões — e definir metas simples e mensuráveis para cada um deles.', '/images/articles/gestao-ambiental.svg', true, '2026-01-15T12:00:00.000Z', true),
  ('art-reducao-desperdicios', 'reducao-de-desperdicios-e-uso-eficiente-de-recursos', 'Redução de desperdícios e uso eficiente de recursos', 'Pequenas mudanças de rotina podem gerar economia e reduzir impactos ambientais de forma consistente.', 'Desperdício é custo. Água, energia, materiais de escritório e insumos de produção consumidos além do necessário afetam tanto o resultado financeiro quanto o meio ambiente.

Medir é o primeiro passo: registrar consumos mensais permite identificar padrões e definir metas. Em seguida, vale envolver a equipe com orientações práticas e reconhecer as boas iniciativas.

Revisar processos com foco em eficiência — eliminando etapas desnecessárias, reaproveitando materiais e planejando compras — costuma trazer ganhos rápidos.', '/images/articles/recursos.svg', true, '2026-01-15T12:00:00.000Z', true),
  ('art-esg-governanca', 'esg-e-governanca-corporativa-por-onde-comecar', 'ESG e governança corporativa: por onde começar', 'Entenda os três pilares do ESG e como empresas de qualquer porte podem dar os primeiros passos.', 'ESG é a sigla em inglês para Ambiental, Social e Governança. Trata-se de um conjunto de critérios usados para avaliar como uma organização gerencia seus impactos e se relaciona com as partes interessadas.

No pilar ambiental, entram temas como resíduos, energia e emissões. No social, a relação com colaboradores, clientes e comunidade. Na governança, a ética, a transparência e a qualidade das decisões.

Para começar, recomenda-se um diagnóstico das práticas atuais, a escolha de poucos indicadores relevantes e a definição de responsáveis por acompanhá-los.', '/images/articles/esg.svg', true, '2026-01-15T12:00:00.000Z', true)
on conflict (id) do nothing;
