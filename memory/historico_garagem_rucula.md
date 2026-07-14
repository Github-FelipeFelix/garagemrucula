---
name: historico_garagem_rucula
description: "Changelog detalhado do Garagem Rúcula — o que foi feito em cada sessão, com commits, arquivos e o PORQUÊ/COMO. Detalhe que saiu do MEMORY.md pra mantê-lo enxuto."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0aec57f9-58d7-4a8e-bbc0-d1e9eac92fac
---

# Histórico / changelog — Garagem Rúcula

> Detalhe por sessão (mais recente primeiro). O estado atual e as pendências vivem no [[MEMORY]]; o plano/escopo em [[project_garagem_rucula]]; regras técnicas em [[aprendizados_rebobina]].

## 13/07/2026 (Opus 4.8) — Área de PEÇAS + galeria "Nosso espaço" + "Mover para Peças"
Commits `ad0442b` (peças + espaço) e `eec25a3` (mover). **Tudo no ar.**
- **(1) ÁREA DE PEÇAS** (farol, roda, pneus…), SEPARADA dos carros. Tabela `parts` PRÓPRIA (migração `0003_parts.sql`, rodada pelo Felipe; reusa o bucket `car-media` com prefixo `parts/`, sem bucket novo). **Fluxo de carros INTOCADO** — `queries.ts`, `car-input.ts`, `storage-media.ts`, `api/admin/cars/*`, `CarCard`, `Vitrine` não foram alterados (só adições). **Admin:** aba "Peças" (`/admin/pecas`) → lista + `nova` + `[id]` editar/apagar/**duplicar**, mesmo form dos carros (`PartForm`, mobile-first, capa por botão ⭐, QR por peça com `base="pecas"`). **Site:** menu "Peças" → `/pecas` (`PartsVitrine`: filtros categoria/estado/preço/busca/ordenar) + `/pecas/[slug]` (reusa `CarGallery`+`Lightbox`, ficha [categoria/estado/marca/compatibilidade], `InteressePecaButton`→WhatsApp msg pronta, `ShareButton`, `opengraph-image`, "veja também", selo VENDIDO, `ViewTracker partId`) + teaser na home (some se vazio). Campos: categoria (select `PART_CATEGORIES` em `types.ts`), condição (novo/seminovo/usado), marca, compatibilidade, preço, descrição, tags, fotos, vídeos, status, destaque, views. Libs próprias: `part-input.ts`, `parts-queries.ts`, `parts-storage.ts` (cópia/cleanup por-tabela, isolado do `storage-media.ts` dos carros). Rotas `/api/admin/parts` (POST) + `/[id]` (PATCH/DELETE) + `/[id]/duplicate`. Lead de peça unificado na tela Leads com selo peça/carro (`leads.part_id` aditivo; `/api/lead` só manda part_id quando é peça → carro continua idêntico). Sitemap/Header/Footer atualizados.
- **(2) Galeria "Nosso espaço" (Sobre):** admin sobe/reordena fotos em `/admin/site` (seção "Fotos do espaço", reusa `PhotoUploader` com `folder="espaco"`); guardado em `site_settings.data.aboutPhotos` (jsonb — SEM migração nova). No Sobre, componente `EspacoGallery` mostra grade HD (`next/image` q90) que abre no `Lightbox`; some se vazia. `settings.ts` ganhou `aboutPhotos` + `sanitizeAboutPhotos`; a rota `/api/admin/settings` salva e limpa do bucket as fotos removidas (diff old→new, best-effort).
- **(3) "Mover para Peças":** botão na edição do carro (`CarForm`) → `POST /api/admin/cars/[id]/move-to-parts`: cria a peça a partir dos dados do carro, COPIA fotos/vídeos pra `parts/` (peça dona), apaga o carro e remove só os arquivos antigos que a peça NÃO adotou (`removeMediaSafely` dos carros) — **a foto da peça nunca some** (padrão do fix #39). Categoria fica em branco → redireciona pra edição da peça. Pra quando o primo cadastrou peça como carro antes de existir a área.
- **Infra compartilhada (aditiva):** `upload-url` aceita `folder` (allowlist cars/parts/espaco, mesmo bucket); `PhotoUploader`/`VideoUploader` ganharam prop `folder` (default "cars" → carros idênticos); `ViewTracker` aceita `carId` OU `partId`; `QrCard` aceita `base` ("carros"/"pecas").
- **QA:** build TS strict OK (0 erro novo de lint; os 5 são preexistentes). Contra o banco REAL: parts **11/11** (INSERT bate com o schema, RLS anon lê, RPC `bump_part_view` incrementa, lead com part_id) + move **E2E** (foto da peça sobrevive à exclusão do carro + limpeza — confirmado via API de listagem do storage, sem CDN); tudo self-cleaning (deixou o banco limpo). Prod smoke: páginas 200, `/admin/pecas` 307→login, `POST /api/admin/*` 401. Aprendizado #45 em [[aprendizados_rebobina]].

## 02/07/2026 (noite, Opus/…) — Feedback do PWA + AUTONOMIA
Commits `5db76bd`/`7874307`/`9c6f4ab`/`73e8d4c`/`7a08d75`. 7 pontos que o Felipe sentiu usando o PWA:
1. **Trocar foto fazia a TELA DESCER** — `scrollIntoView(block:nearest)` da `CarGallery` rolava a página; agora `scrollBy` só no container (QA: scrollY 0→0).
2. **Lightbox:** a tira agora SEGUE a foto ativa (mesmo scroll-container).
3. **Contorno da miniatura ativa cortava no topo** → `py-1.5` na tira.
4. **Seta do card:** near-miss entrava no anúncio → `before:-inset-2` amplia o clicável ~50px.
5. **Ícone do PWA** bem maior (sharp: trim + 94%/78% maskable; ⚠️ reinstalar o app pra ver).
6. **Login mobile:** OAuth esmaecido não redirecionava → `skipBrowserRedirect:true`+`window.location.href`; e-mail "carregando" eterno → `window.location.assign` (QA conta REAL: ~1,5s).
7. **AUTONOMIA — aba "Textos do site" (`/admin/site`)**: primo edita subtítulo do hero + 2 parágrafos do Sobre + 3 diferenciais; `site_settings` (jsonb 1 linha; migração 0002; RLS anon lê / service_role escreve); `getSiteSettings()` degrada pros defaults; E2E provado. WhatsApp/Instagram FORA de propósito. Confirmado: múltiplos destaques JÁ funcionam. Aprendizados #42–44.

## 02/07/2026 (FASE DE TESTES, Fable 5)
Commits `d7d15c8`/`fd08b69`/`4ed134d`/`2fe8527`. Auditoria estática de todo o src + QA runtime (20/20 páginas desktop+iPhone `isMobile`, 27/27 interações, 10/10 segurança, prod 100%). **4 fixes:**
1. **CRÍTICO** `storage-media.ts` — duplicate copiava só a REFERÊNCIA das fotos (mesmos paths) e delete removia do bucket → apagar original/cópia matava as fotos do sobrevivente. Agora duplicate COPIA os arquivos (`storage.copy`), DELETE remove só paths que nenhum outro carro usa, PATCH limpa órfãos da edição; validado no Storage real (8/8), 73 mídias/5 carros OK.
2. OG image com foto DEITADA (EXIF que o Satori não aplica → capa via `/_next/image`) + "GARAGEM RUCULA" all-caps sem acento.
3. `withRetry` nas leituras públicas.
4. sitemap em `REVALIDATE_PATHS` (carro novo indexa na hora). Aprendizados #38–41.

## 02/07/2026 (tarde) — Galeria + super-zoom + selos + marca sem acento
Commits `215ddc3`/`e0b2e3b`/`53520cc`/`d052d4c`. Setas+swipe na galeria (`CarGallery`) + contador + miniatura ativa destacada; FIM do delay ao trocar foto (pré-carrega vizinhas, janela `[ant,atual,próx]` empilhada + `loading=eager`); **fix "super zoom" no celular** (grids sem `grid-cols-1` na base estouravam o viewport pra 1504px → mobile-first; provado com iPhone emulado 1504→390 — aprendizado #33); selos sólidos/padronizados (Tailwind v4 `border` herda `currentColor` — #35) + `isolate` no card pro z-index dos filtros (#36); rodapé centralizado; **marca SEM acento "Rucula"** em 34 lugares/12 arquivos (os `.md` ficam com "Rúcula" de propósito). Aprendizados #33–37.

## 02/07/2026 (mais cedo) — Acesso ao admin no celular + segurança
Commit `42d1cda`. Admin é WEB (roda em qualquer aparelho; trava = login+whitelist, não o dispositivo). Feito: shortcut "Painel" no `manifest.ts`, link discreto no rodapé, guia `COMO-USAR-O-ADMIN.md`. **Auditoria de segurança (4 camadas OK):** whitelist (`lib/admins`) → `proxy.ts` (`getUser()`) → cada `/api/admin/*` re-checa `getAdminUser()` → RLS. Aprendizados #30–32. ⚠️ Pendente: 2FA na conta `garagemrucula@gmail.com`.

## 02/07/2026 (PC 2) — Fix admin mobile (capa/remover foto)
Trocar capa só existia via drag por alça de ~20px (intocável no touch) e o X tinha ~20px. `PhotoUploader`: botão "⭐ capa" (toque → `arrayMove(i→0)`), X e alça 32×32px. QA com toque real (Playwright `hasTouch`+`tap()`). Aprendizados #28–29.

## 01/07/2026 — Login Google, domínio, cosméticos, fotos HD, lightbox, carrossel
- **Login Google (OAuth)** commits `0fe4fe8`/`0bee878`: botão no `/admin/login` (`signInWithOAuth`), rota `/auth/callback` (`exchangeCodeForSession` PKCE, valida `next`, respeita `x-forwarded-host`); porteiro = `lib/admins.ts`. Setup Google Cloud + Supabase FEITO. Guia `COMO-CONFIGURAR-LOGIN-GOOGLE.md`. Google bloqueia login automatizado → validado até a tela do Google. Aprendizado #25.
- **Domínio + bug de SEO:** `www.garagemrucula.com.br` no ar. `NEXT_PUBLIC_SITE_URL` vazou `localhost` do `.env.local` pra Vercel (embutida no build) → `siteUrl()` (`lib/site.ts`) virou defensivo. Aprendizado #22.
- **Leva 2** (`b7b857f`/`8710217`/`b9e45a9`/`c1b00e9`): zoom no Lightbox (pinça/duplo-toque/pan), carrossel no card (`CarCardMedia`, evita `<button>` dentro de `<a>` — #23), OG image por carro (next/og), toast no admin, cursor pointer global (#26).
- **Leva 1** (`4570aa2`): fotos HD (AVIF/WebP + `images.qualities` — #24), Lightbox tela cheia, filtros colapsáveis no mobile, safe-area iPhone, rate-limit `/api/lead` (`lib/rate-limit.ts`).
- **Cosméticos "UAU"** (`e8269ab`): reveal-on-scroll com js-gate à prova de falha, barra de progresso, spotlight nos cards, hero com orbs/grade/glow, glass no header/filtros. Componentes `Reveal.tsx`+`ScrollProgress.tsx`. Respeita `prefers-reduced-motion`.

## Base (v1) — madrugada 30/06→01/07
- **Site público:** home (hero+destaques+grid), vitrine c/ filtros, página do carro (galeria fotos+vídeos, ficha, "tenho interesse"→WhatsApp+lead, QR, compartilhar, "veja também", selo VENDIDO), sobre, 404, error.
- **Admin:** login e-mail/senha OU Google, dashboard (métricas+leads), CRUD de carros (@dnd-kit + vídeos, ficha, tags, mods), status/destaque, duplicar, histórico de vendas (`car_sales` privado), leads, trocar senha, toast.
- **Infra:** PWA (SW network-first) + banner instalar; SEO (sitemap/robots/JSON-LD); favicon; Vercel Analytics; Supabase (clients read/server/admin, RLS, bucket `car-media` público, RPC `bump_car_view`).
