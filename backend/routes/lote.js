const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const LoteController = require('../controllers/LoteController');

/**
 * Criar novo lote para envio à validadora
 * Apenas ADMINISTRADOR
 */
router.post('/criar', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  LoteController.criar(req, res)
);

/**
 * Marcar lote como pago pela validadora
 * Apenas ADMINISTRADOR
 */
router.post('/marcar-pago', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  LoteController.marcarPago(req, res)
);

/**
 * Listar todos os lotes
 * Apenas ADMINISTRADOR
 */
router.get('/listar', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  LoteController.listar(req, res)
);

/**
 * Buscar detalhes de um lote específico
 * Apenas ADMINISTRADOR
 */
router.get('/:id', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  LoteController.buscarPorId(req, res)
);

/**
 * Estatísticas de lotes
 * Apenas ADMINISTRADOR
 */
router.get('/stats/geral', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  LoteController.obterEstatisticas(req, res)
);

module.exports = router;
