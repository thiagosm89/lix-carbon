const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const WasteRecord = require('../models/WasteRecord');
const Token = require('../models/Token');

// Calcular crédito baseado no peso e categoria
const calcularCredito = (peso, categoria) => {
  // Reciclável: 10% do peso em créditos
  // Orgânico: 5% do peso em créditos
  const taxa = categoria === 'RECICLAVEL' ? 0.10 : 0.05;
  return peso * taxa;
};

// Listar registros de lixo do usuário
router.get('/meus-registros', authenticateToken, authorizeRole('USUARIO'), async (req, res) => {
  try {
    const userId = req.user.id;
    const registros = await WasteRecord.findByUserId(userId);
    
    res.json({
      total: registros.length,
      registros
    });
  } catch (error) {
    console.error('Erro ao listar registros:', error);
    res.status(500).json({ error: 'Erro ao listar registros' });
  }
});

// Registrar novo lixo com token
router.post('/registrar', authenticateToken, authorizeRole('USUARIO'), async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  try {
    if (!token || token.length !== 6) {
      return res.status(400).json({ error: 'Token deve ter 6 dígitos' });
    }

    // Verificar se token existe e está DISPONÍVEL (usado = 0)
    // Um token com o mesmo número pode existir várias vezes,
    // mas apenas um pode estar disponível por vez
    const tokenData = await Token.findAvailable(token);
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Token inválido ou já utilizado' });
    }

    // Calcular crédito
    const credito = calcularCredito(tokenData.peso, tokenData.categoria);

    // Criar novo registro
    const novoRegistro = await WasteRecord.create({
      userId,
      token,
      categoria: tokenData.categoria,
      peso: tokenData.peso,
      credito,
      status: 'VALIDADO',
      dataValidacao: new Date().toISOString()
    });

    // Marcar token como usado (usado = 1)
    // Agora um novo token com o mesmo número pode ser gerado pelo totem
    await Token.markAsUsed(token);

    res.status(201).json({
      message: 'Lixo registrado com sucesso',
      registro: novoRegistro
    });
  } catch (error) {
    console.error('Erro ao registrar lixo:', error);
    res.status(500).json({ error: 'Erro ao registrar lixo' });
  }
});

// Estatísticas de lixo do usuário
router.get('/estatisticas', authenticateToken, authorizeRole('USUARIO'), async (req, res) => {
  try {
    const userId = req.user.id;
    const registros = await WasteRecord.findByUserId(userId);

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
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Listar todos os registros (para validador e admin)
router.get('/todos', authenticateToken, authorizeRole('VALIDADOR_CREDITO', 'ADMINISTRADOR'), async (req, res) => {
  try {
    const registros = await WasteRecord.findAll();
    
    res.json({
      total: registros.length,
      registros
    });
  } catch (error) {
    console.error('Erro ao listar todos os registros:', error);
    res.status(500).json({ error: 'Erro ao listar registros' });
  }
});

// Listar tokens disponíveis para criar lote (apenas VALIDADOS)
router.get('/disponiveis-lote', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const User = require('../models/User');
    const registros = await WasteRecord.findByStatus('VALIDADO');
    
    // Adicionar informações do usuário
    const registrosComUsuario = [];
    for (const registro of registros) {
      const user = await User.findById(registro.userId);
      registrosComUsuario.push({
        ...registro,
        nomeEmpresa: user ? user.nome : 'Desconhecido',
        cnpj: user ? user.cnpj : ''
      });
    }
    
    // Ordenar por data de criação (mais antigos primeiro)
    registrosComUsuario.sort((a, b) => 
      new Date(a.dataCriacao) - new Date(b.dataCriacao)
    );
    
    res.json({
      total: registrosComUsuario.length,
      registros: registrosComUsuario
    });
  } catch (error) {
    console.error('Erro ao listar tokens disponíveis:', error);
    res.status(500).json({ error: 'Erro ao listar tokens disponíveis' });
  }
});

module.exports = router;
