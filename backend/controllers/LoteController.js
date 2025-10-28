const LoteService = require('../services/LoteService');

/**
 * Controller de Lotes
 * Camada de Presentation (HTTP)
 */
class LoteController {
  /**
   * POST /api/lote/criar
   */
  async criar(req, res) {
    const { pesoMaximo } = req.body;

    try {
      const lote = await LoteService.criar(pesoMaximo);
      res.status(201).json({
        message: 'Lote criado com sucesso',
        lote
      });
    } catch (error) {
      console.error('Erro ao criar lote:', error);
      res.status(500).json({ error: error.message || 'Erro ao criar lote' });
    }
  }

  /**
   * POST /api/lote/marcar-pago
   */
  async marcarPago(req, res) {
    const { loteId, valorPago } = req.body;

    try {
      const resultado = await LoteService.marcarComoPago(loteId, valorPago);
      res.json({
        message: 'Lote marcado como pago com sucesso',
        resultado
      });
    } catch (error) {
      console.error('Erro ao marcar lote como pago:', error);
      res.status(500).json({ error: error.message || 'Erro ao processar pagamento' });
    }
  }

  /**
   * GET /api/lote/listar
   */
  async listar(req, res) {
    try {
      const resultado = await LoteService.listar();
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar lotes:', error);
      res.status(500).json({ error: 'Erro ao listar lotes' });
    }
  }

  /**
   * GET /api/lote/:id
   */
  async buscarPorId(req, res) {
    const { id } = req.params;

    try {
      const resultado = await LoteService.buscarPorId(id);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar lote:', error);
      const statusCode = error.message === 'Lote não encontrado' ? 404 : 500;
      res.status(statusCode).json({ error: error.message || 'Erro ao buscar lote' });
    }
  }

  /**
   * GET /api/lote/stats/geral
   */
  async obterEstatisticas(req, res) {
    try {
      const resultado = await LoteService.obterEstatisticas();
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}

module.exports = new LoteController();

