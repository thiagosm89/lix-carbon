console.log('🧪 Testando banco de dados...');

try {
  const db = require('./database/db');
  console.log('✅ Banco carregado com sucesso');
  
  setTimeout(() => {
    console.log('🔍 Testando consulta...');
    db.getAsync('SELECT COUNT(*) as count FROM users')
      .then(result => {
        console.log('✅ Consulta executada:', result);
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Erro na consulta:', err);
        process.exit(1);
      });
  }, 2000);
  
} catch (error) {
  console.error('❌ Erro ao carregar banco:', error);
  process.exit(1);
}

