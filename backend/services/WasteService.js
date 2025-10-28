const WasteRecordRepository = require('../repositories/WasteRecordRepository');
const TokenRepository = require('../repositories/TokenRepository');
const UserRepository = require('../repositories/UserRepository');

/**
 * Service de Resíduos
 * Camada de Business Logic
 */
class WasteService {
  /**
   * Calcular crédito baseado no peso e categoria
   */
  calcularCredito(peso, categoria) {
    // Reciclável: 10% do peso em créditos
    // Orgânico: 5% do peso em créditos
    const taxa = categoria === 'RECICLAVEL' ? 0.10 : 0.05;
    return peso * taxa;
  }

  /**
   * Listar registros de lixo do usuário
   */
  async listarMeusRegistros(userId) {
    const registros = await WasteRecordRepository.findByUserId(userId);
    
    return {
      total: registros.length,
      registros
    };
  }

  /**
   * Registrar novo lixo com token
   */
  async registrar(userId, token) {
    if (!token || token.length !== 6) {
      throw new Error('Token deve ter 6 dígitos');
    }

    // Verificar se token existe e está DISPONÍVEL (usado = 0)
    const tokenData = await TokenRepository.findAvailable(token);
    
    if (!tokenData) {
      throw new Error('Token inválido ou já utilizado');
    }

    // Calcular crédito
    const credito = this.calcularCredito(tokenData.peso, tokenData.categoria);

    // Criar novo registro
    const novoRegistro = await WasteRecordRepository.create({
      userId,
      token,
      categoria: tokenData.categoria,
      peso: tokenData.peso,
      credito,
      status: 'VALIDADO',
      dataValidacao: new Date().toISOString()
    });

    // Marcar token como usado
    await TokenRepository.markAsUsed(token);

    return novoRegistro;
  }

  /**
   * Estatísticas de lixo do usuário
   */
  async obterEstatisticas(userId) {
    const registros = await WasteRecordRepository.findByUserId(userId);

    const stats = {
      totalPeso: 0,
      totalCredito: 0,
      porCategoria: {
        RECICLAVEL: { peso: 0, credito: 0, quantidade: 0 },
        ORGANICO: { peso: 0, credito: 0, quantidade: 0 }
      },
      porStatus: {
        VALIDADO: 0,
        PENDENTE_PAGAMENTO: 0,
        PAGO: 0
      }
    };

    registros.forEach(r => {
      stats.totalPeso += r.peso;
      stats.totalCredito += r.credito;
      stats.porCategoria[r.categoria].peso += r.peso;
      stats.porCategoria[r.categoria].credito += r.credito;
      stats.porCategoria[r.categoria].quantidade += 1;
      stats.porStatus[r.status] = (stats.porStatus[r.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Listar todos os registros (para validador e admin)
   */
  async listarTodos() {
    const registros = await WasteRecordRepository.findAll();
    
    return {
      total: registros.length,
      registros
    };
  }

  /**
   * Listar tokens disponíveis para criar lote (apenas VALIDADOS)
   */
  async listarDisponiveisParaLote() {
    const registros = await WasteRecordRepository.findByStatus('VALIDADO');
    
    // Adicionar informações do usuário
    const registrosComUsuario = [];
    for (const registro of registros) {
      const user = await UserRepository.findById(registro.userId);
      registrosComUsuario.push({
        ...registro,
        nomeEmpresa: user ? user.nome : 'Desconhecido',
        cnpj: user ? user.cnpj : ''
      });
    }
    
    // Ordenar por data de criação (mais antigos primeiro)
    registrosComUsuario.sort((a, b) => 
      new Date(a.dataCriacao) - new Date(b.dataCriacao)
    );
    
    return {
      total: registrosComUsuario.length,
      registros: registrosComUsuario
    };
  }
}

module.exports = new WasteService();

