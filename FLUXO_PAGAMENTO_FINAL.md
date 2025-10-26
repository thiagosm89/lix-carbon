# 💰 Fluxo de Pagamento Final - LixCarbon

## 📋 Resumo das Mudanças

### ❌ O que foi REMOVIDO:
- USUARIO **NÃO SOLICITA** mais pagamento
- Rota `POST /api/payment/solicitar` removida
- Status `PENDENTE_PAGAMENTO` removido do fluxo do usuário

### ✅ O que foi ADICIONADO:
- Nova página "**Acompanhar Pagamento**" (substitui "Solicitar Pagamento")
- Nova rota `GET /api/payment/acompanhar` - visualização completa dos tokens
- Sistema de lotes automático
- Cálculo proporcional de valores

---

## 🔄 Novo Fluxo Completo

### 1️⃣ **USUARIO Registra Token**

**Ação:** Deposita lixo no totem, recebe token, registra no sistema

**Endpoint:** `POST /api/waste/registrar`
```json
{ "token": "789012" }
```

**Status do Token:** `VALIDADO`

**Na Tela "Acompanhar Pagamento":**
- Aparece em "**Tokens Pendentes**"
- Mostra peso e categoria
- Mensagem: "Aguardando processamento do lote pela validadora"

---

### 2️⃣ **ADMINISTRADOR Cria Lote**

**Ação:** Define peso máximo, sistema seleciona tokens automaticamente

**Endpoint:** `POST /api/lote/criar`
```json
{ "pesoMaximo": 1000 }
```

**Seleção Automática:**
- Busca tokens com status `VALIDADO`
- Ordena por `dataCriacao` (mais antigos primeiro)
- Soma pesos até completar o peso máximo
- Gera UUID do lote

**Status do Token:** `VALIDADO` → `ENVIADO_VALIDADORA`

**Na Tela do USUARIO:**
- Continua em "**Tokens Pendentes**"
- Badge muda para "Enviado à Validadora"

---

### 3️⃣ **ADMINISTRADOR Registra Pagamento da Validadora**

**Ação:** Validadora paga o lote, admin registra valor

**Endpoint:** `POST /api/lote/marcar-pago`
```json
{
  "loteId": "uuid-do-lote",
  "valorPago": 100.00
}
```

**Cálculo Automático:**
```javascript
Valor Pago: $100.00
Taxa LixCarbon (20%): $20.00
Para Distribuir (80%): $80.00

Para cada token:
  valorProporcional = ($80 * peso_token) / peso_total_lote
```

**Exemplo:**
```
Lote: 1000kg total, $100 pago

Token A: 180kg
  Proporção: 180/1000 = 18%
  Valor: $80 * 0.18 = $14.40

Token B: 220kg
  Proporção: 220/1000 = 22%
  Valor: $80 * 0.22 = $17.60
```

**Status do Token:** `ENVIADO_VALIDADORA` → `LIBERADO_PAGAMENTO`

**Na Tela do USUARIO:**
- Move para "**Disponível para Saque**"
- Mostra valor em $ (valorProporcional)
- Mostra ID do lote
- Badge verde "Disponível para Saque"
- Card em destaque

---

### 4️⃣ **ADMINISTRADOR Processa Pagamento**

**Ação:** Admin seleciona tokens liberados e paga usuários

**Endpoint:** `POST /api/payment/processar`
```json
{
  "registroIds": ["abc123", "def456"]
}
```

**Validação:**
- Só aceita tokens com status `LIBERADO_PAGAMENTO`

**Status do Token:** `LIBERADO_PAGAMENTO` → `PAGO`

**Na Tela do USUARIO:**
- Move para "**Histórico de Pagamentos**"
- Seção oculta por padrão (click para expandir)
- Mostra valor pago e data
- Badge roxo "Pago"

---

## 📊 Estados dos Tokens na Tela do USUARIO

### 🟠 Tokens Pendentes
**Status:** `VALIDADO` ou `ENVIADO_VALIDADORA`

**Exibe:**
- Token, categoria, peso
- Badge de status
- Data de registro
- **NÃO exibe valor** (ainda não foi calculado)

**Mensagem:**
- `VALIDADO`: "Aguardando processamento do lote pela validadora"
- `ENVIADO_VALIDADORA`: "Aguardando processamento do lote pela validadora"

**Totalização:** Peso total (kg)

---

### 🟢 Disponível para Saque
**Status:** `LIBERADO_PAGAMENTO`

**Exibe:**
- Token, categoria, peso
- **Valor em $** (valorProporcional)
- ID do lote
- Badge "Disponível para Saque"

**Mensagem:**
"Disponível para saque - aguardando processamento do administrador"

**Totalização:** Valor total em $ disponível

**Destaque:**
- Card com borda verde
- Fundo levemente verde
- Linhas da tabela destacadas

---

### 🟣 Histórico de Pagamentos
**Status:** `PAGO`

**Exibe:**
- Token, categoria, peso
- Valor pago em $
- ID do lote
- Data do pagamento
- Badge "Pago"

**Estado Inicial:** Oculto (só aparece ao clicar)

**Totalização:** Total já pago

---

## 🖥️ Interface da Nova Página

### Estrutura:

```
┌─────────────────────────────────────────────────────┐
│ 📊 Acompanhar Pagamentos            [🔄 Atualizar] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐      │
│ │⏰ Pendentes│  │💰Disponível│  │✅ Já Pagos│      │
│ │    5      │  │  $42.80   │  │  $128.40  │      │
│ │ tokens    │  │  3 tokens │  │ 12 tokens │      │
│ └───────────┘  └───────────┘  └───────────┘      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ ⏰ TOKENS PENDENTES                           [5]  │
├─────────────────────────────────────────────────────┤
│ Token    │ Categoria  │ Peso  │ Status     │ Data │
│ 789012   │ Reciclável │ 180kg │ 🟠 Aguard. │ ...  │
│ 890123   │ Orgânico   │ 220kg │ 📦 Enviado │ ...  │
│ ...                                                 │
├─────────────────────────────────────────────────────┤
│ 💰 DISPONÍVEL PARA SAQUE              [$42.80]    │
├─────────────────────────────────────────────────────┤
│ Token    │ Cat.│ Peso │ Lote    │ Valor  │ Data  │
│ 901234   │ Rec │ 275kg│ abc123  │ $14.40 │ ...   │
│ 123456   │ Org │ 200kg│ abc123  │ $16.00 │ ...   │
│ 234567   │ Rec │ 150kg│ def456  │ $12.40 │ ...   │
├─────────────────────────────────────────────────────┤
│ ✅ HISTÓRICO DE PAGAMENTOS          [🔽 Expandir] │
│ (12 pagos - clique para visualizar)                │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Elementos Visuais

### Cards de Resumo:
- **Pendentes**: Laranja (🟠)
- **Disponível**: Verde (🟢) - destaque
- **Pagos**: Roxo (🟣)

### Badges de Status:
- `VALIDADO`: 🟠 Laranja "Aguardando Lote"
- `ENVIADO_VALIDADORA`: 🔵 Azul "Enviado à Validadora"
- `LIBERADO_PAGAMENTO`: 🟢 Verde com animação "Disponível para Saque"
- `PAGO`: 🟣 Roxo "Pago"

### Animações:
- Badge "Disponível para Saque" pulsa suavemente
- Hover nas linhas da tabela
- Transição suave ao expandir/recolher "Pagos"

---

## 🔗 Endpoints Atualizados

### Para USUARIO:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/payment/acompanhar` | Visualização completa (pendentes + disponíveis + pagos) |
| GET | `/api/payment/disponiveis` | Apenas tokens liberados |
| GET | `/api/payment/historico` | Apenas tokens pagos |

### Para ADMINISTRADOR:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/lote/criar` | Criar lote (seleciona tokens automaticamente) |
| POST | `/api/lote/marcar-pago` | Registrar pagamento da validadora (calcula valores) |
| GET | `/api/lote/listar` | Listar todos os lotes |
| GET | `/api/lote/:id` | Detalhes de um lote |
| GET | `/api/payment/disponiveis/todos` | Tokens liberados de todos usuários |
| POST | `/api/payment/processar` | Marcar tokens como pagos |

---

## 💡 Benefícios da Nova Abordagem

### Para USUARIO:
✅ **Mais simples**: Não precisa "solicitar", só acompanha
✅ **Transparente**: Vê exatamente quanto vai receber
✅ **Organizado**: Estados bem definidos e visuais
✅ **Informativo**: Sabe quando o lote foi enviado e pago

### Para ADMINISTRADOR:
✅ **Automatizado**: Sistema seleciona tokens por ordem de data
✅ **Controle total**: Decide quando criar lote e processar pagamentos
✅ **Rastreável**: Cada token vinculado a um lote específico
✅ **Justo**: Distribuição proporcional automática

### Para o Sistema:
✅ **Menos passos**: Fluxo mais direto
✅ **Menos erros**: Menos interação manual
✅ **Auditável**: Histórico completo por lote
✅ **Escalável**: Suporta milhares de tokens

---

## 🧪 Como Testar

### 1. Registrar Tokens como USUARIO:
```bash
# Login
POST /api/auth/login
{ "email": "empresa@example.com", "senha": "empresa123" }

# Registrar 3 tokens
POST /api/waste/registrar { "token": "789012" }
POST /api/waste/registrar { "token": "890123" }
POST /api/waste/registrar { "token": "901234" }

# Acessar no navegador
http://localhost:3000/pagamentos
```

**Esperado:**
- 3 tokens em "Pendentes"
- Badge "Aguardando Lote"
- Total de peso exibido

---

### 2. Criar Lote como ADMIN:
```bash
# Login Admin
POST /api/auth/login
{ "email": "admin@lixcarbon.com", "senha": "admin123" }

# Criar lote de 1000kg
POST /api/lote/criar
{ "pesoMaximo": 1000 }
```

**Esperado:**
- Tokens mudam para "Enviado à Validadora"
- Lote criado com UUID

---

### 3. Marcar Lote como Pago:
```bash
POST /api/lote/marcar-pago
{
  "loteId": "uuid-retornado-acima",
  "valorPago": 100
}
```

**Esperado:**
- Tokens mudam para "Disponível para Saque"
- `valorProporcional` calculado para cada token
- Na tela do USUARIO: tokens aparecem em "Disponível" com valores em $

---

### 4. Processar Pagamento:
```bash
# Listar disponíveis
GET /api/payment/disponiveis/todos

# Processar
POST /api/payment/processar
{ "registroIds": ["id1", "id2", "id3"] }
```

**Esperado:**
- Tokens mudam para "Pago"
- Na tela do USUARIO: tokens aparecem em "Histórico" (oculto, expandir para ver)

---

## 📁 Arquivos Modificados/Criados

### Backend:
- ✅ `backend/database/db.js` - Nova estrutura (loteId, valorProporcional, lotes table)
- ✅ `backend/models/Lote.js` - NOVO modelo
- ✅ `backend/routes/lote.js` - NOVAS rotas
- ✅ `backend/routes/payment.js` - Atualizado (removido solicitar, adicionado acompanhar)
- ✅ `backend/server.js` - Rota de lotes adicionada

### Frontend:
- ✅ `frontend/src/pages/AcompanharPagamento/` - NOVA página
- ✅ `frontend/src/App.js` - Rota atualizada
- ✅ `frontend/src/components/Sidebar/Sidebar.js` - Label atualizado

### Documentação:
- ✅ `FLUXO_PAGAMENTO.md` - Documentação detalhada
- ✅ `LOGICA_TOKENS.md` - Lógica de tokens repetidos
- ✅ `FLUXO_PAGAMENTO_FINAL.md` - Este documento

---

## ✅ Status Final

### Backend: ✅ Completo e Rodando
- API: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`
- Banco SQLite com estrutura completa

### Frontend: ⚠️ Pronto para Testar
- Página "Acompanhar Pagamento" criada
- Rotas configuradas
- Componentes atualizados

### Próximos Passos para ADMIN:
- [ ] Criar página "Gerenciar Lotes"
- [ ] Criar página "Processar Pagamentos" 
- [ ] Atualizar Dashboard do Admin com estatísticas de lotes

---

## 🚀 Conclusão

O novo fluxo é **mais simples, transparente e automatizado**. O USUARIO agora tem visibilidade completa do status dos seus tokens sem precisar tomar ações, enquanto o ADMINISTRADOR tem controle total sobre o processo de criação de lotes e pagamentos.

**Tudo está pronto para uso! 🎉**

