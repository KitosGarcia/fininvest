const db = require('../config/db');

exports.auditLog = async (user_id, action, table_name, record_id, data = null) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action_type, table_name, record_id, data, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [user_id, action, table_name, record_id, data ? JSON.stringify(data) : null]
    );
  } catch (err) {
    console.error('Erro ao gravar log de auditoria:', err);
  }
};
