# 💾 Banco de Dados SQLite - LixCarbon

## 📋 Visão Geral

O LixCarbon utiliza **SQLite** como banco de dados para armazenar todas as informações da plataforma de forma persistente.

### Por que SQLite?

- ✅ **Sem instalação extra**: Funciona como um arquivo local
- ✅ **Leve e rápido**: Perfeito para desenvolvimento e aplicações médias
- ✅ **ACID compliant**: Transações seguras e confiáveis
- ✅ **Zero configuração**: Não precisa de servidor separado
- ✅ **Portável**: Todo o banco em um único arquivo `.db`

## 🗂️ Estrutura do Banco

### Tabelas

#### 1. **users** - Usuários do sistema
```sql
- id (TEXT, PRIMARY KEY)
- nome (TEXT)
- cnpj (TEXT, UNIQUE)
- email (TEXT, UNIQUE)
- senha (TEXT, hash bcrypt)
- role (TEXT: 'USUARIO', 'VALIDADOR_CREDITO', 'ADMINISTRADOR')
- endereco (TEXT)
- telefone (TEXT)
- criadoEm (TEXT, ISO 8601)
```

#### 2. **waste_records** - Registros de lixo coletado
```sql
- id (TEXT, PRIMARY KEY)
- userId (TEXT, FOREIGN KEY)
- token (TEXT, UNIQUE)
- categoria (TEXT: 'RECICLAVEL', 'ORGANICO')
- peso (REAL, em kg)
- credito (REAL, em CO₂)
- status (TEXT: 'VALIDADO', 'PENDENTE_PAGAMENTO', 'PAGO')
- dataCriacao (TEXT, ISO 8601)
- dataValidacao (TEXT, ISO 8601)
- dataSolicitacaoPagamento (TEXT, ISO 8601)
- dataPagamento (TEXT, ISO 8601)
```

#### 3. **available_tokens** - Tokens disponíveis gerados pelo totem
```sql
- token (TEXT, PRIMARY KEY)
- categoria (TEXT: 'RECICLAVEL', 'ORGANICO')
- peso (REAL, em kg)
- usado (INTEGER: 0 ou 1)
- dataCriacao (TEXT, ISO 8601)
```

## 🚀 Como Usar

### Primeira Execução

Ao iniciar o servidor pela primeira vez:

1. O banco de dados `lixcarbon.db` será criado automaticamente
2. As tabelas serão criadas com o schema definido
3. Os dados iniciais (seed) serão inseridos automaticamente

### Localização do Banco

```
backend/database/lixcarbon.db
```

### Executar Seed Manualmente

Se precisar recriar os dados iniciais:

```bash
cd backend
node database/seed.js
```

**⚠️ ATENÇÃO**: Isso só funciona se o banco estiver vazio. Para resetar completamente:

```bash
cd backend/database
rm lixcarbon.db
cd ..
npm start
```

## 📊 Dados Iniciais (Seed)

O seed cria automaticamente:

### Usuários

1. **Empresa EcoEmpresas** (USUARIO)
   - CNPJ: `12.345.678/0001-90`
   - Email: `contato@ecoempresas.com`
   - Senha: `empresa123`

2. **GreenTech** (VALIDADOR_CREDITO)
   - CNPJ: `98.765.432/0001-10`
   - Email: `contato@greentech.com`
   - Senha: `validador123`

3. **Administrador** (ADMINISTRADOR)
   - Email: `admin@lixcarbon.com`
   - Senha: `admin123`

4. **Natura** (USUARIO)
   - CNPJ: `11.222.333/0001-44`
   - Email: `sustentabilidade@natura.com`
   - Senha: `natura123`

### Registros de Lixo

- 5 registros de exemplo com diferentes status
- 2 registros em PENDENTE_PAGAMENTO para testar o sistema de pagamentos

### Tokens Disponíveis

- 3 tokens não utilizados para teste de registro

## 🔧 Models (Camada de Acesso)

### User.js
- `findByEmail(email)` - Busca por email
- `findByCnpj(cnpj)` - Busca por CNPJ
- `findById(id)` - Busca por ID
- `create(userData)` - Criar usuário
- `update(id, userData)` - Atualizar usuário
- `verifyPassword(plain, hash)` - Verificar senha

### WasteRecord.js
- `findById(id)` - Buscar por ID
- `findByUserId(userId)` - Buscar por usuário
- `findByStatus(status)` - Buscar por status
- `create(recordData)` - Criar registro
- `updateStatus(id, status)` - Atualizar status
- `updateMany(ids, status)` - Atualizar múltiplos

### Token.js
- `findByToken(token)` - Buscar token
- `findAvailable(token)` - Buscar token disponível
- `create(tokenData)` - Criar token
- `markAsUsed(token)` - Marcar como usado

## 📈 Performance

### Índices Criados

Para garantir consultas rápidas:

```sql
- idx_waste_userId (waste_records.userId)
- idx_waste_status (waste_records.status)
- idx_waste_token (waste_records.token)
- idx_users_email (users.email)
- idx_users_cnpj (users.cnpj)
```

## 🔒 Segurança

- Senhas são armazenadas com **bcrypt** (10 rounds)
- Foreign keys habilitadas para integridade referencial
- Validação de tipos com CHECK constraints
- Campos UNIQUE para evitar duplicatas

## 🔄 Migração Futura

Se precisar migrar para PostgreSQL no futuro:

1. Use ferramentas como `pgloader` para migração automática
2. Ou exporte os dados e importe manualmente
3. Os models já estão preparados para suportar diferentes bancos

## 🛠️ Ferramentas Úteis

### Ver o Banco no VSCode

Instale a extensão: **SQLite Viewer**

### Linha de Comando

```bash
# Abrir banco no terminal
sqlite3 database/lixcarbon.db

# Ver tabelas
.tables

# Ver schema de uma tabela
.schema users

# Consulta
SELECT * FROM users;

# Sair
.quit
```

## 📝 Backup

Para fazer backup do banco:

```bash
# Copiar o arquivo
cp backend/database/lixcarbon.db backend/database/backup/lixcarbon_backup_$(date +%Y%m%d).db
```

## ❓ Troubleshooting

### Erro: "Database is locked"

O SQLite permite apenas uma escrita por vez. Se você estiver executando múltiplas instâncias do servidor, isso pode causar problemas.

**Solução**: Garanta que apenas uma instância do servidor está rodando.

### Resetar banco completamente

```bash
cd backend/database
rm lixcarbon.db
cd ..
npm start
```

