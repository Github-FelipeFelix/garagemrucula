# 🔐 Como ligar o "Entrar com Google" no painel

O botão **"Entrar com Google"** já está no site (`/admin/login`), mas só funciona depois de fazer **2 configurações** (uma no Google, outra no Supabase). São ~10 minutos. Faça na ordem.

> **Valores que você vai usar (copie daqui):**
> - **URL de redirecionamento (Google):** `https://lryzyydzjodywvzhiumx.supabase.co/auth/v1/callback`
> - **Site:** `https://www.garagemrucula.com.br`

---

## PARTE 1 — Google Cloud (criar as chaves)

Abra **https://console.cloud.google.com** logado na conta **garagemrucula@gmail.com**.

### 1.1 Criar um projeto
- No topo, clique no seletor de projeto → **"Novo projeto"**.
- Nome: `Garagem Rucula` → **Criar**. Espere criar e selecione ele.

### 1.2 Configurar a tela de consentimento
- No menu (☰) → **"APIs e serviços"** → **"Tela de permissão OAuth"**
  (nas contas novas aparece como **"Google Auth Platform" → Começar/Get started**).
- Preencha:
  - **Nome do app:** `Garagem Rúcula`
  - **E-mail de suporte:** `garagemrucula@gmail.com`
  - **Público (Audience):** escolha **Externo (External)**
  - **E-mail do desenvolvedor:** o seu e-mail
- Salve/continue até o fim.

### 1.3 Liberar quem pode entrar (usuários de teste)
- Ainda na **Google Auth Platform** → aba **"Público-alvo" (Audience)**.
- Em **"Usuários de teste" (Test users)** → **Adicionar** os e-mails:
  - `garagemrucula@gmail.com`
  - `felipeherrera.contato@gmail.com`
- Salvar. (Assim vocês entram sem o aviso de "app não verificado". Não precisa publicar nem passar por verificação da Google.)

### 1.4 Criar o "ID do cliente OAuth"
- Menu → **"APIs e serviços"** → **"Credenciais"**.
- **"+ Criar credenciais"** → **"ID do cliente OAuth"**.
- **Tipo de aplicativo:** `Aplicativo da Web`.
- **Nome:** `Garagem Rucula Web`.
- Em **"URIs de redirecionamento autorizados"** → **Adicionar URI** → cole **exatamente**:
  ```
  https://lryzyydzjodywvzhiumx.supabase.co/auth/v1/callback
  ```
- **Criar**. Vai aparecer uma janela com **"ID do cliente"** e **"Chave secreta do cliente"**.
- **Copie os dois** (deixe essa aba aberta ou anote num lugar seguro — NÃO mande pra ninguém).

---

## PARTE 2 — Supabase (colar as chaves)

Abra **https://supabase.com/dashboard**, entre no projeto da Garagem Rúcula.

### 2.1 Ligar o provedor Google
- Menu lateral → **"Authentication"** → **"Sign In / Providers"** (ou **"Providers"**).
- Encontre **"Google"** na lista → clique → **ative o botão (Enable)**.
- Cole:
  - **Client ID (for OAuth):** o *ID do cliente* que você copiou.
  - **Client Secret (for OAuth):** a *Chave secreta* que você copiou.
- **Save**.

### 2.2 Conferir os endereços permitidos
- Ainda em **"Authentication"** → **"URL Configuration"**.
- **Site URL:** `https://www.garagemrucula.com.br`
- **Redirect URLs** → **Add URL** e adicione estas três (uma de cada vez):
  ```
  https://www.garagemrucula.com.br/**
  https://garagemrucula.vercel.app/**
  http://localhost:3000/**
  ```
- **Save**.

---

## PARTE 3 — Testar
1. Abra **https://www.garagemrucula.com.br/admin/login** (dê um Ctrl+Shift+R pra atualizar).
2. Clique em **"Entrar com Google"**.
3. Escolha a conta **garagemrucula@gmail.com** e autorize.
4. Deve voltar pro painel **já logado**. ✅

---

## Se der errado
- **"Erro 400: redirect_uri_mismatch"** → o URI da Parte 1.4 está diferente do endereço do Supabase. Confira que colou **exatamente** `https://lryzyydzjodywvzhiumx.supabase.co/auth/v1/callback` (sem espaço, sem barra a mais).
- **Volta pro login dizendo que não deu** → o e-mail usado não está autorizado. Só os e-mails da lista do sistema entram (`garagemrucula@gmail.com` e `felipeherrera.contato@gmail.com`). Se quiser liberar outro, me avise pra eu adicionar no código.
- **"App não verificado"** → confirme que adicionou o e-mail em **Usuários de teste** (Parte 1.3).
- O login por **e-mail e senha continua funcionando** normalmente — o Google é só um atalho a mais.
