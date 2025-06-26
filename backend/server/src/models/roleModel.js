const db = require("../config/db");

const Role = {
  getAll: async () => {
    const query = "SELECT role_id, role_name FROM roles ORDER BY role_name;";
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Erro ao listar roles:", error);
      throw error;
    }
  },
};

module.exports = Role;
