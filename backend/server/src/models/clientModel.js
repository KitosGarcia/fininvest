const db = require("../config/db");

const Client = {
  findAll: async () => {
    const { rows } = await db.query("SELECT * FROM clients ORDER BY name ASC");
    return rows;
  },

  findById: async (client_id) => {
    const { rows } = await db.query("SELECT * FROM clients WHERE client_id = $1", [client_id]);
    return rows[0] || null;
  },

  findByType: async (client_type) => {
    const { rows } = await db.query("SELECT * FROM clients WHERE client_type = $1 ORDER BY name ASC", [client_type]);
    return rows;
  },

  findByMemberId: async (member_id) => {
    const { rows } = await db.query("SELECT * FROM clients WHERE member_id = $1", [member_id]);
    return rows[0] || null;
  },

  create: async (data) => {
    const {
      member_id,
      name,
      document_id,
      email,
      phone,
      address,
      client_type,
      birth_date,
      gender,
      nationality,
      marital_status,
      occupation,
      income_range,
      pep_flag,
      status,
      risk_profile,
      credit_rating,
      documents,
    } = data;

    const query = `
      INSERT INTO clients (
        member_id, name, document_id, email, phone, address,
        client_type, birth_date, gender, nationality, marital_status,
        occupation, income_range, pep_flag, status,
        risk_profile, credit_rating, documents
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15,
        $16, $17, $18
      )
      RETURNING *;
    `;

    const values = [
      member_id ? parseInt(member_id, 10) : null,
      name?.trim(),
      document_id?.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      address?.trim() || null,
      client_type,
      birth_date || null,
      gender || null,
      nationality?.trim() || null,
      marital_status?.trim() || null,
      occupation?.trim() || null,
      income_range?.trim() || null,
      pep_flag ?? false,
      status || "ativo",
      risk_profile || "",
      credit_rating || "",
      documents || null,
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  update: async (client_id, data) => {
    const {
      member_id,
      name,
      document_id,
      email,
      phone,
      address,
      client_type,
      birth_date,
      gender,
      nationality,
      marital_status,
      occupation,
      income_range,
      pep_flag,
      status,
      risk_profile,
      credit_rating,
      documents,
    } = data;

    const query = `
      UPDATE clients SET
        member_id = $1, name = $2, document_id = $3, email = $4, phone = $5,
        address = $6, client_type = $7, birth_date = $8, gender = $9,
        nationality = $10, marital_status = $11, occupation = $12,
        income_range = $13, pep_flag = $14, status = $15,
        risk_profile = $16, credit_rating = $17, documents = $18,
        updated_at = CURRENT_TIMESTAMP
      WHERE client_id = $19
      RETURNING *;
    `;

    const values = [
      member_id ? parseInt(member_id, 10) : null,
      name?.trim(),
      document_id?.trim(),
      email?.trim() || null,
      phone?.trim() || null,
      address?.trim() || null,
      client_type,
      birth_date || null,
      gender || null,
      nationality?.trim() || null,
      marital_status?.trim() || null,
      occupation?.trim() || null,
      income_range?.trim() || null,
      pep_flag ?? false,
      status || "ativo",
      risk_profile || "",
      credit_rating || "",
      documents || null,
      client_id,
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  },

  delete: async (client_id) => {
    try {
      const { rows } = await db.query("DELETE FROM clients WHERE client_id = $1 RETURNING *;", [client_id]);
      return rows[0] || null;
    } catch (error) {
      if (error.code === "23503") {
        throw new Error("Cliente não pode ser removido — existem registros dependentes.");
      }
      throw error;
    }
  },

  findLoans: async (client_id) => {
    console.warn("⚠️ Método findLoans ainda não implementado.");
    return [];
  },
};

module.exports = Client;
