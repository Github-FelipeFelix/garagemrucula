# Memory Index — Garagem Rúcula

## ➤ ONDE PARAMOS — ler ISTO primeiro · atualizar por último (att. 01/07/2026)
> Ponto único de continuidade entre os 2 PCs, sincronizado via **GitHub**. Início de sessão: ler este bloco. Fim de sessão: reescrevê-lo. **O canônico vive também no `CLAUDE.md` da raiz.**

**🔴 MUDANÇA (01/07): o projeto SAIU do Google Drive → agora vive em DISCO LOCAL + GitHub.** Motivo: `npm install` corrompe no Drive (EBADF/EPERM — o G: nem aceita junction). Working dir do PC principal: **`C:\dev\garagemrucula`**. O **GitHub** (`github.com/Github-FelipeFelix/garagemrucula`) é a fonte da verdade e sincroniza TUDO (código + markdowns + `memory/`). A pasta antiga do Drive (`G:\...\Garagem Rucula`) está **APOSENTADA** (só guarda o `.env.local`). **SEMPRE abrir o Claude em `C:\dev\garagemrucula`.**

**INÍCIO DE SESSÃO:** hook `SessionStart` → `sessao-inicio.ps1` faz `git pull` (ff-only) + conserta ponteiro de memória. **FIM DE SESSÃO:** `git push`. **PC novo:** `git clone <repo> C:\dev\garagemrucula` → copiar `.env.local` → `npm install`. **Node 20 dá warning** (supabase-js quer 22); funciona, mas ideal atualizar p/ Node 22.

**Projeto:** vitrine de carros (compra/venda de antigos, importados, modificados). Cliente → WhatsApp (+55 19 97416-5880) ou Instagram @garagem_rucula. `/admin` mobile-first.

**FEITO (01/07):** ✅ GitHub (~9 commits). ✅ `.env.local` c/ chaves (ref `lryzyydzjodywvzhiumx`). ✅ Logo → ícones/favicon/og (sharp). ✅ Design tokens (cores do logo). ✅ Camada Supabase (clients read/server/admin) + `proxy.ts` + schema SQL. ✅ **SITE PÚBLICO** completo e validado no browser (home, vitrine c/ filtros, carro, sobre, 404). ✅ **ADMIN** completo e validado (login email+senha, dashboard c/ stats, CRUD de carros c/ upload de fotos+dnd @dnd-kit, leads, QR por carro). ✅ **PWA** service worker network-first + manifest. ✅ Usuário admin criado no Auth (`garagemrucula@gmail.com`, senha TEMPORÁRIA passada ao Felipe → trocar). Build de produção passa limpo; site+admin testados no dev-browser (desktop+mobile).

**PRÓXIMOS PASSOS:** (1) ⚠️ **Felipe roda `supabase/migrations/0001_init.sql`** no SQL Editor do Supabase (DDL; desbloqueia os dados/CRUD). (2) Felipe configura **Vercel** (import do repo + 4 env vars do `.env.local`) → site no ar. (3) Após o SQL: testar CRUD real (criar carro + upload de foto) no browser. (4) Extra restante do v1: **histórico de vendas** (registrar `sold_price` em `car_sales` quando status=vendido). (5) Testar instalação PWA no celular após o deploy.

**Decisões fechadas:** sem vídeo na home; tema escuro/preto; vendidos c/ selo "VENDIDO"; extras v1 = QR + leads + views + histórico vendas (TODOS). Paleta: verde rúcula #24a54b (claro #4ade80) + petróleo #013c43 + amarelo Senna #f3e838 + azul #204ba0 sobre preto #0a0a0a.

**Contas:** Supabase = conta NOVA `garagemrucula@gmail.com` (free 2 projetos/conta, e o Rebobina já ocupa a do Felipe). Vercel = conta atual do Felipe (Hobby não limita projetos; SMS não chega no e-mail novo). GitHub = repo na conta do Felipe (pegar URL).

---

## Índice
- [Projeto Garagem Rúcula — plano completo](project_garagem_rucula.md) — escopo do site + admin, stack, paleta, decisões, extras v1.
- [Setup & continuidade entre 2 PCs](setup_continuidade.md) — scaffold, contas, sessao-inicio.ps1, o que falta configurar.
- [Aprendizados herdados do Rebobina 3D](aprendizados_rebobina.md) — regras técnicas reaproveitadas (PostgREST, admin middleware, PWA SW, await serverless, testar de verdade).
