# QA local com Supabase simulado

Scripts da sessão de 29–30/10/2026 (incidente do Supabase bloqueado por cota).
Servem pra testar o site **sem depender do Supabase real**, inclusive o cenário
"banco cai depois da página boa estar no ar".

## Por que fora do OneDrive

`next build` dentro da pasta do projeto dá EPERM (o OneDrive trava o `.next`).
Junção pro `node_modules` não serve (o Turbopack recusa) e caminho longo estoura
o limite de 260 caracteres do Windows. Receita que funciona:

```bash
P="<pasta do projeto>"   # a de onde o Claude é aberto
Q="$TEMP/grqa"   # caminho CURTO, fora do OneDrive
mkdir -p "$Q" && cd "$P" && cp -r src public next.config.ts package.json tsconfig.json postcss.config.mjs next-env.d.ts "$Q/"
```
```powershell
robocopy "<projeto>\node_modules" "$env:TEMP\grqa\node_modules" /E /MT:16 /NFL /NDL /NJH /NJS /NP   # ~15 s; exit 1 = sucesso
```

## Rodando

```bash
node scripts/qa/mock-supabase.cjs &        # porta 54321; modos: /__mode/ok | /__mode/402 | /__mode/ok2
cd "$TEMP/grqa"
export NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-anon \
       SUPABASE_SERVICE_ROLE_KEY=mock-service NEXT_PUBLIC_SITE_URL=http://localhost:3100
npx next build && node node_modules/next/dist/bin/next start -p 3100 &
```

| Script | O que prova |
|---|---|
| `teste-isr.cjs` | banco cai (402) → home, `/carros` e anúncios já visitados **continuam no ar**; banco volta → tudo se atualiza sozinho (~2,5 min, espera o `revalidate=60`) |
| `teste-login.cjs <url> [mock]` | senha errada = "senha inválida"; servidor fora = aviso honesto (banner, envio e Google). Usa o Playwright de `~/.dev-browser` (iPhone emulado) |
| `teste-srcset.cjs` | miniaturas com 2 opções no srcset, galeria com 5; otimizador recusa largura/qualidade fora da lista, outro projeto e outro bucket |
| `teste-compressao.cjs` | compressão do `PhotoUploader` (código EXATO, transpilado) no Chromium e no WebKit: 12 MP → ~0,8 MB, rotação EXIF certa, PNG/foto leve intactos. Precisa do `typescript` e do `sharp` da cópia em `$TEMP/grqa` (ou `QA_DIR`) |

## Scripts que mexem com PRODUÇÃO (usar com cuidado)

Rodar da pasta do projeto, com o `.env.local` carregado (`set -a && . ./.env.local && set +a`):

| Script | O que faz |
|---|---|
| `backup-bucket.cjs <destino>` | backup completo do bucket `car-media` (somente leitura) + `manifest.json` com sha256; recusa destino que já tenha arquivos |
| `recomprimir-fotos.cjs <backup> <caminho-do-sharp> [--seco]` | recomprime IN-PLACE as fotos JPEG pesadas a partir do backup; `--seco` só calcula. Retomável e para no 1º erro. Confere com fura-cache (a CDN do Storage grátis não invalida ao sobrescrever) |
| `varre-sensivel.cjs varrer` | **rodar antes de commitar docs** (repo público): acha nomes de outros projetos, caminho local do OneDrive, usuário do Windows e e-mail corporativo no que é NOVO. Lista de nomes local em `.claude/hooks/nomes-sensiveis.json` |
| `valida-producao.cjs` | 15 checagens em www.garagemrucula.com.br (vitrine, anúncio/peça com cache, srcset, otimizador, OG, `/api/status`, sitemap, login no iPhone) |

No fim: parar os processos (conferir as portas 3100/54321 — o `next start` via `npx`
deixa processo órfão) e apagar `$TEMP/grqa`.

`next dev` com o Supabase real quebrou no `next/font/google` (Turbopack) — por isso
o QA é com build de produção + mock.
