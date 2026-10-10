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
