const ValidadoraService = require('../services/ValidadoraService');

/**
 * Controller de Validadoras
 * Camada de Presentation (HTTP)
 */
class ValidadoraController {
  /**
   * GET /api/validadora/
   */
  async listar(req, res) {
    try {
      const resultado = await ValidadoraService.listar();
      res.json({
        success: true,
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao listar validadoras:', error);
      res.status(500).json({ success: false, error: 'Erro ao listar validadoras' });
    }
  }

  /**
   * GET /api/validadora/ativas
   */
  async listarAtivas(req, res) {
    try {
      const resultado = await ValidadoraService.listarAtivas();
      res.json({
        success: true,
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao listar validadoras ativas:', error);
      res.status(500).json({ success: false, error: 'Erro ao listar validadoras ativas' });
    }
  }

  /**
   * GET /api/validadora/:id
   */
  async buscarPorId(req, res) {
    try {
      const resultado = await ValidadoraService.buscarPorId(req.params.id);
      res.json({
        success: true,
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao buscar validadora:', error);
      const statusCode = error.message === 'Validadora não encontrada' ? 404 : 500;
      res.status(statusCode).json({ success: false, error: error.message || 'Erro ao buscar validadora' });
    }
  }

  /**
   * POST /api/validadora/
   */
  async criar(req, res) {
    try {
      const { nomeEmpresa, cnpj, email, telefone, endereco, responsavel } = req.body;
      const resultado = await ValidadoraService.criar({
        nomeEmpresa,
        cnpj,
        email,
        telefone,
        endereco,
        responsavel
      });

      res.status(201).json({
        success: true,
        message: 'Validadora cadastrada com sucesso',
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao criar validadora:', error);
      const statusCode = error.message.includes('obrigatório') || error.message.includes('já cadastrado') ? 400 : 500;
      res.status(statusCode).json({ success: false, error: error.message || 'Erro ao cadastrar validadora' });
    }
  }

  /**
   * PUT /api/validadora/:id
   */
  async atualizar(req, res) {
    try {
      const { nomeEmpresa, cnpj, email, telefone, endereco, responsavel, ativa } = req.body;
      const resultado = await ValidadoraService.atualizar(req.params.id, {
        nomeEmpresa,
        cnpj,
        email,
        telefone,
        endereco,
        responsavel,
        ativa
      });

      res.json({
        success: true,
        message: 'Validadora atualizada com sucesso',
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao atualizar validadora:', error);
      const statusCode = error.message === 'Validadora não encontrada' ? 404 :
                          error.message.includes('obrigatório') || error.message.includes('já cadastrado') ? 400 : 500;
      res.status(statusCode).json({ success: false, error: error.message || 'Erro ao atualizar validadora' });
    }
  }

  /**
   * PATCH /api/validadora/:id/toggle
   */
  async toggleAtiva(req, res) {
    try {
      const resultado = await ValidadoraService.toggleAtiva(req.params.id);
      res.json({
        success: true,
        message: `Validadora ${resultado.validadora.ativa ? 'ativada' : 'desativada'} com sucesso`,
        ...resultado
      });
    } catch (error) {
      console.error('Erro ao alternar status da validadora:', error);
      const statusCode = error.message === 'Validadora não encontrada' ? 404 : 500;
      res.status(statusCode).json({ success: false, error: error.message || 'Erro ao alternar status da validadora' });
    }
  }

  /**
   * DELETE /api/validadora/:id
   */
  async deletar(req, res) {
    try {
      await ValidadoraService.deletar(req.params.id);
      res.json({
        success: true,
        message: 'Validadora deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar validadora:', error);
      const statusCode = error.message === 'Validadora não encontrada' ? 404 : 500;
      res.status(statusCode).json({ success: false, error: error.message || 'Erro ao deletar validadora' });
    }
  }
}

module.exports = new ValidadoraController();

