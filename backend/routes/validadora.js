const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const ValidadoraController = require('../controllers/ValidadoraController');

// Todas as rotas são apenas para ADMINISTRADOR

// Listar todas as validadoras
router.get('/', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  ValidadoraController.listar(req, res)
);

// Listar validadoras ativas
router.get('/ativas', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  ValidadoraController.listarAtivas(req, res)
);

// Buscar validadora por ID
router.get('/:id', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  ValidadoraController.buscarPorId(req, res)
);

// Criar nova validadora
router.post('/', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  ValidadoraController.criar(req, res)
);

// Atualizar validadora
router.put('/:id', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  ValidadoraController.atualizar(req, res)
);

// Ativar/Desativar validadora
router.patch('/:id/toggle', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  ValidadoraController.toggleAtiva(req, res)
);

// Deletar validadora
router.delete('/:id', authenticateToken, authorizeRole('ADMINISTRADOR'), (req, res) => 
  ValidadoraController.deletar(req, res)
);

module.exports = router;
