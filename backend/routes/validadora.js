const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Validadora = require('../models/Validadora');

// Todas as rotas são apenas para ADMINISTRADOR

// Listar todas as validadoras
router.get('/', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const validadoras = await Validadora.findAll();
    const stats = await Validadora.getStats();
    
    res.json({
      success: true,
      validadoras,
      stats
    });
  } catch (error) {
    console.error('Erro ao listar validadoras:', error);
    res.status(500).json({ success: false, error: 'Erro ao listar validadoras' });
  }
});

// Listar validadoras ativas
router.get('/ativas', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const validadoras = await Validadora.findActive();
    
    res.json({
      success: true,
      validadoras
    });
  } catch (error) {
    console.error('Erro ao listar validadoras ativas:', error);
    res.status(500).json({ success: false, error: 'Erro ao listar validadoras ativas' });
  }
});

// Buscar validadora por ID
router.get('/:id', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const validadora = await Validadora.findById(req.params.id);
    
    if (!validadora) {
      return res.status(404).json({ success: false, error: 'Validadora não encontrada' });
    }
    
    res.json({
      success: true,
      validadora
    });
  } catch (error) {
    console.error('Erro ao buscar validadora:', error);
    res.status(500).json({ success: false, error: 'Erro ao buscar validadora' });
  }
});

// Criar nova validadora
router.post('/', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const { nomeEmpresa, cnpj, email, telefone, endereco, responsavel } = req.body;

    // Validações
    if (!nomeEmpresa || !cnpj || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nome da empresa, CNPJ e email são obrigatórios'
      });
    }

    // Verificar se CNPJ já existe
    const cnpjExistente = await Validadora.findByCnpj(cnpj);
    if (cnpjExistente) {
      return res.status(400).json({
        success: false,
        error: 'CNPJ já cadastrado'
      });
    }

    const validadora = await Validadora.create({
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
      validadora
    });
  } catch (error) {
    console.error('Erro ao criar validadora:', error);
    res.status(500).json({ success: false, error: 'Erro ao cadastrar validadora' });
  }
});

// Atualizar validadora
router.put('/:id', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const { nomeEmpresa, cnpj, email, telefone, endereco, responsavel, ativa } = req.body;

    // Validações
    if (!nomeEmpresa || !cnpj || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nome da empresa, CNPJ e email são obrigatórios'
      });
    }

    // Verificar se validadora existe
    const validadoraExistente = await Validadora.findById(req.params.id);
    if (!validadoraExistente) {
      return res.status(404).json({ success: false, error: 'Validadora não encontrada' });
    }

    // Verificar se CNPJ já existe em outra validadora
    const cnpjOutraValidadora = await Validadora.findByCnpj(cnpj);
    if (cnpjOutraValidadora && cnpjOutraValidadora.id !== req.params.id) {
      return res.status(400).json({
        success: false,
        error: 'CNPJ já cadastrado em outra validadora'
      });
    }

    const validadora = await Validadora.update(req.params.id, {
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
      validadora
    });
  } catch (error) {
    console.error('Erro ao atualizar validadora:', error);
    res.status(500).json({ success: false, error: 'Erro ao atualizar validadora' });
  }
});

// Ativar/Desativar validadora
router.patch('/:id/toggle', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const validadora = await Validadora.toggleAtiva(req.params.id);
    
    if (!validadora) {
      return res.status(404).json({ success: false, error: 'Validadora não encontrada' });
    }
    
    res.json({
      success: true,
      message: `Validadora ${validadora.ativa ? 'ativada' : 'desativada'} com sucesso`,
      validadora
    });
  } catch (error) {
    console.error('Erro ao alternar status da validadora:', error);
    res.status(500).json({ success: false, error: 'Erro ao alternar status da validadora' });
  }
});

// Deletar validadora
router.delete('/:id', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const validadora = await Validadora.delete(req.params.id);
    
    if (!validadora) {
      return res.status(404).json({ success: false, error: 'Validadora não encontrada' });
    }
    
    res.json({
      success: true,
      message: 'Validadora deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar validadora:', error);
    res.status(500).json({ success: false, error: 'Erro ao deletar validadora' });
  }
});

module.exports = router;

