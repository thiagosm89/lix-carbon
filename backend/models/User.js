const db = require('../database/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  // Buscar usuário por email
  static async findByEmail(email) {
    try {
      return await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    } catch (error) {
      console.error('Erro ao buscar por email:', error);
      return null;
    }
  }

  // Buscar usuário por CNPJ
  static async findByCnpj(cnpj) {
    try {
      return await db.getAsync('SELECT * FROM users WHERE cnpj = ?', [cnpj]);
    } catch (error) {
      console.error('Erro ao buscar por CNPJ:', error);
      return null;
    }
  }

  // Buscar usuário por ID
  static async findById(id) {
    try {
      return await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
    } catch (error) {
      console.error('Erro ao buscar por ID:', error);
      return null;
    }
  }

  // Buscar usuário por email ou CNPJ
  static async findByEmailOrCnpj(identifier) {
    try {
      return await db.getAsync('SELECT * FROM users WHERE email = ? OR cnpj = ?', [identifier, identifier]);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
  }

  // Buscar todos os usuários por role
  static async findByRole(role) {
    try {
      return await db.allAsync('SELECT * FROM users WHERE role = ?', [role]);
    } catch (error) {
      console.error('Erro ao buscar por role:', error);
      return [];
    }
  }

  // Criar novo usuário
  static async create(userData) {
    const senhaHash = bcrypt.hashSync(userData.senha, 10);

    try {
      // PostgreSQL: usar RETURNING para obter o registro criado
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

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Verificar senha
  static verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  // Atualizar usuário
  static async update(id, userData) {
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

  // Deletar usuário
  static async delete(id) {
    try {
      return await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // Listar todos os usuários
  static async findAll() {
    try {
      return await db.allAsync('SELECT * FROM users', []);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return [];
    }
  }
}

module.exports = User;
