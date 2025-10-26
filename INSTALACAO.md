# 📋 Guia de Instalação - LixCarbon

Este guia irá ajudá-lo a configurar e executar a plataforma LixCarbon em seu ambiente local.

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior) - [Download](https://nodejs.org/)
- **npm** (geralmente vem com Node.js)
- **Git** (opcional) - [Download](https://git-scm.com/)

## 🚀 Instalação Passo a Passo

### 1. Instalar Dependências

Abra o terminal no diretório raiz do projeto e execute:

```bash
npm run install-all
```

Este comando irá instalar todas as dependências do projeto (raiz, backend e frontend).

### 2. Iniciar a Aplicação

Para iniciar tanto o backend quanto o frontend simultaneamente:

```bash
npm run dev
```

**OU** você pode iniciar cada um separadamente:

#### Backend (API)
```bash
cd backend
npm start
```
O backend estará disponível em: `http://localhost:5000`

#### Frontend (React)
```bash
cd frontend
npm start
```
O frontend estará disponível em: `http://localhost:3000`

## 🌐 Acessando a Aplicação

Após iniciar os servidores, abra seu navegador e acesse:

```
http://localhost:3000
```

## 👤 Usuários de Teste

### Perfil: Empresa (USUARIO)
- **CNPJ:** `12.345.678/0001-90`
- **Senha:** `empresa123`

### Perfil: Validador de Crédito
- **CNPJ:** `98.765.432/0001-10`
- **Senha:** `validador123`

### Perfil: Administrador
- **Email:** `admin@lixcarbon.com`
- **Senha:** `admin123`

## 🎯 Tokens de Teste para Registro de Lixo

Use estes tokens para testar o sistema de registro:

- `789012` - Reciclável, 180 kg
- `890123` - Orgânico, 220 kg
- `901234` - Reciclável, 275.5 kg

## 🔧 Solução de Problemas

### Porta já em uso

Se a porta 3000 ou 5000 já estiver em uso, você pode alterar nas configurações:

**Backend:** Edite `backend/server.js` e altere a porta:
```javascript
const PORT = process.env.PORT || 5001; // Altere para outra porta
```

**Frontend:** Crie um arquivo `.env` na pasta `frontend` com:
```
PORT=3001
```

### Erro de CORS

Certifique-se de que o backend está rodando antes de iniciar o frontend.

### Dependências não instaladas

Se houver erros de módulos não encontrados, tente:
```bash
cd backend && npm install
cd ../frontend && npm install
```

## 📱 Navegação da Aplicação

### Para Empresas (USUARIO):
1. **Dashboard** - Visualize suas métricas e contribuições
2. **Registrar Lixo** - Insira tokens dos totems
3. **Pagamentos** - Solicite pagamento dos créditos validados

### Para Validadores:
1. **Dashboard** - Visão geral de todas as coletas
2. **Validar Créditos** - Valide registros de empresas
3. **Relatórios** - Estatísticas gerais

### Para Administradores:
1. **Dashboard** - Visão geral do sistema
2. **Empresas** - Gerencie empresas cadastradas
3. **Pagamentos** - Aprove e processe pagamentos
4. **Configurações** - Parâmetros do sistema

## 🎨 Estrutura do Projeto

```
lixcarbon/
├── backend/              # API Node.js + Express
│   ├── server.js        # Servidor principal
│   ├── routes/          # Rotas da API
│   ├── middleware/      # Middleware de autenticação
│   └── data/            # Dados mockados
│
├── frontend/            # Aplicação React
│   ├── public/          # Arquivos estáticos
│   └── src/
│       ├── components/  # Componentes reutilizáveis
│       ├── pages/       # Páginas da aplicação
│       ├── contexts/    # Context API (Auth)
│       └── services/    # Serviços (API)
│
└── logomarca.png        # Logo da empresa
```

## 🔐 Segurança

**IMPORTANTE:** Este projeto usa dados mockados para demonstração. Para produção:

- Configure um banco de dados real (PostgreSQL, MongoDB, etc.)
- Use variáveis de ambiente para secrets
- Implemente validação adequada de JWT
- Configure HTTPS
- Adicione rate limiting
- Implemente logs de segurança

## 📞 Suporte

Se encontrar problemas durante a instalação, verifique:

1. Versão do Node.js está atualizada
2. Todas as dependências foram instaladas
3. Portas 3000 e 5000 estão livres
4. Firewall não está bloqueando as portas

## 🎉 Pronto!

Você agora está pronto para usar a plataforma LixCarbon! Explore as funcionalidades e teste o fluxo completo de coleta de lixo até a geração de créditos de carbono.

