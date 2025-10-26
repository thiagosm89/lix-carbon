const db = require('../database/db');

class Token {
  // Buscar token disponível
  static async findByToken(token) {
    try {
      return await db.getAsync('SELECT * FROM available_tokens WHERE token = ?', [token]);
    } catch (error) {
      console.error('Erro ao buscar token:', error);
      return null;
    }
  }

  // Buscar token disponível e não usado
  static async findAvailable(token) {
    try {
      return await db.getAsync('SELECT * FROM available_tokens WHERE token = ? AND usado = 0', [token]);
    } catch (error) {
      console.error('Erro ao buscar token disponível:', error);
      return null;
    }
  }

  // Criar novo token
  static async create(tokenData) {
    try {
      const sql = `
        INSERT INTO available_tokens (token, categoria, peso, usado)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await db.pool.query(sql, [
        tokenData.token,
        tokenData.categoria,
        tokenData.peso,
        0
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar token:', error);
      throw error;
    }
  }

  // Marcar token como usado
  static async markAsUsed(token) {
    try {
      return await db.runAsync('UPDATE available_tokens SET usado = 1 WHERE token = ?', [token]);
    } catch (error) {
      console.error('Erro ao marcar token como usado:', error);
      throw error;
    }
  }

  // Listar todos os tokens
  static async findAll() {
    try {
      return await db.allAsync('SELECT * FROM available_tokens', []);
    } catch (error) {
      console.error('Erro ao listar tokens:', error);
      return [];
    }
  }

  // Listar tokens disponíveis
  static async findAllAvailable() {
    try {
      return await db.allAsync('SELECT * FROM available_tokens WHERE usado = 0', []);
    } catch (error) {
      console.error('Erro ao listar tokens disponíveis:', error);
      return [];
    }
  }

  // Deletar token
  static async delete(token) {
    try {
      return await db.runAsync('DELETE FROM available_tokens WHERE token = ?', [token]);
    } catch (error) {
      console.error('Erro ao deletar token:', error);
      throw error;
    }
  }

  // Buscar tokens recentes (para debug do totem)
  static async findRecent(limit = 10) {
    try {
      const sql = `
        SELECT * FROM available_tokens 
        ORDER BY dataCriacao DESC 
        LIMIT $1
      `;
      return await db.allAsync(sql, [limit]);
    } catch (error) {
      console.error('Erro ao buscar tokens recentes:', error);
      return [];
    }
  }
}

module.exports = Token;
