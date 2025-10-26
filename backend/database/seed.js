const db = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {
  console.log('🌱 Iniciando seed do banco de dados...');

  try {
    // Verificar se já existem dados
    const userCount = await db.getAsync('SELECT COUNT(*) as count FROM users');
    if (userCount && userCount.count > 0) {
      console.log('⚠️  Banco já possui dados. Pulando seed...');
      return;
    }

    console.log('📝 Inserindo usuários...');
    
    // Inserir usuários
    const users = [
      {
        id: '1',
        nome: 'EcoEmpresas Ltda',
        cnpj: '12.345.678/0001-90',
        email: 'contato@ecoempresas.com',
        senha: bcrypt.hashSync('empresa123', 10),
        role: 'USUARIO',
        endereco: 'Rua Verde, 123 - São Paulo',
        telefone: '(11) 98765-4321',
        criadoEm: '2024-01-15T00:00:00Z'
      },
      {
        id: '2',
        nome: 'GreenTech Soluções',
        cnpj: '98.765.432/0001-10',
        email: 'contato@greentech.com',
        senha: bcrypt.hashSync('validador123', 10),
        role: 'VALIDADOR_CREDITO',
        endereco: 'Av. Sustentável, 456 - Rio de Janeiro',
        telefone: '(21) 91234-5678',
        criadoEm: '2024-01-10T00:00:00Z'
      },
      {
        id: '3',
        nome: 'Administrador LixCarbon',
        cnpj: null,
        email: 'admin@lixcarbon.com',
        senha: bcrypt.hashSync('admin123', 10),
        role: 'ADMINISTRADOR',
        endereco: null,
        telefone: null,
        criadoEm: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        nome: 'Natura Indústrias SA',
        cnpj: '11.222.333/0001-44',
        email: 'sustentabilidade@natura.com',
        senha: bcrypt.hashSync('natura123', 10),
        role: 'USUARIO',
        endereco: 'Av. Brasil, 789 - São Paulo',
        telefone: '(11) 3456-7890',
        criadoEm: '2024-02-01T00:00:00Z'
      }
    ];

    for (const user of users) {
      await db.runAsync(`
        INSERT INTO users (id, nome, cnpj, email, senha, role, endereco, telefone, criadoEm)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id,
        user.nome,
        user.cnpj,
        user.email,
        user.senha,
        user.role,
        user.endereco,
        user.telefone,
        user.criadoEm
      ]);
    }

    console.log(`✅ ${users.length} usuários inseridos`);
    console.log('ℹ️  Usuários iniciam sem registros de lixo (conforme requisito)');

    console.log('📝 Inserindo tokens disponíveis...');

    // Inserir tokens disponíveis
    const tokens = [
      { token: '789012', categoria: 'RECICLAVEL', peso: 180.0, usado: 0 },
      { token: '890123', categoria: 'ORGANICO', peso: 220.0, usado: 0 },
      { token: '901234', categoria: 'RECICLAVEL', peso: 275.5, usado: 0 }
    ];

    for (const token of tokens) {
      await db.runAsync(`
        INSERT INTO available_tokens (token, categoria, peso, usado)
        VALUES (?, ?, ?, ?)
      `, [token.token, token.categoria, token.peso, token.usado]);
    }

    console.log(`✅ ${tokens.length} tokens disponíveis inseridos`);
    console.log('🎉 Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
  }
};

// Executar seed se este arquivo for executado diretamente
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('✅ Seed finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = seedDatabase;
