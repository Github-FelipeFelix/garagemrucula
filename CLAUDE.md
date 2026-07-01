# CLAUDE.md — Garagem Rúcula

> Site de **anúncio/vitrine de carros** do primo do Felipe (compra e venda de veículos antigos, importados e modificados — turbo, rebaixado, etc.). Instagram [@garagem_rucula](https://www.instagram.com/garagem_rucula/) (~40 mil seguidores). Ninguém compra pelo site: o cliente entra, vê o que está disponível (fotos, vídeos, ficha, modificações) e é levado pro **WhatsApp (+55 19 97416-5880, com mensagem pronta do carro)** ou **Instagram**. Tem `/admin` pra ele gerenciar tudo (inclusive do celular, em eventos).

---

## 🟢 ONDE PARAMOS — ler ISTO primeiro · atualizar por último
> Ponto único de continuidade entre os 2 PCs (a pasta sincroniza pelo Google Drive). Início de sessão: ler isto. Fim de sessão: reescrever isto + os arquivos de `memory/`.

**Estado (sessão 30/06/2026 — kickoff, PC principal C:):** Projeto recém-criado. Já feito nesta sessão:
- ✅ Scaffold **Next.js 16.2.9 + React 19.2.4 + TypeScript + Tailwind v4** na raiz da pasta (criado via create-next-app, movido pra raiz). `git init` local feito pelo create-next-app (SEM remote ainda).
- ✅ Infra de **continuidade entre 2 PCs**: `scripts/sessao-inicio.ps1` + hook `SessionStart` em `.claude/settings.json` + pasta `memory/` + este CLAUDE.md.
- ✅ Decisões de produto fechadas (abaixo).
- ⚠️ **Logo** está em `Logos/Logo Garagem Rucula.pdf.png` (fusca verde rúcula + kombi branca + Senna sobre fundo preto/amarelo/azul). Ainda NÃO processado para o site/PWA.

**PRÓXIMOS PASSOS (em ordem):**
1. **Vercel:** hospedar na conta Vercel EXISTENTE do Felipe (`felipeherrera.contato@gmail.com`) — Hobby não limita nº de projetos, fica grátis. (Não criar conta nova: o SMS de verificação não chega no `garagemrucula@gmail.com` porque o celular já está atrelado à conta dele.) Conectar ao repo do GitHub.
2. **GitHub:** Felipe criou um repo. **PEGAR A URL** com ele → `git remote add origin <url>` → primeiro push. (Sem remote, o `sessao-inicio.ps1` pula o sync de código, mas a pasta sincroniza pelo Drive mesmo assim.)
3. **Supabase:** Felipe JÁ criou o projeto na conta nova `garagemrucula@gmail.com`. **PEGAR as chaves** (Project Settings → API: Project URL, anon key, service_role) → montar `.env.local`. Criar schema (tabela `cars` + storage de fotos/vídeos + RLS).
4. **Design tokens** (paleta abaixo) em `globals.css` + fontes; processar o logo; **sem vídeo na home**.
5. **PWA** (manifest + service worker network-first) — copiar padrão do Rebobina.
6. Construir **site público** e **/admin** (escopo abaixo). Testar de verdade (Chrome real :9222 + dev-browser), desktop E mobile, antes de dizer "feito".

**Contas (resolvendo o medo de virar pagante):** o limite que pega é **Supabase free = 2 projetos por conta** (e o Rebobina já ocupa a do Felipe) → por isso o Supabase do Rúcula é uma **conta nova** (`garagemrucula@gmail.com`), cota grátis fresca. Vercel Hobby NÃO limita nº de projetos → hospeda na conta atual do Felipe sem custo.

---

## Decisões de produto (fechadas com o Felipe em 30/06)
- **Sem vídeo na home** (não faz sentido pro negócio dele).
- **Tema escuro sobre preto** (combina com o logo e valoriza foto de carro).
- **Carros vendidos:** continuam na vitrine com **selo "VENDIDO"** por cima (prova social — mostra que vende mesmo).
- **Extras do v1 (TODOS aprovados):**
  1. **QR Code por carro** — gera QR que leva à página do carro; ele imprime e cola no vidro nos eventos.
  2. **Captura de leads** — clique em "tenho interesse" vai pro WhatsApp E registra no admin (qual carro, quando).
  3. **Contador de visualizações** por carro.
  4. **Histórico de vendas** — registrar por quanto cada carro foi vendido (controle particular, não aparece no site).

## Escopo
**Site público:** Home (marca + destaques + grid de disponíveis) · Vitrine com filtros (marca, ano, faixa de preço, tags do nicho: turbo/rebaixado/antigo/importado…) · Página do carro (galeria fotos+vídeos, preço, ficha técnica [ano, km, motor, câmbio, cor, combustível], lista de modificações/acessórios, botão WhatsApp com msg pré-preenchida + Instagram + compartilhar) · botão WhatsApp flutuante · Sobre/Contato.
**/admin (só o primo):** login por e-mail · CRUD de carros (upload de várias fotos com arrastar-reordenar via dnd-kit, vídeos, preço, ficha, modificações) · status Disponível/Reservado/Vendido · destaque na home · QR por carro · leads · visualizações · histórico de vendas. Mobile-first.

## 🎨 Paleta (do logo) — tema escuro
- **Fundo:** preto `#0A0A0A` / superfícies `#141414` / `#1C1C1C`
- **Verde rúcula (primária):** tom encorpado do fusca — base ~`#2E7D32`, e variante CLARA p/ texto sobre escuro ~`#4ADE80`
- **Amarelo Senna (destaque):** ~`#F4D03F` / `#FFDB00` (preço, "disponível", CTAs)
- **Azul Senna (secundária):** ~`#1E66C7`
- **Texto:** branco `#FAFAFA` / muted `#D4D4D8`
- ⚠️ Regra herdada do Rebobina: **texto sobre fundo escuro usa a VARIANTE CLARA da cor**, nunca a base escura (contraste). Amostrar os hex exatos do logo ao implementar.

---

## Stack
Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 (`@tailwindcss/postcss`) · Supabase (Postgres + Auth + Storage) com RLS · Vercel (deploy via git push) · PWA. Lib de drag-n-drop: **@dnd-kit** (fotos do admin). Ícones: **lucide-react**. QR: **qrcode** (gerar) no admin.

## ⚠️ Regras de desenvolvimento (herdadas do Rebobina 3D — evitam bug)
1. **Supabase: NUNCA usar embedded joins do PostgREST** (`.select('*, x:y(*)')`) — banco sem FK constraints retorna `data:null` silencioso. **Sempre 2 queries + join manual no TypeScript.**
2. **Proteção do `/admin`:** lista de e-mails hardcoded no `src/middleware.ts` (ex.: `['garagemrucula@gmail.com', 'felipeherrera.contato@gmail.com']`). Deslogado → redirect login; logado sem permissão → home; rota `/api/*` → 401.
3. **Migrations (DDL):** `ALTER/CREATE TABLE` não passam pela API REST. Escrever `.sql` em `supabase/migrations/` e pedir ao Felipe rodar no **SQL Editor do Supabase**. Código deve degradar com segurança até a coluna existir.
4. **Serverless:** **sempre `await`** efeitos (upload, e-mail). `fn().catch(()=>{})` sem await é abandonado quando a função responde.
5. **Service worker NETWORK-FIRST para HTML/páginas** (deploy atualiza na hora). Cache-first só em assets com hash. **Nunca** cache-first em HTML (prende em versão velha).
6. **Storage de imagens:** Supabase Storage. Adicionar `remotePatterns` em `next.config.ts` p/ `**.supabase.co`.
7. **Valores/dados sensíveis no servidor** (não confiar no cliente). RLS desde o dia 1 (leitura pública dos carros; escrita só admin via service role / RLS).
8. **Deploy:** `git commit` + `git push origin main` ao fim de cada mudança relevante. **git user.email = `felipeherrera.contato@gmail.com`** (precisa bater com a conta da Vercel; outro e-mail bloqueia deploy no Hobby). TypeScript error quebra o build na Vercel.
9. **TESTAR DE VERDADE:** tsc/lint/build só garantem que compila. Validar na UI: Chrome REAL com `--remote-debugging-port=9222` + `dev-browser --connect` (Google bloqueia login OAuth em browser de automação), checar console, **desktop E mobile**, após deploy.
10. **PWA app único:** um manifest, service worker network-first. Instalável no celular (ele usa em eventos).
11. **Moeda BR / pt-BR** em toda a UI. Responder ao Felipe **sempre em português**.

## Continuidade entre os 2 PCs
- A pasta sincroniza pelo **Google Drive**. **Não rodar o Claude nos 2 PCs ao mesmo tempo** (risco de conflito no Drive).
- Hook `SessionStart` → `scripts/sessao-inicio.ps1`: sincroniza git (se houver remote) e conserta o `autoMemoryDirectory` desta máquina pra apontar pra `memory/` deste projeto.
- **1ª vez em cada PC:** rodar na mão `& "<repo>\scripts\sessao-inicio.ps1"`, depois **REINICIAR o Claude** (o ponteiro de memória só vale na próxima sessão).
- Toolchain do PC principal (C:): Node v20.12.2, npm 10.5.0, git 2.45.1. Vercel CLI NÃO instalado (deploy é git push). dev-browser disponível.
