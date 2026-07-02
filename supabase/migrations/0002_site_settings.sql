-- ============================================================================
-- Garagem Rúcula — site_settings (conteúdo editável pelo admin)
-- COMO RODAR: Supabase Dashboard -> SQL Editor -> New query -> colar tudo -> Run.
-- Idempotente. Guarda o texto editável do site (Sobre, diferenciais, subtítulo do
-- hero) numa única linha (id=1), como JSON. Escrita só via service_role (admin);
-- leitura pública (anon) — as páginas públicas leem daqui com fallback pros defaults.
-- ============================================================================

create table if not exists public.site_settings (
  id          smallint primary key default 1,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)   -- garante linha única
);

insert into public.site_settings (id, data) values (1, '{}'::jsonb)
  on conflict (id) do nothing;

alter table public.site_settings enable row level security;

-- Leitura pública (o site lê o conteúdo). Escrita NÃO tem policy => bloqueada
-- pra anon/authenticated; só o service_role (admin, bypassa RLS) escreve.
drop policy if exists site_settings_select_public on public.site_settings;
create policy site_settings_select_public on public.site_settings for select using (true);

grant select on public.site_settings to anon, authenticated;
