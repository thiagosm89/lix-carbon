// Vercel Serverless Function Entry Point
const app = require('../server');
const db = require('../database/db');
const seedDatabase = require('../database/seed');

let isInitialized = false;

// Middleware para inicializar banco na primeira requisição
async function initializeOnce(req, res, next) {
  if (!isInitialized) {
    try {
      console.log('🔧 Primeira requisição - Inicializando banco...');
      await db.initDatabase();
      await seedDatabase();
      isInitialized = true;
      console.log('✅ Banco inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar:', error);
      // Continuar mesmo com erro (tabelas podem já existir)
      isInitialized = true;
    }
  }
  next();
}

// Aplicar middleware antes de qualquer rota
app.use(initializeOnce);

// Exportar para o Vercel
module.exports = app;

