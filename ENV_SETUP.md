# 🔧 Configuração de Variáveis de Ambiente

## 📝 Desenvolvimento Local

### Frontend (.env.local)

Criar arquivo `frontend/.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)

Criar arquivo `backend/.env`:

```env
# Banco de Dados (desenvolvimento local usa SQLite)
# Não precisa configurar nada aqui para desenvolvimento

# JWT Secret
JWT_SECRET=desenvolvimento_secret_key_123

# CORS
FRONTEND_URL=http://localhost:3000

# Porta
PORT=5000

# Ambiente
NODE_ENV=development
```

---

## 🌐 Produção (Vercel)

### Backend - Environment Variables

No Vercel Dashboard do backend, adicionar:

```env
# Banco de Dados PostgreSQL (obrigatório no Vercel)
POSTGRES_URL=postgresql://user:password@host:5432/database

# JWT Secret (IMPORTANTE: Use uma chave forte!)
JWT_SECRET=prod_super_secret_key_change_this_123456789

# CORS - URL do frontend
FRONTEND_URL=https://seu-frontend.vercel.app

# Ambiente
NODE_ENV=production
```

### Frontend - Environment Variables

No Vercel Dashboard do frontend, adicionar:

```env
# URL da API
REACT_APP_API_URL=https://seu-backend.vercel.app/api
```

---

## 🔐 Gerando JWT_SECRET Seguro

### Opção 1: Node.js

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Opção 2: OpenSSL

```bash
openssl rand -hex 64
```

### Opção 3: Online

https://www.grc.com/passwords.htm (use "63 random alpha-numeric characters")

---

## ✅ Como Testar

### Desenvolvimento Local:

```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm start
```

Acesse: http://localhost:3000

### Produção:

```bash
# Testar Backend
curl https://seu-backend.vercel.app/api/health

# Testar Frontend
# Abra no navegador: https://seu-frontend.vercel.app
```

---

## ⚠️ Importante

1. **Nunca** commite arquivos `.env` no Git
2. **Sempre** use chaves diferentes para desenvolvimento e produção
3. **Rotacione** o JWT_SECRET regularmente em produção
4. **Documente** as variáveis necessárias para novos desenvolvedores

---

## 📂 Arquivos .gitignore

Certifique-se que os `.gitignore` estão corretos:

### frontend/.gitignore
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### backend/.gitignore
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## 🆘 Troubleshooting

### "Cannot read properties of undefined (reading 'REACT_APP_API_URL')"

❌ Variável não foi carregada
✅ Reinicie o servidor (npm start)
✅ Verifique se o arquivo .env.local existe
✅ Verifique se a variável começa com `REACT_APP_`

### "CORS error"

❌ FRONTEND_URL no backend está errado
✅ Verifique se a URL está correta
✅ Não adicione `/` no final da URL
✅ Redeploy o backend após mudar variável

### "Database connection failed"

❌ POSTGRES_URL está incorreto
✅ Copie novamente do Vercel Postgres Dashboard
✅ Verifique se o banco foi criado
✅ Teste a conexão localmente primeiro

