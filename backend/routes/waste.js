const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const WasteController = require('../controllers/WasteController');

// Listar registros de lixo do usuário
router.get('/meus-registros', authenticateToken, authorizeRole('USUARIO'), (req, res) => 
  WasteController.listarMeusRegistros(req, res)
);

// Registrar novo lixo com token
router.post('/registrar', authenticateToken, authorizeRole('USUARIO'), (req, res) => 
  WasteController.registrar(req, res)
);

// Estatísticas de lixo do usuário
router.get('/estatisticas', authenticateToken, authorizeRole('USUARIO'), (req, res) => 
  WasteController.obterEstatisticas(req, res)
);

// Listar todos os registros (para validador e admin)
router.get('/todos', authenticateToken, authorizeRole('VALIDADOR_CREDITO', 'ADMINISTRADOR'), (req, res) => 
  WasteController.listarTodos(req, res)
);

// Listar tokens disponíveis para criar lote (apenas VALIDADOS)
router.get('/disponiveis-lote', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  WasteController.listarDisponiveisParaLote(req, res)
);

module.exports = router;
