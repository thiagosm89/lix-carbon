const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../data/users');
const { SECRET_KEY } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Login
router.post('/login', (req, res) => {
  const { identifier, senha } = req.body;

  // Buscar usuário por email ou CNPJ
  const user = users.find(u => 
    u.email === identifier || u.cnpj === identifier
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Verificar senha
  const senhaValida = bcrypt.compareSync(senha, user.senha);
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
});

// Cadastro (apenas para empresas - perfil USUARIO)
router.post('/cadastro', (req, res) => {
  const { nome, cnpj, email, senha, endereco, telefone } = req.body;

  // Validações básicas
  if (!nome || !cnpj || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  // Verificar se CNPJ ou email já existe
  const usuarioExistente = users.find(u => u.cnpj === cnpj || u.email === email);
  if (usuarioExistente) {
    return res.status(400).json({ error: 'CNPJ ou email já cadastrado' });
  }

  // Criar novo usuário
  const novoUsuario = {
    id: uuidv4(),
    nome,
    cnpj,
    email,
    senha: bcrypt.hashSync(senha, 10),
    role: 'USUARIO',
    endereco: endereco || '',
    telefone: telefone || '',
    criadoEm: new Date().toISOString()
  };

  users.push(novoUsuario);

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
});

// Verificar token
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { senha: _, ...userSemSenha } = user;
    res.json({ user: userSemSenha });
  });
});

module.exports = router;

