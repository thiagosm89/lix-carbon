# 🌟 Funcionalidades da Plataforma LixCarbon

## 🎯 Visão Geral

A LixCarbon é uma plataforma completa para geração de créditos de carbono através da coleta e classificação inteligente de resíduos.

## 👥 Perfis de Usuário

### 1. USUARIO (Empresas)

**Funcionalidades Disponíveis:**

#### Dashboard
- ✅ Visualização de métricas de contribuição
- ✅ Gráficos de evolução mensal
- ✅ Estatísticas por categoria (Reciclável/Orgânico)
- ✅ Resumo de créditos totais, pendentes e pagos
- ✅ Últimos registros de coleta

#### Registro de Lixo
- ✅ Inserção de tokens de 6 dígitos do totem
- ✅ Validação automática do token
- ✅ Cálculo automático de créditos baseado em peso e categoria
- ✅ Histórico completo de registros
- ✅ Estatísticas em tempo real

**Cálculo de Créditos:**
- Recicláveis: 10% do peso em créditos de CO₂
- Orgânicos: 5% do peso em créditos de CO₂

#### Solicitar Pagamento
- ✅ Visualização de créditos disponíveis para saque
- ✅ Seleção múltipla de registros
- ✅ Solicitação de pagamento em lote
- ✅ Acompanhamento de pagamentos pendentes
- ✅ Histórico de pagamentos recebidos

### 2. VALIDADOR_CREDITO

**Funcionalidades Disponíveis:**

#### Dashboard do Validador
- ✅ Visão geral de todos os registros
- ✅ Total de peso coletado
- ✅ Total de créditos gerados
- ✅ Número de empresas ativas
- ✅ Distribuição por categoria
- ✅ Registros recentes de todas as empresas

#### Validação de Créditos
- ✅ Visualização de registros pendentes
- ✅ Análise de dados de coleta
- ✅ Validação de autenticidade
- ✅ Conversão para créditos oficiais

### 3. ADMINISTRADOR

**Funcionalidades Disponíveis:**

#### Dashboard Administrativo
- ✅ Total de empresas cadastradas
- ✅ Total de créditos gerados no sistema
- ✅ Pagamentos pendentes de aprovação
- ✅ Valor total pendente
- ✅ Lista detalhada de empresas
- ✅ Últimos pagamentos pendentes

#### Gerenciamento de Pagamentos
- ✅ Visualização de todas as solicitações
- ✅ Aprovação/Rejeição de pagamentos
- ✅ Processamento em lote
- ✅ Histórico completo de transações

#### Gerenciamento de Empresas
- ✅ Listagem de todas as empresas
- ✅ Visualização de métricas por empresa
- ✅ Monitoramento de contribuições

## 🎨 Design e Interface

### Paleta de Cores

Baseada na logomarca da LixCarbon:

- **Verde Escuro (#0F5C47):** Principal, representa sustentabilidade
- **Verde Médio (#4ADE80):** Secundário, crescimento e vida
- **Verde Claro (#7FD14B):** Energia renovável
- **Dourado (#FFA500):** Valor e métricas financeiras
- **Azul Escuro (#0F2E4A):** Tecnologia e confiança

### Componentes Visuais

- ✅ Landing page com tema natureza + tecnologia
- ✅ Animações suaves e transições
- ✅ Cards interativos com hover effects
- ✅ Gráficos dinâmicos (Recharts)
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ Ícones intuitivos (Lucide React)

## 🔐 Autenticação e Segurança

### Sistema de Login
- ✅ Login com email ou CNPJ
- ✅ Validação de senha
- ✅ Tokens JWT para sessões
- ✅ Redirecionamento baseado em perfil
- ✅ Proteção de rotas por perfil

### Cadastro de Empresas
- ✅ Validação de CNPJ
- ✅ Formatação automática de campos
- ✅ Validação de email
- ✅ Senha com mínimo de caracteres
- ✅ Confirmação de senha

## 📊 Sistema de Métricas

### Dashboards Interativos
- ✅ Gráficos de barras para evolução temporal
- ✅ Cards com estatísticas em tempo real
- ✅ Progress bars para categorias
- ✅ Indicadores visuais coloridos
- ✅ Tooltips informativos

### Relatórios
- ✅ Relatórios por categoria
- ✅ Relatórios por período
- ✅ Relatórios por empresa (admin)
- ✅ Exportação de dados (planejado)

## 🗄️ Backend e API

### Rotas Disponíveis

#### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/cadastro` - Cadastro
- `GET /api/auth/me` - Verificar sessão

#### Resíduos
- `GET /api/waste/meus-registros` - Listar registros do usuário
- `POST /api/waste/registrar` - Registrar novo lixo
- `GET /api/waste/estatisticas` - Estatísticas do usuário
- `GET /api/waste/todos` - Listar todos (validador/admin)

#### Pagamentos
- `POST /api/payment/solicitar` - Solicitar pagamento
- `GET /api/payment/pendentes` - Pagamentos pendentes do usuário
- `GET /api/payment/pendentes/todos` - Todos pendentes (admin)
- `POST /api/payment/processar` - Processar pagamento (admin)
- `GET /api/payment/historico` - Histórico de pagamentos

#### Dashboard
- `GET /api/dashboard/usuario` - Dashboard do usuário
- `GET /api/dashboard/validador` - Dashboard do validador
- `GET /api/dashboard/admin` - Dashboard do admin

## 🔄 Fluxo Completo do Sistema

### 1. Cadastro e Login
```
Empresa acessa a landing page
    ↓
Clica em "Cadastre-se"
    ↓
Preenche dados (CNPJ, email, senha)
    ↓
Sistema cria conta automaticamente
    ↓
Redirecionado para dashboard
```

### 2. Coleta de Lixo
```
Empresa deposita lixo no totem
    ↓
Seleciona categoria (Reciclável/Orgânico)
    ↓
Totem pesa e gera token de 6 dígitos
    ↓
Empresa registra token no sistema
    ↓
Sistema valida e calcula créditos
    ↓
Registro aparece no dashboard
```

### 3. Geração de Créditos
```
Registros validados acumulam créditos
    ↓
Empresa visualiza créditos no dashboard
    ↓
Métricas atualizadas em tempo real
    ↓
Gráficos mostram evolução
```

### 4. Solicitação de Pagamento
```
Empresa acessa "Pagamentos"
    ↓
Seleciona registros validados
    ↓
Solicita pagamento
    ↓
Status muda para "Pendente"
    ↓
Admin aprova pagamento
    ↓
Status muda para "Pago"
    ↓
Aparece no histórico
```

## 📱 Responsividade

### Breakpoints
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Adaptações
- ✅ Menu lateral colapsável
- ✅ Tabelas com scroll horizontal
- ✅ Cards empilhados em mobile
- ✅ Fonte e espaçamento adaptados
- ✅ Touch-friendly em dispositivos móveis

## 🚀 Tecnologias Utilizadas

### Frontend
- React 18
- React Router DOM 6
- Axios
- Recharts (gráficos)
- Lucide React (ícones)
- Framer Motion (animações)
- CSS Modules

### Backend
- Node.js
- Express
- JWT (autenticação)
- bcryptjs (hash de senhas)
- CORS
- UUID

## 🎯 Diferenciais

1. **Interface Intuitiva:** Design limpo e fácil de usar
2. **Métricas em Tempo Real:** Dados atualizados instantaneamente
3. **Sistema de Tokens:** Processo simples de registro
4. **Cálculo Automático:** Créditos calculados automaticamente
5. **Multi-perfil:** Sistema adaptado para cada tipo de usuário
6. **Transparência Total:** Acompanhamento de todas as etapas
7. **Visual Moderno:** Design inspirado em natureza e tecnologia

## 📈 Próximas Funcionalidades (Roadmap)

- [ ] Integração com blockchain para certificação
- [ ] Notificações por email
- [ ] Exportação de relatórios em PDF
- [ ] App mobile nativo
- [ ] Integração com sistemas ERP
- [ ] Dashboard de impacto ambiental
- [ ] Ranking de empresas sustentáveis
- [ ] Sistema de recompensas gamificado

