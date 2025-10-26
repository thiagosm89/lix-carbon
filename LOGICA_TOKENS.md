# 🎫 Lógica dos Tokens - LixCarbon

## 📋 Como Funciona

### Conceito Principal
Os **tokens são gerados pelo totem** de coleta de lixo. Cada vez que alguém deposita lixo, o totem:
1. Pesa o lixo
2. Identifica a categoria (Reciclável ou Orgânico)
3. **Gera um token de 6 dígitos**
4. Imprime/exibe para a pessoa

### ✅ Regras dos Tokens

#### 1. **Tokens podem repetir números**
- O token `789012` pode ser gerado **várias vezes**
- Não há problema em ter múltiplos registros com o mesmo número

**Exemplo:**
```
ID  | Token  | Categoria   | Peso  | Usado
1   | 789012 | RECICLAVEL  | 180kg | 1 (usado)
2   | 890123 | ORGANICO    | 220kg | 0 (disponível)
3   | 789012 | RECICLAVEL  | 150kg | 0 (disponível) ✓ OK!
```

#### 2. **Apenas um token disponível por número**
- **NÃO pode** ter dois tokens com o mesmo número **ambos disponíveis**
- Quando um está `usado = 0`, outro com o mesmo número deve estar `usado = 1`

**❌ ERRADO:**
```
ID  | Token  | Usado
1   | 789012 | 0 (disponível)
2   | 789012 | 0 (disponível)  ← Problema!
```

**✅ CORRETO:**
```
ID  | Token  | Usado
1   | 789012 | 1 (usado)
2   | 789012 | 0 (disponível)  ✓ OK!
```

#### 3. **Ao registrar, marca como usado**
Quando usuário registra o token:
1. Sistema busca token `disponível` (usado = 0)
2. Cria registro em `waste_records`
3. Marca token como `usado = 1` em `available_tokens`

#### 4. **Novo token pode ser gerado**
Depois que um token é usado, o totem pode gerar outro com o mesmo número:
```
Momento 1:
- Token 789012 (usado = 0) → Usuário registra → Token 789012 (usado = 1)

Momento 2:
- Totem gera novo token 789012 (usado = 0) ✓ OK!
```

---

## 🗄️ Estrutura do Banco

### Tabela: `available_tokens`

```sql
CREATE TABLE available_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ID único
  token TEXT NOT NULL,                    -- Pode repetir!
  categoria TEXT NOT NULL,
  peso REAL NOT NULL,
  usado INTEGER NOT NULL DEFAULT 0,       -- 0 = disponível, 1 = usado
  dataCriacao TEXT NOT NULL
);
```

**Índices:**
- `idx_tokens_number` - Busca rápida por número do token
- `idx_tokens_usado` - Filtro por tokens disponíveis

---

## 🔄 Fluxo Completo

### 1. Totem Gera Token
```javascript
// Admin/Sistema adiciona token
{
  token: "789012",
  categoria: "RECICLAVEL",
  peso: 180.0,
  usado: 0  // Disponível
}
```

### 2. Usuário Registra Token
```javascript
POST /api/waste/registrar
{
  "token": "789012"
}

// Backend:
1. Busca token disponível: WHERE token = '789012' AND usado = 0
2. Se encontrou:
   - Cria registro em waste_records
   - Marca usado = 1
3. Se não encontrou:
   - Retorna erro: "Token inválido ou já utilizado"
```

### 3. Histórico Gerado
```javascript
// waste_records
{
  id: "abc123",
  userId: "user1",
  token: "789012",
  categoria: "RECICLAVEL",
  peso: 180.0,
  credito: 18.0,
  status: "VALIDADO"
}

// available_tokens
{
  id: 1,
  token: "789012",
  usado: 1  // Marcado como usado
}
```

### 4. Novo Token (mesmo número)
```javascript
// Totem pode gerar novamente
{
  id: 2,
  token: "789012",  // Mesmo número!
  categoria: "ORGANICO",
  peso: 200.0,
  usado: 0  // Disponível novamente
}
```

---

## 💡 Exemplos Práticos

### Cenário 1: Uso Normal

**Estado Inicial:**
```
available_tokens:
ID | Token  | Peso  | Usado
1  | 789012 | 180kg | 0

waste_records: (vazio)
```

**Usuário registra 789012:**
```
available_tokens:
ID | Token  | Peso  | Usado
1  | 789012 | 180kg | 1  ✓ Marcado como usado

waste_records:
ID  | Token  | Peso  | Status
abc | 789012 | 180kg | VALIDADO
```

**Totem gera novo 789012:**
```
available_tokens:
ID | Token  | Peso  | Usado
1  | 789012 | 180kg | 1  (antigo)
2  | 789012 | 220kg | 0  ✓ Novo disponível

waste_records:
ID  | Token  | Peso  | Status
abc | 789012 | 180kg | VALIDADO
```

### Cenário 2: Token Duplicado Disponível

**Estado Incorreto (NÃO PERMITIDO):**
```
available_tokens:
ID | Token  | Usado
1  | 789012 | 0
2  | 789012 | 0  ← Problema!
```

**Solução:** O totem/sistema deve verificar antes de gerar:
```sql
SELECT COUNT(*) FROM available_tokens 
WHERE token = '789012' AND usado = 0
-- Se > 0: Não gerar duplicado
```

### Cenário 3: Mesmo Token, Vários Usuários

```
available_tokens:
ID | Token  | Usado
1  | 789012 | 1
2  | 789012 | 1
3  | 789012 | 0  ← Disponível

waste_records:
ID   | User | Token  | Peso
abc1 | A    | 789012 | 180kg  (registro 1)
abc2 | B    | 789012 | 200kg  (registro 2)
(Aguardando usuário C registrar o ID 3)
```

---

## 🎯 Validações Importantes

### No Backend (/api/waste/registrar):

```javascript
// 1. Token tem 6 dígitos?
if (token.length !== 6) {
  return error('Token deve ter 6 dígitos');
}

// 2. Token existe E está disponível?
const tokenData = findAvailable(token); // WHERE token = ? AND usado = 0
if (!tokenData) {
  return error('Token inválido ou já utilizado');
}

// 3. Registrar e marcar como usado
createWasteRecord(tokenData);
markAsUsed(token); // UPDATE SET usado = 1
```

### No Sistema do Totem:

```javascript
// Antes de gerar token:
const exists = checkTokenAvailable(tokenNumber);
if (exists) {
  // Gerar outro número
  tokenNumber = generateNewNumber();
}
```

---

## 📊 Queries Úteis

### Ver todos os tokens
```sql
SELECT * FROM available_tokens ORDER BY dataCriacao DESC;
```

### Ver tokens disponíveis
```sql
SELECT * FROM available_tokens WHERE usado = 0;
```

### Ver histórico de um token específico
```sql
SELECT * FROM waste_records WHERE token = '789012';
```

### Contar quantas vezes um token foi usado
```sql
SELECT COUNT(*) as vezes_usado 
FROM waste_records 
WHERE token = '789012';
```

### Ver tokens duplicados disponíveis (PROBLEMA!)
```sql
SELECT token, COUNT(*) as quantidade
FROM available_tokens
WHERE usado = 0
GROUP BY token
HAVING COUNT(*) > 1;
```

---

## ✅ Resumo

| Situação | Permitido? |
|----------|-----------|
| Mesmo token, números diferentes | ✅ SIM |
| Mesmo token, um usado + um disponível | ✅ SIM |
| Mesmo token, dois disponíveis | ❌ NÃO |
| Mesmo token em waste_records várias vezes | ✅ SIM |
| Token de 6 dígitos | ✅ SIM |
| Token com menos/mais de 6 dígitos | ❌ NÃO |

**Chave:** Um token pode existir múltiplas vezes, mas apenas um disponível (usado = 0) por vez!

