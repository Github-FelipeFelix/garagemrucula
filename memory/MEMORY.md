# Memory Index — Garagem Rúcula

## ➤ ONDE PARAMOS — ler ISTO primeiro · atualizar por último (att. 01/07/2026)
> Ponto único de continuidade entre os 2 PCs, sincronizado via **GitHub**. Início de sessão: ler este bloco. Fim de sessão: reescrevê-lo. **O canônico vive também no `CLAUDE.md` da raiz.**

**🔴 MUDANÇA (01/07): o projeto SAIU do Google Drive → agora vive em DISCO LOCAL + GitHub.** Motivo: `npm install` corrompe no Drive (EBADF/EPERM — o G: nem aceita junction). Working dir do PC principal: **`C:\dev\garagemrucula`**. O **GitHub** (`github.com/Github-FelipeFelix/garagemrucula`) é a fonte da verdade e sincroniza TUDO (código + markdowns + `memory/`). A pasta antiga do Drive (`G:\...\Garagem Rucula`) está **APOSENTADA** (só guarda o `.env.local`). **SEMPRE abrir o Claude em `C:\dev\garagemrucula`.**

**INÍCIO DE SESSÃO:** hook `SessionStart` → `sessao-inicio.ps1` faz `git pull` (ff-only) + conserta ponteiro de memória. **FIM DE SESSÃO:** `git push`. **PC novo:** `git clone <repo> C:\dev\garagemrucula` → copiar `.env.local` → `npm install`. **Node 20 dá warning** (supabase-js quer 22); funciona, mas ideal atualizar p/ Node 22.

**Projeto:** vitrine de carros (compra/venda de antigos, importados, modificados). Cliente → WhatsApp (+55 19 97416-5880) ou Instagram @garagem_rucula. `/admin` mobile-first.

**FEITO (01/07):** ✅ GitHub (6 commits). ✅ `.env.local` c/ chaves Supabase (ref do projeto: `lryzyydzjodywvzhiumx`, derivado do JWT). ✅ Logo → ícones PWA + favicon + og (via sharp). ✅ Design tokens (cores AMOSTRADAS do logo). ✅ Camada Supabase (clients read/server/admin, tipos, queries), `proxy.ts` (protege /admin), schema SQL. ✅ **SITE PÚBLICO COMPLETO E VALIDADO no browser** (home, vitrine c/ filtros, página do carro, sobre, 404) — desktop+mobile lindos, build de produção passa limpo.

**PRÓXIMOS PASSOS:** (1) ⚠️ **Felipe roda `supabase/migrations/0001_init.sql`** no SQL Editor do Supabase (DDL; desbloqueia os dados). (2) Felipe configura **Vercel** (import do repo + 4 env vars do `.env.local`) → site no ar. (3) Construir **/admin** (login email+senha, CRUD carros c/ upload+dnd, leads, views, QR, histórico vendas). (4) **PWA service worker** network-first. (5) Após SQL: criar user admin + carro de teste via service_role e testar tudo.

**Decisões fechadas:** sem vídeo na home; tema escuro/preto; vendidos c/ selo "VENDIDO"; extras v1 = QR + leads + views + histórico vendas (TODOS). Paleta: verde rúcula #24a54b (claro #4ade80) + petróleo #013c43 + amarelo Senna #f3e838 + azul #204ba0 sobre preto #0a0a0a.

**Contas:** Supabase = conta NOVA `garagemrucula@gmail.com` (free 2 projetos/conta, e o Rebobina já ocupa a do Felipe). Vercel = conta atual do Felipe (Hobby não limita projetos; SMS não chega no e-mail novo). GitHub = repo na conta do Felipe (pegar URL).

---

## Índice
- [Projeto Garagem Rúcula — plano completo](project_garagem_rucula.md) — escopo do site + admin, stack, paleta, decisões, extras v1.
- [Setup & continuidade entre 2 PCs](setup_continuidade.md) — scaffold, contas, sessao-inicio.ps1, o que falta configurar.
- [Aprendizados herdados do Rebobina 3D](aprendizados_rebobina.md) — regras técnicas reaproveitadas (PostgREST, admin middleware, PWA SW, await serverless, testar de verdade).
