const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const { mapDbObjectToCamelCase, mapDbArrayToCamelCase } = require('../utils/columnMapper');

/**
 * Helper para converter strings numéricas do PostgreSQL para números
 * e mapear colunas lowercase para camelCase
 */
const parseNumericFields = (lote) => {
  if (!lote) return lote;
  
  // Primeiro mapeia as colunas para camelCase
  const mapped = mapDbObjectToCamelCase(lote);
  
  // Depois converte os campos numéricos
  return {
    ...mapped,
    pesoMaximo: parseFloat(mapped.pesoMaximo || mapped.pesomaximo) || 0,
    pesoUtilizado: parseFloat(mapped.pesoUtilizado || mapped.pesoutilizado) || 0,
    quantidadeTokens: parseInt(mapped.quantidadeTokens || mapped.quantidadetokens) || 0,
    percentualEmpresa: parseFloat(mapped.percentualEmpresa || mapped.percentualempresa) || 20,
    valorPago: parseFloat(mapped.valorPago || mapped.valorpago) || 0,
    valorDistribuido: parseFloat(mapped.valorDistribuido || mapped.valordistribuido) || 0
  };
};

const parseNumericArrayFields = (lotes) => {
  if (!lotes || !Array.isArray(lotes)) return [];
  return lotes.map(parseNumericFields);
};

/**
 * Repository para acesso aos dados de lotes
 * Camada de Data Access
 */
class LoteRepository {
  /**
   * Listar todos os lotes
   */
  async findAll() {
    const lotes = await db.allAsync(
      'SELECT * FROM lotes ORDER BY dataCriacao DESC',
      []
    );
    return parseNumericArrayFields(lotes);
  }

  /**
   * Buscar lote por ID
   */
  async findById(id) {
    const lote = await db.getAsync(
      'SELECT * FROM lotes WHERE id = $1',
      [id]
    );
    return parseNumericFields(lote);
  }

  /**
   * Criar novo lote
   */
  async create(id, pesoMaximo, pesoUtilizado, quantidadeTokens) {
    await db.pool.query(
      `INSERT INTO lotes (id, pesoMaximo, pesoUtilizado, quantidadeTokens, status)
       VALUES ($1, $2, $3, $4, 'PENDENTE_VALIDADORA')`,
      [id, pesoMaximo, pesoUtilizado, quantidadeTokens]
    );

    return {
      id,
      pesoMaximo,
      pesoUtilizado,
      quantidadeTokens,
      status: 'PENDENTE_VALIDADORA'
    };
  }

  /**
   * Atualizar status e valores do lote
   */
  async updatePagamento(loteId, valorPago, valorDistribuido) {
    await db.pool.query(
      `UPDATE lotes 
       SET status = 'PAGO_VALIDADORA',
           valorPago = $1,
           valorDistribuido = $2,
           dataPagamentoValidadora = NOW()
       WHERE id = $3`,
      [valorPago, valorDistribuido, loteId]
    );
  }

  /**
   * Buscar tokens de um lote
   */
  async findTokensByLoteId(loteId) {
    const tokens = await db.allAsync(
      `SELECT wr.*, u.nome as nomeEmpresa, u.cnpj 
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
  async getStats() {
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

module.exports = new LoteRepository();

