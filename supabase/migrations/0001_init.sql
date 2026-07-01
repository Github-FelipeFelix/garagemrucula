-- ============================================================================
-- Garagem Rúcula — schema inicial
-- COMO RODAR: Supabase Dashboard -> SQL Editor -> New query -> colar tudo -> Run.
-- Idempotente: pode rodar novamente sem quebrar.
-- ============================================================================

create extension if not exists pgcrypto;

-- ============ CARS (dados públicos do carro) ============
create table if not exists public.cars (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz,
  slug          text not null unique,
  title         text not null,
  brand         text,                 -- marca
  model         text,                 -- modelo
  year          int,                  -- ano
  price         numeric,              -- null = "Sob consulta"
  km            int,
  engine        text,                 -- motor
  transmission  text,                 -- câmbio
  color         text,                 -- cor
  fuel          text,                 -- combustível
  description   text,
  mods          text[]  not null default '{}',        -- modificações / acessórios
  tags          text[]  not null default '{}',        -- turbo, rebaixado, antigo, importado...
  photos        jsonb   not null default '[]'::jsonb,  -- [{ "path": "...", "url": "..." }] (ordenado)
  videos        jsonb   not null default '[]'::jsonb,  -- [{ "path": "...", "url": "..." }]
  status        text    not null default 'disponivel'
                  check (status in ('disponivel','reservado','vendido')),
  featured      boolean not null default false,        -- destaque na home
  views         int     not null default 0
);

create index if not exists cars_status_idx   on public.cars (status);
create index if not exists cars_created_idx  on public.cars (created_at desc);
create index if not exists cars_featured_idx on public.cars (featured) where featured;
create index if not exists cars_tags_idx     on public.cars using gin (tags);

-- ============ LEADS (interesse capturado no clique "tenho interesse") ============
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  car_id      uuid references public.cars(id) on delete set null,
  car_title   text,                 -- snapshot: o lead sobrevive mesmo se o carro for apagado
  source      text not null default 'whatsapp'
);
create index if not exists leads_created_idx on public.leads (created_at desc);

-- ============ CAR_SALES (PRIVADO — por quanto vendeu; nunca aparece no site) ============
create table if not exists public.car_sales (
  car_id      uuid primary key references public.cars(id) on delete cascade,
  sold_price  numeric,
  sold_at     date,
  notes       text,
  created_at  timestamptz not null default now()
);

-- ============ updated_at automático ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cars_set_updated_at on public.cars;
create trigger cars_set_updated_at
  before update on public.cars
  for each row execute function public.set_updated_at();

-- ============ Contador de visualizações (incremento atômico, sem dar UPDATE ao público) ============
create or replace function public.bump_car_view(p_car_id uuid)
returns void
language plpgsql
security definer
set search_path = public as $$
begin
  update public.cars set views = views + 1 where id = p_car_id;
end;
$$;

-- ============ RLS ============
alter table public.cars      enable row level security;
alter table public.leads     enable row level security;
alter table public.car_sales enable row level security;

-- cars: leitura pública. Escrita só via service_role (que bypassa RLS).
drop policy if exists cars_select_public on public.cars;
create policy cars_select_public on public.cars for select using (true);

-- leads: qualquer visitante pode INSERIR; ninguém lê via anon (só service_role no admin).
drop policy if exists leads_insert_public on public.leads;
create policy leads_insert_public on public.leads for insert with check (true);

-- car_sales: RLS ligado e SEM policy => bloqueado para anon/authenticated. service_role bypassa.

-- Grants explícitos (não depender do default do projeto)
grant usage on schema public to anon, authenticated;
grant select on public.cars  to anon, authenticated;
grant insert on public.leads to anon, authenticated;
grant execute on function public.bump_car_view(uuid) to anon, authenticated;

-- ============ STORAGE (fotos/vídeos dos carros) ============
insert into storage.buckets (id, name, public)
values ('car-media', 'car-media', true)
on conflict (id) do nothing;

-- Leitura pública dos arquivos do bucket (upload/delete só via service_role no admin).
drop policy if exists "car-media public read" on storage.objects;
create policy "car-media public read" on storage.objects
  for select using (bucket_id = 'car-media');
