---
name: setup_continuidade
description: Estado do setup (scaffold, contas, git/Vercel/Supabase) e como a continuidade entre os 2 PCs funciona.
metadata:
  type: project
---

# Setup & continuidade — Garagem Rúcula

## O que JÁ está feito (30/06 kickoff)
- Scaffold **Next.js 16.2.9 + React 19.2.4 + TS + Tailwind v4** na raiz da pasta (create-next-app movido pra raiz). `git init` local feito (sem remote).
- `scripts/sessao-inicio.ps1` + hook `SessionStart` em `.claude/settings.json` + `memory/` + `CLAUDE.md`.

## O que FALTA configurar (próxima sessão)
1. **GitHub:** Felipe criou um repo na conta dele. Pegar a URL → `git config user.email felipeherrera.contato@gmail.com` → `git remote add origin <url>` → `git add -A && git commit && git push -u origin main`.
2. **Vercel:** hospedar na conta EXISTENTE do Felipe (`felipeherrera.contato@gmail.com`). Hobby NÃO limita nº de projetos → grátis. NÃO criar conta nova (SMS de verificação não chega no e-mail novo porque o celular dele já está atrelado à conta antiga). Import do repo do GitHub → deploy automático.
3. **Supabase:** projeto JÁ criado na conta nova `garagemrucula@gmail.com`. Pegar Project URL + anon key + service_role (Project Settings → API) → `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.
   - Criar schema: tabela `cars` (+ fotos/vídeos em Supabase Storage), `leads`, `car_views`, `sales`. RLS: leitura pública dos carros, escrita só admin.

## Continuidade entre 2 PCs (igual Rebobina)
- Pasta sincroniza pelo **Google Drive**. **NÃO** rodar o Claude nos 2 PCs ao mesmo tempo.
- Hook → `sessao-inicio.ps1`: sincroniza git (se houver remote; senão pula, pois o Drive já sincroniza arquivos) + ajusta `autoMemoryDirectory` desta máquina pra `memory/` deste projeto.
- **1ª vez em cada PC:** rodar na mão `& "<repo>\scripts\sessao-inicio.ps1"` → **REINICIAR o Claude** (ponteiro de memória só vale na próxima sessão). Conferir `/model` = Opus.
- ⚠️ `node_modules/` e `.next/` sincronizam lentos pelo Drive; se der erro no outro PC, rodar `npm install` lá.

## Toolchain PC principal (C:, OneDrive)
Node v20.12.2, npm 10.5.0, git 2.45.1 (no PATH). Vercel CLI NÃO instalado (deploy = git push). dev-browser disponível p/ QA (Chrome real :9222).

Plano e regras em [[project_garagem_rucula]] / [[aprendizados_rebobina]].
