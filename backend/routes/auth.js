const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET_KEY } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  const { identifier, senha } = req.body;

  try {
    // Buscar usuário por email ou CNPJ
    const user = await User.findByEmailOrCnpj(identifier);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaValida = User.verifyPassword(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Remover senha da resposta
    const { senha: _, ...userSemSenha } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userSemSenha
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Cadastro (apenas para empresas - perfil USUARIO)
router.post('/cadastro', async (req, res) => {
  const { nome, cnpj, email, senha, endereco, telefone } = req.body;

  try {
    // Validações básicas
    if (!nome || !cnpj || !email || !senha) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se CNPJ ou email já existe
    const usuarioExistentePorCnpj = await User.findByCnpj(cnpj);
    if (usuarioExistentePorCnpj) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }

    const usuarioExistentePorEmail = await User.findByEmail(email);
    if (usuarioExistentePorEmail) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Criar novo usuário
    const novoUsuario = await User.create({
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

    res.status(201).json({
      message: 'Cadastro realizado com sucesso',
      token,
      user: userSemSenha
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao fazer cadastro' });
  }
});

// Verificar token
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    try {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const { senha: _, ...userSemSenha } = user;
      res.json({ user: userSemSenha });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  });
});

module.exports = router;
