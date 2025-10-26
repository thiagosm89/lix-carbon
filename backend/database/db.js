const { Pool } = require('pg');

// Conexão com PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL (Neon)');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no banco de dados:', err);
});

// Criar helpers compatíveis com o código SQLite anterior
const db = {
  // Helper para SELECT que retorna UMA linha
  getAsync: async function(sql, params = []) {
    try {
      // Converter ? para $1, $2, etc
      const pgSql = convertParams(sql);
      const result = await pool.query(pgSql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro em getAsync:', error);
      throw error;
    }
  },

  // Helper para SELECT que retorna MÚLTIPLAS linhas
  allAsync: async function(sql, params = []) {
    try {
      const pgSql = convertParams(sql);
      const result = await pool.query(pgSql, params);
      return result.rows || [];
    } catch (error) {
      console.error('Erro em allAsync:', error);
      throw error;
    }
  },

  // Helper para INSERT/UPDATE/DELETE
  runAsync: async function(sql, params = []) {
    try {
      const pgSql = convertParams(sql);
      const result = await pool.query(pgSql, params);
      return {
        lastID: result.rows[0]?.id || null,
        changes: result.rowCount || 0
      };
    } catch (error) {
      console.error('Erro em runAsync:', error);
      throw error;
    }
  },

  // Acesso direto ao pool para queries mais complexas
  query: (sql, params) => pool.query(sql, params),
  pool: pool
};

// Converter placeholders ? para $1, $2, etc (PostgreSQL style)
function convertParams(sql) {
  let count = 0;
  return sql.replace(/\?/g, () => {
    count++;
    return `$${count}`;
  });
}

// Inicializar schema do banco de dados
async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️  Inicializando schema do banco de dados PostgreSQL...');

    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18) UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK(role IN ('USUARIO', 'VALIDADOR_CREDITO', 'ADMINISTRADOR')),
        endereco TEXT,
        telefone VARCHAR(20),
        criadoEm TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Tabela de lotes (deve vir antes de waste_records por causa da FK)
    await client.query(`
      CREATE TABLE IF NOT EXISTS lotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pesoMaximo NUMERIC(10,2) NOT NULL,
        pesoUtilizado NUMERIC(10,2) NOT NULL,
        quantidadeTokens INTEGER NOT NULL,
        valorPago NUMERIC(10,2) DEFAULT 0,
        percentualEmpresa NUMERIC(5,2) DEFAULT 20,
        valorDistribuido NUMERIC(10,2) DEFAULT 0,
        status VARCHAR(50) NOT NULL CHECK(status IN ('PENDENTE_VALIDADORA', 'PAGO_VALIDADORA', 'PAGO_USUARIOS')),
        dataCriacao TIMESTAMP NOT NULL DEFAULT NOW(),
        dataPagamentoValidadora TIMESTAMP,
        observacoes TEXT
      )
    `);

    // Tabela de registros de lixo
    await client.query(`
      CREATE TABLE IF NOT EXISTS waste_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        userId UUID NOT NULL,
        token VARCHAR(6) NOT NULL UNIQUE,
        categoria VARCHAR(50) NOT NULL CHECK(categoria IN ('RECICLAVEL', 'ORGANICO')),
        peso NUMERIC(10,2) NOT NULL,
        credito NUMERIC(10,2) NOT NULL,
        loteId UUID,
        valorProporcional NUMERIC(10,2) DEFAULT 0,
        status VARCHAR(50) NOT NULL CHECK(status IN ('VALIDADO', 'ENVIADO_VALIDADORA', 'LIBERADO_PAGAMENTO', 'PENDENTE_PAGAMENTO', 'PAGO')),
        dataCriacao TIMESTAMP NOT NULL DEFAULT NOW(),
        dataValidacao TIMESTAMP,
        dataSolicitacaoPagamento TIMESTAMP,
        dataPagamento TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (loteId) REFERENCES lotes(id) ON DELETE SET NULL
      )
    `);

    // Tabela de empresas validadoras
    await client.query(`
      CREATE TABLE IF NOT EXISTS validadoras (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nomeEmpresa VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        telefone VARCHAR(20),
        endereco TEXT,
        responsavel VARCHAR(255),
        ativa BOOLEAN DEFAULT true,
        dataCadastro TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Tabela de tokens disponíveis
    await client.query(`
      CREATE TABLE IF NOT EXISTS available_tokens (
        id SERIAL PRIMARY KEY,
        token VARCHAR(6) NOT NULL,
        categoria VARCHAR(50) NOT NULL CHECK(categoria IN ('RECICLAVEL', 'ORGANICO')),
        peso NUMERIC(10,2) NOT NULL,
        usado SMALLINT NOT NULL DEFAULT 0,
        dataCriacao TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // Criar índices (apenas se não existirem)
    await client.query('CREATE INDEX IF NOT EXISTS idx_waste_userId ON waste_records(userId)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_waste_status ON waste_records(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_waste_token ON waste_records(token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_waste_loteId ON waste_records(loteId)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_cnpj ON users(cnpj)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tokens_number ON available_tokens(token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_tokens_usado ON available_tokens(usado)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_lotes_status ON lotes(status)');

    console.log('✅ Schema do banco de dados criado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Inicializar banco ao carregar o módulo
initDatabase().catch(err => {
  console.error('Falha ao inicializar banco:', err);
});

module.exports = db;
