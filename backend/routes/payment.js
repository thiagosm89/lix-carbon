const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const PaymentController = require('../controllers/PaymentController');

// Acompanhar status de pagamentos (usuário)
router.get('/acompanhar', authenticateToken, authorizeRole('USUARIO'), (req, res) => 
  PaymentController.acompanhar(req, res)
);

// Listar tokens disponíveis para saque (usuário)
router.get('/disponiveis', authenticateToken, authorizeRole('USUARIO'), (req, res) => 
  PaymentController.listarDisponiveis(req, res)
);

// Listar tokens disponíveis para pagamento (administrador)
router.get('/disponiveis/todos', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  PaymentController.listarTodosDisponiveis(req, res)
);

// Processar pagamentos (administrador)
router.post('/processar', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  PaymentController.processar(req, res)
);

// Histórico de pagamentos do usuário
router.get('/historico', authenticateToken, authorizeRole('USUARIO'), (req, res) => 
  PaymentController.obterHistorico(req, res)
);

// Histórico de todos os pagamentos (administrador)
router.get('/historico/todos', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  PaymentController.obterHistoricoCompleto(req, res)
);

module.exports = router;
