const db = require('../database/db');
const { mapDbObjectToCamelCase, mapDbArrayToCamelCase } = require('../utils/columnMapper');

/**
 * Repository para acesso aos dados de tokens
 * Camada de Data Access
 */
class TokenRepository {
  /**
   * Buscar token por número
   */
  async findByToken(token) {
    try {
      const result = await db.getAsync('SELECT * FROM available_tokens WHERE token = ?', [token]);
      return mapDbObjectToCamelCase(result);
    } catch (error) {
      console.error('Erro ao buscar token:', error);
      return null;
    }
  }

  /**
   * Buscar token disponível e não usado
   */
  async findAvailable(token) {
    try {
      const result = await db.getAsync('SELECT * FROM available_tokens WHERE token = ? AND usado = 0', [token]);
      return mapDbObjectToCamelCase(result);
    } catch (error) {
      console.error('Erro ao buscar token disponível:', error);
      return null;
    }
  }

  /**
   * Criar novo token
   */
  async create(tokenData) {
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

      return mapDbObjectToCamelCase(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar token:', error);
      throw error;
    }
  }

  /**
   * Marcar token como usado
   */
  async markAsUsed(token) {
    try {
      return await db.runAsync('UPDATE available_tokens SET usado = 1 WHERE token = ?', [token]);
    } catch (error) {
      console.error('Erro ao marcar token como usado:', error);
      throw error;
    }
  }

  /**
   * Listar todos os tokens
   */
  async findAll() {
    try {
      const results = await db.allAsync('SELECT * FROM available_tokens', []);
      return mapDbArrayToCamelCase(results);
    } catch (error) {
      console.error('Erro ao listar tokens:', error);
      return [];
    }
  }

  /**
   * Listar tokens disponíveis
   */
  async findAllAvailable() {
    try {
      const results = await db.allAsync('SELECT * FROM available_tokens WHERE usado = 0', []);
      return mapDbArrayToCamelCase(results);
    } catch (error) {
      console.error('Erro ao listar tokens disponíveis:', error);
      return [];
    }
  }

  /**
   * Deletar token
   */
  async delete(token) {
    try {
      return await db.runAsync('DELETE FROM available_tokens WHERE token = ?', [token]);
    } catch (error) {
      console.error('Erro ao deletar token:', error);
      throw error;
    }
  }

  /**
   * Buscar tokens recentes (para debug do totem)
   */
  async findRecent(limit = 10) {
    try {
      const sql = `
        SELECT * FROM available_tokens 
        ORDER BY dataCriacao DESC 
        LIMIT $1
      `;
      const results = await db.allAsync(sql, [limit]);
      return mapDbArrayToCamelCase(results);
    } catch (error) {
      console.error('Erro ao buscar tokens recentes:', error);
      return [];
    }
  }
}

module.exports = new TokenRepository();

