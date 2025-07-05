const { createAlert } = require('../utils/alertUtils');
const db = require('../db/db');

// GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const { is_read, type } = req.query;

    const query = db('alerts').select('*').orderBy('created_at', 'desc');

    if (is_read !== undefined) query.where('is_read', is_read === 'true');
    if (type) query.where('type', type);

    const alerts = await query;
    res.json(alerts);
  } catch (error) {
    console.error("Erro ao buscar alertas:", error);
    res.status(500).json({ message: "Erro ao buscar alertas" });
  }
};

// PUT /api/alerts/:id/read
const markAlertAsRead = async (req, res) => {
  const alertId = req.params.id;

  try {
    const alert = await db('alerts').where({ alert_id: alertId }).first();

    if (!alert) {
      return res.status(404).json({ message: "Alerta não encontrado" });
    }

await db('alerts')
  .where({ alert_id: alertId })
  .update({
    is_read: true,
    read_at: new Date(),
  });


    res.json({ message: "Alerta marcado como lido" });
  } catch (error) {
    console.error("Erro ao atualizar alerta:", error);
    res.status(500).json({ message: "Erro ao atualizar alerta" });
  }
};

const checkMissingContributions = async (req, res) => {
  try {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);

    const members = await db("members").where({ status: 'ativo' });

    for (const member of members) {
      const contribs = await db("contributions")
        .where("member_id", member.member_id)
        .andWhere("reference_month", "<", currentMonth);

      if (contribs.length === 0) {
        await createAlert({
          type: 'contribuicao',
          category: 'missing_history',
          message: `Sócio ${member.member_id} sem contribuições até ${currentMonth}`,
          member_id: member.member_id,
          description: `O sócio ativo ${member.member_id} (${member.name}) não possui nenhuma contribuição registada até o mês corrente.`
        });
      }
    }

    res.json({ message: "Verificação concluída." });
  } catch (err) {
    console.error("Erro ao verificar contribuições faltantes:", err);
    res.status(500).json({ message: "Erro ao verificar contribuições." });
  }
};

module.exports = {
  getAlerts,
  markAlertAsRead,
  checkMissingContributions,
};
