const PaymentService = require('../services/PaymentService');

/**
 * Controller de Pagamentos
 * Camada de Presentation (HTTP)
 */
class PaymentController {
  /**
   * GET /api/payment/acompanhar
   */
  async acompanhar(req, res) {
    const userId = req.user.id;

    try {
      const resultado = await PaymentService.acompanhar(userId);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao acompanhar pagamentos:', error);
      res.status(500).json({ error: 'Erro ao acompanhar pagamentos' });
    }
  }

  /**
   * GET /api/payment/disponiveis
   */
  async listarDisponiveis(req, res) {
    try {
      const userId = req.user.id;
      const resultado = await PaymentService.listarDisponiveis(userId);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar tokens disponíveis:', error);
      res.status(500).json({ error: 'Erro ao listar tokens disponíveis' });
    }
  }

  /**
   * GET /api/payment/disponiveis/todos
   */
  async listarTodosDisponiveis(req, res) {
    try {
      const resultado = await PaymentService.listarTodosDisponiveis();
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar tokens disponíveis:', error);
      res.status(500).json({ error: 'Erro ao listar tokens disponíveis' });
    }
  }

  /**
   * POST /api/payment/processar
   */
  async processar(req, res) {
    const { registroIds } = req.body;

    try {
      const resultado = await PaymentService.processar(registroIds);
      res.json({
        message: 'Pagamentos processados com sucesso',
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao processar pagamentos:', error);
      const statusCode = error.message.includes('não encontrado') ? 404 :
                          error.message.includes('não está disponível') || error.message.includes('selecionado') ? 400 : 500;
      res.status(statusCode).json({ error: error.message || 'Erro ao processar pagamentos' });
    }
  }

  /**
   * GET /api/payment/historico
   */
  async obterHistorico(req, res) {
    try {
      const userId = req.user.id;
      const resultado = await PaymentService.obterHistorico(userId);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar histórico:', error);
      res.status(500).json({ error: 'Erro ao listar histórico' });
    }
  }

  /**
   * GET /api/payment/historico/todos
   */
  async obterHistoricoCompleto(req, res) {
    try {
      const resultado = await PaymentService.obterHistoricoCompleto();
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao listar histórico completo:', error);
      res.status(500).json({ error: 'Erro ao listar histórico' });
    }
  }
}

module.exports = new PaymentController();

