const db = require('../database/db');

/**
 * Repository para acesso aos dados de validadoras
 * Camada de Data Access
 */
class ValidadoraRepository {
  /**
   * Criar nova validadora
   */
  async create(validadoraData) {
    try {
      const sql = `
        INSERT INTO validadoras (
          nomeEmpresa, cnpj, email, telefone, endereco, responsavel, ativa
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await db.pool.query(sql, [
        validadoraData.nomeEmpresa,
        validadoraData.cnpj,
        validadoraData.email,
        validadoraData.telefone || null,
        validadoraData.endereco || null,
        validadoraData.responsavel || null,
        validadoraData.ativa !== undefined ? validadoraData.ativa : true
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar validadora:', error);
      throw error;
    }
  }

  /**
   * Buscar todas as validadoras
   */
  async findAll() {
    try {
      const result = await db.pool.query(
        'SELECT * FROM validadoras ORDER BY nomeEmpresa ASC'
      );
      return result.rows;
    } catch (error) {
      console.error('Erro ao listar validadoras:', error);
      return [];
    }
  }

  /**
   * Buscar validadoras ativas
   */
  async findActive() {
    try {
      const result = await db.pool.query(
        'SELECT * FROM validadoras WHERE ativa = true ORDER BY nomeEmpresa ASC'
      );
      return result.rows;
    } catch (error) {
      console.error('Erro ao listar validadoras ativas:', error);
      return [];
    }
  }

  /**
   * Buscar validadora por ID
   */
  async findById(id) {
    try {
      const result = await db.pool.query(
        'SELECT * FROM validadoras WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar validadora:', error);
      return null;
    }
  }

  /**
   * Buscar validadora por CNPJ
   */
  async findByCnpj(cnpj) {
    try {
      const result = await db.pool.query(
        'SELECT * FROM validadoras WHERE cnpj = $1',
        [cnpj]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar validadora por CNPJ:', error);
      return null;
    }
  }

  /**
   * Atualizar validadora
   */
  async update(id, validadoraData) {
    try {
      const sql = `
        UPDATE validadoras SET
          nomeEmpresa = $1,
          cnpj = $2,
          email = $3,
          telefone = $4,
          endereco = $5,
          responsavel = $6,
          ativa = $7
        WHERE id = $8
        RETURNING *
      `;

      const result = await db.pool.query(sql, [
        validadoraData.nomeEmpresa,
        validadoraData.cnpj,
        validadoraData.email,
        validadoraData.telefone || null,
        validadoraData.endereco || null,
        validadoraData.responsavel || null,
        validadoraData.ativa !== undefined ? validadoraData.ativa : true,
        id
      ]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar validadora:', error);
      throw error;
    }
  }

  /**
   * Ativar/Desativar validadora
   */
  async toggleAtiva(id) {
    try {
      const sql = `
        UPDATE validadoras 
        SET ativa = NOT ativa
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.pool.query(sql, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao alternar status da validadora:', error);
      throw error;
    }
  }

  /**
   * Deletar validadora
   */
  async delete(id) {
    try {
      const result = await db.pool.query(
        'DELETE FROM validadoras WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao deletar validadora:', error);
      throw error;
    }
  }

  /**
   * Estatísticas
   */
  async getStats() {
    try {
      const result = await db.pool.query(`
        SELECT 
          COUNT(*)::int as total,
          SUM(CASE WHEN ativa = true THEN 1 ELSE 0 END)::int as ativas,
          SUM(CASE WHEN ativa = false THEN 1 ELSE 0 END)::int as inativas
        FROM validadoras
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { total: 0, ativas: 0, inativas: 0 };
    }
  }
}

module.exports = new ValidadoraRepository();

