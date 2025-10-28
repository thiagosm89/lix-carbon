const WasteService = require('../services/WasteService');

/**
 * Controller de Resíduos
 * Camada de Presentation (HTTP)
 */
class WasteController {
  /**
   * GET /api/waste/meus-registros
   */
  async listarMeusRegistros(req, res) {
    try {
      const userId = req.user.id;
      const resultado = await WasteService.listarMeusRegistros(userId);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar registros:', error);
      res.status(500).json({ error: 'Erro ao listar registros' });
    }
  }

  /**
   * POST /api/waste/registrar
   */
  async registrar(req, res) {
    const { token } = req.body;
    const userId = req.user.id;

    try {
      const novoRegistro = await WasteService.registrar(userId, token);
      res.status(201).json({
        message: 'Lixo registrado com sucesso',
        registro: novoRegistro
      });
    } catch (error) {
      console.error('Erro ao registrar lixo:', error);
      const statusCode = error.message.includes('inválido') || error.message.includes('6 dígitos') ? 400 : 
                          error.message.includes('já utilizado') ? 404 : 500;
      res.status(statusCode).json({ error: error.message || 'Erro ao registrar lixo' });
    }
  }

  /**
   * GET /api/waste/estatisticas
   */
  async obterEstatisticas(req, res) {
    try {
      const userId = req.user.id;
      const stats = await WasteService.obterEstatisticas(userId);
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  /**
   * GET /api/waste/todos
   */
  async listarTodos(req, res) {
    try {
      const resultado = await WasteService.listarTodos();
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar todos os registros:', error);
      res.status(500).json({ error: 'Erro ao listar registros' });
    }
  }

  /**
   * GET /api/waste/disponiveis-lote
   */
  async listarDisponiveisParaLote(req, res) {
    try {
      const resultado = await WasteService.listarDisponiveisParaLote();
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar tokens disponíveis:', error);
      res.status(500).json({ error: 'Erro ao listar tokens disponíveis' });
    }
  }
}

module.exports = new WasteController();

