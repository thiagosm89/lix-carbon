# 🔄 Mapeamento de Colunas PostgreSQL → camelCase

## 📋 Problema

### PostgreSQL e Case Sensitivity

O PostgreSQL converte automaticamente todos os nomes de colunas para **minúsculas** a menos que sejam definidos entre aspas duplas:

```sql
-- Ao criar a tabela assim:
CREATE TABLE lotes (
  pesoMaximo NUMERIC(10,2),  -- ❌ Será convertido para: pesomaximo
  pesoUtilizado NUMERIC(10,2) -- ❌ Será convertido para: pesoutilizado
);

-- O PostgreSQL armazena como:
-- pesomaximo
-- pesoutilizado
```

### Impacto no JavaScript

Quando buscamos dados do banco:

```javascript
// ❌ Objeto retornado do banco (lowercase)
{
  id: 'abc123',
  pesomaximo: 500,
  pesoutilizado: 350,
  quantidadetokens: 25
}

// ✅ Objeto esperado no JavaScript (camelCase)
{
  id: 'abc123',
  pesoMaximo: 500,
  pesoUtilizado: 350,
  quantidadeTokens: 25
}
```

## ✅ Solução Implementada

### 1. Utilitário de Mapeamento

Criamos `backend/utils/columnMapper.js` com funções para mapeamento automático:

```javascript
const { mapDbObjectToCamelCase } = require('../utils/columnMapper');

// Uso:
const dbObject = { pesomaximo: 500, pesoutilizado: 350 };
const mapped = mapDbObjectToCamelCase(dbObject);
// Resultado: { pesoMaximo: 500, pesoUtilizado: 350 }
```

### 2. Mapeamento Centralizado

Todas as colunas problemáticas estão mapeadas em um único lugar:

```javascript
const columnMappings = {
  // Lotes
  'pesomaximo': 'pesoMaximo',
  'pesoutilizado': 'pesoUtilizado',
  'quantidadetokens': 'quantidadeTokens',
  'valorpago': 'valorPago',
  'percentualempresa': 'percentualEmpresa',
  'valordistribuido': 'valorDistribuido',
  
  // Waste Records
  'userid': 'userId',
  'loteid': 'loteId',
  'valorproporcional': 'valorProporcional',
  'datavalidacao': 'dataValidacao',
  
  // ... outros campos
};
```

### 3. Integração nos Repositories

Cada repository aplica o mapeamento automaticamente:

```javascript
// backend/repositories/LoteRepository.js
const { mapDbObjectToCamelCase } = require('../utils/columnMapper');

const parseNumericFields = (lote) => {
  if (!lote) return lote;
  
  // 1️⃣ Primeiro mapeia as colunas para camelCase
  const mapped = mapDbObjectToCamelCase(lote);
  
  // 2️⃣ Depois converte os campos numéricos
  return {
    ...mapped,
    pesoMaximo: parseFloat(mapped.pesoMaximo) || 0,
    pesoUtilizado: parseFloat(mapped.pesoUtilizado) || 0,
    // ...
  };
};
```

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────┐
│          POSTGRESQL DATABASE                │
│                                             │
│  SELECT * FROM lotes WHERE id = $1          │
│                                             │
│  Retorna:                                   │
│  {                                          │
│    id: 'abc',                              │
│    pesomaximo: 500,        ← lowercase     │
│    pesoutilizado: 350      ← lowercase     │
│  }                                          │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│         REPOSITORY LAYER                    │
│                                             │
│  const lote = await db.getAsync(...)        │
│                                             │
│  // Aplica mapeamento automático            │
│  const mapped = mapDbObjectToCamelCase(lote)│
│                                             │
│  Retorna:                                   │
│  {                                          │
│    id: 'abc',                              │
│    pesoMaximo: 500,        ← camelCase ✅  │
│    pesoUtilizado: 350      ← camelCase ✅  │
│  }                                          │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│          SERVICE LAYER                      │
│                                             │
│  Usa objetos com propriedades camelCase     │
│  lote.pesoMaximo    ✅                      │
│  lote.pesoUtilizado ✅                      │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│         CONTROLLER LAYER                    │
│                                             │
│  res.json({ lote })                         │
│                                             │
│  Frontend recebe camelCase ✅               │
└─────────────────────────────────────────────┘
```

## 📦 Funções Disponíveis

### `mapDbObjectToCamelCase(dbObject)`

Mapeia um único objeto do banco para camelCase:

```javascript
const dbLote = {
  id: '123',
  pesomaximo: 500,
  pesoutilizado: 350
};

const mapped = mapDbObjectToCamelCase(dbLote);
// {
//   id: '123',
//   pesoMaximo: 500,
//   pesoUtilizado: 350
// }
```

### `mapDbArrayToCamelCase(dbArray)`

Mapeia um array de objetos:

```javascript
const dbLotes = [
  { id: '1', pesomaximo: 500 },
  { id: '2', pesomaximo: 600 }
];

const mapped = mapDbArrayToCamelCase(dbLotes);
// [
//   { id: '1', pesoMaximo: 500 },
//   { id: '2', pesoMaximo: 600 }
// ]
```

### `mapCamelCaseToDb(camelObject)`

Converte camelCase para lowercase (para queries):

```javascript
const jsObject = {
  pesoMaximo: 500,
  pesoUtilizado: 350
};

const dbFormat = mapCamelCaseToDb(jsObject);
// {
//   pesomaximo: 500,
//   pesoutilizado: 350
// }
```

## 🛠️ Repositories Atualizados

Os seguintes repositories já usam o mapeamento automático:

- ✅ **LoteRepository** - Lotes para validadoras
- ✅ **WasteRecordRepository** - Registros de lixo

### Exemplo de Uso

```javascript
// Antes (problema)
const lote = await LoteRepository.findById(id);
console.log(lote.pesomaximo);    // ❌ lowercase
console.log(lote.pesoutilizado); // ❌ lowercase

// Depois (solução)
const lote = await LoteRepository.findById(id);
console.log(lote.pesoMaximo);    // ✅ camelCase
console.log(lote.pesoUtilizado); // ✅ camelCase
```

## 📝 Como Adicionar Novos Mapeamentos

Se você criar novas colunas que o PostgreSQL converte para minúsculas:

### 1. Adicione ao `columnMappings`

Edite `backend/utils/columnMapper.js`:

```javascript
const columnMappings = {
  // ... mapeamentos existentes
  
  // Adicione aqui:
  'novocampo': 'novoCampo',
  'datainicio': 'dataInicio',
  'valorminimo': 'valorMinimo'
};
```

### 2. Use no Repository

O mapeamento será automático:

```javascript
const { mapDbObjectToCamelCase } = require('../utils/columnMapper');

async findById(id) {
  const result = await db.getAsync('SELECT * FROM tabela WHERE id = ?', [id]);
  return mapDbObjectToCamelCase(result); // ✅ Automático
}
```

## 🔍 Casos Especiais

### Colunas que já estão corretas

Colunas sem letras maiúsculas não são afetadas:

```javascript
{
  id: 'abc',      // ✅ Mantém 'id'
  token: '123',   // ✅ Mantém 'token'
  peso: 50,       // ✅ Mantém 'peso'
  categoria: 'A'  // ✅ Mantém 'categoria'
}
```

### Snake_case para camelCase

Se você tiver colunas em snake_case:

```javascript
// Adicione ao mapeamento:
'data_criacao': 'dataCriacao',
'valor_total': 'valorTotal'
```

## 🚫 Alternativa: Aspas Duplas no SQL

**NÃO RECOMENDADO**, mas possível:

```sql
CREATE TABLE lotes (
  "pesoMaximo" NUMERIC(10,2),  -- Mantém case exato
  "pesoUtilizado" NUMERIC(10,2)
);

-- Queries também precisam de aspas:
SELECT "pesoMaximo" FROM lotes; -- ✅
SELECT pesoMaximo FROM lotes;   -- ❌ Erro!
```

**Problemas:**
- Todas as queries precisam de aspas
- Muito trabalhoso
- Propenso a erros

**Nossa solução é melhor:** Mapeamento automático na camada de Repository! ✅

## 📊 Tabelas Afetadas

### Lotes
```
pesomaximo      → pesoMaximo
pesoutilizado   → pesoUtilizado
quantidadetokens → quantidadeTokens
valorpago       → valorPago
percentualempresa → percentualEmpresa
valordistribuido → valorDistribuido
datacriacao     → dataCriacao
```

### Waste Records
```
userid          → userId
loteid          → loteId
valorproporcional → valorProporcional
datacriacao     → dataCriacao
datavalidacao   → dataValidacao
datasolicitacaopagamento → dataSolicitacaoPagamento
datapagamento   → dataPagamento
```

### Users
```
criadoem        → criadoEm
```

### Validadoras
```
nomeempresa     → nomeEmpresa
datacadastro    → dataCadastro
```

## 🎯 Benefícios da Solução

1. ✅ **Consistência** - Código JavaScript sempre em camelCase
2. ✅ **Centralizado** - Um único lugar para mapeamentos
3. ✅ **Automático** - Sem necessidade de mapear manualmente em cada query
4. ✅ **Manutenível** - Fácil adicionar novos mapeamentos
5. ✅ **Type-safe** - Propriedades corretas no código
6. ✅ **Padrão** - Segue convenções JavaScript

## 🧪 Testes

### Testar Mapeamento

```javascript
const { mapDbObjectToCamelCase } = require('./utils/columnMapper');

// Teste 1: Objeto simples
const result1 = mapDbObjectToCamelCase({
  pesomaximo: 500,
  pesoutilizado: 350
});
console.log(result1);
// { pesoMaximo: 500, pesoUtilizado: 350 } ✅

// Teste 2: Array
const result2 = mapDbArrayToCamelCase([
  { pesomaximo: 500 },
  { pesomaximo: 600 }
]);
console.log(result2);
// [{ pesoMaximo: 500 }, { pesoMaximo: 600 }] ✅
```

## 📚 Referências

- [PostgreSQL Identifiers](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)
- [JavaScript Naming Conventions](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript#variable_naming)

---

**LixCarbon Backend** - Mapeamento automático de colunas implementado! 🎉

