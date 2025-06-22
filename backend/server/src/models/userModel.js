const db = require("../config/db");
const bcrypt = require("bcrypt");

const User = {
  // Encontrar utilizador por ID
  findById: async (id) => {
    const query = `
      SELECT u.user_id, u.member_id, u.username,
             r.role_name, u.two_factor_enabled,
             u.last_login, u.created_at
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      WHERE u.user_id = $1
    `;
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error finding user with ID ${id}:`, error);
      throw error;
    }
  },

  // Encontrar utilizador por username
  findByUsername: async (username) => {
    const query = `
      SELECT 
        u.user_id,
        u.username,
        u.password_hash,
        u.role_id,
        r.role_name AS role_name
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.username = $1
      LIMIT 1
    `;
    try {
      const { rows } = await db.query(query, [username]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error finding user with username ${username}:`, error);
      throw error;
    }
  },

  // Criar novo utilizador
  create: async ({ member_id, username, password, role_id = 2, two_factor_enabled = false }) => {
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const finalMemberId = member_id ? parseInt(member_id, 10) : null;

    const query = `
      INSERT INTO users (member_id, username, password_hash, role_id, two_factor_enabled)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, member_id, username, role_id, created_at;
    `;
    const values = [finalMemberId, username, password_hash, role_id, two_factor_enabled];

    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === '23505') {
        throw new Error('Username or linked Member ID already exists.');
      }
      if (error.code === '23503') {
        throw new Error('Associated Member ID not found.');
      }
      throw error;
    }
  },

  // Validar password
  verifyPassword: async (username, password) => {
    const user = await User.findByUsername(username);
    if (!user) return false;
    return await bcrypt.compare(password, user.password_hash);
  },

  // Atualizar utilizador
  update: async (id, { member_id, username, role_id, two_factor_enabled }) => {
    const fields = [];
    const values = [];
    let index = 1;

    if (member_id !== undefined) {
      fields.push(`member_id = $${index++}`);
      values.push(member_id ? parseInt(member_id, 10) : null);
    }
    if (username !== undefined) {
      fields.push(`username = $${index++}`);
      values.push(username);
    }
    if (role_id !== undefined) {
      fields.push(`role_id = $${index++}`);
      values.push(role_id);
    }
    if (two_factor_enabled !== undefined) {
      fields.push(`two_factor_enabled = $${index++}`);
      values.push(two_factor_enabled);
    }

    if (fields.length === 0) return await User.findById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE user_id = $${index} 
      RETURNING user_id, member_id, username, role_id, two_factor_enabled, updated_at;
    `;

    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      if (error.code === '23505') {
        throw new Error('Username or linked Member ID already exists.');
      }
      if (error.code === '23503') {
        throw new Error('Associated Member ID not found.');
      }
      throw error;
    }
  },

  // Atualizar data de último login
  updateLastLogin: async (id) => {
    const query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1";
    try {
      await db.query(query, [id]);
    } catch (error) {
      console.error(`Error updating last login for user ID ${id}:`, error);
    }
  },

  // Listar todos os utilizadores
  listAll: async () => {
    const query = `
      SELECT u.user_id,
             u.member_id,
             u.username,
             u.role_id,
             r.role_name,
             u.two_factor_enabled
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      ORDER BY u.username
    `;
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Error listing users:", error);
      throw error;
    }
  }
};

module.exports = User;
