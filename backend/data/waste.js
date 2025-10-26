const { v4: uuidv4 } = require('uuid');

// Mock de registros de lixo
const wasteRecords = [
  {
    id: uuidv4(),
    userId: '1',
    token: '123456',
    categoria: 'RECICLAVEL',
    peso: 150.5,
    credito: 15.05,
    status: 'VALIDADO',
    dataCriacao: '2024-10-01T10:30:00Z',
    dataValidacao: '2024-10-01T11:00:00Z'
  },
  {
    id: uuidv4(),
    userId: '1',
    token: '234567',
    categoria: 'ORGANICO',
    peso: 200.0,
    credito: 10.0,
    status: 'VALIDADO',
    dataCriacao: '2024-10-05T14:20:00Z',
    dataValidacao: '2024-10-05T15:00:00Z'
  },
  {
    id: uuidv4(),
    userId: '1',
    token: '345678',
    categoria: 'RECICLAVEL',
    peso: 300.0,
    credito: 30.0,
    status: 'PENDENTE_PAGAMENTO',
    dataCriacao: '2024-10-15T09:15:00Z',
    dataValidacao: '2024-10-15T10:00:00Z'
  },
  {
    id: uuidv4(),
    userId: '4',
    token: '456789',
    categoria: 'RECICLAVEL',
    peso: 500.0,
    credito: 50.0,
    status: 'VALIDADO',
    dataCriacao: '2024-10-10T16:45:00Z',
    dataValidacao: '2024-10-10T17:00:00Z'
  },
  {
    id: uuidv4(),
    userId: '4',
    token: '567890',
    categoria: 'ORGANICO',
    peso: 350.0,
    credito: 17.5,
    status: 'PENDENTE_PAGAMENTO',
    dataCriacao: '2024-10-18T11:30:00Z',
    dataValidacao: '2024-10-18T12:00:00Z'
  }
];

// Tokens disponíveis gerados pelo totem (simulação)
const availableTokens = [
  { token: '789012', categoria: 'RECICLAVEL', peso: 180.0, usado: false },
  { token: '890123', categoria: 'ORGANICO', peso: 220.0, usado: false },
  { token: '901234', categoria: 'RECICLAVEL', peso: 275.5, usado: false }
];

module.exports = { wasteRecords, availableTokens };

