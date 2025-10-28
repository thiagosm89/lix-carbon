const AuthService = require('../services/AuthService');

/**
 * Controller de Autenticação
 * Camada de Presentation (HTTP)
 */
class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    const { identifier, senha } = req.body;

    try {
      const resultado = await AuthService.login(identifier, senha);
      res.json({
        message: 'Login realizado com sucesso',
        token: resultado.token,
        user: resultado.user
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(401).json({ error: error.message || 'Erro ao fazer login' });
    }
  }

  /**
   * POST /api/auth/cadastro
   */
  async cadastro(req, res) {
    const { nome, cnpj, email, senha, endereco, telefone } = req.body;

    try {
      const resultado = await AuthService.cadastro({
        nome,
        cnpj,
        email,
        senha,
        endereco,
        telefone
      });

      res.status(201).json({
        message: 'Cadastro realizado com sucesso',
        token: resultado.token,
        user: resultado.user
      });
    } catch (error) {
      console.error('Erro no cadastro:', error);
      const statusCode = error.message.includes('já cadastrado') ? 400 : 500;
      res.status(statusCode).json({ error: error.message || 'Erro ao fazer cadastro' });
    }
  }

  /**
   * GET /api/auth/me
   */
  async verificarToken(req, res) {
    try {
      const user = await AuthService.verificarToken(req.user.id);
      res.json({ user });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      const statusCode = error.message === 'Usuário não encontrado' ? 404 : 500;
      res.status(statusCode).json({ error: error.message || 'Erro ao buscar usuário' });
    }
  }
}

module.exports = new AuthController();

