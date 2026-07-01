# Memory Index — Garagem Rúcula

## ➤ ONDE PARAMOS — ler ISTO primeiro · atualizar por último (att. 02/07/2026 — FIM DE SESSÃO)
> Continuidade entre os 2 PCs via **GitHub**. Início: hook roda `git pull`. Fim: `git push`. Canônico também no `CLAUDE.md` da raiz.

**🟢 SITE NO AR e FUNCIONAL: https://garagemrucula.vercel.app** — v1 completo, testado em produção **sem bugs**. Deploy automático a cada `git push origin main`.

**AMBIENTE:** o projeto vive em **`C:\dev\garagemrucula`** (disco local — NÃO no Google Drive; o `npm install` corrompe lá com EBADF). GitHub `github.com/Github-FelipeFelix/garagemrucula` (**PÚBLICO**) é a fonte da verdade. **Sempre abrir o Claude em `C:\dev\garagemrucula`.** Hook `SessionStart` → `sessao-inicio.ps1` faz `git pull`. **PC novo:** `git clone` → `git config user.email felipeherrera.contato@gmail.com` → copiar `.env.local` (guardado na pasta antiga do Drive) → `npm install` (Node ideal 22+; no 20 dá só warning).

**Projeto:** vitrine de carros do primo do Felipe (antigos/importados/modificados — turbo, rebaixado). Cliente vê o disponível → vai pro WhatsApp (+55 19 97416-5880, msg pronta) ou Instagram @garagem_rucula. `/admin` mobile-first (o primo é leigo, usa do celular em eventos).

## 🔜 PENDÊNCIAS — COMEÇAR A PRÓXIMA SESSÃO POR AQUI
1. 🎨 **COSMÉTICOS / visual "UAU" (PRIORIDADE — o Felipe pediu explicitamente).** Ele quer o site LINDO pra impressionar o primo. Trazer o MÁXIMO de melhorias visuais (do Rebobina e além): **reveal-on-scroll** (entrada animada das seções ao rolar), **scroll progress bar** no topo, **spotlight/glow radial nos cards** no hover, **glass cards** (backdrop-blur), mais microinterações e transições suaves, hero ainda mais impactante. Já existe a base (Exo 2, orbs no hero, botões c/ glow, cards elevados, eyebrows, fade-up no hero). Objetivo: bonito **e** funcional, sem quebrar nada.
2. 🔒 **Rate-limit no `/api/lead`** (rota pública, sem proteção contra spam de leads). Padrão do Rebobina = **Upstash**. Fazer quando o Felipe criar a conta grátis (+ env vars).
3. 🌐 **Domínio `garagemrucula.com.br`** — DNS configurado no Registro.br (apex = campo Nome VAZIO, não `@`; A→`216.198.79.1`; CNAME www→`2a5a7eacc180262f.vercel-dns-017.com`). Estava PROPAGANDO no fim da sessão. Checar: `curl -I https://garagemrucula.com.br`. Quando abrir: Felipe muda **`NEXT_PUBLIC_SITE_URL`** na Vercel (Settings→Env Vars) de `https://garagemrucula.vercel.app` → `https://www.garagemrucula.com.br` + re-deploy (Claude não acessa a Vercel; só confirma).
4. 🚗 **Primo cadastrar os carros reais** e apagar o `fusca-teste`. Guia mastigado em `COMO-USAR-O-ADMIN.md`.

## ✅ JÁ FEITO (v1 completo — tudo testado em prod)
- **Site público:** home (hero c/ orbs + destaques + grid), vitrine c/ filtros (marca/ano/preço/estilo/busca + limpar), página do carro (galeria fotos+vídeos, ficha c/ ícones, "tenho interesse"→WhatsApp **e registra lead**, QR, compartilhar, "veja também", selo VENDIDO), sobre (c/ diferenciais), 404, error.tsx.
- **Admin** (`/admin`, protegido por `proxy.ts` + e-mails em `lib/admins`): login email+senha, dashboard (4 métricas + leads recentes), CRUD de carros (upload fotos c/ arrastar @dnd-kit + vídeos, ficha completa, tags, mods), status/destaque, **duplicar carro**, **histórico de vendas** (tabela `car_sales`, privado), leads, **trocar senha** (/admin/senha). Header responsivo (mobile ok).
- **Infra:** PWA (SW network-first) + banner "instalar app"; SEO (sitemap/robots/JSON-LD); favicon; Vercel Analytics. Supabase (clients read/server/admin, RLS, bucket `car-media` público, RPC `bump_car_view`).
- **Senha do admin:** trocada pelo Felipe — **NUNCA versionar senha** (repo é público).

**Decisões fechadas:** sem vídeo na home; tema escuro/preto; vendidos c/ selo "VENDIDO"; extras v1 (QR, leads, views, histórico vendas) TODOS feitos. Paleta: verde rúcula #24a54b (claro #4ade80) + petróleo #013c43 + amarelo Senna #f3e838 + azul #204ba0 sobre preto #0a0a0a.

**Contas:** Supabase = `garagemrucula@gmail.com` (conta nova; ref projeto `lryzyydzjodywvzhiumx`). Vercel = `felipeherrera.contato@gmail.com` (Hobby). git `user.email` DEVE ser `felipeherrera.contato@gmail.com` (bate com a Vercel).

---

## Índice
- [Projeto — plano/escopo completo](project_garagem_rucula.md)
- [Setup & continuidade (local + GitHub)](setup_continuidade.md)
- [Aprendizados técnicos (Rebobina + deploy/infra desta sessão)](aprendizados_rebobina.md)
