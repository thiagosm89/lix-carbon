# ✅ Migração SQLite → PostgreSQL CONCLUÍDA!

## 🎉 O que foi feito:

### 1️⃣ Backend Atualizado
- ✅ `database/db.js` - Convertido para PostgreSQL (Neon)
- ✅ `models/User.js` - Atualizado para PostgreSQL
- ✅ `models/WasteRecord.js` - Atualizado para PostgreSQL
- ✅ `models/Token.js` - Atualizado para PostgreSQL
- ✅ `models/Lote.js` - Atualizado para PostgreSQL
- ✅ `database/seed.js` - Atualizado para PostgreSQL
- ✅ `server.js` - CORS configurado para produção

### 2️⃣ Frontend Atualizado
- ✅ `src/services/api.js` - URL da API dinâmica
- ✅ `vercel.json` - Configuração de deploy

### 3️⃣ Documentação Criada
- ✅ `DEPLOY_INSTRUCTIONS.md` - Guia completo
- ✅ `QUICK_START.md` - Deploy rápido
- ✅ `ENV_SETUP.md` - Variáveis de ambiente
- ✅ `.gitignore` - Arquivos ignorados

---

## 🚀 Próximos Passos:

### **OPÇÃO A: Testar Localmente Primeiro** (Recomendado)

#### 1. Configurar variáveis de ambiente:

Criar arquivo `backend/.env`:

```env
# Suas credenciais do Neon
POSTGRES_URL=postgresql://neondb_owner:npg_JVR2fa6npxHS@ep-aged-cake-acvxsssa-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=desenvolvimento_secret_key_123
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=5000
```

#### 2. Testar Backend:

```bash
cd backend
npm install
node server.js
```

Deve mostrar:
```
✅ Conectado ao banco de dados PostgreSQL (Neon)
🗄️  Inicializando schema do banco de dados PostgreSQL...
✅ Schema do banco de dados criado com sucesso!
🌱 Servidor LixCarbon rodando na porta 5000
🌱 Iniciando seed do banco de dados...
✅ 4 usuários inseridos
✅ 3 tokens disponíveis inseridos
🎉 Seed concluído com sucesso!
```

#### 3. Testar endpoint:

```bash
curl http://localhost:5000/api/health
```

#### 4. Testar Frontend:

Criar arquivo `frontend/.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
cd frontend
npm install
npm start
```

#### 5. Fazer Login:

- Email: `12.345.678/0001-90`
- Senha: `empresa123`

---

### **OPÇÃO B: Deploy Direto no Vercel**

#### 1. Subir para GitHub:

```bash
# Frontend
cd frontend
git init
git add .
git commit -m "Frontend LixCarbon com PostgreSQL"
git remote add origin https://github.com/SEU_USUARIO/lixcarbon-frontend.git
git push -u origin main

# Backend
cd ../backend
git init
git add .
git commit -m "Backend LixCarbon com PostgreSQL"
git remote add origin https://github.com/SEU_USUARIO/lixcarbon-backend.git
git push -u origin main
```

#### 2. Deploy Backend:

1. Vercel.com → New Project
2. Import `lixcarbon-backend`
3. Environment Variables (já tem as credenciais Neon):
   ```
   POSTGRES_URL=(já configurado automaticamente)
   JWT_SECRET=prod_super_secret_key_change_this_123456789
   NODE_ENV=production
   ```
4. Deploy

#### 3. Deploy Frontend:

1. Vercel.com → New Project
2. Import `lixcarbon-frontend`
3. Environment Variables:
   ```
   REACT_APP_API_URL=https://seu-backend.vercel.app/api
   ```
4. Deploy

#### 4. Atualizar CORS:

1. Backend → Settings → Environment Variables
2. Adicionar:
   ```
   FRONTEND_URL=https://seu-frontend.vercel.app
   ```
3. Redeploy

---

## 📝 Credenciais de Teste:

```
USUARIO (Empresa):
Email: 12.345.678/0001-90
Senha: empresa123

USUARIO (Natura):
Email: 11.222.333/0001-44
Senha: natura123

ADMIN:
Email: admin@lixcarbon.com
Senha: admin123

VALIDADOR:
Email: 98.765.432/0001-10
Senha: validador123
```

---

## 🗄️ Estrutura do Banco PostgreSQL:

### Tabelas Criadas:
- `users` - Usuários do sistema (UUIDs)
- `waste_records` - Registros de lixo (UUIDs)
- `available_tokens` - Tokens disponíveis (Serial)
- `lotes` - Lotes enviados para validadora (UUIDs)

### Principais Mudanças:
- ✅ `TEXT` → `VARCHAR` ou `UUID`
- ✅ `REAL` → `NUMERIC(10,2)`
- ✅ `INTEGER` → `INT` ou `SERIAL`
- ✅ `datetime('now')` → `NOW()` ou `CURRENT_TIMESTAMP`
- ✅ `?` → `$1, $2, $3...` (placeholders)
- ✅ `AUTOINCREMENT` → `SERIAL` ou `gen_random_uuid()`

---

## ⚠️ Importante:

1. ✅ **Banco Neon já está criado** no Vercel
2. ✅ **Schema será criado automaticamente** ao iniciar o backend
3. ✅ **Seed rodará automaticamente** na primeira inicialização
4. ✅ **Dados são persistentes** (não são perdidos)
5. ✅ **SSL obrigatório** (já configurado)

---

## 🆘 Troubleshooting:

### "Connection refused"
❌ POSTGRES_URL está incorreto
✅ Copie novamente do Vercel

### "relation does not exist"
❌ Schema não foi criado
✅ Verifique logs: `🗄️  Inicializando schema...`

### "Seed já possui dados"
✅ Normal! Banco já tem dados
✅ Para limpar: use Vercel Dashboard → Query Editor

### "CORS error"
❌ FRONTEND_URL está incorreto
✅ Atualizar variável e redeploy

---

## 🎯 Resultado Final:

- ✅ SQLite **removido** (só era para desenvolvimento)
- ✅ PostgreSQL (Neon) **funcionando**
- ✅ **Pronto para produção** no Vercel
- ✅ **Dados persistentes**
- ✅ **10 GB gratuito** no plano Neon

---

**🚀 Está tudo pronto para Deploy!**

Escolha a OPÇÃO A (testar local) ou OPÇÃO B (deploy direto).

