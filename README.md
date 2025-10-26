# LixCarbon - Plataforma de Crédito de Carbono

Plataforma especializada em geração de crédito de carbono através da coleta e classificação de lixo.

## 🌱 Sobre o Projeto

A LixCarbon permite que empresas depositem seus resíduos, que são classificados e medidos para calcular a contribuição individual na geração de créditos de carbono. Cada empresa recebe seu percentual proporcional à sua contribuição.

## 🎨 Paleta de Cores

Baseada na logomarca da empresa:
- **Primary Verde Escuro**: #0F5C47 - Sustentabilidade e natureza
- **Secondary Verde Médio**: #4ADE80 - Crescimento e vida
- **Accent Verde Claro**: #7FD14B - Energia renovável
- **Dourado**: #FFA500 - Valor e métricas
- **Azul Escuro**: #0F2E4A - Tecnologia e confiança
- **Cinza Claro**: #F3F4F6 - Background neutro

## 👥 Perfis de Usuário

1. **USUARIO**: Empresas que coletam lixo e geram tokens
2. **VALIDADOR_CREDITO**: Valida créditos de carbono e distribui recompensas
3. **ADMINISTRADOR**: Gerencia parâmetros e pagamentos

## 🚀 Como Executar

### Instalação
```bash
npm run install-all
```

### Desenvolvimento
```bash
npm run dev
```

O frontend estará disponível em: http://localhost:3000
O backend estará disponível em: http://localhost:5000

## 📁 Estrutura do Projeto

```
lixcarbon/
├── backend/           # API Node.js + Express
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   └── data/
├── frontend/          # React Application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── contexts/
│       └── styles/
└── logomarca.png
```

## 🔐 Usuários Padrão (Mock)

**Usuário Empresa:**
- CNPJ: 12.345.678/0001-90
- Senha: empresa123

**Validador:**
- CNPJ: 98.765.432/0001-10
- Senha: validador123

**Administrador:**
- Email: admin@lixcarbon.com
- Senha: admin123

## 🌟 Funcionalidades

- ✅ Landing Page com natureza e tecnologia
- ✅ Cadastro de empresas (CNPJ)
- ✅ Sistema de login com perfis
- ✅ Dashboard com métricas de crédito de carbono
- ✅ Registro de lixo via token de 6 dígitos
- ✅ Sistema de pagamentos
- ✅ Classificação por categoria (Orgânico e Reciclável)

## 📊 Tecnologias

- **Frontend**: React, React Router, Axios, Recharts, Framer Motion
- **Backend**: Node.js, Express, JWT
- **Estilo**: CSS Modules com paleta personalizada

