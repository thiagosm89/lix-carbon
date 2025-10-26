# 🚀 Deploy Corrigido para Vercel - LixCarbon

## ✅ Correções Aplicadas

### 1. **Configuração PostgreSQL para Serverless**
- ✅ Pool configurado com `max: 1` conexão
- ✅ Timeouts ajustados (10 segundos)
- ✅ `allowExitOnIdle: true` para fechar conexões idle
- ✅ SSL configurado corretamente

### 2. **Estrutura Serverless do Vercel**
- ✅ Criado `backend/api/index.js` como entry point
- ✅ Inicialização lazy do banco (primeira requisição)
- ✅ `vercel.json` atualizado para usar `api/index.js`

### 3. **Variáveis de Ambiente**
- ✅ `.env.example` criado como referência
- ✅ `.gitignore` já protege o `.env`

---

## 📋 Passos para Deploy

### **Backend (API)**

1. **No diretório do backend, faça commit das alterações:**
   ```bash
   cd backend
   git add .
   git commit -m "fix: Configuração serverless para Vercel com Neon PostgreSQL"
   git push origin main
   ```

2. **No Vercel, configure as variáveis de ambiente:**
   - `POSTGRES_URL` = `postgresql://neondb_owner:npg_JVR2fa6npxHS@ep-aged-cake-acvxsssa-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require`
   - `DATABASE_URL` = (mesmo valor acima)
   - `JWT_SECRET` = `desenvolvimento_secret_key_lixcarbon_123`
   - `NODE_ENV` = `production`
   - `FRONTEND_URL` = `https://seu-frontend.vercel.app` (URL do frontend após deploy)

3. **Redeploy no Vercel:**
   - O Vercel vai detectar as mudanças e fazer novo deploy automaticamente
   - Ou force um redeploy no dashboard do Vercel

4. **Teste a API:**
   ```bash
   curl https://seu-backend.vercel.app/api/health
   ```
   
   Resposta esperada:
   ```json
   {"status":"OK","message":"LixCarbon API está funcionando!"}
   ```

---

### **Frontend**

1. **Atualize a variável de ambiente no Vercel:**
   - `REACT_APP_API_URL` = `https://seu-backend.vercel.app/api`

2. **Redeploy do frontend:**
   - O Vercel vai fazer redeploy automaticamente
   - Ou force um redeploy manual

---

## 🔍 Verificações

### **API Funcionando:**
```bash
# Health check
curl https://seu-backend.vercel.app/api/health

# Login teste
curl -X POST https://seu-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lixcarbon.com","senha":"admin123"}'
```

### **Frontend Conectado:**
1. Abra `https://seu-frontend.vercel.app`
2. Tente fazer login com:
   - Email: `admin@lixcarbon.com`
   - Senha: `admin123`

---

## 🐛 Troubleshooting

### **Erro: "Client network socket disconnected"**
- ✅ **RESOLVIDO**: Pool configurado para serverless
- Se persistir: Verifique se `POSTGRES_URL` está correta no Vercel

### **Erro: "CORS blocked"**
- Certifique-se que `FRONTEND_URL` no backend aponta para o frontend correto
- Exemplo: `https://lixcarbon-frontend.vercel.app`

### **Erro: "Cannot find module"**
- Verifique se `vercel.json` aponta para `api/index.js`
- Confirme que a pasta `backend/api/` existe no repositório

### **Banco não inicializa:**
- Primeira requisição pode demorar ~10 segundos (cold start)
- Verifique logs no Vercel: Settings > Functions > View Logs

---

## 📁 Arquivos Modificados

```
backend/
├── api/
│   └── index.js           ← NOVO (entry point Vercel)
├── database/
│   └── db.js              ← Atualizado (config serverless)
├── server.js              ← Atualizado (não inicia em Vercel)
├── vercel.json            ← Atualizado (aponta para api/index.js)
└── .env.example           ← NOVO (referência variáveis)
```

---

## 🎯 Próximos Passos

1. **Commit e Push do Backend**
2. **Configure variáveis de ambiente no Vercel**
3. **Aguarde o redeploy automático**
4. **Teste a API com curl**
5. **Atualize `REACT_APP_API_URL` no frontend**
6. **Teste login no frontend**

---

## ✅ Checklist Final

- [ ] Backend deployado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] API respondendo em `/api/health`
- [ ] Login funcionando na API
- [ ] Frontend deployado no Vercel
- [ ] Frontend conectado à API
- [ ] Login funcionando no frontend
- [ ] Dashboard carregando dados do PostgreSQL

---

**🎉 Pronto! Sua aplicação estará rodando no Vercel com PostgreSQL (Neon)!**

