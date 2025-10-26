# 📊 Dashboard do USUARIO - Explicação Detalhada

## Como os dados são calculados (do Banco SQL)

### 🔢 Resumo (Cards superiores)

#### 1. **Créditos Totais**
- **Origem**: Banco SQL - Tabela `waste_records`
- **Cálculo**: Soma de TODOS os `credito` dos registros do usuário
- **Query**: `SUM(credito) WHERE userId = ?`
- **Status considerados**: TODOS (VALIDADO, PENDENTE_PAGAMENTO, PAGO)

```javascript
dashboard.resumo.totalCredito = registros.reduce((sum, r) => sum + r.credito, 0);
```

#### 2. **Peso Total**
- **Origem**: Banco SQL - Tabela `waste_records`
- **Cálculo**: Soma de TODOS os `peso` dos registros do usuário
- **Query**: `SUM(peso) WHERE userId = ?`
- **Unidade**: kg (quilogramas)

```javascript
dashboard.resumo.totalPeso = registros.reduce((sum, r) => sum + r.peso, 0);
```

#### 3. **Crédito Pendente**
- **Origem**: Banco SQL - Tabela `waste_records`
- **Cálculo**: Soma dos `credito` com status = 'PENDENTE_PAGAMENTO'
- **Query**: `SUM(credito) WHERE userId = ? AND status = 'PENDENTE_PAGAMENTO'`
- **Significa**: Dinheiro que o usuário ainda vai receber

```javascript
dashboard.resumo.creditoPendente = registros
  .filter(r => r.status === 'PENDENTE_PAGAMENTO')
  .reduce((sum, r) => sum + r.credito, 0);
```

#### 4. **Registros**
- **Origem**: Banco SQL - Tabela `waste_records`
- **Cálculo**: Contagem total de registros do usuário
- **Query**: `COUNT(*) WHERE userId = ?`
- **Significa**: Quantidade total de tokens já cadastrados

```javascript
dashboard.resumo.totalRegistros = registros.length;
```

---

### 📦 Contribuição por Categoria

#### Dados Calculados por Categoria:

**RECICLAVEL:**
- **Peso total**: Soma de `peso` onde `categoria = 'RECICLAVEL'`
- **Crédito total**: Soma de `credito` onde `categoria = 'RECICLAVEL'`
- **Quantidade**: Contagem de registros onde `categoria = 'RECICLAVEL'`
- **Percentual**: `(crédito_reciclavel / crédito_total) * 100`

**ORGANICO:**
- **Peso total**: Soma de `peso` onde `categoria = 'ORGANICO'`
- **Crédito total**: Soma de `credito` onde `categoria = 'ORGANICO'`
- **Quantidade**: Contagem de registros onde `categoria = 'ORGANICO'`
- **Percentual**: `(crédito_organico / crédito_total) * 100`

```javascript
registros.forEach(r => {
  dashboard.porCategoria[r.categoria].peso += r.peso;
  dashboard.porCategoria[r.categoria].credito += r.credito;
  dashboard.porCategoria[r.categoria].quantidade += 1;
});
```

---

### 📈 Evolução Mensal (Gráfico)

#### Como funciona:
- **Período**: Últimos 6 meses
- **Origem**: Banco SQL - Tabela `waste_records`
- **Eixo X**: Mês/Ano (ex: Out/25, Nov/25)
- **Eixo Y**: Peso em kg
- **Barras**: 
  - Verde claro: Recicláveis
  - Verde escuro: Orgânicos

#### Cálculo:
1. Cria 6 meses vazios (do mais antigo ao mais recente)
2. Agrupa registros por `dataCriacao` (mês/ano)
3. Soma o `peso` de cada categoria por mês

```javascript
// Exemplo de dados retornados:
[
  { mes: 'Mai/25', reciclavel: 180.0, organico: 0 },
  { mes: 'Jun/25', reciclavel: 275.5, organico: 220.0 },
  { mes: 'Jul/25', reciclavel: 0, organico: 0 },
  { mes: 'Ago/25', reciclavel: 0, organico: 0 },
  { mes: 'Set/25', reciclavel: 0, organico: 0 },
  { mes: 'Out/25', reciclavel: 0, organico: 0 }
]
```

---

### 📋 Últimos Registros (Tabela)

#### Dados Mostrados:
- **Origem**: Banco SQL - Tabela `waste_records`
- **Ordenação**: `dataCriacao DESC` (mais recente primeiro)
- **Limite**: 10 registros

#### Colunas:
1. **Data**: `dataCriacao` formatada (dd/mm/yyyy)
2. **Categoria**: Badge colorido (🔵 Reciclável ou 🟢 Orgânico)
3. **Peso**: `peso` em kg
4. **Crédito**: `credito` em CO₂
5. **Status**: 
   - ✅ Validado
   - ⏳ Pend. Pagamento
   - 💰 Pago

```javascript
dashboard.ultimosRegistros = registros
  .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
  .slice(0, 10);
```

---

## 🔄 Fluxo de Atualização

### 1. Usuário acessa Dashboard
```
Frontend → GET /api/dashboard/usuario
Backend → SELECT * FROM waste_records WHERE userId = ?
Backend → Calcula todos os totais
Backend → Retorna JSON com dados
Frontend → Exibe no dashboard
```

### 2. Usuário registra novo lixo
```
Frontend → POST /api/waste/registrar { token }
Backend → INSERT INTO waste_records
Frontend → Dashboard atualiza automaticamente (via refresh)
```

### 3. Usuário solicita pagamento
```
Frontend → POST /api/payment/solicitar { registroIds }
Backend → UPDATE waste_records SET status='PENDENTE_PAGAMENTO'
Frontend → Crédito Pendente aumenta
```

### 4. Admin aprova pagamento
```
Admin → POST /api/payment/processar { registroIds }
Backend → UPDATE waste_records SET status='PAGO'
Frontend → Crédito Pendente diminui
```

---

## 💡 Exemplos Práticos

### Cenário 1: Usuário novo (sem registros)
```json
{
  "resumo": {
    "totalPeso": 0,
    "totalCredito": 0,
    "totalRegistros": 0,
    "creditoPendente": 0
  },
  "porCategoria": {
    "RECICLAVEL": { "peso": 0, "credito": 0, "quantidade": 0, "percentual": "0.0" },
    "ORGANICO": { "peso": 0, "credito": 0, "quantidade": 0, "percentual": "0.0" }
  },
  "ultimosRegistros": [],
  "graficoMensal": []
}
```

### Cenário 2: Usuário com 2 registros
```json
{
  "resumo": {
    "totalPeso": 400.0,        // 180 + 220
    "totalCredito": 29.0,       // 18 + 11
    "totalRegistros": 2,
    "creditoPendente": 0
  },
  "porCategoria": {
    "RECICLAVEL": { 
      "peso": 180.0, 
      "credito": 18.0, 
      "quantidade": 1, 
      "percentual": "62.1"     // (18/29) * 100
    },
    "ORGANICO": { 
      "peso": 220.0, 
      "credito": 11.0, 
      "quantidade": 1, 
      "percentual": "37.9"     // (11/29) * 100
    }
  },
  "ultimosRegistros": [
    {
      "id": "abc123",
      "token": "890123",
      "categoria": "ORGANICO",
      "peso": 220.0,
      "credito": 11.0,
      "status": "VALIDADO",
      "dataCriacao": "2025-10-26T12:00:00Z"
    },
    {
      "id": "def456",
      "token": "789012",
      "categoria": "RECICLAVEL",
      "peso": 180.0,
      "credito": 18.0,
      "status": "VALIDADO",
      "dataCriacao": "2025-10-26T10:00:00Z"
    }
  ]
}
```

---

## ✅ Validações

- ✅ Todos os dados vêm do banco SQL
- ✅ Cálculos em tempo real
- ✅ Sem cache (sempre dados atualizados)
- ✅ Filtrado por `userId` (cada usuário vê apenas seus dados)
- ✅ Ordenação por data decrescente
- ✅ Tratamento de divisão por zero
- ✅ Percentuais arredondados em 1 casa decimal

---

## 🎯 Resumo Final

**Tudo no dashboard do USUARIO vem do banco SQL:**

| Métrica | Tabela | Campo | Condição |
|---------|--------|-------|----------|
| Créditos Totais | waste_records | credito | userId = X |
| Peso Total | waste_records | peso | userId = X |
| Crédito Pendente | waste_records | credito | userId = X AND status = 'PENDENTE_PAGAMENTO' |
| Registros | waste_records | COUNT(*) | userId = X |
| Por Categoria | waste_records | categoria | userId = X |
| Evolução Mensal | waste_records | dataCriacao + peso | userId = X |
| Últimos Registros | waste_records | * | userId = X ORDER BY dataCriacao DESC LIMIT 10 |

**100% conectado ao banco de dados SQLite!** 💾✨

