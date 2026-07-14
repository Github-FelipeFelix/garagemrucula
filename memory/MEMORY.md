# Memory Index — Garagem Rúcula

## ➤ ONDE PARAMOS — ler ISTO primeiro · atualizar por último
**att. 13/07/2026 (Opus 4.8):** NOVA **ÁREA DE PEÇAS** (tabela `parts` própria, menu "Peças" → `/pecas` + admin) + galeria **"Nosso espaço"** no Sobre (admin sobe fotos) + botão **"Mover para Peças"** (converte carro→peça sem recadastrar). Migração `0003_parts.sql` rodada pelo Felipe. Tudo no ar. Detalhe em [[historico_garagem_rucula]].
> **Sessão 13/07 (tarde) — sem código:** consultoria de **precificação** (quanto cobrar por um site desse porte). A referência COM números/estratégia ficou **PRIVADA no Google Drive** (`G:\Meu Drive\004_Projetos\Garagem_Rucula\PRECIFICACAO-referencia.md`, sincroniza nos 2 PCs) — **fora do git** porque o repo é público. No git só o ponteiro sem números ([[precificacao_projeto]]). Nenhuma mudança de código/produto.

> Continuidade entre os 2 PCs via **GitHub**. Início: hook roda `git pull`. Fim: `git push`. Canônico também no `CLAUDE.md` da raiz.

**🟢 SITE NO AR (domínio próprio): https://www.garagemrucula.com.br** (apex → 308 pro www; `garagemrucula.vercel.app` também responde). Carros + **Peças** + Sobre c/ "Nosso espaço", cosméticos "UAU", fotos HD, lightbox c/ zoom, carrossel no card, login Google, admin mobile-first, editor de textos/fotos no admin. Deploy automático a cada `git push origin main`.

**AMBIENTE:** projeto em **`C:\dev\garagemrucula`** (disco local — NÃO no Drive; `npm install` corrompe lá com EBADF). GitHub `github.com/Github-FelipeFelix/garagemrucula` (**PÚBLICO**) = fonte da verdade. **Sempre abrir o Claude em `C:\dev\garagemrucula`.** Hook `SessionStart` → `sessao-inicio.ps1` faz `git pull`. **PC novo:** `git clone` → `git config user.email felipeherrera.contato@gmail.com` → copiar `.env.local` (na pasta antiga do Drive) → `npm install` (Node ideal 22+; no 20 dá só warning). Detalhes de setup em [[setup_continuidade]].

**Projeto:** vitrine de carros + peças do primo do Felipe (carros antigos/importados/modificados — turbo, rebaixado; peças = rodas, pneus, faróis, som…). Cliente vê o disponível → vai pro WhatsApp (+55 19 97416-5880, msg pronta) ou Instagram @garagem_rucula. `/admin` mobile-first (o primo é leigo, usa do celular em eventos). Plano/escopo em [[project_garagem_rucula]].

## 🔜 PENDÊNCIAS — COMEÇAR A PRÓXIMA SESSÃO POR AQUI
> ⚠️ Felipe pediu (02/07): estas ficam como pendência e **NÃO implementar por ora** (só se ele pedir). 2FA saiu da lista. Teste logado do admin: FEITO com a conta real.
1. 💡 **E-mail/notificação de novo lead** (Resend free): hoje o primo só vê interesse abrindo o admin. Alto valor.
2. 💡 **HEIC do iPhone no PhotoUploader** (validar/converter; irrelevante se o primo usa Android).
3. 💡 **Rate-limit distribuído (Upstash free)** em `/api/lead`, mesma assinatura de `rateLimit()`.
4. 💡 **Autonomia+ (só se pedir):** WhatsApp/Instagram no editor de textos (COM validação — é o CTA de venda) e/ou ícones dos diferenciais editáveis.
5. 🧹 **Dívida cosmética:** 5 lint errors preexistentes (`react-hooks/set-state-in-effect`, não quebram build); zoom por scroll no Lightbox (desktop); limpar assets antigos do cache do SW.
6. 🔎 *(só se repetir)* Login Google "fresh" — provável já resolvido pelo fix do OAuth mobile; se repetir, ver logs da Vercel.

## ✅ JÁ FEITO (uma linha cada — detalhe/commits/PORQUÊ em [[historico_garagem_rucula]])
- **Peças (13/07):** área nova SEPARADA dos carros — tabela `parts`, menu "Peças", `/pecas` (filtros) + página por peça (galeria, ficha, WhatsApp, share, OG), admin CRUD/duplicar/QR, teaser na home, leads unificados c/ selo peça/carro, botão "Mover para Peças". Fluxo de carros intocado. Migração 0003.
- **Galeria "Nosso espaço" no Sobre (13/07):** admin sobe/reordena fotos em `/admin/site` (`site_settings.aboutPhotos`, sem migração), grade HD → Lightbox.
- **Site público (v1):** home (hero+destaques+grid), vitrine c/ filtros, página do carro (galeria fotos+vídeos, ficha, "tenho interesse"→WhatsApp+lead, QR, compartilhar, "veja também", selo VENDIDO), sobre, 404/error.
- **Admin** (`/admin`, `proxy.ts` + whitelist `lib/admins`): login e-mail+senha OU Google; dashboard; CRUD carros (@dnd-kit + vídeos, ficha, tags, mods); status/destaque; duplicar; histórico de vendas (`car_sales` privado); leads; trocar senha; editor "Textos e fotos do site". Mobile-first (capa por botão ⭐, alvos ≥32px).
- **Visual/UX:** cosméticos "UAU" (reveal-on-scroll, progress bar, spotlight, hero orbs, glass); fotos HD (AVIF/WebP, quality 82–90); Lightbox (fullscreen+zoom); carrossel no card; galeria setas/swipe + troca instantânea; selos sólidos padronizados; **marca SEM acento "Rucula"** (só os `.md` internos mantêm "Rúcula").
- **Infra:** PWA (SW network-first) + banner instalar; SEO (sitemap/robots/JSON-LD + `siteUrl()` defensivo); favicon; Vercel Analytics; Supabase (clients read/server/admin, RLS, bucket `car-media` público c/ prefixos cars//parts//espaco/, RPCs `bump_car_view`/`bump_part_view`); rate-limit `/api/lead`; login Google (OAuth PKCE).
- **Segurança:** 4 camadas OK (whitelist → `proxy.ts` `getUser()` → cada `/api/admin/*` re-checa `getAdminUser()` → RLS). ⚠️ pendente pro Felipe: 2FA na conta `garagemrucula@gmail.com`.
- **Senha do admin:** trocada pelo Felipe — **NUNCA versionar senha** (repo é público).

**Decisões fechadas:** sem vídeo na home; tema escuro/preto; vendidos c/ selo "VENDIDO"; **marca no site/admin SEM acento ("Rucula", 02/07)** — só os `.md` internos ficam com "Rúcula"; extras v1 (QR, leads, views, histórico vendas) TODOS feitos; **peças SEPARADAS dos carros** (tabela/menu/páginas próprios, 13/07). Paleta: verde rúcula #24a54b (claro #4ade80) + petróleo #013c43 + amarelo Senna #f3e838 + azul #204ba0 sobre preto #0a0a0a.

**Contas:** Supabase = `garagemrucula@gmail.com` (ref projeto `lryzyydzjodywvzhiumx`). Vercel = `felipeherrera.contato@gmail.com` (Hobby). git `user.email` DEVE ser `felipeherrera.contato@gmail.com` (bate com a Vercel).

---

## Índice
- [Projeto — plano/escopo completo](project_garagem_rucula.md)
- [Setup & continuidade (local + GitHub)](setup_continuidade.md)
- [Histórico/changelog detalhado (commits, arquivos, PORQUÊ)](historico_garagem_rucula.md)
- [Aprendizados técnicos (Rebobina + deploy/infra)](aprendizados_rebobina.md)
- [Precificação — quanto cobrar por um site desse porte](precificacao_projeto.md) — só PONTEIRO; conteúdo (faixas/recorrência/estratégia) fica PRIVADO no Drive (`G:\Meu Drive\004_Projetos\Garagem_Rucula\`), fora do git público
