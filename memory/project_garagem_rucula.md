---
name: project_garagem_rucula
description: "Plano completo do site Garagem Rúcula — escopo do site público + admin, stack, paleta, decisões e extras."
metadata: 
  node_type: memory
  type: project
  originSessionId: 67654963-a746-4d27-9b3c-c0f1c1074895
---

# Garagem Rúcula — plano

> **STATUS (02/07/2026):** v1 IMPLEMENTADO e no ar em https://garagemrucula.vercel.app. Este arquivo é o plano/escopo original; o **estado atual e as pendências** (cosméticos, rate-limit, domínio, cadastro) vivem no [[MEMORY]] e no `CLAUDE.md`.

Vitrine de carros do primo do Felipe. Nicho: antigos, importados, modificados (turbo, rebaixado, rodas, som…). Ninguém compra pelo site → redireciona pro **WhatsApp +55 19 97416-5880** (mensagem pré-preenchida com o carro) ou **Instagram @garagem_rucula** (~40 mil seguidores). Domínio reservado: **www.garagemrucula.com.br** (Registro.br). E-mail do primo: **garagemrucula@gmail.com**.

**História da marca:** primeiro fusca que ele montou (verde rúcula, turbo, rodas de Porsche) vendeu por R$110 mil → daí o nome. Ele é fã do Senna (logo tem silhueta do Senna + kombi em homenagem). Felipe tem um fusca rat look 1973 comprado com ele.

## Site público
- **Home** (SEM vídeo): marca + carros em destaque + grid dos disponíveis.
- **Vitrine** com filtros: marca, ano, faixa de preço, tags do nicho (turbo/rebaixado/antigo/importado…).
- **Página do carro:** galeria fotos + vídeos, preço, ficha técnica (ano, km, motor, câmbio, cor, combustível), lista de modificações/acessórios, botão WhatsApp (msg pronta) + Instagram + compartilhar.
- Botão WhatsApp flutuante. Sobre/Contato.
- **Vendidos** ficam visíveis com selo **"VENDIDO"** (prova social).

## /admin (só o primo) — mobile-first
- Login por **e-mail/senha OU Google (OAuth)** (`garagemrucula@gmail.com`). Porteiro = lista de e-mails em `lib/admins.ts`.
- CRUD de carros: upload de várias fotos com arrastar-reordenar (@dnd-kit), vídeos, preço, ficha, modificações.
- Status: Disponível / Reservado / Vendido. Destaque na home.
- **Extras v1 (todos aprovados):** QR Code por carro (colar no vidro em eventos); captura de leads (clique "tenho interesse" → WhatsApp + registro no admin); contador de visualizações; histórico de vendas (por quanto vendeu — privado).

## Stack & paleta
Next.js 16 + React 19 + TS + Tailwind v4 + Supabase (Postgres/Auth/Storage + RLS) + Vercel + PWA. Libs: @dnd-kit, lucide-react, qrcode.
Paleta (tema escuro): fundo preto `#0A0A0A`; verde rúcula primária (base `#2E7D32`, clara p/ texto `#4ADE80`); amarelo Senna destaque (`#F4D03F`); azul Senna secundária (`#1E66C7`); texto `#FAFAFA`/`#D4D4D8`. Amostrar hex exatos do `Logos/Logo Garagem Rucula.pdf.png` ao implementar.

Detalhes técnicos e regras em [[aprendizados_rebobina]]. Estado e setup em [[setup_continuidade]].
