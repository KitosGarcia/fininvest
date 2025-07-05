const db = require('../db/db');

/**
 * Cria um alerta no sistema.
 * @param {Object} alertData - Dados do alerta.
 * @param {string} alertData.type - Tipo do alerta (ex: 'contribuicao').
 * @param {string} alertData.message - Mensagem curta (exibe no sino).
 * @param {string} [alertData.category] - Categoria extra (opcional).
 * @param {number} [alertData.member_id] - ID do sócio relacionado (opcional).
 * @param {number} [alertData.related_id] - ID de referência do registo afetado (ex: ID da contribuição).
 * @param {string} [alertData.description] - Texto detalhado (opcional).
 */
async function createAlert({ type, message, category, member_id, related_id, description }) {
  try {
    await db('alerts').insert({
      type,
      message,
      category: category || null,
      member_id: member_id || null,
      related_id: related_id || null,
      description: description || null,
      is_read: false,
      created_at: new Date()
    });
  } catch (err) {
    console.error("Erro ao criar alerta:", err);
  }
}

module.exports = {
  createAlert
};
