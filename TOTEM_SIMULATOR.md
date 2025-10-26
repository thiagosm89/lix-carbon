# 🎫 Totem LixCarbon - Simulador

## 📋 Descrição

O **Totem Simulador** é um endpoint público que simula o funcionamento de um totem físico de coleta de resíduos. Ele gera tokens automáticos com peso e categoria aleatórios.

---

## 🚀 Como Usar

### **1. Iniciar o Backend**

```bash
cd backend
node server.js
```

O servidor estará rodando em: `http://localhost:5000`

---

### **2. Acessar o Simulador Web**

Abra no navegador:
```
http://localhost:5000/totem/totem.html
```

Clique no botão **"Gerar Token de Pesagem"** para simular uma coleta.

---

## 📡 Endpoints da API

### **POST /api/totem/gerar-token**
Gera um novo token de pesagem.

**Público:** ✅ Não requer autenticação

**Response:**
```json
{
  "success": true,
  "message": "Token gerado com sucesso!",
  "token": {
    "numero": "123456",
    "categoria": "RECICLAVEL",
    "peso": 125.50,
    "dataCriacao": "2025-10-26T12:00:00.000Z",
    "usado": false
  }
}
```

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:5000/api/totem/gerar-token \
  -H "Content-Type: application/json"
```

**Exemplo com JavaScript:**
```javascript
fetch('http://localhost:5000/api/totem/gerar-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => console.log(data.token));
```

---

### **GET /api/totem/status**
Verifica status do totem.

**Público:** ✅ Não requer autenticação

**Response:**
```json
{
  "success": true,
  "status": "online",
  "message": "Totem LixCarbon operacional",
  "timestamp": "2025-10-26T12:00:00.000Z"
}
```

---

### **GET /api/totem/ultimos-tokens**
Lista últimos tokens gerados (para debug).

**Público:** ✅ Não requer autenticação

**Query Params:**
- `limit` (opcional): Número de tokens a retornar (padrão: 10)

**Response:**
```json
{
  "success": true,
  "total": 5,
  "tokens": [
    {
      "numero": "123456",
      "categoria": "RECICLAVEL",
      "peso": 125.50,
      "usado": false,
      "dataCriacao": "2025-10-26T12:00:00.000Z"
    }
  ]
}
```

**Exemplo:**
```bash
curl http://localhost:5000/api/totem/ultimos-tokens?limit=5
```

---

## ⚙️ Configurações

### **Geração Automática:**

- **Token:** 6 dígitos aleatórios (100000 - 999999)
- **Peso:** Aleatório entre 5kg e 500kg
- **Categoria:** Aleatória (RECICLAVEL ou ORGANICO)
- **Usado:** Sempre `false` no momento da criação

### **Armazenamento:**

Os tokens são salvos na tabela `available_tokens` do banco de dados PostgreSQL.

---

## 🎨 Interface Web

A interface do totem (`totem.html`) possui:

- ✅ Design moderno e responsivo
- ✅ Animações suaves
- ✅ Feedback visual de sucesso/erro
- ✅ Exibição clara do token gerado
- ✅ Informações de categoria e peso
- ✅ Loading state durante geração

---

## 🔄 Fluxo de Uso

```
1. TOTEM GERA TOKEN
   ↓
2. Token salvo no banco (available_tokens)
   ↓
3. USUÁRIO registra token na plataforma
   ↓
4. Token marcado como "usado"
   ↓
5. Waste record criado para o usuário
```

---

## 🧪 Testes

### **Teste Manual (Navegador):**
1. Abra `http://localhost:5000/totem/totem.html`
2. Clique em "Gerar Token"
3. Anote o número do token
4. Faça login na plataforma como USUARIO
5. Registre o token na página "Registrar Lixo"

### **Teste Automatizado (cURL):**
```bash
# Gerar token
TOKEN=$(curl -X POST http://localhost:5000/api/totem/gerar-token | jq -r '.token.numero')
echo "Token gerado: $TOKEN"

# Verificar tokens recentes
curl http://localhost:5000/api/totem/ultimos-tokens?limit=1
```

---

## 📊 Monitoramento

Para ver todos os tokens gerados em tempo real:
```bash
curl http://localhost:5000/api/totem/ultimos-tokens?limit=50
```

Para verificar status do totem:
```bash
curl http://localhost:5000/api/totem/status
```

---

## 🔐 Segurança

**Observação:** Os endpoints do totem são públicos para simular um dispositivo físico que não requer autenticação.

Para produção, considere:
- Adicionar API Key para autenticação do totem
- Implementar rate limiting
- Validar origem das requisições
- Logs de auditoria

---

## 🎯 Integração com Hardware Real

Para integrar com um totem físico real:

1. **Hardware do Totem deve:**
   - Pesar o resíduo
   - Identificar categoria (sensor ou manual)
   - Fazer POST para `/api/totem/gerar-token`
   - Exibir token no display

2. **Configuração:**
   - Apontar para o endpoint de produção
   - Implementar retry logic
   - Cache local em caso de offline
   - Sincronização quando voltar online

---

## 📝 Exemplo de Integração IoT

```javascript
// Código exemplo para Arduino/ESP32
async function pesarEGerar() {
  const peso = lerBalanca();
  const categoria = detectarCategoria();
  
  const response = await fetch('https://api.lixcarbon.com/api/totem/gerar-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await response.json();
  exibirToken(data.token.numero);
  imprimirRecibo(data.token);
}
```

---

## ✅ Checklist de Implementação

- [x] Endpoint POST /api/totem/gerar-token
- [x] Endpoint GET /api/totem/status
- [x] Endpoint GET /api/totem/ultimos-tokens
- [x] Interface web simulador (totem.html)
- [x] Geração aleatória de peso (5-500kg)
- [x] Geração aleatória de categoria
- [x] Token de 6 dígitos
- [x] Salvamento no banco de dados
- [x] Documentação completa

---

**🎉 Totem Simulador Pronto para Uso!**

Para mais informações, consulte o código em:
- Backend: `backend/routes/totem.js`
- Frontend: `backend/public/totem.html`
- Model: `backend/models/Token.js`

