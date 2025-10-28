const TotemService = require('../services/TotemService');

/**
 * Controller de Totem
 * Camada de Presentation (HTTP)
 */
class TotemController {
  /**
   * POST /api/totem/gerar-token
   */
  async gerarToken(req, res) {
    try {
      const token = await TotemService.gerarToken();
      res.status(201).json({
        success: true,
        message: 'Token gerado com sucesso!',
        token
      });
    } catch (error) {
      console.error('Erro ao gerar token no totem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar token. Tente novamente.'
      });
    }
  }

  /**
   * GET /api/totem/status
   */
  async verificarStatus(req, res) {
    try {
      const status = await TotemService.verificarStatus();
      res.json({
        success: true,
        ...status
      });
    } catch (error) {
      console.error('Erro ao verificar status do totem:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar status'
      });
    }
  }

  /**
   * GET /api/totem/ultimos-tokens
   */
  async buscarUltimosTokens(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const resultado = await TotemService.buscarUltimosTokens(limit);
      res.json({
        success: true,
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao buscar últimos tokens:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar tokens'
      });
    }
  }
}

module.exports = new TotemController();

