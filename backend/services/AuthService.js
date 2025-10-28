const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');
const { SECRET_KEY } = require('../middleware/auth');

/**
 * Service de Autenticação
 * Camada de Business Logic
 */
class AuthService {
  /**
   * Fazer login
   */
  async login(identifier, senha) {
    // Buscar usuário por email ou CNPJ
    const user = await UserRepository.findByEmailOrCnpj(identifier);

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const senhaValida = UserRepository.verifyPassword(senha, user.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Remover senha da resposta
    const { senha: _, ...userSemSenha } = user;

    return {
      token,
      user: userSemSenha
    };
  }

  /**
   * Cadastrar novo usuário (empresa)
   */
  async cadastro(userData) {
    const { nome, cnpj, email, senha, endereco, telefone } = userData;

    // Validações básicas
    if (!nome || !cnpj || !email || !senha) {
      throw new Error('Todos os campos são obrigatórios');
    }

    // Verificar se CNPJ ou email já existe
    const usuarioExistentePorCnpj = await UserRepository.findByCnpj(cnpj);
    if (usuarioExistentePorCnpj) {
      throw new Error('CNPJ já cadastrado');
    }

    const usuarioExistentePorEmail = await UserRepository.findByEmail(email);
    if (usuarioExistentePorEmail) {
      throw new Error('Email já cadastrado');
    }

    // Criar novo usuário
    const novoUsuario = await UserRepository.create({
      nome,
      cnpj,
      email,
      senha,
      role: 'USUARIO',
      endereco: endereco || '',
      telefone: telefone || ''
    });

    // Gerar token
    const token = jwt.sign(
      { id: novoUsuario.id, email: novoUsuario.email, role: novoUsuario.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    const { senha: _, ...userSemSenha } = novoUsuario;

    return {
      token,
      user: userSemSenha
    };
  }

  /**
   * Verificar token e buscar usuário
   */
  async verificarToken(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const { senha: _, ...userSemSenha } = user;
    return userSemSenha;
  }
}

module.exports = new AuthService();

