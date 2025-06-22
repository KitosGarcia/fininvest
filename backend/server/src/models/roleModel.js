const db = require("../config/db");

const Role = {
  getAll: async () => {
    const { rows } = await db.query(
      "SELECT role_id, role_name FROM roles ORDER BY role_name"
    );
    return rows;
  },
};

module.exports = Role;
