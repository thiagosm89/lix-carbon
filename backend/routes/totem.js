const express = require('express');
const router = express.Router();
const Token = require('../models/Token');

/**
 * POST /api/totem/gerar-token
 * Endpoint público para simular geração de token pelo totem
 * Não requer autenticação
 */
router.post('/gerar-token', async (req, res) => {
  try {
    // Gerar token de 6 dígitos aleatórios
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Gerar peso aleatório entre 5kg e 500kg
    const peso = parseFloat((Math.random() * (500 - 5) + 5).toFixed(2));
    
    // Categoria aleatória
    const categorias = ['RECICLAVEL', 'ORGANICO'];
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    
    // Criar token no banco de dados
    const novoToken = await Token.create({
      token,
      categoria,
      peso,
      usado: false
    });

    console.log(`🎫 Token gerado pelo totem: ${token} | ${categoria} | ${peso}kg`);

    // Retornar dados do token
    res.status(201).json({
      success: true,
      message: 'Token gerado com sucesso!',
      token: {
        numero: novoToken.token,
        categoria: novoToken.categoria,
        peso: novoToken.peso,
        dataCriacao: novoToken.dataCriacao,
        usado: novoToken.usado
      }
    });

  } catch (error) {
    console.error('Erro ao gerar token no totem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao gerar token. Tente novamente.'
    });
  }
});

/**
 * GET /api/totem/status
 * Endpoint público para verificar status do totem
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    message: 'Totem LixCarbon operacional',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/totem/ultimos-tokens
 * Endpoint público para ver últimos tokens gerados (para debug/teste)
 */
router.get('/ultimos-tokens', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tokens = await Token.findRecent(limit);

    res.json({
      success: true,
      total: tokens.length,
      tokens: tokens.map(t => ({
        numero: t.token,
        categoria: t.categoria,
        peso: t.peso,
        usado: t.usado,
        dataCriacao: t.dataCriacao
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar últimos tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar tokens'
    });
  }
});

module.exports = router;

