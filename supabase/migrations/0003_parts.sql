-- ============================================================================
-- Garagem Rúcula — peças/produtos (farol, roda, pneus…), separadas dos carros
-- COMO RODAR: Supabase Dashboard -> SQL Editor -> New query -> colar tudo -> Run.
-- Idempotente: pode rodar novamente sem quebrar.
-- Reaproveita o bucket público 'car-media' já existente (prefixo de path 'parts/'),
-- então NÃO cria bucket novo. Espelha o schema/RLS de 'cars' (migração 0001).
-- ============================================================================

create extension if not exists pgcrypto;

-- ============ PARTS (dados públicos da peça/produto) ============
create table if not exists public.parts (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz,
  slug          text not null unique,
  title         text not null,
  category      text,                 -- Rodas, Pneus, Faróis, Som, Motor/Turbo, Suspensão…
  condition     text not null default 'usado'
                  check (condition in ('novo','seminovo','usado')),
  brand         text,                 -- fabricante da peça (BBS, Cibié, Pirelli…)
  compatibility text,                 -- serve em quais carros (ex.: "Fusca, Brasília")
  price         numeric,              -- null = "Sob consulta"
  description   text,
  tags          text[]  not null default '{}',
  photos        jsonb   not null default '[]'::jsonb,  -- [{ "path": "...", "url": "..." }] (ordenado)
  videos        jsonb   not null default '[]'::jsonb,
  status        text    not null default 'disponivel'
                  check (status in ('disponivel','reservado','vendido')),
  featured      boolean not null default false,        -- destaque na home
  views         int     not null default 0
);

create index if not exists parts_status_idx   on public.parts (status);
create index if not exists parts_created_idx   on public.parts (created_at desc);
create index if not exists parts_featured_idx  on public.parts (featured) where featured;
create index if not exists parts_category_idx  on public.parts (category);
create index if not exists parts_tags_idx      on public.parts using gin (tags);

-- ============ updated_at automático (reusa a função da migração 0001) ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists parts_set_updated_at on public.parts;
create trigger parts_set_updated_at
  before update on public.parts
  for each row execute function public.set_updated_at();

-- ============ Contador de visualizações (incremento atômico, sem UPDATE ao público) ============
create or replace function public.bump_part_view(p_part_id uuid)
returns void
language plpgsql
security definer
set search_path = public as $$
begin
  update public.parts set views = views + 1 where id = p_part_id;
end;
$$;

-- ============ Lead de peça: reaproveita a tabela 'leads' (coluna aditiva) ============
-- O clique "tenho interesse" numa peça grava um lead com part_id preenchido
-- (car_id fica null). Aditivo: não altera nada do fluxo de leads dos carros.
alter table public.leads
  add column if not exists part_id uuid references public.parts(id) on delete set null;

-- ============ RLS (espelha 'cars': leitura pública, escrita só service_role) ============
alter table public.parts enable row level security;

drop policy if exists parts_select_public on public.parts;
create policy parts_select_public on public.parts for select using (true);

-- Grants explícitos (não depender do default do projeto)
grant usage on schema public to anon, authenticated;
grant select on public.parts to anon, authenticated;
grant execute on function public.bump_part_view(uuid) to anon, authenticated;

-- Obs.: Storage — as fotos das peças usam o bucket público 'car-media' já criado
-- na 0001 (prefixo 'parts/'); a policy "car-media public read" já cobre a leitura.
