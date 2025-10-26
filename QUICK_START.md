# ⚡ Quick Start - Deploy no Vercel

## 🎯 Resumo Rápido

Este guia te leva do zero ao deploy em **~15 minutos**.

---

## 📋 Checklist

- [ ] Conta no GitHub
- [ ] Conta no Vercel  
- [ ] Git instalado
- [ ] Node.js instalado

---

## 🚀 Deploy em 5 Passos

### 1️⃣ Subir Frontend para GitHub (2 min)

```bash
cd frontend
git init
git add .
git commit -m "Frontend LixCarbon"

# No GitHub, criar: lixcarbon-frontend
git remote add origin https://github.com/SEU_USUARIO/lixcarbon-frontend.git
git branch -M main
git push -u origin main
```

### 2️⃣ Subir Backend para GitHub (2 min)

```bash
cd ../backend
git init
git add .
git commit -m "Backend LixCarbon"

# No GitHub, criar: lixcarbon-backend
git remote add origin https://github.com/SEU_USUARIO/lixcarbon-backend.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy Backend no Vercel (5 min)

1. **Vercel.com** → New Project
2. **Import:** `lixcarbon-backend`
3. **Environment Variables:**
   ```
   JWT_SECRET=minha_chave_super_secreta_123
   NODE_ENV=production
   ```
4. **Deploy** → Copiar URL: `https://seu-backend.vercel.app`

### 4️⃣ Deploy Frontend no Vercel (5 min)

1. **Vercel.com** → New Project
2. **Import:** `lixcarbon-frontend`
3. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://seu-backend.vercel.app/api
   ```
4. **Deploy** → Copiar URL: `https://seu-frontend.vercel.app`

### 5️⃣ Atualizar CORS (1 min)

1. **Vercel** → Backend → Settings → Environment Variables
2. **Adicionar:**
   ```
   FRONTEND_URL=https://seu-frontend.vercel.app
   ```
3. **Redeploy** (Deployments → ... → Redeploy)

---

## ✅ Pronto!

Acesse: `https://seu-frontend.vercel.app`

**Credenciais:**
- Email: `12.345.678/0001-90`
- Senha: `senha123`

---

## ⚠️ IMPORTANTE: Banco de Dados

O SQLite **não funciona** no Vercel!

### Solução Rápida: Vercel Postgres

1. **Vercel** → Storage → Create Database → Postgres
2. **Copiar** variáveis de ambiente
3. **Backend** → Settings → Environment Variables → Adicionar `POSTGRES_URL`
4. **Migrar** dados (ver `DEPLOY_INSTRUCTIONS.md`)

---

## 🆘 Problemas?

### Frontend não conecta no Backend
✅ Verifique `REACT_APP_API_URL` no frontend

### Erro CORS
✅ Verifique `FRONTEND_URL` no backend

### API retorna erro 500
✅ Veja logs: Vercel Dashboard → Backend → Deployments → View Function Logs

---

## 📚 Mais Detalhes

Ver arquivo completo: `DEPLOY_INSTRUCTIONS.md`

