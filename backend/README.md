# 🌱 LixCarbon - Backend API

API REST para gerenciamento de créditos de carbono através da coleta de resíduos.

## 🚀 Desenvolvimento Local

### Instalação

```bash
npm install
```

### Executar

```bash
node server.js
```

API disponível em: http://localhost:5000

## 📋 Endpoints Principais

### Auth
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Registro de novo usuário

### Dashboard
- `GET /api/dashboard/usuario` - Dashboard do usuário
- `GET /api/dashboard/admin` - Dashboard do admin
- `GET /api/dashboard/validador` - Dashboard do validador

### Waste (Resíduos)
- `GET /api/waste/meus-registros` - Listar registros do usuário
- `POST /api/waste/registrar` - Registrar novo token de lixo
- `GET /api/waste/disponiveis-lote` - Tokens disponíveis para lote (admin)

### Lotes
- `POST /api/lote/criar` - Criar novo lote (admin)
- `GET /api/lote` - Listar todos os lotes (admin)
- `GET /api/lote/:id` - Detalhes de um lote (admin)
- `PUT /api/lote/:id/marcar-pago` - Marcar lote como pago (admin)

### Payment
- `GET /api/payment/acompanhar` - Acompanhar pagamentos (usuário)
- `GET /api/payment/disponiveis/todos` - Tokens disponíveis (admin)
- `POST /api/payment/processar` - Processar pagamentos (admin)

## 🗄️ Banco de Dados

### Local: SQLite
- Arquivo: `database/lixcarbon.db`
- Automático via `database/db.js`

### Produção: PostgreSQL
**⚠️ IMPORTANTE:** SQLite não funciona no Vercel!

Você precisa migrar para PostgreSQL. Veja `DEPLOY_INSTRUCTIONS.md`

## 🌐 Deploy no Vercel

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente:
   ```
   POSTGRES_URL=postgresql://...
   JWT_SECRET=sua_chave_secreta
   FRONTEND_URL=https://seu-frontend.vercel.app
   NODE_ENV=production
   ```
3. Deploy automático!

## 🔐 Variáveis de Ambiente

```env
# Banco de Dados (Produção)
POSTGRES_URL=postgresql://...

# JWT
JWT_SECRET=sua_chave_secreta_super_segura

# CORS
FRONTEND_URL=http://localhost:3000

# Ambiente
NODE_ENV=development
PORT=5000
```

## 🛠️ Tecnologias

- Node.js
- Express.js
- SQLite3 (dev) / PostgreSQL (prod)
- JWT (jsonwebtoken)
- bcryptjs
- CORS
- uuid

