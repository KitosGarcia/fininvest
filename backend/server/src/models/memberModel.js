const db = require("../config/db");

const Member = {
  // Listar todos os membros
  findAll: async () => {
    const query = "SELECT * FROM members ORDER BY name ASC";
    const { rows } = await db.query(query);
    return rows;
  },

  // Buscar membro por ID
  findById: async (id) => {
    const query = "SELECT * FROM members WHERE member_id = $1";
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  },

  // Criar novo membro
  create: async ({ name, document_id, join_date, status = "active" }) => {
    const query = `
      INSERT INTO members (
        name, document_id, join_date, status
      ) VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      name?.trim(),
      document_id?.trim(),
      join_date ? new Date(join_date) : new Date(),
      status,
    ];

    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Erro ao criar membro:", error);
      if (error.code === "23505") {
        throw new Error("Já existe um membro com este documento.");
      }
      throw error;
    }
  },

  // Atualizar membro existente
  update: async (member_id, { name, document_id, join_date, status }) => {
    const query = `
      UPDATE members SET
        name = $1,
        document_id = $2,
        join_date = $3,
        status = $4,
        updated_at = CURRENT_TIMESTAMP
      WHERE member_id = $5
      RETURNING *;
    `;

    const values = [
      name?.trim(),
      document_id?.trim(),
      join_date ? new Date(join_date) : new Date(),
      status,
      member_id,
    ];

    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error(`Erro ao atualizar membro com ID ${member_id}:`, error);
      throw error;
    }
  },

  // "Remover" membro (soft delete)
  delete: async (member_id) => {
    const query = `
      UPDATE members
      SET status = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE member_id = $1
      RETURNING *;
    `;
    try {
      const { rows } = await db.query(query, [member_id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Erro ao desativar membro com ID ${member_id}:`, error);
      throw error;
    }
  },

  // Futura integração: contribuições do membro
  findContributions: async (memberId) => {
    console.warn("findContributions ainda não implementado.");
    return [];
  },

  // Futura integração: cálculo de participação
  calculateParticipation: async (memberId) => {
    console.warn("calculateParticipation ainda não implementado.");
    return 0;
  },
};

module.exports = Member;
