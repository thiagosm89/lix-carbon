const express = require('express');
const router = express.Router();
const Lote = require('../models/Lote');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * Criar novo lote para envio à validadora
 * Apenas ADMINISTRADOR
 */
router.post('/criar', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  const { pesoMaximo } = req.body;

  try {
    if (!pesoMaximo || pesoMaximo <= 0) {
      return res.status(400).json({ error: 'Peso máximo deve ser maior que zero' });
    }

    const lote = await Lote.create(pesoMaximo);

    res.status(201).json({
      message: 'Lote criado com sucesso',
      lote
    });
  } catch (error) {
    console.error('Erro ao criar lote:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar lote' });
  }
});

/**
 * Marcar lote como pago pela validadora
 * Apenas ADMINISTRADOR
 */
router.post('/marcar-pago', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  const { loteId, valorPago } = req.body;

  try {
    if (!loteId) {
      return res.status(400).json({ error: 'ID do lote é obrigatório' });
    }

    if (!valorPago || valorPago <= 0) {
      return res.status(400).json({ error: 'Valor pago deve ser maior que zero' });
    }

    const resultado = await Lote.marcarComoPago(loteId, valorPago);

    res.json({
      message: 'Lote marcado como pago com sucesso',
      resultado
    });
  } catch (error) {
    console.error('Erro ao marcar lote como pago:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar pagamento' });
  }
});

/**
 * Listar todos os lotes
 * Apenas ADMINISTRADOR
 */
router.get('/listar', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const lotes = await Lote.findAll();
    res.json({ lotes });
  } catch (error) {
    console.error('Erro ao listar lotes:', error);
    res.status(500).json({ error: 'Erro ao listar lotes' });
  }
});

/**
 * Buscar detalhes de um lote específico
 * Apenas ADMINISTRADOR
 */
router.get('/:id', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  const { id } = req.params;

  try {
    const lote = await Lote.findById(id);
    
    if (!lote) {
      return res.status(404).json({ error: 'Lote não encontrado' });
    }

    const tokens = await Lote.findTokensByLoteId(id);

    res.json({
      lote,
      tokens
    });
  } catch (error) {
    console.error('Erro ao buscar lote:', error);
    res.status(500).json({ error: 'Erro ao buscar lote' });
  }
});

/**
 * Estatísticas de lotes
 * Apenas ADMINISTRADOR
 */
router.get('/stats/geral', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const stats = await Lote.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;

