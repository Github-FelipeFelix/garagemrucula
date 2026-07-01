# Memory Index — Garagem Rúcula

## ➤ ONDE PARAMOS — ler ISTO primeiro · atualizar por último (att. 30/06/2026 — KICKOFF)
> Ponto único de continuidade entre os 2 PCs (pasta sincroniza pelo Google Drive). Início de sessão: ler este bloco. Fim de sessão: reescrevê-lo. **O canônico vive também no `CLAUDE.md` da raiz** (carrega automático mesmo antes da memória).

**🔴 INÍCIO DE TODA SESSÃO:** o hook `SessionStart` (`.claude/settings.json`) roda `scripts/sessao-inicio.ps1` → sincroniza git (se houver remote) + conserta o ponteiro de memória DESTA máquina. **1ª vez em cada PC:** rodar na mão `& "<repo>\scripts\sessao-inicio.ps1"` e **REINICIAR o Claude**.

**Projeto:** vitrine de carros do primo do Felipe (compra/venda de antigos, importados e modificados — turbo, rebaixado). Cliente vê o disponível → vai pro WhatsApp (+55 19 97416-5880) ou Instagram [@garagem_rucula](https://www.instagram.com/garagem_rucula/). Tem `/admin` mobile-first.

**Feito em 30/06 (kickoff):** scaffold Next.js 16.2.9 + React 19 + TS + Tailwind v4 (raiz); infra de continuidade 2-PCs (sessao-inicio.ps1 + hook + memory + CLAUDE.md); decisões de produto fechadas.

**PRÓXIMOS PASSOS:** (1) GitHub: pegar URL do repo c/ Felipe → `git remote add origin` → push. (2) Vercel: hospedar na conta EXISTENTE dele (`felipeherrera.contato@gmail.com`, Hobby s/ limite de projetos) conectada ao repo. (3) Supabase: pegar chaves do projeto novo (`garagemrucula@gmail.com`) → `.env.local` + schema tabela `cars` + storage + RLS. (4) Design tokens (paleta do logo) + processar logo, SEM vídeo na home. (5) PWA (manifest + SW network-first). (6) Site público + /admin. Testar de verdade (Chrome :9222 + dev-browser), desktop E mobile.

**Decisões fechadas:** sem vídeo na home; tema escuro/preto; vendidos ficam com selo "VENDIDO"; extras v1 = QR por carro + captura de leads + contador de views + histórico de vendas (TODOS). Paleta: verde rúcula + amarelo Senna + azul Senna sobre preto (detalhe no CLAUDE.md).

**Contas:** Supabase = conta NOVA `garagemrucula@gmail.com` (free 2 projetos/conta, e o Rebobina já ocupa a do Felipe). Vercel = conta atual do Felipe (Hobby não limita projetos; SMS não chega no e-mail novo). GitHub = repo na conta do Felipe (pegar URL).

---

## Índice
- [Projeto Garagem Rúcula — plano completo](project_garagem_rucula.md) — escopo do site + admin, stack, paleta, decisões, extras v1.
- [Setup & continuidade entre 2 PCs](setup_continuidade.md) — scaffold, contas, sessao-inicio.ps1, o que falta configurar.
- [Aprendizados herdados do Rebobina 3D](aprendizados_rebobina.md) — regras técnicas reaproveitadas (PostgREST, admin middleware, PWA SW, await serverless, testar de verdade).
