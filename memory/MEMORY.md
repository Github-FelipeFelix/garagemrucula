# Memory Index — Garagem Rúcula

## ➤ ONDE PARAMOS — ler ISTO primeiro · atualizar por último (att. 01/07/2026)
> Ponto único de continuidade entre os 2 PCs, sincronizado via **GitHub**. Início de sessão: ler este bloco. Fim de sessão: reescrevê-lo. **O canônico vive também no `CLAUDE.md` da raiz.**

**🔴 MUDANÇA (01/07): o projeto SAIU do Google Drive → agora vive em DISCO LOCAL + GitHub.** Motivo: `npm install` corrompe no Drive (EBADF/EPERM — o G: nem aceita junction). Working dir do PC principal: **`C:\dev\garagemrucula`**. O **GitHub** (`github.com/Github-FelipeFelix/garagemrucula`) é a fonte da verdade e sincroniza TUDO (código + markdowns + `memory/`). A pasta antiga do Drive (`G:\...\Garagem Rucula`) está **APOSENTADA** (só guarda o `.env.local`). **SEMPRE abrir o Claude em `C:\dev\garagemrucula`.**

**INÍCIO DE SESSÃO:** hook `SessionStart` → `sessao-inicio.ps1` faz `git pull` (ff-only) + conserta ponteiro de memória. **FIM DE SESSÃO:** `git push`. **PC novo:** `git clone <repo> C:\dev\garagemrucula` → copiar `.env.local` → `npm install`. **Node 20 dá warning** (supabase-js quer 22); funciona, mas ideal atualizar p/ Node 22.

**Projeto:** vitrine de carros (compra/venda de antigos, importados, modificados). Cliente → WhatsApp (+55 19 97416-5880) ou Instagram @garagem_rucula. `/admin` mobile-first.

**🟢 SITE NO AR: https://garagemrucula.vercel.app** (deploy automático a cada `git push`). SQL já rodado; Supabase funcionando com dados reais.

**⚠️ APRENDIZADO CRÍTICO (deploy Vercel):** o clone local NÃO herda o `user.email` local do outro repo → os commits saíram como `felipe.felix@housi.com.br` e a Vercel Hobby **bloqueou** o deploy (repo privado + autor sem acesso). CORRIGIDO: `git config user.email felipeherrera.contato@gmail.com` no clone C:, E o **repo virou PÚBLICO** (Settings→Danger Zone) — o que remove a restrição de vez. Todo clone novo: rodar esse `git config`.

**FEITO (01/07):** ✅ GitHub público + Vercel no ar. ✅ Supabase (`.env.local`, ref `lryzyydzjodywvzhiumx`, SQL rodado, bucket testado). ✅ Logo→ícones/og. ✅ **SITE PÚBLICO** (home, vitrine, carro, sobre, 404) + **ADMIN** completo (login, dashboard, CRUD c/ upload fotos+dnd + **vídeos**, leads, QR, **histórico de vendas**, **trocar senha**). ✅ **Filtros** de marca/ano/preço/estilo/busca. ✅ **PWA** + banner **"instalar app"**. ✅ **Refinamento visual nível Rebobina** (estudei o projeto: Exo 2 + JetBrains Mono, eyebrows mono, orbs de glow, botões com glow, cards elevados, pulse no WhatsApp). ✅ QA desktop+mobile (zero erros). ✅ Usuário admin `garagemrucula@gmail.com` (senha já trocada pelo Felipe — NUNCA versionar senha aqui, o repo é PÚBLICO). Carro de teste `fusca-teste` no site (apagar no /admin quando quiser).

**FEITO na madrugada (autônomo, 01→02/07):** ✅ **SEO** (sitemap.xml dinâmico c/ carros, robots.txt, JSON-LD Product/Offer na pág do carro → preço no Google). ✅ **Veja também** (carros relacionados no fim da pág do carro). ✅ Header muda ao rolar. ✅ Dashboard c/ **leads recentes** + 4 métricas. ✅ **Duplicar carro** (rota + botão, cadastro rápido). ✅ Voltar-ao-topo + skeletons (loading.tsx) + **error.tsx** (tela de erro amigável). ✅ **favicon.ico** (do logo, via png-to-ico). ✅ **Vercel Analytics** (`@vercel/analytics` no layout — habilitar no painel da Vercel p/ ver visitas). ✅ Refinamento visual completo (ficha do carro c/ ícones lucide, Sobre c/ diferenciais, eyebrows vitrine/footer). ✅ **QA rigoroso**: criar/editar/duplicar/vender/apagar carro + filtros + trocar senha testados no browser; **prod sem erros**. NOTA: aviso de hydration no DEV era o service worker servindo bundle velho — em prod os assets têm hash, sem efeito.

**PRÓXIMOS PASSOS (dependem do Felipe):** (1) **Domínio**: DNS configurado no Registro.br (modo avançado, propagando ~2h). Quando `garagemrucula.com.br` resolver, **mudar `NEXT_PUBLIC_SITE_URL` na Vercel** pro domínio (o Claude NÃO tem acesso à conta Vercel p/ mudar env var; só monitora e avisa). (2) Trocar a senha temporária (/admin/senha). (3) Cadastrar carros reais + apagar `fusca-teste`. (4) Habilitar Analytics no painel Vercel. (5) (opcional) testar instalação PWA no celular.

**Decisões fechadas:** sem vídeo na home; tema escuro/preto; vendidos c/ selo "VENDIDO"; extras v1 = QR + leads + views + histórico vendas (TODOS). Paleta: verde rúcula #24a54b (claro #4ade80) + petróleo #013c43 + amarelo Senna #f3e838 + azul #204ba0 sobre preto #0a0a0a.

**Contas:** Supabase = conta NOVA `garagemrucula@gmail.com` (free 2 projetos/conta, e o Rebobina já ocupa a do Felipe). Vercel = conta atual do Felipe (Hobby não limita projetos; SMS não chega no e-mail novo). GitHub = repo na conta do Felipe (pegar URL).

---

## Índice
- [Projeto Garagem Rúcula — plano completo](project_garagem_rucula.md) — escopo do site + admin, stack, paleta, decisões, extras v1.
- [Setup & continuidade entre 2 PCs](setup_continuidade.md) — scaffold, contas, sessao-inicio.ps1, o que falta configurar.
- [Aprendizados herdados do Rebobina 3D](aprendizados_rebobina.md) — regras técnicas reaproveitadas (PostgREST, admin middleware, PWA SW, await serverless, testar de verdade).
