const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { wasteRecords, availableTokens } = require('../data/waste');
const { v4: uuidv4 } = require('uuid');

// Calcular crédito baseado no peso e categoria
const calcularCredito = (peso, categoria) => {
  // Reciclável: 10% do peso em créditos
  // Orgânico: 5% do peso em créditos
  const taxa = categoria === 'RECICLAVEL' ? 0.10 : 0.05;
  return peso * taxa;
};

// Listar registros de lixo do usuário
router.get('/meus-registros', authenticateToken, authorizeRole('USUARIO'), (req, res) => {
  const userId = req.user.id;
  const registros = wasteRecords.filter(r => r.userId === userId);
  
  res.json({
    total: registros.length,
    registros: registros.sort((a, b) => 
      new Date(b.dataCriacao) - new Date(a.dataCriacao)
    )
  });
});

// Registrar novo lixo com token
router.post('/registrar', authenticateToken, authorizeRole('USUARIO'), (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  if (!token || token.length !== 6) {
    return res.status(400).json({ error: 'Token deve ter 6 dígitos' });
  }

  // Verificar se token existe e não foi usado
  const tokenData = availableTokens.find(t => t.token === token && !t.usado);
  
  if (!tokenData) {
    return res.status(404).json({ error: 'Token inválido ou já utilizado' });
  }

  // Verificar se token já foi registrado
  const tokenJaRegistrado = wasteRecords.find(r => r.token === token);
  if (tokenJaRegistrado) {
    return res.status(400).json({ error: 'Token já foi registrado' });
  }

  // Calcular crédito
  const credito = calcularCredito(tokenData.peso, tokenData.categoria);

  // Criar novo registro
  const novoRegistro = {
    id: uuidv4(),
    userId,
    token,
    categoria: tokenData.categoria,
    peso: tokenData.peso,
    credito,
    status: 'VALIDADO',
    dataCriacao: new Date().toISOString(),
    dataValidacao: new Date().toISOString()
  };

  wasteRecords.push(novoRegistro);
  tokenData.usado = true;

  res.status(201).json({
    message: 'Lixo registrado com sucesso',
    registro: novoRegistro
  });
});

// Estatísticas de lixo do usuário
router.get('/estatisticas', authenticateToken, authorizeRole('USUARIO'), (req, res) => {
  const userId = req.user.id;
  const registros = wasteRecords.filter(r => r.userId === userId);

  const stats = {
    totalPeso: 0,
    totalCredito: 0,
    porCategoria: {
      RECICLAVEL: { peso: 0, credito: 0, quantidade: 0 },
      ORGANICO: { peso: 0, credito: 0, quantidade: 0 }
    },
    porStatus: {
      VALIDADO: 0,
      PENDENTE_PAGAMENTO: 0,
      PAGO: 0
    }
  };

  registros.forEach(r => {
    stats.totalPeso += r.peso;
    stats.totalCredito += r.credito;
    stats.porCategoria[r.categoria].peso += r.peso;
    stats.porCategoria[r.categoria].credito += r.credito;
    stats.porCategoria[r.categoria].quantidade += 1;
    stats.porStatus[r.status] = (stats.porStatus[r.status] || 0) + 1;
  });

  res.json(stats);
});

// Listar todos os registros (para validador e admin)
router.get('/todos', authenticateToken, authorizeRole('VALIDADOR_CREDITO', 'ADMINISTRADOR'), (req, res) => {
  res.json({
    total: wasteRecords.length,
    registros: wasteRecords.sort((a, b) => 
      new Date(b.dataCriacao) - new Date(a.dataCriacao)
    )
  });
});

module.exports = router;

