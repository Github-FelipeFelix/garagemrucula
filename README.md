# Garagem Rúcula

Site de vitrine de carros da **Garagem Rúcula** — compra e venda de veículos antigos, importados e modificados (fuscas, kombis, projetos turbo e rebaixado) e também **peças/acessórios** (rodas, pneus, faróis, som…). O cliente vê os itens disponíveis (fotos, vídeos, ficha, modificações) e é levado ao **WhatsApp** (com mensagem pronta) ou **Instagram**. Inclui painel `/admin` mobile-first para o dono gerenciar tudo — inclusive do celular, em eventos.

🔗 **Site:** https://www.garagemrucula.com.br
📸 **Instagram:** [@garagem_rucula](https://www.instagram.com/garagem_rucula/)

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** — tema escuro, cores amostradas do logo
- **Supabase** — Postgres + Auth + Storage, com RLS
- **Vercel** — deploy automático a cada push
- **PWA** — instalável no celular (service worker network-first)

## Rodando localmente

```bash
npm install
npm run dev
```

Crie um `.env.local` a partir do `.env.example` com as chaves do Supabase.

## Estrutura

- `src/app/(site)` — site público (home, vitrine de carros, **vitrine de peças `/pecas`**, páginas de carro/peça, sobre)
- `src/app/admin` — painel protegido (CRUD de **carros e peças**, leads, vendas, textos/fotos do site, trocar senha)
- `src/lib` — clients Supabase (leitura/servidor/admin), tipos, helpers (`queries`/`parts-queries`, `car-input`/`part-input`, `storage-media`/`parts-storage`)
- `supabase/migrations` — schema SQL (rodar no SQL Editor do Supabase): `0001` carros/leads/vendas, `0002` textos do site, `0003` peças

## Funcionalidades

- **Vitrine de carros** com filtros: marca, ano, faixa de preço, estilo (turbo/rebaixado/…) e busca
- **Página do carro**: galeria de fotos/vídeos, ficha técnica, modificações, botão "tenho interesse" (abre o WhatsApp e registra o lead), QR Code, compartilhar
- **Peças/acessórios** (área separada): vitrine `/pecas` com filtros (categoria, estado, preço, busca) + página por peça (galeria, ficha [categoria/estado/marca/compatibilidade], "tenho interesse"→WhatsApp, QR, compartilhar). Botão **"Mover para Peças"** converte um carro em peça sem recadastrar
- **Sobre** com galeria **"Nosso espaço"** (fotos da garagem, editáveis no admin)
- **Admin**: cadastro de carros e peças com upload de fotos arrastáveis (dnd-kit), status, destaque na home, contador de visualizações, histórico de vendas (privado), leads (com marcação carro/peça), **editor de textos e fotos do site** (Sobre/subtítulo do hero/fotos do espaço — sem mexer no código)
- Itens vendidos permanecem na vitrine com selo **"VENDIDO"** (prova social)
