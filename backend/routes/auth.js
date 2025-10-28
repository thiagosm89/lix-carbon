const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const AuthController = require('../controllers/AuthController');
const { SECRET_KEY, authenticateToken } = require('../middleware/auth');

// Login
router.post('/login', (req, res) => AuthController.login(req, res));

// Cadastro (apenas para empresas - perfil USUARIO)
router.post('/cadastro', (req, res) => AuthController.cadastro(req, res));

// Verificar token
router.get('/me', authenticateToken, (req, res) => AuthController.verificarToken(req, res));

module.exports = router;
