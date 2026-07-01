# Garagem Rúcula

Site de vitrine de carros da **Garagem Rúcula** — compra e venda de veículos antigos, importados e modificados (fuscas, kombis, projetos turbo e rebaixado). O cliente vê os carros disponíveis (fotos, vídeos, ficha, modificações) e é levado ao **WhatsApp** (com mensagem pronta) ou **Instagram**. Inclui painel `/admin` mobile-first para o dono gerenciar tudo — inclusive do celular, em eventos.

🔗 **Site:** https://garagemrucula.vercel.app
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

- `src/app/(site)` — site público (home, vitrine, página do carro, sobre)
- `src/app/admin` — painel protegido (CRUD de carros, leads, vendas, trocar senha)
- `src/lib` — clients Supabase (leitura/servidor/admin), tipos, helpers
- `supabase/migrations` — schema SQL (rodar no SQL Editor do Supabase)

## Funcionalidades

- **Vitrine** com filtros: marca, ano, faixa de preço, estilo (turbo/rebaixado/…) e busca
- **Página do carro**: galeria de fotos/vídeos, ficha técnica, modificações, botão "tenho interesse" (abre o WhatsApp e registra o lead), QR Code, compartilhar
- **Admin**: cadastro com upload de fotos arrastáveis (dnd-kit), status, destaque na home, contador de visualizações, histórico de vendas (privado)
- Carros vendidos permanecem na vitrine com selo **"VENDIDO"** (prova social)
