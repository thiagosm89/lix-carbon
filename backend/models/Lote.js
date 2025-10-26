const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class Lote {
  /**
   * Criar novo lote para envio à validadora
   */
  static async create(pesoMaximo) {
    const id = uuidv4();
    
    // Buscar tokens VALIDADOS (não enviados ainda) por ordem de data
    const tokensDisponiveis = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM waste_records 
         WHERE status = 'VALIDADO' 
         ORDER BY dataCriacao ASC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    if (!tokensDisponiveis || tokensDisponiveis.length === 0) {
      throw new Error('Não há tokens disponíveis para criar lote');
    }

    // Selecionar tokens até completar o peso máximo
    let pesoAcumulado = 0;
    const tokensSelecionados = [];

    for (const token of tokensDisponiveis) {
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
    const lote = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM lotes WHERE id = ?',
        [loteId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!lote) {
      throw new Error('Lote não encontrado');
    }

    if (lote.status !== 'PENDENTE_VALIDADORA') {
      throw new Error('Lote já foi processado');
    }

    // Calcular distribuição
    const percentualEmpresa = lote.percentualEmpresa || 20;
    const valorEmpresa = valorPago * (percentualEmpresa / 100);
    const valorDistribuir = valorPago - valorEmpresa;

    // Buscar tokens do lote
    const tokens = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM waste_records WHERE loteId = ?',
        [loteId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Calcular valor proporcional para cada token
    const pesoTotal = lote.pesoUtilizado;
    for (const token of tokens) {
      const proporcao = token.peso / pesoTotal;
      const valorToken = valorDistribuir * proporcao;

      // Atualizar token
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE waste_records 
           SET status = 'LIBERADO_PAGAMENTO', 
               valorProporcional = ?
           WHERE id = ?`,
          [valorToken, token.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    // Atualizar lote
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE lotes 
         SET status = 'PAGO_VALIDADORA',
             valorPago = ?,
             valorDistribuido = ?,
             dataPagamentoValidadora = datetime('now')
         WHERE id = ?`,
        [valorPago, valorDistribuir, loteId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return {
      loteId,
      valorPago,
      valorEmpresa,
      valorDistribuido: valorDistribuir,
      tokensAtualizados: tokens.length
    };
  }

  /**
   * Listar todos os lotes
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM lotes ORDER BY dataCriacao DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Buscar lote por ID
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM lotes WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Buscar tokens de um lote
   */
  static async findTokensByLoteId(loteId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT wr.*, u.nomeEmpresa, u.cnpj 
         FROM waste_records wr
         JOIN users u ON wr.userId = u.id
         WHERE wr.loteId = ?
         ORDER BY wr.dataCriacao ASC`,
        [loteId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Estatísticas de lotes
   */
  static async getStats() {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as totalLotes,
          SUM(CASE WHEN status = 'PENDENTE_VALIDADORA' THEN 1 ELSE 0 END) as pendentes,
          SUM(CASE WHEN status = 'PAGO_VALIDADORA' THEN 1 ELSE 0 END) as pagos,
          SUM(pesoUtilizado) as pesoTotal,
          SUM(valorPago) as valorTotal
         FROM lotes`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }
}

module.exports = Lote;

