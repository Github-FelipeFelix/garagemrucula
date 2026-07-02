---
name: setup_continuidade
description: Estado do setup (ambiente local + GitHub + Vercel + Supabase) e como a continuidade entre os 2 PCs funciona.
metadata: 
  node_type: memory
  type: project
  originSessionId: 0ee22cde-c09a-4101-bafb-2d288ea4fc2b
---

# Setup & continuidade — Garagem Rúcula

## ✅ Tudo configurado (site no ar em https://www.garagemrucula.com.br)
- **Ambiente:** projeto em disco LOCAL `C:\dev\garagemrucula` (Next 16 + React 19 + TS + Tailwind v4). NÃO no Google Drive (o `npm install` corrompe lá — EBADF).
- **GitHub:** `github.com/Github-FelipeFelix/garagemrucula` — **PÚBLICO** (tornado público pra destravar o deploy Hobby). Fonte da verdade; sincroniza código + markdowns + `memory/`.
- **Vercel:** conta do Felipe (`felipeherrera.contato@gmail.com`, Hobby). Deploy automático a cada `git push origin main`. As 4 env vars do `.env.local` estão configuradas lá.
- **Supabase:** conta `garagemrucula@gmail.com` (ref `lryzyydzjodywvzhiumx`). Schema rodado (`supabase/migrations/0001_init.sql`: cars, leads, car_sales + RLS + RPC `bump_car_view`). Bucket `car-media` (público). `.env.local` com URL + anon + service_role + `NEXT_PUBLIC_SITE_URL`.

## 🔜 Falta (detalhe nas PENDÊNCIAS do MEMORY.md)
Primo cadastrar os carros reais (+ apagar o `fusca-teste`) · rate-limit distribuído opcional (Upstash) · melhorias contínuas (mandato aberto). Cosméticos, domínio, fotos HD, login Google e fix do admin mobile: **FEITOS**.

## Continuidade entre 2 PCs (via GitHub, NÃO mais Drive)
- **Fonte:** GitHub. Início: hook `SessionStart` → `sessao-inicio.ps1` faz `git pull` (ff-only) + ajusta `autoMemoryDirectory` pra `memory/` deste repo. **Fim de sessão: `git push`.**
- **NÃO** rodar o Claude nos 2 PCs ao mesmo tempo (conflito git).
- **Setup de um PC NOVO:**
  1. `git clone https://github.com/Github-FelipeFelix/garagemrucula C:\dev\garagemrucula`
  2. `cd C:\dev\garagemrucula && git config user.email felipeherrera.contato@gmail.com` (**OBRIGATÓRIO** — senão bloqueia o deploy Vercel)
  3. copiar o `.env.local` (guardado na pasta antiga do Drive: `G:\...\Garagem Rucula\.env.local`)
  4. `npm install`
  5. rodar `& "C:\dev\garagemrucula\scripts\sessao-inicio.ps1"` → **REINICIAR o Claude** (ponteiro de memória vale na próxima sessão). Conferir `/model`.
- Pasta antiga do Drive `G:\...\Garagem Rucula` = **APOSENTADA** (só guarda o `.env.local`; tem um `_LEIA-PROJETO-MOVIDO.md` avisando).

## Toolchain PC principal (C:)
Node v20.12.2 (ideal atualizar p/ 22 — supabase-js avisa), npm 10.5.0, git 2.45.1. Vercel CLI não instalado (deploy = git push). dev-browser p/ QA (timeout 30s por script; desregistrar SW antes de testar hydration).

## Toolchain PC 2 (sessão 02/07)
Node v20.12.2 idem; clone em `C:\dev\garagemrucula` já com `user.email` certo. ⚠️ **dev-browser: daemon quebrado neste PC** (processo órfão de sessão elevada segura o pipe `\\.\pipe\dev-browser-daemon-felipefelix`; sem UAC não mata) → **bypass:** usar o Playwright de `~/.dev-browser/node_modules` direto em script Node (detalhe no [[aprendizados_rebobina]] #29).

Plano em [[project_garagem_rucula]] · regras técnicas em [[aprendizados_rebobina]].
