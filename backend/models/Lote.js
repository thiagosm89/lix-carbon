const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Helper para converter strings numéricas do PostgreSQL para números
const parseNumericFields = (lote) => {
  if (!lote) return lote;
  return {
    ...lote,
    pesomaximo: parseFloat(lote.pesomaximo) || 0,
    pesoutilizado: parseFloat(lote.pesoutilizado) || 0,
    quantidadetokens: parseInt(lote.quantidadetokens) || 0,
    percentualempresa: parseFloat(lote.percentualempresa) || 20,
    valorpago: parseFloat(lote.valorpago) || 0,
    valordistribuido: parseFloat(lote.valordistribuido) || 0
  };
};

const parseNumericArrayFields = (lotes) => {
  if (!lotes || !Array.isArray(lotes)) return [];
  return lotes.map(parseNumericFields);
};

class Lote {
  /**
   * Criar novo lote para envio à validadora
   */
  static async create(pesoMaximo) {
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
    await db.pool.query(
      `INSERT INTO lotes (id, pesoMaximo, pesoUtilizado, quantidadeTokens, status)
       VALUES ($1, $2, $3, $4, 'PENDENTE_VALIDADORA')`,
      [id, pesoMaximo, pesoAcumulado, tokensSelecionados.length]
    );

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
      id,
      pesoMaximo,
      pesoUtilizado: pesoAcumulado,
      quantidadeTokens: tokensSelecionados.length,
      tokens: tokensSelecionados,
      status: 'PENDENTE_VALIDADORA'
    };
  }

  /**
   * Marcar lote como pago pela validadora e distribuir valores
   */
  static async marcarComoPago(loteId, valorPago) {
    // Buscar lote
    const lote = await db.getAsync(
      'SELECT * FROM lotes WHERE id = $1',
      [loteId]
    );

    if (!lote) {
      throw new Error('Lote não encontrado');
    }

    const loteNormalizado = parseNumericFields(lote);

    if (loteNormalizado.status !== 'PENDENTE_VALIDADORA') {
      throw new Error('Lote já foi processado');
    }

    // Calcular distribuição
    const percentualEmpresa = loteNormalizado.percentualempresa || 20;
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
    const pesoTotal = loteNormalizado.pesoutilizado;
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
    await db.pool.query(
      `UPDATE lotes 
       SET status = 'PAGO_VALIDADORA',
           valorPago = $1,
           valorDistribuido = $2,
           dataPagamentoValidadora = NOW()
       WHERE id = $3`,
      [valorPago, valorDistribuir, loteId]
    );

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
  static async findAll() {
    const lotes = await db.allAsync(
      'SELECT * FROM lotes ORDER BY dataCriacao DESC',
      []
    );
    return parseNumericArrayFields(lotes);
  }

  /**
   * Buscar lote por ID
   */
  static async findById(id) {
    const lote = await db.getAsync(
      'SELECT * FROM lotes WHERE id = $1',
      [id]
    );
    return parseNumericFields(lote);
  }

  /**
   * Buscar tokens de um lote
   */
  static async findTokensByLoteId(loteId) {
    const tokens = await db.allAsync(
      `SELECT wr.*, u.nomeEmpresa, u.cnpj 
       FROM waste_records wr
       JOIN users u ON wr.userId = u.id
       WHERE wr.loteId = $1
       ORDER BY wr.dataCriacao ASC`,
      [loteId]
    );
    
    // Converter campos numéricos
    return tokens.map(t => ({
      ...t,
      peso: parseFloat(t.peso) || 0,
      credito: parseFloat(t.credito) || 0,
      valorproporcional: parseFloat(t.valorproporcional) || 0
    }));
  }

  /**
   * Estatísticas de lotes
   */
  static async getStats() {
    const stats = await db.getAsync(
      `SELECT 
        COUNT(*)::int as totalLotes,
        SUM(CASE WHEN status = 'PENDENTE_VALIDADORA' THEN 1 ELSE 0 END)::int as pendentes,
        SUM(CASE WHEN status = 'PAGO_VALIDADORA' THEN 1 ELSE 0 END)::int as pagos,
        COALESCE(SUM(pesoUtilizado), 0) as pesoTotal,
        COALESCE(SUM(valorPago), 0) as valorTotal
       FROM lotes`,
      []
    );
    
    return {
      ...stats,
      pesototal: parseFloat(stats.pesototal) || 0,
      valortotal: parseFloat(stats.valortotal) || 0
    };
  }
}

module.exports = Lote;
