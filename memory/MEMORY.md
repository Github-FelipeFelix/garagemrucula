# Memory Index — Garagem Rúcula

## ➤ ONDE PARAMOS — ler ISTO primeiro · atualizar por último (att. 03/07/2026 — cosméticos "UAU" no ar)
> Continuidade entre os 2 PCs via **GitHub**. Início: hook roda `git pull`. Fim: `git push`. Canônico também no `CLAUDE.md` da raiz.

**🟢 SITE NO AR: https://garagemrucula.vercel.app** — v1 completo (testado em prod sem bugs) + **camada cosmética "UAU"** (commit `e8269ab`) no ar. Deploy automático a cada `git push origin main`.

**AMBIENTE:** o projeto vive em **`C:\dev\garagemrucula`** (disco local — NÃO no Google Drive; o `npm install` corrompe lá com EBADF). GitHub `github.com/Github-FelipeFelix/garagemrucula` (**PÚBLICO**) é a fonte da verdade. **Sempre abrir o Claude em `C:\dev\garagemrucula`.** Hook `SessionStart` → `sessao-inicio.ps1` faz `git pull`. **PC novo:** `git clone` → `git config user.email felipeherrera.contato@gmail.com` → copiar `.env.local` (guardado na pasta antiga do Drive) → `npm install` (Node ideal 22+; no 20 dá só warning).

**Projeto:** vitrine de carros do primo do Felipe (antigos/importados/modificados — turbo, rebaixado). Cliente vê o disponível → vai pro WhatsApp (+55 19 97416-5880, msg pronta) ou Instagram @garagem_rucula. `/admin` mobile-first (o primo é leigo, usa do celular em eventos).

## 🔜 PENDÊNCIAS — COMEÇAR A PRÓXIMA SESSÃO POR AQUI
0. 👀 **Confirmar com o Felipe o veredito visual dos cosméticos** (ver "JÁ FEITO"). Nesta sessão NÃO consegui screenshot — o daemon do `dev-browser` travou (o launch do Chromium pendurava, e `dev-browser status` também). Validei por: build verde + SSR 200 + HTML de produção com os marcadores + CSS compilado + reveal à prova de falha. Se ele pedir ajuste (intensidade do glow, velocidade das animações, etc.), começar por aí.
1. 🔒 **Rate-limit no `/api/lead`** (rota pública, sem proteção contra spam de leads). Padrão do Rebobina = **Upstash**. Fazer quando o Felipe criar a conta grátis (+ env vars).
2. 🌐 **Domínio `garagemrucula.com.br`** — DNS configurado no Registro.br (apex = campo Nome VAZIO, não `@`; A→`216.198.79.1`; CNAME www→`2a5a7eacc180262f.vercel-dns-017.com`). Estava PROPAGANDO no fim da sessão. Checar: `curl -I https://garagemrucula.com.br`. Quando abrir: Felipe muda **`NEXT_PUBLIC_SITE_URL`** na Vercel (Settings→Env Vars) de `https://garagemrucula.vercel.app` → `https://www.garagemrucula.com.br` + re-deploy (Claude não acessa a Vercel; só confirma).
3. 🚗 **Primo cadastrar os carros reais** e apagar o `fusca-teste`. Guia mastigado em `COMO-USAR-O-ADMIN.md`.

## ✅ JÁ FEITO
- **🎨 Camada cosmética "UAU" (commit `e8269ab`):** **reveal-on-scroll** (IntersectionObserver + cascata/stagger) com **js-gate à prova de falha** — script inline no `layout.tsx` marca `.js-reveal` no `<html>` ANTES da 1ª pintura e o CSS só esconde `[data-reveal]` quando essa classe existe (sem JS ou com reduced-motion nada some; `<html suppressHydrationWarning>`). **Barra de progresso** no topo (`ScrollProgress.tsx`, via rAF). **Spotlight** radial seguindo o cursor nos cards (`Reveal.tsx` = pointermove global + IntersectionObserver que re-observa por `usePathname`; classe `.spotlight` + `z-[2]` no texto do `CarCard`). **Hero +impactante:** grade `.hero-grid`, 3º orb amarelo, orbs flutuando (`orb-float-a/b/c`), glow `.text-glow-rucula`. **Microinterações:** shine varrendo botões cheios, hover glow no WhatsApp/voltar-ao-topo, **glass** (backdrop-blur) no header/filtros/banner; filtros da vitrine **sticky** no desktop. Regras em `globals.css`; componentes novos `Reveal.tsx` + `ScrollProgress.tsx` montados no `(site)/layout.tsx`. Tudo respeita `prefers-reduced-motion`. ⚠️ Sem QA por screenshot (dev-browser travou) — validado por build+HTML+CSS.
- **Site público (v1):** home (hero c/ orbs + destaques + grid), vitrine c/ filtros (marca/ano/preço/estilo/busca + limpar), página do carro (galeria fotos+vídeos, ficha c/ ícones, "tenho interesse"→WhatsApp **e registra lead**, QR, compartilhar, "veja também", selo VENDIDO), sobre (c/ diferenciais), 404, error.tsx.
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
