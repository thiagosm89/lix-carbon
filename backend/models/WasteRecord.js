const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

class WasteRecord {
  // Buscar registro por ID
  static async findById(id) {
    try {
      return await db.getAsync('SELECT * FROM waste_records WHERE id = ?', [id]);
    } catch (error) {
      console.error('Erro ao buscar registro:', error);
      return null;
    }
  }

  // Buscar registro por token
  static async findByToken(token) {
    try {
      return await db.getAsync('SELECT * FROM waste_records WHERE token = ?', [token]);
    } catch (error) {
      console.error('Erro ao buscar por token:', error);
      return null;
    }
  }

  // Buscar registros por usuário
  static async findByUserId(userId) {
    try {
      return await db.allAsync(`
        SELECT * FROM waste_records 
        WHERE userId = ? 
        ORDER BY dataCriacao DESC
      `, [userId]);
    } catch (error) {
      console.error('Erro ao buscar registros do usuário:', error);
      return [];
    }
  }

  // Buscar registros por status
  static async findByStatus(status) {
    try {
      return await db.allAsync(`
        SELECT * FROM waste_records 
        WHERE status = ? 
        ORDER BY dataCriacao DESC
      `, [status]);
    } catch (error) {
      console.error('Erro ao buscar por status:', error);
      return [];
    }
  }

  // Buscar registros por usuário e status
  static async findByUserIdAndStatus(userId, status) {
    try {
      return await db.allAsync(`
        SELECT * FROM waste_records 
        WHERE userId = ? AND status = ? 
        ORDER BY dataCriacao DESC
      `, [userId, status]);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      return [];
    }
  }

  // Criar novo registro
  static async create(recordData) {
    const id = uuidv4();
    const dataCriacao = new Date().toISOString();

    try {
      const sql = `
        INSERT INTO waste_records (
          id, userId, token, categoria, peso, credito, status,
          dataCriacao, dataValidacao, dataSolicitacaoPagamento, dataPagamento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.runAsync(sql, [
        id,
        recordData.userId,
        recordData.token,
        recordData.categoria,
        recordData.peso,
        recordData.credito,
        recordData.status || 'VALIDADO',
        dataCriacao,
        recordData.dataValidacao || dataCriacao,
        recordData.dataSolicitacaoPagamento || null,
        recordData.dataPagamento || null
      ]);

      return await this.findById(id);
    } catch (error) {
      console.error('Erro ao criar registro:', error);
      throw error;
    }
  }

  // Atualizar status
  static async updateStatus(id, status, additionalData = {}) {
    try {
      const fields = ['status = ?'];
      const values = [status];

      if (status === 'PENDENTE_PAGAMENTO' && !additionalData.dataSolicitacaoPagamento) {
        fields.push('dataSolicitacaoPagamento = ?');
        values.push(new Date().toISOString());
      } else if (additionalData.dataSolicitacaoPagamento) {
        fields.push('dataSolicitacaoPagamento = ?');
        values.push(additionalData.dataSolicitacaoPagamento);
      }

      if (status === 'PAGO' && !additionalData.dataPagamento) {
        fields.push('dataPagamento = ?');
        values.push(new Date().toISOString());
      } else if (additionalData.dataPagamento) {
        fields.push('dataPagamento = ?');
        values.push(additionalData.dataPagamento);
      }

      values.push(id);
      const sql = `UPDATE waste_records SET ${fields.join(', ')} WHERE id = ?`;
      await db.runAsync(sql, values);

      return await this.findById(id);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  }

  // Atualizar múltiplos registros
  static async updateMany(ids, status) {
    try {
      const placeholders = ids.map(() => '?').join(',');
      const dataPagamento = status === 'PAGO' ? new Date().toISOString() : null;
      
      const sql = `
        UPDATE waste_records 
        SET status = ?, dataPagamento = ? 
        WHERE id IN (${placeholders})
      `;
      
      return await db.runAsync(sql, [status, dataPagamento, ...ids]);
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
      return await db.allAsync('SELECT * FROM waste_records ORDER BY dataCriacao DESC', []);
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
