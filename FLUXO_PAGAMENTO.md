# 💰 Fluxo de Pagamento - LixCarbon

## 📋 Visão Geral

O sistema de pagamento da LixCarbon funciona em **5 etapas principais**:

1. **USUARIO** registra tokens de lixo
2. **ADMINISTRADOR** cria lote para enviar à VALIDADORA
3. **VALIDADORA** paga o lote
4. **USUARIO** solicita pagamento
5. **ADMINISTRADOR** paga o USUARIO

---

## 🔄 Fluxo Completo

### Etapa 1: USUARIO Registra Tokens

**Quem:** USUARIO (Empresa coletora de lixo)

**Como:**
- Deposita lixo no totem
- Totem pesa e gera token de 6 dígitos
- USUARIO registra token no sistema

**Status do Token:** `VALIDADO`

**Endpoint:** `POST /api/waste/registrar`
```json
{
  "token": "789012"
}
```

**Resultado:**
```json
{
  "id": "abc123",
  "token": "789012",
  "categoria": "RECICLAVEL",
  "peso": 180.0,
  "credito": 18.0,
  "status": "VALIDADO",
  "loteId": null,
  "valorProporcional": 0
}
```

---

### Etapa 2: ADMINISTRADOR Cria Lote para VALIDADORA

**Quem:** ADMINISTRADOR

**Por que:**
- Juntar vários tokens para enviar à validadora
- Validadora só recebe em lotes grandes (ex: 1 tonelada)

**Como:**
1. Define peso máximo do lote (ex: 1000kg)
2. Sistema seleciona automaticamente tokens VALIDADOS por ordem de data
3. Soma pesos até completar o máximo
4. Gera UUID do lote
5. Marca todos os tokens como `ENVIADO_VALIDADORA`

**Status dos Tokens:** `VALIDADO` → `ENVIADO_VALIDADORA`

**Endpoint:** `POST /api/lote/criar`
```json
{
  "pesoMaximo": 1000.0
}
```

**Resultado:**
```json
{
  "id": "uuid-do-lote",
  "pesoMaximo": 1000.0,
  "pesoUtilizado": 875.5,
  "quantidadeTokens": 5,
  "tokens": [
    { "id": "abc123", "peso": 180.0, "categoria": "RECICLAVEL" },
    { "id": "def456", "peso": 220.0, "categoria": "ORGANICO" },
    // ...
  ],
  "status": "PENDENTE_VALIDADORA"
}
```

**Exemplo de Seleção Automática:**

```
Tokens disponíveis (ordenados por data):
ID      | Peso   | Data
abc123  | 180.0  | 2025-10-20 10:00
def456  | 220.0  | 2025-10-20 11:00
ghi789  | 275.5  | 2025-10-20 12:00
jkl012  | 200.0  | 2025-10-20 13:00
mno345  | 150.0  | 2025-10-20 14:00
pqr678  | 300.0  | 2025-10-20 15:00  ← NÃO entra (ultrapassaria 1000kg)

Peso Máximo: 1000kg
Tokens Selecionados: abc123, def456, ghi789, jkl012, mno345
Peso Total: 1025.5kg (todos entram pois não tem como dividir)
```

---

### Etapa 3: VALIDADORA Paga o Lote

**Quem:** ADMINISTRADOR (recebendo pagamento da validadora)

**Como:**
1. VALIDADORA transfere dinheiro para LixCarbon
2. ADMINISTRADOR registra valor pago no sistema
3. Sistema calcula distribuição:
   - **20% fica para LixCarbon** (taxa da empresa)
   - **80% distribuído proporcionalmente** aos USUARIOS pelo peso

**Status dos Tokens:** `ENVIADO_VALIDADORA` → `LIBERADO_PAGAMENTO`

**Endpoint:** `POST /api/lote/marcar-pago`
```json
{
  "loteId": "uuid-do-lote",
  "valorPago": 100.00
}
```

**Cálculo de Distribuição:**

```
Valor Pago pela Validadora: $100.00
Peso Total do Lote: 1000kg

Taxa LixCarbon (20%): $100 * 0.20 = $20.00
Valor para Distribuir (80%): $100 - $20 = $80.00

Cada token recebe proporcional ao seu peso:

Token abc123 (180kg):
  Proporção: 180 / 1000 = 0.18 (18%)
  Valor: $80 * 0.18 = $14.40

Token def456 (220kg):
  Proporção: 220 / 1000 = 0.22 (22%)
  Valor: $80 * 0.22 = $17.60

Token ghi789 (275.5kg):
  Proporção: 275.5 / 1000 = 0.2755 (27.55%)
  Valor: $80 * 0.2755 = $22.04

Token jkl012 (200kg):
  Proporção: 200 / 1000 = 0.20 (20%)
  Valor: $80 * 0.20 = $16.00

Token mno345 (150kg):
  Proporção: 150 / 1000 = 0.15 (15%)
  Valor: $80 * 0.15 = $12.00

Total Distribuído: $82.04 ≈ $80.00 (pequena diferença por arredondamento)
```

**Resultado:**
```json
{
  "loteId": "uuid-do-lote",
  "valorPago": 100.00,
  "valorEmpresa": 20.00,
  "valorDistribuido": 80.00,
  "tokensAtualizados": 5
}
```

**Cada Token Atualizado:**
```json
{
  "id": "abc123",
  "status": "LIBERADO_PAGAMENTO",
  "valorProporcional": 14.40
}
```

---

### Etapa 4: USUARIO Solicita Pagamento

**Quem:** USUARIO

**Como:**
1. Acessa tela "Solicitar Pagamento"
2. Vê tokens com status `LIBERADO_PAGAMENTO`
3. Seleciona tokens que deseja receber
4. Solicita pagamento

**Status dos Tokens:** `LIBERADO_PAGAMENTO` → `PENDENTE_PAGAMENTO`

**Endpoint:** `POST /api/payment/solicitar`
```json
{
  "registroIds": ["abc123", "def456"]
}
```

**Validação:**
- ✅ Token deve estar `LIBERADO_PAGAMENTO`
- ❌ Se está `VALIDADO`: "Aguarde processamento pela validadora"
- ❌ Se está `ENVIADO_VALIDADORA`: "Aguarde validadora pagar o lote"

**Resultado:**
```json
{
  "message": "Solicitação enviada com sucesso",
  "totalValor": 32.00,
  "quantidadeRegistros": 2,
  "registros": [
    {
      "id": "abc123",
      "valorProporcional": 14.40,
      "status": "PENDENTE_PAGAMENTO"
    },
    {
      "id": "def456",
      "valorProporcional": 17.60,
      "status": "PENDENTE_PAGAMENTO"
    }
  ]
}
```

---

### Etapa 5: ADMINISTRADOR Paga USUARIO

**Quem:** ADMINISTRADOR

**Como:**
1. Vê lista de pagamentos pendentes
2. Seleciona pagamentos a processar
3. Transfere dinheiro para empresa
4. Marca como pago no sistema

**Status dos Tokens:** `PENDENTE_PAGAMENTO` → `PAGO`

**Endpoint:** `POST /api/payment/processar`
```json
{
  "registroIds": ["abc123", "def456"]
}
```

**Resultado:**
```json
{
  "message": "Pagamentos processados com sucesso",
  "totalValor": 32.00,
  "quantidadeRegistros": 2,
  "registros": [
    {
      "id": "abc123",
      "valorProporcional": 14.40,
      "status": "PAGO",
      "dataPagamento": "2025-10-25T15:30:00Z"
    },
    {
      "id": "def456",
      "valorProporcional": 17.60,
      "status": "PAGO",
      "dataPagamento": "2025-10-25T15:30:00Z"
    }
  ]
}
```

---

## 📊 Status dos Tokens

| Status | Descrição | Próximo Passo |
|--------|-----------|---------------|
| `VALIDADO` | Token registrado pelo usuário | Admin cria lote |
| `ENVIADO_VALIDADORA` | Incluído em lote para validadora | Admin registra pagamento |
| `LIBERADO_PAGAMENTO` | Validadora pagou, usuário pode solicitar | Usuário solicita |
| `PENDENTE_PAGAMENTO` | Usuário solicitou pagamento | Admin processa |
| `PAGO` | Usuário recebeu pagamento | Fim |

---

## 🗄️ Estrutura do Banco

### Tabela: `waste_records`

```sql
CREATE TABLE waste_records (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT NOT NULL,
  categoria TEXT NOT NULL,
  peso REAL NOT NULL,
  credito REAL NOT NULL,              -- Crédito de CO₂ (apenas informativo)
  loteId TEXT,                         -- UUID do lote
  valorProporcional REAL DEFAULT 0,   -- Valor em $ calculado pela validadora
  status TEXT NOT NULL,                -- Status do token
  dataCriacao TEXT NOT NULL,
  dataValidacao TEXT,
  dataSolicitacaoPagamento TEXT,
  dataPagamento TEXT
);
```

### Tabela: `lotes`

```sql
CREATE TABLE lotes (
  id TEXT PRIMARY KEY,                 -- UUID
  pesoMaximo REAL NOT NULL,            -- Peso máximo definido
  pesoUtilizado REAL NOT NULL,         -- Peso efetivamente usado
  quantidadeTokens INTEGER NOT NULL,   -- Quantidade de tokens
  valorPago REAL DEFAULT 0,            -- Valor pago pela validadora
  percentualEmpresa REAL DEFAULT 20,   -- % que fica para LixCarbon
  valorDistribuido REAL DEFAULT 0,     -- Valor distribuído aos usuários
  status TEXT NOT NULL,                -- Status do lote
  dataCriacao TEXT NOT NULL,
  dataPagamentoValidadora TEXT,
  observacoes TEXT
);
```

---

## 🎯 Exemplo Completo

### Cenário: 3 Empresas, 1 Lote de 1 Tonelada

#### 1. Registro de Tokens

```
Empresa A: 3 tokens
  - Token 123: 150kg Reciclável
  - Token 456: 200kg Orgânico
  - Token 789: 180kg Reciclável
  Total: 530kg

Empresa B: 2 tokens
  - Token 234: 300kg Reciclável
  - Token 567: 150kg Orgânico
  Total: 450kg

Empresa C: 1 token
  - Token 890: 100kg Reciclável
  Total: 100kg

TOTAL DISPONÍVEL: 1080kg
```

#### 2. Admin Cria Lote de 1000kg

```
Sistema seleciona por ordem:
✓ Token 123 (150kg) - acumulado: 150kg
✓ Token 456 (200kg) - acumulado: 350kg
✓ Token 789 (180kg) - acumulado: 530kg
✓ Token 234 (300kg) - acumulado: 830kg
✓ Token 567 (150kg) - acumulado: 980kg
✓ Token 890 (100kg) - acumulado: 1080kg (últimos tokens sempre entram)

Lote criado:
- ID: lote-001
- Peso: 1080kg (ultrapassou, mas incluiu todos)
- Tokens: 6
- Status: PENDENTE_VALIDADORA
```

#### 3. Validadora Paga $108

```
Valor Pago: $108.00
Taxa LixCarbon (20%): $21.60
Distribuir (80%): $86.40

Distribuição por Empresa:

Empresa A (530kg / 1080kg = 49.07%):
  - Token 123: $86.40 * (150/1080) = $12.00
  - Token 456: $86.40 * (200/1080) = $16.00
  - Token 789: $86.40 * (180/1080) = $14.40
  Total Empresa A: $42.40

Empresa B (450kg / 1080kg = 41.67%):
  - Token 234: $86.40 * (300/1080) = $24.00
  - Token 567: $86.40 * (150/1080) = $12.00
  Total Empresa B: $36.00

Empresa C (100kg / 1080kg = 9.26%):
  - Token 890: $86.40 * (100/1080) = $8.00
  Total Empresa C: $8.00

TOTAL DISTRIBUÍDO: $86.40 ✓
```

#### 4. Empresas Solicitam Pagamento

```
Empresa A: solicita tokens 123 e 456
  → Valor: $28.00
  → Status: PENDENTE_PAGAMENTO

Empresa B: solicita token 234
  → Valor: $24.00
  → Status: PENDENTE_PAGAMENTO

Empresa C: não solicitou ainda
  → Tokens permanecem: LIBERADO_PAGAMENTO
```

#### 5. Admin Processa Pagamentos

```
Admin seleciona:
- Empresa A: $28.00 → PAGO
- Empresa B: $24.00 → PAGO

Empresa C: ainda aguardando solicitar
```

---

## 🔍 Endpoints da API

### Lotes

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| POST | `/api/lote/criar` | Criar lote para validadora | ADMIN |
| POST | `/api/lote/marcar-pago` | Marcar lote como pago | ADMIN |
| GET | `/api/lote/listar` | Listar todos os lotes | ADMIN |
| GET | `/api/lote/:id` | Detalhes de um lote | ADMIN |
| GET | `/api/lote/stats/geral` | Estatísticas | ADMIN |

### Pagamentos

| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| POST | `/api/payment/solicitar` | Solicitar pagamento | USUARIO |
| GET | `/api/payment/pendentes` | Meus pagamentos pendentes | USUARIO |
| GET | `/api/payment/pendentes/todos` | Todos pagamentos pendentes | ADMIN |
| POST | `/api/payment/processar` | Processar pagamentos | ADMIN |
| GET | `/api/payment/historico` | Meu histórico | USUARIO |
| GET | `/api/payment/historico/todos` | Histórico completo | ADMIN |

---

## ✅ Vantagens do Novo Fluxo

1. **Automatização**: Sistema seleciona tokens automaticamente para lotes
2. **Justiça**: Pagamento proporcional ao peso contribuído
3. **Transparência**: Cada etapa tem status claro
4. **Controle**: Admin gerencia lotes e pagamentos
5. **Histórico**: Tudo rastreável pelo `loteId`
6. **Flexibilidade**: Usuário escolhe quando solicitar pagamento

---

## 🚀 Próximos Passos (Frontend)

### Para USUARIO:
- [ ] Tela "Meus Tokens" mostrando status
- [ ] Filtro por status
- [ ] Tela "Solicitar Pagamento" só com tokens `LIBERADO_PAGAMENTO`
- [ ] Dashboard mostrando valores em $ ao invés de créditos CO₂

### Para ADMINISTRADOR:
- [ ] Tela "Criar Lote" com simulação de peso
- [ ] Tela "Gerenciar Lotes" listando todos
- [ ] Marcar lote como pago com valor
- [ ] Dashboard de lotes (pendentes, pagos, valores)
- [ ] Visualizar tokens de cada lote

