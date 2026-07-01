---
name: aprendizados_rebobina
description: Regras técnicas herdadas do Rebobina 3D e do EnergyDex, reaproveitadas no Garagem Rúcula para nascer com poucos bugs.
metadata:
  type: reference
---

# Aprendizados herdados (Rebobina 3D + EnergyDex)

Fontes: `Rebobina 3D/rebobina3d` (Next 16 + Supabase + Vercel + PWA, maduro) e `AppEnergy/energydex` (Next 16 + React 19 + Tailwind v4 + Supabase SSR + PWA).

1. **PostgREST: nunca embedded joins** (`.select('*, x:y(*)')`) — sem FK constraints retorna `data:null` silencioso. Sempre 2 queries + join manual no TS.
2. **Admin protegido por e-mail hardcoded no `src/middleware.ts`** (`ADMIN_EMAILS`). Deslogado→login (?next); logado sem permissão→home; API→401. Rate-limit opcional (Upstash) em rotas sensíveis.
3. **Migrations = arquivos `.sql`** em `supabase/migrations/`, rodados no SQL Editor do Supabase (DDL não passa pela REST API). Código degrada com segurança até a coluna existir.
4. **Serverless: sempre `await`** efeitos (upload/e-mail). Fire-and-forget é abandonado quando a função responde.
5. **PWA:** manifest único (`start_url`, `scope:"/"`, `display:standalone`, ícones 192/512/maskable) + **service worker NETWORK-FIRST para HTML** (deploy atualiza na hora), cache-first só em assets com hash. Nunca cache-first em HTML.
6. **Supabase clients (SSR):** `lib/supabase/client.ts` (`createBrowserClient`, anon key) e `server.ts` (`createServerClient` com cookies do `next/headers`). Service role só no servidor p/ escrita sensível.
7. **RLS desde o dia 1:** leitura pública do que é público (carros); escrita só admin.
8. **Storage de imagens:** Supabase Storage; `next.config.ts` com `images.remotePatterns` p/ `**.supabase.co`.
9. **Deploy:** git push → Vercel. **git user.email deve bater com a conta Vercel** (`felipeherrera.contato@gmail.com`), senão bloqueia deploy no Hobby. TS error quebra o build.
10. **Testar de verdade:** tsc/build ≠ funciona. Validar na UI com Chrome REAL `--remote-debugging-port=9222` + `dev-browser --connect` (Google bloqueia login em browser de automação), checar console, desktop E mobile, após deploy. `window.confirm` nativo trava no dev-browser → dá pra sobrescrever.
11. **Design tokens** em `globals.css` (CSS vars) + Tailwind v4. Texto sobre fundo escuro usa VARIANTE CLARA da cor da marca.
12. **dev-browser:** roda script JS em sandbox QuickJS (sem npm/fs host). `browser.getPage`, `page.goto/click/fill/evaluate/screenshot`, `page.snapshotForAI()`. Daemon pode ficar órfão (EADDRINUSE pipe) → matar `node` com `daemon.mjs` no cmdline.

Aplicação no projeto em [[project_garagem_rucula]] e [[setup_continuidade]].
