const express = require('express');
const router = express.Router();
const TotemController = require('../controllers/TotemController');

/**
 * POST /api/totem/gerar-token
 * Endpoint público para simular geração de token pelo totem
 * Não requer autenticação
 */
router.post('/gerar-token', (req, res) => TotemController.gerarToken(req, res));

/**
 * GET /api/totem/status
 * Endpoint público para verificar status do totem
 */
router.get('/status', (req, res) => TotemController.verificarStatus(req, res));

/**
 * GET /api/totem/ultimos-tokens
 * Endpoint público para ver últimos tokens gerados (para debug/teste)
 */
router.get('/ultimos-tokens', (req, res) => TotemController.buscarUltimosTokens(req, res));

module.exports = router;
