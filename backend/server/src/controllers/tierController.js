const db = require('../config/db');
const { auditLog } = require('../utils/auditLogger');

// ✅ Criar novo Tier
const createTier = async (req, res) => {
  try {
    const { member_id, quota_amount, start_date, end_date } = req.body;

    const memberId = parseInt(member_id, 10);
    const quotaAmount = parseFloat(quota_amount);
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const tierName = `Escalão ${quotaAmount.toFixed(2)}`; // ← Nome automático

    // Verifica sobreposição de períodos
    const existing = await db.query(
      `SELECT * FROM member_tiers 
       WHERE member_id = $1
         AND start_date <= $2
         AND end_date >= $3
         AND is_active = true`,
      [memberId, endDate, startDate]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe um escalão ativo para esse período.' });
    }

    const result = await db.query(
      `INSERT INTO member_tiers 
       (member_id, tier_name, quota_amount, start_date, end_date, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
       RETURNING *`,
      [memberId, tierName, quotaAmount, startDate, endDate]
    );

    await auditLog(req.user.user_id, 'create', 'member_tiers', result.rows[0].tier_id, result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar tier:', error);
    res.status(500).json({ message: 'Erro interno ao criar escalão.' });
  }
};

// ✅ Listar todos os Tiers
const getTiers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT mt.*, m.name AS member_name
       FROM member_tiers mt
       JOIN members m ON m.member_id = mt.member_id
       WHERE mt.is_active = true
       ORDER BY m.name, mt.start_date`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar tiers:', error);
    res.status(500).json({ message: 'Erro interno ao listar escalões.' });
  }
};

// ✅ Atualizar Tier
const updateTier = async (req, res) => {
  try {
    const { tier_id } = req.params;
    const { quota_amount, start_date, end_date } = req.body;

    const quotaAmount = parseFloat(quota_amount);
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const result = await db.query(
      `UPDATE member_tiers
       SET quota_amount = $1, start_date = $2, end_date = $3, updated_at = NOW()
       WHERE tier_id = $4
       RETURNING *`,
      [quotaAmount, startDate, endDate, tier_id]
    );

    await auditLog(req.user.user_id, 'update', 'member_tiers', tier_id, result.rows[0]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar tier:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar escalão.' });
  }
};

// ✅ Soft delete de Tier
const deleteTier = async (req, res) => {
  try {
    const { tier_id } = req.params;

    await db.query(
      `UPDATE member_tiers SET is_active = false, updated_at = NOW() WHERE tier_id = $1`,
      [tier_id]
    );

    await auditLog(req.user.user_id, 'delete', 'member_tiers', tier_id);

    res.json({ message: 'Escalão desativado com sucesso.' });
  } catch (error) {
    console.error('Erro ao apagar tier:', error);
    res.status(500).json({ message: 'Erro interno ao apagar escalão.' });
  }
};

// ✅ Exports organizados
module.exports = {
  createTier,
  getTiers,
  updateTier,
  deleteTier,
};
