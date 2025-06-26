const db = require("../config/db");
const bcrypt = require("bcrypt");

const User = {
  findById: async (id) => {
    const query = `
      SELECT u.user_id, u.member_id, u.username,
             r.role_name, u.two_factor_enabled,
             u.last_login, u.created_at
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      WHERE u.user_id = $1;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  findByUsername: async (username) => {
    const query = `
      SELECT u.user_id, u.username, u.password_hash,
             u.role_id, r.role_name
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      WHERE u.username = $1
      LIMIT 1;
    `;
    const { rows } = await db.query(query, [username]);
    return rows[0] || null;
  },

  create: async ({ member_id, username, password, role_id = 2, two_factor_enabled = false }) => {
    const password_hash = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (member_id, username, password_hash, role_id, two_factor_enabled)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, member_id, username, role_id, created_at;
    `;
    const values = [
      member_id ? parseInt(member_id, 10) : null,
      username,
      password_hash,
      role_id,
      two_factor_enabled,
    ];

    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Erro ao criar utilizador:", error);
      if (error.code === "23505") throw new Error("Username ou Member ID já existe.");
      if (error.code === "23503") throw new Error("Member ID não encontrado.");
      throw error;
    }
  },

  verifyPassword: async (username, password) => {
    const user = await User.findByUsername(username);
    if (!user) return false;
    return await bcrypt.compare(password, user.password_hash);
  },

  update: async (id, updates) => {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (["member_id", "username", "role_id", "two_factor_enabled"].includes(key)) {
        fields.push(`${key} = $${i++}`);
        values.push(val);
      }
    }

    if (!fields.length) return await User.findById(id);

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users SET ${fields.join(", ")}
      WHERE user_id = $${i}
      RETURNING user_id, member_id, username, role_id, two_factor_enabled, updated_at;
    `;

    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error(`Erro ao atualizar utilizador ID ${id}:`, error);
      if (error.code === "23505") throw new Error("Username ou Member ID já existe.");
      if (error.code === "23503") throw new Error("Member ID inválido.");
      throw error;
    }
  },

  updateLastLogin: async (id) => {
    try {
      await db.query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1;", [id]);
    } catch (error) {
      console.error(`Erro ao atualizar último login do user ${id}:`, error);
    }
  },

  listAll: async () => {
    const query = `
      SELECT u.user_id, u.member_id, u.username, u.role_id,
             r.role_name, u.two_factor_enabled
      FROM users u
      JOIN roles r ON r.role_id = u.role_id
      ORDER BY u.username;
    `;
    const { rows } = await db.query(query);
    return rows;
  },
};

module.exports = User;
