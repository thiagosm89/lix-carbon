const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { wasteRecords } = require('../data/waste');

// Solicitar pagamento (usuario marca tokens para pagamento)
router.post('/solicitar', authenticateToken, authorizeRole('USUARIO'), (req, res) => {
  const { registroIds } = req.body;
  const userId = req.user.id;

  if (!registroIds || !Array.isArray(registroIds) || registroIds.length === 0) {
    return res.status(400).json({ error: 'IDs de registros são obrigatórios' });
  }

  // Verificar se todos os registros pertencem ao usuário e estão validados
  const registrosParaPagamento = [];
  let totalCredito = 0;

  for (const id of registroIds) {
    const registro = wasteRecords.find(r => r.id === id);
    
    if (!registro) {
      return res.status(404).json({ error: `Registro ${id} não encontrado` });
    }
    
    if (registro.userId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para este registro' });
    }
    
    if (registro.status !== 'VALIDADO') {
      return res.status(400).json({ error: `Registro ${id} não está validado` });
    }

    registrosParaPagamento.push(registro);
    totalCredito += registro.credito;
  }

  // Atualizar status para PENDENTE_PAGAMENTO
  registrosParaPagamento.forEach(r => {
    r.status = 'PENDENTE_PAGAMENTO';
    r.dataSolicitacaoPagamento = new Date().toISOString();
    console.log(`💰 Pagamento solicitado - Registro ${r.id.slice(0, 8)} mudou para PENDENTE_PAGAMENTO`);
  });

  console.log(`✅ Total de ${registrosParaPagamento.length} registros marcados como PENDENTE_PAGAMENTO`);

  res.json({
    message: 'Solicitação de pagamento enviada com sucesso',
    totalCredito,
    quantidadeRegistros: registrosParaPagamento.length,
    registros: registrosParaPagamento
  });
});

// Listar pagamentos pendentes (usuário)
router.get('/pendentes', authenticateToken, authorizeRole('USUARIO'), (req, res) => {
  const userId = req.user.id;
  const pendentes = wasteRecords.filter(r => 
    r.userId === userId && r.status === 'PENDENTE_PAGAMENTO'
  );

  const totalCredito = pendentes.reduce((sum, r) => sum + r.credito, 0);

  res.json({
    total: pendentes.length,
    totalCredito,
    registros: pendentes
  });
});

// Listar todos pagamentos pendentes (admin)
router.get('/pendentes/todos', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => {
  const pendentes = wasteRecords.filter(r => r.status === 'PENDENTE_PAGAMENTO');

  // Agrupar por usuário
  const porUsuario = {};
  pendentes.forEach(r => {
    if (!porUsuario[r.userId]) {
      porUsuario[r.userId] = {
        userId: r.userId,
        registros: [],
        totalCredito: 0
      };
    }
    porUsuario[r.userId].registros.push(r);
    porUsuario[r.userId].totalCredito += r.credito;
  });

  res.json({
    total: pendentes.length,
    porUsuario: Object.values(porUsuario)
  });
});

// Processar pagamento (admin)
router.post('/processar', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => {
  const { registroIds } = req.body;

  if (!registroIds || !Array.isArray(registroIds)) {
    return res.status(400).json({ error: 'IDs de registros são obrigatórios' });
  }

  const registrosPagos = [];
  let totalPago = 0;

  registroIds.forEach(id => {
    const registro = wasteRecords.find(r => r.id === id);
    if (registro && registro.status === 'PENDENTE_PAGAMENTO') {
      registro.status = 'PAGO';
      registro.dataPagamento = new Date().toISOString();
      registrosPagos.push(registro);
      totalPago += registro.credito;
    }
  });

  res.json({
    message: 'Pagamentos processados com sucesso',
    totalPago,
    quantidadeRegistros: registrosPagos.length,
    registros: registrosPagos
  });
});

// Histórico de pagamentos
router.get('/historico', authenticateToken, authorizeRole('USUARIO'), (req, res) => {
  const userId = req.user.id;
  const pagos = wasteRecords.filter(r => 
    r.userId === userId && r.status === 'PAGO'
  );

  const totalPago = pagos.reduce((sum, r) => sum + r.credito, 0);

  res.json({
    total: pagos.length,
    totalPago,
    registros: pagos.sort((a, b) => 
      new Date(b.dataPagamento) - new Date(a.dataPagamento)
    )
  });
});

module.exports = router;

