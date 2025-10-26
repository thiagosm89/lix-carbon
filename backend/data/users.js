const bcrypt = require('bcryptjs');

// Mock de usuários - Em produção, isso seria um banco de dados
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
    criadoEm: '2024-01-15'
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
    criadoEm: '2024-01-10'
  },
  {
    id: '3',
    nome: 'Administrador LixCarbon',
    email: 'admin@lixcarbon.com',
    senha: bcrypt.hashSync('admin123', 10),
    role: 'ADMINISTRADOR',
    criadoEm: '2024-01-01'
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
    criadoEm: '2024-02-01'
  }
];

module.exports = users;

