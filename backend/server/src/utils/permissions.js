const db = require("../config/db");

async function getPermissionsForRole(role_id) {
  const query = `
    SELECT module, can_view, can_create, can_update, can_delete
    FROM permissions
    WHERE role_id = $1
  `;

  const result = await db.query(query, [role_id]);
  return result.rows;
}

module.exports = {
  getPermissionsForRole,
};
