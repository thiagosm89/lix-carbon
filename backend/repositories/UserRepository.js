const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { mapDbObjectToCamelCase, mapDbArrayToCamelCase } = require('../utils/columnMapper');

/**
 * Repository para acesso aos dados de usuários
 * Camada de Data Access
 */
class UserRepository {
  /**
   * Buscar usuário por email
   */
  async findByEmail(email) {
    try {
      const result = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
      return mapDbObjectToCamelCase(result);
    } catch (error) {
      console.error('Erro ao buscar por email:', error);
      return null;
    }
  }

  /**
   * Buscar usuário por CNPJ
   */
  async findByCnpj(cnpj) {
    try {
      const result = await db.getAsync('SELECT * FROM users WHERE cnpj = ?', [cnpj]);
      return mapDbObjectToCamelCase(result);
    } catch (error) {
      console.error('Erro ao buscar por CNPJ:', error);
      return null;
    }
  }

  /**
   * Buscar usuário por ID
   */
  async findById(id) {
    try {
      const result = await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
      return mapDbObjectToCamelCase(result);
    } catch (error) {
      console.error('Erro ao buscar por ID:', error);
      return null;
    }
  }

  /**
   * Buscar usuário por email ou CNPJ
   */
  async findByEmailOrCnpj(identifier) {
    try {
      const result = await db.getAsync('SELECT * FROM users WHERE email = ? OR cnpj = ?', [identifier, identifier]);
      return mapDbObjectToCamelCase(result);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  /**
   * Buscar todos os usuários por role
   */
  async findByRole(role) {
    try {
      const results = await db.allAsync('SELECT * FROM users WHERE role = ?', [role]);
      return mapDbArrayToCamelCase(results);
    } catch (error) {
      console.error('Erro ao buscar por role:', error);
      return [];
    }
  }

  /**
   * Criar novo usuário
   */
  async create(userData) {
    const senhaHash = bcrypt.hashSync(userData.senha, 10);

    try {
      const sql = `
        INSERT INTO users (nome, cnpj, email, senha, role, endereco, telefone)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await db.pool.query(sql, [
        userData.nome,
        userData.cnpj || null,
        userData.email,
        senhaHash,
        userData.role || 'USUARIO',
        userData.endereco || null,
        userData.telefone || null
      ]);

      return mapDbObjectToCamelCase(result.rows[0]);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualizar usuário
   */
  async update(id, userData) {
    const fields = [];
    const values = [];

    if (userData.nome) {
      fields.push('nome = ?');
      values.push(userData.nome);
    }
    if (userData.endereco !== undefined) {
      fields.push('endereco = ?');
      values.push(userData.endereco);
    }
    if (userData.telefone !== undefined) {
      fields.push('telefone = ?');
      values.push(userData.telefone);
    }
    if (userData.senha) {
      fields.push('senha = ?');
      values.push(bcrypt.hashSync(userData.senha, 10));
    }

    if (fields.length === 0) return await this.findById(id);

    try {
      values.push(id);
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      await db.runAsync(sql, values);

      return await this.findById(id);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Deletar usuário
   */
  async delete(id) {
    try {
      return await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  /**
   * Listar todos os usuários
   */
  async findAll() {
    try {
      const results = await db.allAsync('SELECT * FROM users', []);
      return mapDbArrayToCamelCase(results);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return [];
    }
  }

  /**
   * Verificar senha
   */
  verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }
}

module.exports = new UserRepository();

