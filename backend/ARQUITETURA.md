# Arquitetura em Camadas (Layer Architecture)

Este backend foi refatorado seguindo o padrão de **Layer Architecture** (Arquitetura em Camadas), que separa as responsabilidades do código em camadas bem definidas.

## 📋 Estrutura das Camadas

```
backend/
├── controllers/        # Camada de Apresentação (Presentation Layer)
├── services/          # Camada de Lógica de Negócio (Business Logic Layer)
├── repositories/      # Camada de Acesso aos Dados (Data Access Layer)
├── models/           # Modelos/Entidades (mantidos para compatibilidade)
├── routes/           # Definição de rotas HTTP
├── middleware/       # Middlewares (autenticação, autorização)
└── database/         # Configuração do banco de dados
```

## 🔄 Fluxo de uma Requisição

```
HTTP Request → Routes → Controller → Service → Repository → Database
                  ↓          ↓          ↓           ↓
               (HTTP)   (Validação) (Lógica)  (SQL/Queries)
```

### Exemplo Prático

```
POST /api/waste/registrar
  ↓
routes/waste.js (define a rota)
  ↓
WasteController.registrar() (recebe req/res)
  ↓
WasteService.registrar() (lógica de negócio)
  ↓
WasteRecordRepository.create() (SQL)
TokenRepository.markAsUsed() (SQL)
  ↓
Database
```

## 📦 Descrição das Camadas

### 1. **Controllers** (Camada de Apresentação)
**Responsabilidade:** Lidar com requisições e respostas HTTP

- Recebe dados do `req.body`, `req.params`, `req.query`
- Valida dados de entrada básicos
- Chama os Services apropriados
- Retorna respostas HTTP com status codes adequados
- Trata erros e formata respostas

**Exemplo:**
```javascript
// controllers/WasteController.js
async registrar(req, res) {
  try {
    const novoRegistro = await WasteService.registrar(userId, token);
    res.status(201).json({ message: 'Sucesso', registro: novoRegistro });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

### 2. **Services** (Camada de Lógica de Negócio)
**Responsabilidade:** Implementar regras de negócio

- Contém toda a lógica de negócio da aplicação
- Valida dados de negócio
- Coordena chamadas entre múltiplos repositories
- Não conhece detalhes de HTTP (não recebe req/res)
- Retorna dados ou lança exceções

**Exemplo:**
```javascript
// services/WasteService.js
async registrar(userId, token) {
  // Validações de negócio
  if (!token || token.length !== 6) {
    throw new Error('Token deve ter 6 dígitos');
  }
  
  // Lógica de negócio
  const tokenData = await TokenRepository.findAvailable(token);
  if (!tokenData) throw new Error('Token inválido');
  
  const credito = this.calcularCredito(tokenData.peso, tokenData.categoria);
  
  // Coordena múltiplos repositories
  const registro = await WasteRecordRepository.create({...});
  await TokenRepository.markAsUsed(token);
  
  return registro;
}
```

### 3. **Repositories** (Camada de Acesso aos Dados)
**Responsabilidade:** Acesso ao banco de dados

- Executam queries SQL
- Fazem parsing de dados do banco
- Não contêm lógica de negócio
- Retornam dados brutos ou null
- Cada repository gerencia uma entidade (User, WasteRecord, etc.)

**Exemplo:**
```javascript
// repositories/WasteRecordRepository.js
async create(recordData) {
  const sql = `INSERT INTO waste_records (...) VALUES (...) RETURNING *`;
  const result = await db.pool.query(sql, [...]);
  return parseNumericFields(result.rows[0]);
}

async findByUserId(userId) {
  const records = await db.allAsync(
    'SELECT * FROM waste_records WHERE userId = ? ORDER BY dataCriacao DESC',
    [userId]
  );
  return parseNumericArrayFields(records);
}
```

### 4. **Routes** (Definição de Rotas)
**Responsabilidade:** Mapear URLs para controllers

- Define rotas HTTP (GET, POST, PUT, DELETE)
- Aplica middlewares (autenticação, autorização)
- Delega execução para controllers
- Mantém código limpo e organizado

**Exemplo:**
```javascript
// routes/waste.js
router.post('/registrar', 
  authenticateToken, 
  authorizeRole('USUARIO'), 
  (req, res) => WasteController.registrar(req, res)
);
```

## 🎯 Benefícios da Arquitetura

### ✅ Separação de Responsabilidades
Cada camada tem uma responsabilidade única e bem definida.

### ✅ Manutenibilidade
Código mais fácil de entender, modificar e estender.

### ✅ Testabilidade
Cada camada pode ser testada independentemente:
- **Controllers:** Testar respostas HTTP
- **Services:** Testar lógica de negócio
- **Repositories:** Testar queries SQL

### ✅ Reusabilidade
Services podem ser reutilizados por diferentes controllers.

### ✅ Escalabilidade
Facilita adicionar novas funcionalidades sem afetar código existente.

## 📝 Convenções e Boas Práticas

### Nomenclatura
- **Controllers:** `NomeController.js` (ex: `WasteController.js`)
- **Services:** `NomeService.js` (ex: `WasteService.js`)
- **Repositories:** `NomeRepository.js` (ex: `WasteRecordRepository.js`)

### Exports
Todos os módulos exportam uma instância única (Singleton):
```javascript
module.exports = new WasteService();
```

### Tratamento de Erros
- **Controllers:** Capturam erros e retornam HTTP status apropriado
- **Services:** Lançam exceções com mensagens descritivas
- **Repositories:** Lançam exceções de banco de dados

### Async/Await
Todas as operações assíncronas usam `async/await` para melhor legibilidade.

## 🔧 Como Adicionar Nova Funcionalidade

### 1. Criar Repository (se necessário)
```javascript
// repositories/NovaEntidadeRepository.js
class NovaEntidadeRepository {
  async findAll() { /* ... */ }
  async create(data) { /* ... */ }
}
module.exports = new NovaEntidadeRepository();
```

### 2. Criar Service
```javascript
// services/NovaFuncionalidadeService.js
const NovaEntidadeRepository = require('../repositories/NovaEntidadeRepository');

class NovaFuncionalidadeService {
  async executarAcao(dados) {
    // Lógica de negócio
    return await NovaEntidadeRepository.create(dados);
  }
}
module.exports = new NovaFuncionalidadeService();
```

### 3. Criar Controller
```javascript
// controllers/NovaFuncionalidadeController.js
const NovaFuncionalidadeService = require('../services/NovaFuncionalidadeService');

class NovaFuncionalidadeController {
  async executar(req, res) {
    try {
      const resultado = await NovaFuncionalidadeService.executarAcao(req.body);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
module.exports = new NovaFuncionalidadeController();
```

### 4. Adicionar Rota
```javascript
// routes/novaFuncionalidade.js
const express = require('express');
const router = express.Router();
const NovaFuncionalidadeController = require('../controllers/NovaFuncionalidadeController');

router.post('/executar', (req, res) => 
  NovaFuncionalidadeController.executar(req, res)
);

module.exports = router;
```

### 5. Registrar no Server
```javascript
// server.js
const novaFuncionalidadeRoutes = require('./routes/novaFuncionalidade');
app.use('/api/nova-funcionalidade', novaFuncionalidadeRoutes);
```

## 📚 Módulos Criados

### Controllers
- `AuthController` - Autenticação e cadastro
- `WasteController` - Gestão de resíduos
- `PaymentController` - Processamento de pagamentos
- `LoteController` - Gestão de lotes
- `DashboardController` - Dashboards por role
- `TotemController` - Simulação de totem
- `ValidadoraController` - Gestão de validadoras

### Services
- `AuthService` - Lógica de autenticação
- `WasteService` - Lógica de resíduos
- `PaymentService` - Lógica de pagamentos
- `LoteService` - Lógica de lotes
- `DashboardService` - Lógica de dashboards
- `TotemService` - Lógica de totem
- `ValidadoraService` - Lógica de validadoras

### Repositories
- `UserRepository` - CRUD de usuários
- `WasteRecordRepository` - CRUD de registros de lixo
- `TokenRepository` - CRUD de tokens
- `LoteRepository` - CRUD de lotes
- `ValidadoraRepository` - CRUD de validadoras

## 🚀 Executando o Projeto

```bash
cd backend
npm install
npm start
```

O servidor iniciará na porta 5000 (ou a definida em `PORT`).

## 🧪 Testando a API

Use ferramentas como Postman, Insomnia ou curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "admin@lixcarbon.com", "senha": "admin123"}'

# Registrar lixo
curl -X POST http://localhost:5000/api/waste/registrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"token": "123456"}'
```

## 📖 Recursos Adicionais

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Layer Architecture Pattern](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

