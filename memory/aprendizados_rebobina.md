---
name: aprendizados_rebobina
description: "Regras técnicas herdadas do Rebobina 3D e do EnergyDex, reaproveitadas no Garagem Rúcula para nascer com poucos bugs."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 67654963-a746-4d27-9b3c-c0f1c1074895
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
12. **dev-browser:** roda script JS em sandbox QuickJS (sem npm/fs host). `browser.getPage`, `page.goto/click/fill/evaluate/screenshot`. **Timeout de 30s por script** → dividir QA em scripts curtos. `setInputFiles` com path do host FALHA (fs bloqueado) → testar upload por outra via (ex: signed URL via REST). Daemon pode ficar órfão.

## Aprendizados novos — sessão Garagem Rúcula (01–02/07/2026)
13. **npm no Google Drive CORROMPE** (EBADF/EPERM; o `G:` nem aceita junction/reparse). Projetos Next ficam em disco LOCAL (`C:\dev\...`), sincronizados via GitHub — não pela pasta do Drive.
14. **`git clone` NÃO herda o `user.email` local** → o commit sai com o e-mail GLOBAL (ex: `felipe.felix@housi.com.br`). Rodar `git config user.email felipeherrera.contato@gmail.com` em CADA clone, senão a Vercel bloqueia o deploy.
15. **Vercel Hobby + repo PRIVADO bloqueia deploy** se o commit author/co-author não for membro ("commit author did not have contributing access"). Solução definitiva: **repo PÚBLICO** (some a trava); alternativa: author = dono + sem co-authors.
16. **SW cache-first em `/_next/static` → FALSO "hydration mismatch" no DEV** (serve bundle JS velho enquanto o server tem o novo). Em PROD NÃO afeta (assets têm hash de conteúdo). Ao investigar hydration no dev-browser: desregistrar o SW + `caches.delete()` antes de testar.
17. **Registro.br: apex/raiz = campo Nome VAZIO** (não `@`, que Cloudflare et al. usam). `A`→IP no raiz (vazio); `CNAME`→`www`.
18. **NUNCA versionar senha/segredo** — o repo é PÚBLICO. `.env.local` no `.gitignore`; senha do admin fica fora do git.
19. **supabase-js v2 exige Node 22 (WebSocket nativo) em script standalone** — dentro do Next funciona (Next provê WebSocket). Pra scripts Node avulsos (seed/admin/QA), usar a **REST API do Supabase via `fetch`**.
20. **lucide-react removeu ícones de marca** (Instagram etc) → criar SVG próprio, COM `width`/`height` explícitos (senão o SVG estica sem constraint).
21. **Next 16: renomear `middleware.ts` → `proxy.ts`** (função `middleware`→`proxy`; `config.matcher` igual).

## Aprendizados novos — sessão 2 Garagem Rúcula (01/07/2026, tarde/noite)
22. **`NEXT_PUBLIC_*` é embutida no BUILD** → se `NEXT_PUBLIC_SITE_URL` na Vercel tiver `localhost` (copiado do `.env.local`), sitemap/robots/canonical/og/QR saem com localhost em PROD. Fazer o helper `siteUrl()` DEFENSIVO: env não-local vence; senão, em deploy Vercel (`process.env.VERCEL`) usa o domínio canônico; no client, QR/share usam `window.location.origin`. Nunca copiar `.env.local` inteiro pra Vercel sem revisar.
23. **Card clicável com carrossel interno:** NÃO aninhar `<button>` dentro de `<a>` (HTML inválido → hydration mismatch). Padrão: o card é um `<div>`; foto e texto são `<Link>` IRMÃOS pro mesmo destino; setas/bolinhas são `<button>` irmãos com z-index acima + `preventDefault`/`stopPropagation`; swipe não dispara click (o browser distingue), então trocar foto ≠ navegar.
24. **next/image (Next 16):** `sizes` baixo (ex: `120px`) + quality default (75) = foto BORRADA. Pra qualidade: declarar `images.qualities` no `next.config` (senão `quality={90}` é ignorado) + `formats:['image/avif','image/webp']`. O arquivo ORIGINAL vai intacto pro Storage — a degradação é só na exibição.
25. **Google OAuth via Supabase:** (a) Google Cloud → OAuth Client "Web" com redirect `https://<ref>.supabase.co/auth/v1/callback` (o dono do projeto Cloud pode ser QUALQUER conta — não aparece no login); (b) Supabase → Auth → Providers → Google ON + Client ID/Secret + Site/Redirect URLs. Código: `signInWithOAuth({provider:'google', redirectTo:.../auth/callback})` + rota `/auth/callback` com `exchangeCodeForSession` (PKCE). Erro `"provider is not enabled"` = não ligou/salvou no Supabase. App "Testing" = só test users + aviso "não verificado"; **publicar** (scopes email/profile = não-sensíveis) NÃO exige verificação. Google **bloqueia login em browser automatizado** → validar só até a tela do Google; login completo é manual.
26. **`cursor:pointer` não é default em `<button>`/`<select>`** (só `<a>` tem) → parecem "não clicáveis". Regra global no `globals.css` pra `button`/`select`/`[role=button]`/`summary` + `not-allowed` nos disabled.
27. **Falso "hydration mismatch" no DEV por hot-reload** (além do SW, item 16): após várias edições, server e client podem ficar com versões diferentes do componente (ex: className antigo no diff do warning). NÃO é bug real → confirmar no **build de produção** (`npm run build && npm start` → hydration 0). Se persistir no dev, limpar `.next` com o dev parado.

## Aprendizados novos — sessão 3 (02/07/2026, PC 2)
28. **Alvo de toque mobile ≥32px + ação explícita em vez de drag:** ícone 12px + `p-1` ≈ 20px é INTOCÁVEL no dedo (mínimo recomendado ~44px; 32px já resolve em tile pequeno). E ação essencial NUNCA pode existir só via drag: no admin, "trocar capa" era só arrastar-pra-1ª-posição pela alça (dnd-kit com listeners SÓ na alça → tocar na foto não faz nada) — pro leigo no celular = "não funciona". Fix: botão explícito ("⭐ capa" → `arrayMove(i→0)`); drag vira atalho secundário.
29. **dev-browser daemon órfão v2 (named pipe) + bypass Playwright:** daemon quebra com `EADDRINUSE \\.\pipe\dev-browser-daemon-<user>`; se o processo velho for de sessão elevada, `taskkill /F` dá "Acesso negado" (sem UAC não mata). Limpar `daemon.pid`/`daemon-spawn.lock` não basta enquanto o pipe estiver preso. **Bypass que funciona:** usar o Playwright que o dev-browser instala em `~/.dev-browser/node_modules` DIRETO num script Node (`require('C:/Users/<user>/.dev-browser/node_modules/playwright')`; chromium já está em `%LOCALAPPDATA%\ms-playwright`). Bônus: `newContext({ hasTouch:true, isMobile:true, viewport:{width:390,...} })` + `locator().tap()` = QA com TOQUE real, mais fiel que click pra bug mobile.

Aplicação no projeto em [[project_garagem_rucula]] e [[setup_continuidade]].
