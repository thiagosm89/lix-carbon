const { v4: uuidv4 } = require('uuid');
const LoteRepository = require('../repositories/LoteRepository');
const WasteRecordRepository = require('../repositories/WasteRecordRepository');
const db = require('../database/db');

/**
 * Service de Lotes
 * Camada de Business Logic
 */
class LoteService {
  /**
   * Criar novo lote para envio à validadora
   */
  async criar(pesoMaximo) {
    if (!pesoMaximo || pesoMaximo <= 0) {
      throw new Error('Peso máximo deve ser maior que zero');
    }

    const id = uuidv4();
    
    // Buscar tokens VALIDADOS (não enviados ainda) por ordem de data
    const tokensDisponiveis = await db.allAsync(
      `SELECT * FROM waste_records 
       WHERE status = 'VALIDADO' 
       ORDER BY dataCriacao ASC`,
      []
    );

    if (!tokensDisponiveis || tokensDisponiveis.length === 0) {
      throw new Error('Não há tokens disponíveis para criar lote');
    }

    // Converter campos numéricos
    const tokens = tokensDisponiveis.map(t => ({
      ...t,
      peso: parseFloat(t.peso) || 0,
      credito: parseFloat(t.credito) || 0
    }));

    // Selecionar tokens até completar o peso máximo
    let pesoAcumulado = 0;
    const tokensSelecionados = [];

    for (const token of tokens) {
      if (pesoAcumulado + token.peso <= pesoMaximo) {
        tokensSelecionados.push(token);
        pesoAcumulado += token.peso;
      } else {
        // Se já tem pelo menos um token, para
        if (tokensSelecionados.length > 0) break;
        // Se é o primeiro token e já ultrapassou, inclui mesmo assim
        tokensSelecionados.push(token);
        pesoAcumulado += token.peso;
        break;
      }
    }

    if (tokensSelecionados.length === 0) {
      throw new Error('Nenhum token selecionado para o lote');
    }

    // Criar lote
    const lote = await LoteRepository.create(id, pesoMaximo, pesoAcumulado, tokensSelecionados.length);

    // Atualizar tokens para ENVIADO_VALIDADORA e associar ao lote
    for (const token of tokensSelecionados) {
      await db.pool.query(
        `UPDATE waste_records 
         SET status = 'ENVIADO_VALIDADORA', loteId = $1
         WHERE id = $2`,
        [id, token.id]
      );
    }

    return {
      ...lote,
      tokens: tokensSelecionados
    };
  }

  /**
   * Marcar lote como pago pela validadora
   */
  async marcarComoPago(loteId, valorPago) {
    if (!loteId) {
      throw new Error('ID do lote é obrigatório');
    }

    if (!valorPago || valorPago <= 0) {
      throw new Error('Valor pago deve ser maior que zero');
    }

    // Buscar lote
    const lote = await LoteRepository.findById(loteId);

    if (!lote) {
      throw new Error('Lote não encontrado');
    }

    if (lote.status !== 'PENDENTE_VALIDADORA') {
      throw new Error('Lote já foi processado');
    }

    // Calcular distribuição
    const percentualEmpresa = lote.percentualempresa || 20;
    const valorEmpresa = valorPago * (percentualEmpresa / 100);
    const valorDistribuir = valorPago - valorEmpresa;

    // Buscar tokens do lote
    const tokens = await db.allAsync(
      'SELECT * FROM waste_records WHERE loteId = $1',
      [loteId]
    );

    // Converter campos numéricos
    const tokensNormalizados = tokens.map(t => ({
      ...t,
      peso: parseFloat(t.peso) || 0,
      credito: parseFloat(t.credito) || 0
    }));

    // Calcular valor proporcional para cada token
    const pesoTotal = lote.pesoutilizado;
    for (const token of tokensNormalizados) {
      const proporcao = token.peso / pesoTotal;
      const valorToken = valorDistribuir * proporcao;

      // Atualizar token
      await db.pool.query(
        `UPDATE waste_records 
         SET status = 'LIBERADO_PAGAMENTO', 
             valorProporcional = $1
         WHERE id = $2`,
        [valorToken, token.id]
      );
    }

    // Atualizar lote
    await LoteRepository.updatePagamento(loteId, valorPago, valorDistribuir);

    return {
      loteId,
      valorPago,
      valorEmpresa,
      valorDistribuido: valorDistribuir,
      tokensAtualizados: tokensNormalizados.length
    };
  }

  /**
   * Listar todos os lotes
   */
  async listar() {
    const lotes = await LoteRepository.findAll();
    return { lotes };
  }

  /**
   * Buscar detalhes de um lote específico
   */
  async buscarPorId(id) {
    const lote = await LoteRepository.findById(id);
    
    if (!lote) {
      throw new Error('Lote não encontrado');
    }

    const tokens = await LoteRepository.findTokensByLoteId(id);

    return {
      lote,
      tokens
    };
  }

  /**
   * Estatísticas de lotes
   */
  async obterEstatisticas() {
    const stats = await LoteRepository.getStats();
    return { stats };
  }
}

module.exports = new LoteService();

