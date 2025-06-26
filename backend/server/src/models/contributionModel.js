// src/models/contributionModel.js
const db = require("../config/db");

const Contribution = {
  // Criar uma nova contribuição (quota ou taxa)
  create: async ({
    member_id,
    type,
    reference_month,
    amount_due,
    due_date,
    notes = null,
  }) => {
    const query = `
      INSERT INTO contributions (
        member_id, type, reference_month, amount_due, due_date, notes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [member_id, type, reference_month, amount_due, due_date, notes];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Buscar todas contribuições (com filtros opcionais)
  findAll: async ({ member_id, type, status, month } = {}) => {
    let query = `SELECT * FROM contributions WHERE is_active = TRUE`;
    const params = [];

    if (member_id) {
      params.push(member_id);
      query += ` AND member_id = $${params.length}`;
    }
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (month) {
      params.push(month);
      query += ` AND reference_month = $${params.length}`;
    }

    query += ` ORDER BY reference_month DESC, type`;

    const { rows } = await db.query(query, params);
    return rows;
  },

  // Buscar uma contribuição específica
  findById: async (id) => {
    const query = `SELECT * FROM contributions WHERE contribution_id = $1`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  // Atualizar contribuição
  update: async (id, fields) => {
    const updates = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(fields)) {
      updates.push(`${key} = $${idx++}`);
      values.push(value);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE contributions SET ${updates.join(", ")}
      WHERE contribution_id = $${idx}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);
    return rows[0] || null;
  },

  // Inativar contribuição (soft delete)
  softDelete: async (id) => {
    const query = `
      UPDATE contributions
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE contribution_id = $1
      RETURNING *;
    `;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  // Verificar duplicação por sócio, tipo e mês
existsForMonth: async (member_id, type, reference_month) => {
  const query = `
    SELECT 1 FROM contributions
    WHERE member_id = $1 AND type = $2 AND reference_month = $3
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [member_id, type, reference_month]);
  return rows.length > 0;
},
};
module.exports = Contribution;
