const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const DB_PATH = path.join(__dirname, 'lixcarbon.db');

// Criar conexão com o banco
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados SQLite');
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON', (err) => {
  if (err) console.error('Erro ao habilitar foreign keys:', err);
});

// Criar helpers para usar promises
db.getAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

db.runAsync = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Criar tabelas de forma síncrona
console.log('🗄️  Inicializando banco de dados SQLite...');

db.serialize(() => {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      cnpj TEXT UNIQUE,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('USUARIO', 'VALIDADOR_CREDITO', 'ADMINISTRADOR')),
      endereco TEXT,
      telefone TEXT,
      criadoEm TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela users:', err);
  });

  // Tabela de registros de lixo
  db.run(`
    CREATE TABLE IF NOT EXISTS waste_records (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      categoria TEXT NOT NULL CHECK(categoria IN ('RECICLAVEL', 'ORGANICO')),
      peso REAL NOT NULL,
      credito REAL NOT NULL,
      loteId TEXT,
      valorProporcional REAL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('VALIDADO', 'ENVIADO_VALIDADORA', 'LIBERADO_PAGAMENTO', 'PENDENTE_PAGAMENTO', 'PAGO')),
      dataCriacao TEXT NOT NULL DEFAULT (datetime('now')),
      dataValidacao TEXT,
      dataSolicitacaoPagamento TEXT,
      dataPagamento TEXT,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (loteId) REFERENCES lotes(id)
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela waste_records:', err);
  });

  // Tabela de tokens disponíveis
  // Um token pode ser gerado várias vezes, mas apenas um disponível por vez
  db.run(`
    CREATE TABLE IF NOT EXISTS available_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      categoria TEXT NOT NULL CHECK(categoria IN ('RECICLAVEL', 'ORGANICO')),
      peso REAL NOT NULL,
      usado INTEGER NOT NULL DEFAULT 0,
      dataCriacao TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela available_tokens:', err);
  });

  // Tabela de lotes enviados para validadora
  db.run(`
    CREATE TABLE IF NOT EXISTS lotes (
      id TEXT PRIMARY KEY,
      pesoMaximo REAL NOT NULL,
      pesoUtilizado REAL NOT NULL,
      quantidadeTokens INTEGER NOT NULL,
      valorPago REAL DEFAULT 0,
      percentualEmpresa REAL DEFAULT 20,
      valorDistribuido REAL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('PENDENTE_VALIDADORA', 'PAGO_VALIDADORA', 'PAGO_USUARIOS')),
      dataCriacao TEXT NOT NULL DEFAULT (datetime('now')),
      dataPagamentoValidadora TEXT,
      observacoes TEXT
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela lotes:', err);
  });

  // Criar índices
  db.run('CREATE INDEX IF NOT EXISTS idx_waste_userId ON waste_records(userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_waste_status ON waste_records(status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_waste_token ON waste_records(token)');
  db.run('CREATE INDEX IF NOT EXISTS idx_waste_loteId ON waste_records(loteId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
  db.run('CREATE INDEX IF NOT EXISTS idx_users_cnpj ON users(cnpj)');
  db.run('CREATE INDEX IF NOT EXISTS idx_tokens_number ON available_tokens(token)');
  db.run('CREATE INDEX IF NOT EXISTS idx_tokens_usado ON available_tokens(usado)');
  db.run('CREATE INDEX IF NOT EXISTS idx_lotes_status ON lotes(status)');
  
  console.log('✅ Banco de dados inicializado com sucesso!');
});

module.exports = db;
