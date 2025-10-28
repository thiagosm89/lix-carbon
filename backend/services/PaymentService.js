const WasteRecordRepository = require('../repositories/WasteRecordRepository');
const UserRepository = require('../repositories/UserRepository');

/**
 * Service de Pagamentos
 * Camada de Business Logic
 */
class PaymentService {
  /**
   * Acompanhar status de pagamentos (usuário)
   */
  async acompanhar(userId) {
    // Buscar todos os registros do usuário
    const todosRegistros = await WasteRecordRepository.findByUserId(userId);

    // Separar por categorias
    const pendentes = [];
    const disponiveis = [];
    const pagos = [];

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

    return {
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
    };
  }

  /**
   * Listar tokens disponíveis para saque (usuário)
   */
  async listarDisponiveis(userId) {
    const disponiveis = await WasteRecordRepository.findByUserIdAndStatus(userId, 'LIBERADO_PAGAMENTO');
    const totalValor = disponiveis.reduce((sum, p) => sum + (p.valorProporcional || 0), 0);

    return {
      total: disponiveis.length,
      totalValor,
      registros: disponiveis
    };
  }

  /**
   * Listar todos os tokens disponíveis para pagamento (administrador)
   */
  async listarTodosDisponiveis() {
    const disponiveis = await WasteRecordRepository.findByStatus('LIBERADO_PAGAMENTO');

    // Agrupar por usuário
    const porUsuario = {};
    
    for (const p of disponiveis) {
      if (!porUsuario[p.userId]) {
        const user = await UserRepository.findById(p.userId);
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

    return {
      total: disponiveis.length,
      totalValor: totalGeral,
      porUsuario,
      todosDisponiveis: disponiveis
    };
  }

  /**
   * Processar pagamentos (administrador)
   */
  async processar(registroIds) {
    if (!registroIds || registroIds.length === 0) {
      throw new Error('Nenhum registro selecionado');
    }

    const registrosProcessados = [];
    let totalCredito = 0;

    // Validar e processar cada registro
    for (const registroId of registroIds) {
      const registro = await WasteRecordRepository.findById(registroId);

      if (!registro) {
        throw new Error(`Registro ${registroId} não encontrado`);
      }

      if (registro.status !== 'LIBERADO_PAGAMENTO') {
        throw new Error(
          `Registro ${registroId} não está disponível para pagamento. Status atual: ${registro.status}`
        );
      }

      // Atualizar para PAGO
      const registroAtualizado = await WasteRecordRepository.updateStatus(registroId, 'PAGO', {
        dataPagamento: new Date().toISOString()
      });

      registrosProcessados.push(registroAtualizado);
      totalCredito += (registroAtualizado.valorProporcional || 0);
      
      console.log(`✅ Pagamento processado - Registro ${registroId.slice(0, 8)} - Valor: $${registroAtualizado.valorProporcional.toFixed(2)}`);
    }

    console.log(`💰 Total de ${registrosProcessados.length} pagamentos processados - $${totalCredito.toFixed(2)}`);

    return {
      totalValor: totalCredito,
      quantidadeRegistros: registrosProcessados.length,
      registros: registrosProcessados
    };
  }

  /**
   * Histórico de pagamentos do usuário
   */
  async obterHistorico(userId) {
    const pagos = await WasteRecordRepository.findByUserIdAndStatus(userId, 'PAGO');
    const totalValor = pagos.reduce((sum, p) => sum + (p.valorProporcional || 0), 0);

    return {
      total: pagos.length,
      totalValor,
      pagamentos: pagos
    };
  }

  /**
   * Histórico de todos os pagamentos (administrador)
   */
  async obterHistoricoCompleto() {
    const pagos = await WasteRecordRepository.findByStatus('PAGO');
    const totalValor = pagos.reduce((sum, p) => sum + (p.valorProporcional || 0), 0);

    return {
      total: pagos.length,
      totalValor,
      pagamentos: pagos
    };
  }
}

module.exports = new PaymentService();

