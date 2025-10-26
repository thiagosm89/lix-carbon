# 🚀 Instruções de Deploy - LixCarbon

## 📦 Estrutura do Projeto

O projeto está dividido em **duas partes independentes**:
- `frontend/` - Aplicação React
- `backend/` - API Node.js/Express

Cada parte será deployada **separadamente** no Vercel.

---

## 🔧 Pré-requisitos

1. ✅ Conta no **GitHub**
2. ✅ Conta no **Vercel** (https://vercel.com)
3. ✅ Conta no **Vercel Postgres** (ou outro banco)
4. ✅ **Git** instalado

---

## 📋 Passo 1: Criar Repositórios no GitHub

### Opção A - Dois Repositórios (Recomendado)

#### 1️⃣ Repositório do Frontend:

```bash
cd frontend
git init
git add .
git commit -m "Initial commit - Frontend LixCarbon"

# No GitHub, criar repositório: lixcarbon-frontend
git remote add origin https://github.com/SEU_USUARIO/lixcarbon-frontend.git
git branch -M main
git push -u origin main
```

#### 2️⃣ Repositório do Backend:

```bash
cd ../backend
git init
git add .
git commit -m "Initial commit - Backend LixCarbon"

# No GitHub, criar repositório: lixcarbon-backend
git remote add origin https://github.com/SEU_USUARIO/lixcarbon-backend.git
git branch -M main
git push -u origin main
```

### Opção B - Monorepo (Um Repositório)

```bash
cd .. # Voltar para raiz do projeto
git init
git add .
git commit -m "Initial commit - LixCarbon"

# No GitHub, criar repositório: lixcarbon
git remote add origin https://github.com/SEU_USUARIO/lixcarbon.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Passo 2: Configurar Banco de Dados

### ⚠️ **IMPORTANTE:** SQLite não funciona no Vercel!

Você precisa migrar para um banco de dados compatível:

### Opção Recomendada: Vercel Postgres

1. **Acesse:** https://vercel.com/dashboard
2. **Vá em:** Storage → Create Database
3. **Escolha:** Postgres
4. **Dê um nome:** lixcarbon-db
5. **Clique:** Create

6. **Copie as variáveis:**
   ```
   POSTGRES_URL="postgresql://..."
   POSTGRES_PRISMA_URL="postgresql://..."
   POSTGRES_URL_NON_POOLING="postgresql://..."
   POSTGRES_USER="..."
   POSTGRES_HOST="..."
   POSTGRES_PASSWORD="..."
   POSTGRES_DATABASE="..."
   ```

---

## 🚀 Passo 3: Deploy do Backend

### 1️⃣ Conectar Backend ao Vercel:

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione: `lixcarbon-backend` (ou `lixcarbon` se monorepo)
4. Se monorepo, configure:
   - **Root Directory:** `backend`

### 2️⃣ Configurar Variáveis de Ambiente:

Em **Environment Variables**, adicione:

```
POSTGRES_URL=postgresql://...
JWT_SECRET=sua_chave_secreta_super_segura_aqui_123456
FRONTEND_URL=https://seu-frontend.vercel.app
NODE_ENV=production
```

### 3️⃣ Deploy:

- Clique em **"Deploy"**
- Aguarde o deploy (1-3 minutos)
- **Copie a URL:** `https://lixcarbon-backend.vercel.app`

### 4️⃣ Testar:

```bash
curl https://lixcarbon-backend.vercel.app/api/health
```

Deve retornar:
```json
{"status":"OK","message":"LixCarbon API está funcionando!"}
```

---

## 🎨 Passo 4: Deploy do Frontend

### 1️⃣ Conectar Frontend ao Vercel:

1. Acesse: https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione: `lixcarbon-frontend` (ou `lixcarbon` se monorepo)
4. Se monorepo, configure:
   - **Root Directory:** `frontend`

### 2️⃣ Configurar Variáveis de Ambiente:

Em **Environment Variables**, adicione:

```
REACT_APP_API_URL=https://lixcarbon-backend.vercel.app/api
```

### 3️⃣ Deploy:

- Clique em **"Deploy"**
- Aguarde o build (2-5 minutos)
- **Copie a URL:** `https://lixcarbon.vercel.app`

---

## 🔄 Passo 5: Atualizar CORS do Backend

### 1️⃣ No Vercel Dashboard do Backend:

1. Vá em **Settings** → **Environment Variables**
2. Edite `FRONTEND_URL`
3. Altere para: `https://lixcarbon.vercel.app` (sua URL do frontend)
4. **Clique em "Save"**
5. **Redeploy** o backend

---

## ⚠️ Passo 6: Migrar Banco de Dados (CRÍTICO!)

Como estamos usando SQLite localmente, você precisa:

### Opção 1: Migrar Manualmente via SQL

1. **Conectar ao Postgres:**
   - Use ferramentas como **pgAdmin**, **DBeaver** ou **Vercel Dashboard**

2. **Executar Scripts:**
   ```sql
   -- Copie e execute o schema do arquivo backend/database/db.js
   -- Copie e adapte os dados do arquivo backend/database/seed.js
   ```

### Opção 2: Usar Ferramentas

```bash
# Instalar prisma (opcional)
npm install -g prisma
prisma init

# Ou usar script personalizado para migração
```

---

## ✅ Passo 7: Testar a Aplicação

1. **Acesse:** `https://lixcarbon.vercel.app`
2. **Faça Login** com credenciais de teste
3. **Teste todas as funcionalidades**

---

## 📝 Credenciais de Teste (após seed)

```
USUARIO:
Email: empresa@teste.com
Senha: senha123

VALIDADOR:
Email: validador@teste.com
Senha: senha123

ADMIN:
Email: admin@lixcarbon.com
Senha: admin123
```

---

## 🔧 Deploy Automático

Após configuração inicial:

1. **Faça alterações** no código
2. **Commit e Push:**
   ```bash
   git add .
   git commit -m "Atualizações"
   git push
   ```
3. **Vercel faz deploy automático!** 🎉

---

## 🆘 Problemas Comuns

### ❌ Erro CORS

**Solução:** Verifique se `FRONTEND_URL` no backend está correto

### ❌ API não responde

**Solução:** 
- Verifique logs no Vercel Dashboard
- Teste endpoint `/api/health`

### ❌ Banco não conecta

**Solução:**
- Verifique `POSTGRES_URL` está correto
- Confira se banco foi criado no Vercel

### ❌ Build falha

**Solução:**
- Verifique logs de build no Vercel
- Certifique-se que todas as dependências estão no `package.json`

---

## 📊 URLs Finais

- **Frontend:** https://lixcarbon.vercel.app
- **Backend:** https://lixcarbon-backend.vercel.app
- **API Health:** https://lixcarbon-backend.vercel.app/api/health

---

## 🎯 Próximos Passos

1. ✅ Deploy concluído
2. 🔐 Configurar domínio personalizado (opcional)
3. 📧 Configurar email (SendGrid, Mailgun)
4. 📊 Configurar analytics (Google Analytics, Vercel Analytics)
5. 🔒 Adicionar rate limiting e segurança extra

---

## 🆘 Precisa de Ajuda?

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Discord:** https://vercel.com/discord
- **GitHub Issues:** Crie uma issue no repositório

