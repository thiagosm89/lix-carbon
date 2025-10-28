# 🔌 Integração Totem - Backend

## 📋 Visão Geral

O backend foi atualizado para suportar geração de tokens detalhados pelo simulador de totem, salvando todas as informações no banco de dados com `usado = 0` (disponível para registro).

## 🛠️ Arquivos Modificados

### 1. **TotemService.js**
Lógica de negócio para gerar tokens com dados detalhados.

**Método:** `gerarToken(dadosDeposito)`

**Parâmetros:**
```javascript
dadosDeposito = {
  pesoReciclavel: number,  // Peso total reciclável em kg
  pesoOrganico: number,    // Peso total orgânico em kg
  detalhamento: [          // Array com detalhes dos itens
    {
      tipo: string,
      quantidade: number,
      pesoUnitario: number,
      pesoTotal: string
    }
  ]
}
```

**Comportamento:**
- Se `dadosDeposito` for fornecido: usa os dados do simulador
- Se `dadosDeposito` for null: gera token aleatório (modo legado)
- Determina categoria predominante: `pesoReciclavel >= pesoOrganico ? 'RECICLAVEL' : 'ORGANICO'`
- Salva no banco com `usado = 0`

**Retorno:**
```javascript
{
  numero: string,        // Token de 6 dígitos
  categoria: string,     // 'RECICLAVEL' ou 'ORGANICO'
  peso: number,         // Peso total
  pesoReciclavel: number,
  pesoOrganico: number,
  detalhamento: array,
  dataCriacao: string,
  usado: boolean        // Sempre false (0)
}
```

### 2. **TotemController.js**
Controller que recebe a requisição HTTP.

**Endpoint:** `POST /api/totem/gerar-token`

**Body (opcional):**
```json
{
  "pesoReciclavel": 0.275,
  "pesoOrganico": 0.500,
  "detalhamento": [...]
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Token gerado com sucesso!",
  "token": {
    "numero": "123456",
    "categoria": "RECICLAVEL",
    "peso": 0.775,
    "pesoReciclavel": 0.275,
    "pesoOrganico": 0.500,
    "detalhamento": [...],
    "dataCriacao": "2025-10-27T22:30:00.000Z",
    "usado": false
  }
}
```

**Resposta de Erro (500):**
```json
{
  "success": false,
  "error": "Erro ao gerar token. Tente novamente."
}
```

### 3. **TokenRepository.js**
Acesso aos dados da tabela `available_tokens`.

**Método:** `create(tokenData)`

**SQL Executado:**
```sql
INSERT INTO available_tokens (token, categoria, peso, usado)
VALUES ($1, $2, $3, $4)
RETURNING *
```

**Parâmetros:**
- `token`: String de 6 dígitos (ex: "123456")
- `categoria`: 'RECICLAVEL' ou 'ORGANICO'
- `peso`: Decimal (peso total em kg)
- `usado`: 0 (não usado) ou 1 (usado)

## 📊 Fluxo Completo

### 1. Simulador Frontend → Backend
```
┌─────────────────────────────────────────┐
│ TotemSimulador.js                       │
│                                         │
│ Usuario adiciona:                       │
│ • 10 latas (0.150kg)                   │
│ • 5 garrafas (0.125kg)                 │
│ • 1 orgânico (0.500kg)                 │
│                                         │
│ Clica "Gerar Token"                    │
└────────────┬────────────────────────────┘
             │
             ▼
     POST /api/totem/gerar-token
             │
     {
       pesoReciclavel: 0.275,
       pesoOrganico: 0.500,
       detalhamento: [...]
     }
```

### 2. Backend Processa
```
┌─────────────────────────────────────────┐
│ TotemController.gerarToken()            │
└────────────┬────────────────────────────┘
             ▼
┌─────────────────────────────────────────┐
│ TotemService.gerarToken(dados)          │
│                                         │
│ 1. Gera token: "123456"                │
│ 2. Calcula:                            │
│    • pesoTotal = 0.775kg               │
│    • categoria = ORGANICO              │
│      (0.500 > 0.275)                   │
└────────────┬────────────────────────────┘
             ▼
┌─────────────────────────────────────────┐
│ TokenRepository.create()                │
│                                         │
│ INSERT INTO available_tokens           │
│   (token, categoria, peso, usado)      │
│ VALUES                                  │
│   ('123456', 'ORGANICO', 0.775, 0)    │
└────────────┬────────────────────────────┘
             ▼
┌─────────────────────────────────────────┐
│ Retorna Token Salvo                     │
│ { numero, categoria, peso, usado: 0 }  │
└─────────────────────────────────────────┘
```

### 3. Usuario Registra Token
```
┌─────────────────────────────────────────┐
│ Usuario faz login                       │
│ Acessa "Registrar Lixo"                │
│ Digita token: "123456"                 │
└────────────┬────────────────────────────┘
             ▼
     POST /api/waste/registrar
             │
     { token: "123456" }
             │
             ▼
┌─────────────────────────────────────────┐
│ WasteService.registrar()                │
│                                         │
│ 1. Busca token disponível               │
│    WHERE token = '123456' AND usado = 0│
│                                         │
│ 2. Cria waste_record                   │
│    • userId                             │
│    • token: '123456'                   │
│    • categoria: 'ORGANICO'             │
│    • peso: 0.775                       │
│    • credito: calculado                │
│                                         │
│ 3. Marca token como usado              │
│    UPDATE available_tokens              │
│    SET usado = 1                       │
│    WHERE token = '123456'              │
└─────────────────────────────────────────┘
```

## 🗄️ Tabela: available_tokens

### Estrutura
```sql
CREATE TABLE available_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(6) NOT NULL,
  categoria VARCHAR(50) NOT NULL 
    CHECK(categoria IN ('RECICLAVEL', 'ORGANICO')),
  peso NUMERIC(10,2) NOT NULL,
  usado SMALLINT NOT NULL DEFAULT 0,  -- 0 = disponível, 1 = usado
  dataCriacao TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Índices
```sql
CREATE INDEX idx_tokens_number ON available_tokens(token);
CREATE INDEX idx_tokens_usado ON available_tokens(usado);
```

### Query para tokens disponíveis
```sql
SELECT * FROM available_tokens 
WHERE token = '123456' AND usado = 0;
```

### Query para marcar como usado
```sql
UPDATE available_tokens 
SET usado = 1 
WHERE token = '123456';
```

## 🔍 Logs do Backend

Quando um token é gerado pelo simulador:
```
🎫 Token gerado pelo simulador: 123456
   📊 Reciclável: 0.275kg | Orgânico: 0.500kg
   📋 Itens: 2 tipos diferentes
```

Quando um token é usado:
```
✅ Token registrado - Registro abc123...
   Token: 123456 marcado como usado
```

## 🧪 Testando a Integração

### 1. Gerar Token via cURL
```bash
curl -X POST http://localhost:5000/api/totem/gerar-token \
  -H "Content-Type: application/json" \
  -d '{
    "pesoReciclavel": 0.5,
    "pesoOrganico": 0.3,
    "detalhamento": [
      {
        "tipo": "Latas",
        "quantidade": 10,
        "pesoUnitario": 0.015,
        "pesoTotal": "0.150"
      }
    ]
  }'
```

### 2. Verificar no Banco
```sql
-- Ver tokens disponíveis
SELECT * FROM available_tokens 
WHERE usado = 0 
ORDER BY dataCriacao DESC;

-- Ver token específico
SELECT * FROM available_tokens 
WHERE token = '123456';
```

### 3. Registrar Token
```bash
curl -X POST http://localhost:5000/api/waste/registrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "token": "123456"
  }'
```

### 4. Verificar Token Usado
```sql
SELECT * FROM available_tokens 
WHERE token = '123456';
-- usado deve ser 1
```

## 📈 Estatísticas

### Tokens por Status
```sql
SELECT 
  usado,
  COUNT(*) as quantidade,
  SUM(peso) as peso_total
FROM available_tokens
GROUP BY usado;
```

### Tokens Gerados Hoje
```sql
SELECT COUNT(*) 
FROM available_tokens 
WHERE DATE(dataCriacao) = CURRENT_DATE;
```

### Tokens por Categoria
```sql
SELECT 
  categoria,
  COUNT(*) as quantidade,
  AVG(peso) as peso_medio
FROM available_tokens
GROUP BY categoria;
```

## 🚀 Deploy

### Variáveis de Ambiente
```env
# Backend
DATABASE_URL=postgresql://...
PORT=5000

# Frontend
REACT_APP_API_URL=https://seu-backend.com/api
```

### CORS
O backend já está configurado para aceitar requisições do frontend:
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
```

## 🔒 Segurança

- ✅ Endpoint público (não requer autenticação)
- ✅ Tokens de 6 dígitos aleatórios
- ✅ Validação de dados no backend
- ✅ Try/catch para tratamento de erros
- ✅ Logs para auditoria

## 📝 Notas Importantes

1. **Token Único:** Cada token gerado é único (probabilidade muito baixa de duplicação)
2. **Usado = 0:** Token disponível para qualquer usuário registrar
3. **Usado = 1:** Token já registrado, não pode ser usado novamente
4. **Categoria:** Determinada pelo peso predominante (reciclável vs orgânico)
5. **Detalhamento:** Informações adicionais para logs, não salvas no banco

---

**LixCarbon Backend** - Integração completa! 🌱

