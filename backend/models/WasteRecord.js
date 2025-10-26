const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Helper para converter strings numéricas do PostgreSQL para números
const parseNumericFields = (record) => {
  if (!record) return record;
  return {
    ...record,
    peso: parseFloat(record.peso) || 0,
    credito: parseFloat(record.credito) || 0
  };
};

const parseNumericArrayFields = (records) => {
  if (!records || !Array.isArray(records)) return [];
  return records.map(parseNumericFields);
};

class WasteRecord {
  // Buscar registro por ID
  static async findById(id) {
    try {
      const record = await db.getAsync('SELECT * FROM waste_records WHERE id = ?', [id]);
      return parseNumericFields(record);
    } catch (error) {
      console.error('Erro ao buscar registro:', error);
      return null;
    }
  }

  // Buscar registro por token
  static async findByToken(token) {
    try {
      const record = await db.getAsync('SELECT * FROM waste_records WHERE token = ?', [token]);
      return parseNumericFields(record);
    } catch (error) {
      console.error('Erro ao buscar por token:', error);
      return null;
    }
  }

  // Buscar registros por usuário
  static async findByUserId(userId) {
    try {
      const records = await db.allAsync(`
        SELECT * FROM waste_records 
        WHERE userId = ? 
        ORDER BY dataCriacao DESC
      `, [userId]);
      return parseNumericArrayFields(records);
    } catch (error) {
      console.error('Erro ao buscar registros do usuário:', error);
      return [];
    }
  }

  // Buscar registros por status
  static async findByStatus(status) {
    try {
      const records = await db.allAsync(`
        SELECT * FROM waste_records 
        WHERE status = ? 
        ORDER BY dataCriacao DESC
      `, [status]);
      return parseNumericArrayFields(records);
    } catch (error) {
      console.error('Erro ao buscar por status:', error);
      return [];
    }
  }

  // Buscar registros por usuário e status
  static async findByUserIdAndStatus(userId, status) {
    try {
      const records = await db.allAsync(`
        SELECT * FROM waste_records 
        WHERE userId = ? AND status = ? 
        ORDER BY dataCriacao DESC
      `, [userId, status]);
      return parseNumericArrayFields(records);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      return [];
    }
  }

  // Criar novo registro
  static async create(recordData) {
    try {
      const sql = `
        INSERT INTO waste_records (
          userId, token, categoria, peso, credito, status,
          dataValidacao, dataSolicitacaoPagamento, dataPagamento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const result = await db.pool.query(sql, [
        recordData.userId,
        recordData.token,
        recordData.categoria,
        recordData.peso,
        recordData.credito,
        recordData.status || 'VALIDADO',
        recordData.dataValidacao || new Date().toISOString(),
        recordData.dataSolicitacaoPagamento || null,
        recordData.dataPagamento || null
      ]);

      return parseNumericFields(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar registro:', error);
      throw error;
    }
  }

  // Atualizar status
  static async updateStatus(id, status, additionalData = {}) {
    try {
      const fields = [];
      const values = [status];
      let paramCount = 1;

      fields.push(`status = $${paramCount}`);

      if (status === 'PENDENTE_PAGAMENTO' && !additionalData.dataSolicitacaoPagamento) {
        paramCount++;
        fields.push(`dataSolicitacaoPagamento = $${paramCount}`);
        values.push(new Date().toISOString());
      } else if (additionalData.dataSolicitacaoPagamento) {
        paramCount++;
        fields.push(`dataSolicitacaoPagamento = $${paramCount}`);
        values.push(additionalData.dataSolicitacaoPagamento);
      }

      if (status === 'PAGO' && !additionalData.dataPagamento) {
        paramCount++;
        fields.push(`dataPagamento = $${paramCount}`);
        values.push(new Date().toISOString());
      } else if (additionalData.dataPagamento) {
        paramCount++;
        fields.push(`dataPagamento = $${paramCount}`);
        values.push(additionalData.dataPagamento);
      }

      paramCount++;
      values.push(id);
      const sql = `UPDATE waste_records SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
      
      const result = await db.pool.query(sql, values);
      return parseNumericFields(result.rows[0]);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  // Atualizar múltiplos registros
  static async updateMany(ids, status) {
    try {
      const placeholders = ids.map((_, i) => `$${i + 3}`).join(',');
      const dataPagamento = status === 'PAGO' ? new Date().toISOString() : null;
      
      const sql = `
        UPDATE waste_records 
        SET status = $1, dataPagamento = $2 
        WHERE id IN (${placeholders})
        RETURNING *
      `;
      
      const result = await db.pool.query(sql, [status, dataPagamento, ...ids]);
      return { changes: result.rowCount, rows: parseNumericArrayFields(result.rows) };
    } catch (error) {
      console.error('Erro ao atualizar múltiplos registros:', error);
      throw error;
    }
  }

  // Estatísticas por usuário
  static async getStatsByUserId(userId) {
    try {
      return await db.allAsync(`
        SELECT 
          COUNT(*) as totalRegistros,
          SUM(peso) as totalPeso,
          SUM(credito) as totalCredito,
          categoria,
          status
        FROM waste_records 
        WHERE userId = ?
        GROUP BY categoria, status
      `, [userId]);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return [];
    }
  }

  // Listar todos os registros
  static async findAll() {
    try {
      const records = await db.allAsync('SELECT * FROM waste_records ORDER BY dataCriacao DESC', []);
      return parseNumericArrayFields(records);
    } catch (error) {
      console.error('Erro ao listar registros:', error);
      return [];
    }
  }

  // Deletar registro
  static async delete(id) {
    try {
      return await db.runAsync('DELETE FROM waste_records WHERE id = ?', [id]);
    } catch (error) {
      console.error('Erro ao deletar registro:', error);
      throw error;
    }
  }
}

module.exports = WasteRecord;
