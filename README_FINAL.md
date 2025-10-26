# 🌱 LixCarbon - Plataforma de Crédito de Carbono

## ✅ Status do Projeto

**Totalmente funcional com banco de dados real SQLite!**

## 🚀 Como Iniciar

### Backend (Terminal 1)
```bash
cd backend
npm start
```

### Frontend (Terminal 2)
```bash
cd frontend
npm start
```

## 🔐 Credenciais de Teste

### 👤 Administrador
- **Email:** `admin@lixcarbon.com`
- **Senha:** `admin123`

### 🏢 Empresa 1 (EcoEmpresas)
- **CNPJ:** `12.345.678/0001-90`
- **Senha:** `empresa123`

### 🏢 Empresa 2 (Natura)
- **CNPJ:** `11.222.333/0001-44`
- **Senha:** `natura123`

### ✅ Validador
- **Email:** `contato@greentech.com`
- **Senha:** `validador123`

## 📁 Estrutura do Projeto

```
lixcarbon/
├── backend/
│   ├── database/
│   │   ├── db.js              # Conexão SQLite
│   │   ├── seed.js            # Dados iniciais
│   │   ├── lixcarbon.db       # Banco de dados SQLite
│   │   └── README.md          # Documentação do banco
│   ├── models/
│   │   ├── User.js            # Model de usuários
│   │   ├── WasteRecord.js     # Model de registros
│   │   └── Token.js           # Model de tokens
│   ├── routes/
│   │   ├── auth.js            # Autenticação
│   │   ├── waste.js           # Gestão de resíduos
│   │   ├── payment.js         # Gestão de pagamentos
│   │   └── dashboard.js       # Dashboards
│   ├── middleware/
│   │   └── auth.js            # Middleware de autenticação
│   ├── server.js              # Servidor principal
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── logomarca.png      # Logo da empresa
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── contexts/          # Context API
│   │   ├── pages/
│   │   │   ├── LandingPage/
│   │   │   ├── Login/
│   │   │   ├── Cadastro/
│   │   │   ├── Dashboard/
│   │   │   ├── RegistroLixo/
│   │   │   ├── SolicitarPagamento/
│   │   │   └── GerenciarPagamentos/  # NOVO!
│   │   ├── services/
│   │   │   └── api.js         # Cliente HTTP
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── BANCO_DADOS_SQLITE.md     # Documentação do banco
├── BANCO_DADOS_SQLITE.md     # Documentação completa
├── INSTALACAO.md              # Guia de instalação
└── logomarca.png              # Logo da empresa
```

## 💾 Banco de Dados

### SQLite
- **Localização:** `backend/database/lixcarbon.db`
- **Tamanho:** ~61KB
- **Tabelas:** 3 (users, waste_records, available_tokens)

### Características
- ✅ Persistência de dados
- ✅ Transações ACID
- ✅ Sem necessidade de servidor separado
- ✅ Fácil backup (copiar arquivo .db)

## 🎨 Funcionalidades Implementadas

### Para USUARIO (Empresas)
- ✅ Cadastro e login
- ✅ Dashboard com métricas
- ✅ Registro de lixo via token
- ✅ Visualização de créditos
- ✅ Solicitar pagamento

### Para VALIDADOR_CREDITO
- ✅ Dashboard com visão geral
- ✅ Validação de créditos
- ✅ Relatórios

### Para ADMINISTRADOR
- ✅ Dashboard administrativo
- ✅ Visualização de todas empresas
- ✅ **Gerenciamento de pagamentos** 
  - Listar pagamentos pendentes
  - Seleção múltipla
  - Aprovar e processar pagamentos
  - Histórico de pagamentos
- ✅ Parametrização do sistema

## 🔧 Tecnologias Utilizadas

### Backend
- Node.js + Express
- SQLite3
- JWT para autenticação
- Bcrypt para senhas
- UUID para IDs

### Frontend
- React.js
- React Router
- Context API
- Axios
- Lucide Icons
- Recharts (gráficos)

## 📊 Fluxo de Trabalho

1. **Empresa registra lixo** → Token do totem
2. **Sistema valida** → Calcula crédito de carbono
3. **Empresa solicita pagamento** → Status: PENDENTE_PAGAMENTO
4. **Admin aprova pagamento** → Status: PAGO
5. **Empresa recebe** → Créditos de carbono

## 🔐 Segurança

- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ JWT para sessões
- ✅ Protected routes no frontend
- ✅ Middleware de autorização no backend
- ✅ Foreign keys no banco
- ✅ Validação de tipos

## 📈 Próximos Passos (Opcional)

- [ ] Implementar paginação
- [ ] Adicionar filtros avançados
- [ ] Gráficos mais detalhados
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Notificações em tempo real
- [ ] Migração para PostgreSQL (se necessário)

## 🐛 Troubleshooting

### Backend não inicia
- Verifique se a porta 5000 está livre
- Execute `npm install` no diretório backend

### Frontend não carrega
- Verifique se a porta 3000 está livre
- Execute `npm install` no diretório frontend
- Certifique-se de que o backend está rodando

### Banco de dados travado
- Feche todos os processos do backend
- Delete `backend/database/lixcarbon.db`
- Reinicie o backend (criará novo banco com seed)

## 📝 Notas Importantes

1. **Dados persistem** entre reinicializações
2. **Seed automático** se banco estiver vazio
3. **Hot reload** ativado no frontend
4. **Logs detalhados** no console do backend

## ✨ Melhorias Recentes

- ✅ SQLite implementado com sucesso
- ✅ Tela de Gerenciar Pagamentos para Admin
- ✅ Seleção múltipla de pagamentos
- ✅ Design moderno e responsivo
- ✅ Correção de bugs no dashboard

## 🎉 Pronto para Uso!

A aplicação está completamente funcional com:
- ✅ Backend rodando
- ✅ Banco de dados criado
- ✅ Dados de teste inseridos
- ✅ Frontend preparado

Basta iniciar o frontend e começar a usar!

---

**Desenvolvido com 💚 para um futuro mais sustentável**

