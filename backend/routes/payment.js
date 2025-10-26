const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const WasteRecord = require('../models/WasteRecord');
const User = require('../models/User');

// Acompanhar status de pagamentos (usuário)
// USUARIO não solicita pagamento, apenas acompanha
router.get('/acompanhar', authenticateToken, authorizeRole('USUARIO'), async (req, res) => {
  const userId = req.user.id;

  try {
    // Buscar todos os registros do usuário
    const todosRegistros = await WasteRecord.findByUserId(userId);

    // Separar por categorias
    const pendentes = []; // VALIDADO + ENVIADO_VALIDADORA
    const disponiveis = []; // LIBERADO_PAGAMENTO
    const pagos = []; // PAGO

    let totalPendente = 0;
    let totalDisponivel = 0;
    let totalPago = 0;

    for (const registro of todosRegistros) {
      if (registro.status === 'VALIDADO' || registro.status === 'ENVIADO_VALIDADORA') {
        pendentes.push(registro);
        totalPendente += registro.peso;
      } else if (registro.status === 'LIBERADO_PAGAMENTO') {
        disponiveis.push(registro);
        totalDisponivel += (registro.valorProporcional || 0);
      } else if (registro.status === 'PAGO') {
        pagos.push(registro);
        totalPago += (registro.valorProporcional || 0);
      }
    }

    res.json({
      pendentes: {
        quantidade: pendentes.length,
        totalPeso: totalPendente,
        registros: pendentes,
        descricao: 'Aguardando processamento do lote pela validadora'
      },
      disponiveis: {
        quantidade: disponiveis.length,
        totalValor: totalDisponivel,
        registros: disponiveis,
        descricao: 'Disponível para saque - aguardando processamento do administrador'
      },
      pagos: {
        quantidade: pagos.length,
        totalValor: totalPago,
        registros: pagos,
        descricao: 'Pagamentos já realizados'
      }
    });
  } catch (error) {
    console.error('Erro ao acompanhar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao acompanhar pagamentos' });
  }
});

// Listar tokens disponíveis para saque (usuário)
router.get('/disponiveis', authenticateToken, authorizeRole('USUARIO'), async (req, res) => {
  try {
    const userId = req.user.id;
    const disponiveis = await WasteRecord.findByUserIdAndStatus(userId, 'LIBERADO_PAGAMENTO');

    const totalValor = disponiveis.reduce((sum, p) => sum + (p.valorProporcional || 0), 0);

    res.json({
      total: disponiveis.length,
      totalValor,
      registros: disponiveis
    });
  } catch (error) {
    console.error('Erro ao listar tokens disponíveis:', error);
    res.status(500).json({ error: 'Erro ao listar tokens disponíveis' });
  }
});

// Listar tokens disponíveis para pagamento (administrador)
// Tokens com status LIBERADO_PAGAMENTO aguardando processamento
router.get('/disponiveis/todos', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const disponiveis = await WasteRecord.findByStatus('LIBERADO_PAGAMENTO');

    // Agrupar por usuário
    const porUsuario = {};
    
    for (const p of disponiveis) {
      if (!porUsuario[p.userId]) {
        const user = await User.findById(p.userId);
        porUsuario[p.userId] = {
          userId: p.userId,
          nomeEmpresa: user ? user.nome : 'Desconhecido',
          cnpj: user ? user.cnpj : '',
          registros: [],
          totalValor: 0
        };
      }
      
      porUsuario[p.userId].registros.push(p);
      porUsuario[p.userId].totalValor += (p.valorProporcional || 0);
    }

    const totalGeral = disponiveis.reduce((sum, p) => sum + (p.valorProporcional || 0), 0);

    res.json({
      total: disponiveis.length,
      totalValor: totalGeral,
      porUsuario,
      todosDisponiveis: disponiveis
    });
  } catch (error) {
    console.error('Erro ao listar tokens disponíveis:', error);
    res.status(500).json({ error: 'Erro ao listar tokens disponíveis' });
  }
});

// Processar pagamentos (administrador)
// Paga tokens que estão LIBERADO_PAGAMENTO
router.post('/processar', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  const { registroIds } = req.body;

  try {
    if (!registroIds || registroIds.length === 0) {
      return res.status(400).json({ error: 'Nenhum registro selecionado' });
    }

    const registrosProcessados = [];
    let totalCredito = 0;

    // Validar e processar cada registro
    for (const registroId of registroIds) {
      const registro = await WasteRecord.findById(registroId);

      if (!registro) {
        return res.status(404).json({ error: `Registro ${registroId} não encontrado` });
      }

      if (registro.status !== 'LIBERADO_PAGAMENTO') {
        return res.status(400).json({ 
          error: `Registro ${registroId} não está disponível para pagamento. Status atual: ${registro.status}` 
        });
      }

      // Atualizar para PAGO
      const registroAtualizado = await WasteRecord.updateStatus(registroId, 'PAGO', {
        dataPagamento: new Date().toISOString()
      });

      registrosProcessados.push(registroAtualizado);
      totalCredito += (registroAtualizado.valorProporcional || 0);
      
      console.log(`✅ Pagamento processado - Registro ${registroId.slice(0, 8)} - Valor: $${registroAtualizado.valorProporcional.toFixed(2)}`);
    }

    console.log(`💰 Total de ${registrosProcessados.length} pagamentos processados - $${totalCredito.toFixed(2)}`);

    res.json({
      message: 'Pagamentos processados com sucesso',
      totalValor: totalCredito,
      quantidadeRegistros: registrosProcessados.length,
      registros: registrosProcessados
    });
  } catch (error) {
    console.error('Erro ao processar pagamentos:', error);
    res.status(500).json({ error: 'Erro ao processar pagamentos' });
  }
});

// Histórico de pagamentos do usuário
router.get('/historico', authenticateToken, authorizeRole('USUARIO'), async (req, res) => {
  try {
    const userId = req.user.id;
    const pagos = await WasteRecord.findByUserIdAndStatus(userId, 'PAGO');

    const totalValor = pagos.reduce((sum, p) => sum + (p.valorProporcional || 0), 0);

    res.json({
      total: pagos.length,
      totalValor,
      pagamentos: pagos
    });
  } catch (error) {
    console.error('Erro ao listar histórico:', error);
    res.status(500).json({ error: 'Erro ao listar histórico' });
  }
});

// Histórico de todos os pagamentos (administrador)
router.get('/historico/todos', authenticateToken, authorizeRole('ADMINISTRADOR'), async (req, res) => {
  try {
    const pagos = await WasteRecord.findByStatus('PAGO');

    const totalValor = pagos.reduce((sum, p) => sum + (p.valorProporcional || 0), 0);

    res.json({
      total: pagos.length,
      totalValor,
      pagamentos: pagos
    });
  } catch (error) {
    console.error('Erro ao listar histórico completo:', error);
    res.status(500).json({ error: 'Erro ao listar histórico' });
  }
});

module.exports = router;
