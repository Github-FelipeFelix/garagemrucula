# Memory Index — Garagem Rúcula

## ➤ ONDE PARAMOS — ler ISTO primeiro · atualizar por último (att. 01/07/2026 tarde — domínio próprio + fotos HD + lightbox + QA visual)
> Continuidade entre os 2 PCs via **GitHub**. Início: hook roda `git pull`. Fim: `git push`. Canônico também no `CLAUDE.md` da raiz.

**🟢 SITE NO AR (domínio próprio): https://www.garagemrucula.com.br** (apex → 308 pro www; `garagemrucula.vercel.app` também responde). v1 + cosméticos "UAU" + **leva de melhorias** (commit `4570aa2`) no ar. Deploy automático a cada `git push origin main`.

**AMBIENTE:** o projeto vive em **`C:\dev\garagemrucula`** (disco local — NÃO no Google Drive; o `npm install` corrompe lá com EBADF). GitHub `github.com/Github-FelipeFelix/garagemrucula` (**PÚBLICO**) é a fonte da verdade. **Sempre abrir o Claude em `C:\dev\garagemrucula`.** Hook `SessionStart` → `sessao-inicio.ps1` faz `git pull`. **PC novo:** `git clone` → `git config user.email felipeherrera.contato@gmail.com` → copiar `.env.local` (guardado na pasta antiga do Drive) → `npm install` (Node ideal 22+; no 20 dá só warning).

**Projeto:** vitrine de carros do primo do Felipe (antigos/importados/modificados — turbo, rebaixado). Cliente vê o disponível → vai pro WhatsApp (+55 19 97416-5880, msg pronta) ou Instagram @garagem_rucula. `/admin` mobile-first (o primo é leigo, usa do celular em eventos).

## 🔜 PENDÊNCIAS — COMEÇAR A PRÓXIMA SESSÃO POR AQUI
1. 🚗 **Primo cadastrar os carros reais** e apagar o `fusca-teste`. Guia mastigado em `COMO-USAR-O-ADMIN.md`. (O `fusca-teste` usa só o LOGO como foto — a qualidade HD nova só "aparece" com foto real de carro. QR do admin já sai com o domínio; se aparecer `localhost`, é cache → Ctrl+Shift+R.)
2. 🔒 **Rate-limit distribuído (opcional):** hoje é in-memory best-effort em `src/lib/rate-limit.ts` (30/min por IP; segura rajada por instância, mas serverless tem vários processos). Pra limite global rígido, plugar Upstash/Redis com a mesma assinatura de `rateLimit()` quando o Felipe criar a conta grátis.
3. 💡 **Melhorias contínuas:** mandato aberto do Felipe ("quero algo incrível, bugs a gente corrige com o tempo"). Ideias na fila: zoom/pinch no Lightbox, toast de feedback ao salvar no admin, OG image por carro.

**✅ Resolvido nesta sessão (01/07 tarde):** veredito visual dos cosméticos (QA por screenshot OK), domínio no ar, bug de SEO (localhost), rate-limit — ver "JÁ FEITO".

## ✅ JÁ FEITO
- **🌐 Domínio próprio + bug de SEO (01/07 tarde):** `www.garagemrucula.com.br` no ar. A env var `NEXT_PUBLIC_SITE_URL` tinha vazado `http://localhost:3000` do `.env.local` pra Vercel → como `NEXT_PUBLIC_*` é embutida no **build**, sitemap/robots/canonical/og/QR saíam com `localhost` em produção. `siteUrl()` (`src/lib/site.ts`) virou **defensivo** (env não-local vence; senão em deploy Vercel usa o domínio; no client QR/share usam `window.location.origin`); Felipe também corrigiu a env na Vercel. Provado com `VERCEL=1` + env localhost → gera o domínio. **Lição:** nunca copiar `.env.local` inteiro pra Vercel sem revisar `NEXT_PUBLIC_SITE_URL`.
- **✨ Leva de melhorias (commit `4570aa2`, 01/07 tarde):** **fotos HD** (AVIF/WebP + `images.qualities`/`formats` no `next.config`; galeria `quality=90`, cards 82, thumbs do admin nítidos — antes `sizes=120px` borrado; original vai intacto pro Storage, era só exibição); **galeria em TELA CHEIA** (`Lightbox.tsx` — toca na foto → fullscreen com swipe/setas/teclado/contador/trava-scroll; montado na `CarGallery`, botão "ampliar" só em foto); botões **Apagar/Duplicar** do admin com destaque (borda/fundo, antes texto apagado); **filtros da vitrine COLAPSÁVEIS no mobile** (busca sempre visível + botão "Filtros" com `panelCount`); **safe-area do iPhone** no WhatsApp flutuante e voltar-ao-topo (`bottom-[calc(...+env(safe-area-inset-bottom))]`); menu mobile fecha em route change; **rate-limit** in-memory no `/api/lead` (30/min por IP, `src/lib/rate-limit.ts`) + validação UUID/sanitização (nunca bloqueia o WhatsApp, que é `<a>` + fetch keepalive). **QA por screenshot** (dev-browser `--headless`) em mobile(390)/tablet(820)/desktop(1440) — nada quebrando.
- **🎨 Camada cosmética "UAU" (commit `e8269ab`):** **reveal-on-scroll** (IntersectionObserver + cascata/stagger) com **js-gate à prova de falha** — script inline no `layout.tsx` marca `.js-reveal` no `<html>` ANTES da 1ª pintura e o CSS só esconde `[data-reveal]` quando essa classe existe (sem JS ou com reduced-motion nada some; `<html suppressHydrationWarning>`). **Barra de progresso** no topo (`ScrollProgress.tsx`, via rAF). **Spotlight** radial seguindo o cursor nos cards (`Reveal.tsx` = pointermove global + IntersectionObserver que re-observa por `usePathname`; classe `.spotlight` + `z-[2]` no texto do `CarCard`). **Hero +impactante:** grade `.hero-grid`, 3º orb amarelo, orbs flutuando (`orb-float-a/b/c`), glow `.text-glow-rucula`. **Microinterações:** shine varrendo botões cheios, hover glow no WhatsApp/voltar-ao-topo, **glass** (backdrop-blur) no header/filtros/banner; filtros da vitrine **sticky** no desktop. Regras em `globals.css`; componentes novos `Reveal.tsx` + `ScrollProgress.tsx` montados no `(site)/layout.tsx`. Tudo respeita `prefers-reduced-motion`. ✅ **VALIDADO por screenshot** (mobile/tablet/desktop) em 01/07 — o dev-browser funcionou com `dev-browser --headless run`.
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
