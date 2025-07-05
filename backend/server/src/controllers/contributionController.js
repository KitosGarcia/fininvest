const Contribution = require("../models/contributionModel");
const { authorizePermission } = require("../middleware/authMiddleware");
const db = require('../db/db');
const { calculateDueDate } = require("../utils/dateUtils");
const { createAlert } = require("../utils/alertUtils");




const getAllContributions = async (req, res) => {
  try {
    const filters = {
      memberId: req.query.memberId,
      status: req.query.status,
      year: req.query.year,
      month: req.query.month
    };
    const contributions = await Contribution.findAll(filters);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar contribuições", error: error.message });
  }
};

const getContributionById = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribuição não encontrada" });
    }
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar contribuição", error: error.message });
  }
};

const createContribution = async (req, res) => {
  const {
    member_id,
    type,
    reference_month,
    amount_due,
    due_date,
    notes
  } = req.body;

  if (!member_id || !type || !reference_month || !amount_due || !due_date) {
    return res.status(400).json({ message: "Campos obrigatórios em falta." });
  }

  try {
    const contribution = await Contribution.create({
      member_id,
      type,
      reference_month,
      amount_due,
      due_date,
      notes
    });

    res.status(201).json({ message: "Contribuição criada com sucesso", contribution });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: "Já existe contribuição deste tipo para esse sócio nesse mês." });
    }
    res.status(500).json({ message: "Erro ao criar contribuição", error: error.message });
  }
};

const updateContribution = async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  try {
    const existing = await Contribution.findById(id);
    if (!existing) return res.status(404).json({ message: "Contribuição não encontrada" });

    if (existing.status === "pago") {
      return res.status(400).json({ message: "Não é possível editar uma contribuição já paga." });
    }

    const updated = await Contribution.update(id, updates);
    res.json({ message: "Contribuição atualizada com sucesso", contribution: updated });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar contribuição", error: error.message });
  }
};

const deleteContribution = async (req, res) => {
  const id = req.params.id;

  try {
    const existing = await Contribution.findById(id);
    if (!existing) return res.status(404).json({ message: "Contribuição não encontrada" });

    if (existing.status === "pago") {
      return res.status(400).json({ message: "Não é possível apagar uma contribuição paga." });
    }

    const deleted = await Contribution.remove(id);
    res.json({ message: "Contribuição apagada com sucesso", contribution: deleted });
  } catch (error) {
    res.status(500).json({ message: "Erro ao apagar contribuição", error: error.message });
  }
};



const getStatusByMember = async (req, res) => {
  const memberId = req.params.memberId;

  try {
    const contributions = await db('contributions')
      .select('type', 'amount_due', 'amount_paid', 'status', 'reference_month')
      .where({ member_id: memberId })
      .orderBy('reference_month', 'asc');

    const totalQuotasAllResult = await db('contributions')
      .where({ type: 'quota' })
      .sum('amount_paid as total');
    const totalQuotasAll = Number(totalQuotasAllResult[0].total) || 1;

    const anos = {};
    let totalQuotasMember = 0;
    let totalTaxasPagas = 0;

    for (const c of contributions) {
      const date = new Date(c.reference_month);
      const ano = date.getFullYear();
      const mes = date.toLocaleString('pt-PT', { month: 'long' });

      if (!anos[ano]) {
        anos[ano] = {
          ano,
          quotas: [],
          taxas: [],
          statusAno: 'apto'
        };
      }

      const item = {
        mes,
        valor: Number(c.amount_due),
        status: c.status,
        amount_paid: Number(c.amount_paid) || 0
      };

      if (c.type === 'quota') {
        anos[ano].quotas.push(item);
        totalQuotasMember += item.amount_paid;
        if (c.status !== 'pago') anos[ano].statusAno = 'inapto';
      } else {
        anos[ano].taxas.push(item);
        totalTaxasPagas += item.amount_paid;
        if (c.status !== 'pago') anos[ano].statusAno = 'inapto';
      }
    }

    const member = await db('members')
      .select('name')
      .where({ member_id: memberId })
      .first();

    const response = {
      nome: member?.name || 'N/A',
      totalQuotasPagas: totalQuotasMember,
      totalTaxasPagas,
      totalQuotasFundo: totalQuotasAll,
      participacao: totalQuotasMember / totalQuotasAll,
      apto: Object.values(anos).every((a) => a.statusAno === 'apto'),
      anos: Object.values(anos)
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar status de contribuições:', error);
    res.status(500).json({ error: 'Erro interno ao processar status de contribuições' });
  }
};



const generateBulkContributions = async (req, res) => {
  const { year, tax_amount } = req.body;

  if (!year || !tax_amount || isNaN(tax_amount)) {
    return res.status(400).json({ message: "Ano e taxa são obrigatórios." });
  }

  try {
    const members = await db.raw("SELECT member_id FROM members WHERE status = 'ativo'");
    if (members.rows.length === 0) {
      return res.status(404).json({ message: "Nenhum sócio ativo encontrado." });
    }

    for (let month = 1; month <= 12; month++) {
      const reference_month = `${year}-${String(month).padStart(2, "0")}-01`; // ✅ Agora é um DATE válido
      const due_date = calculateDueDate(reference_month);

      for (const member of members.rows) {
        const { member_id } = member;

        // Obter quota do escalão
        const tier = await db.raw(`
          SELECT quota_amount FROM member_tiers 
          WHERE member_id = ? AND start_date <= ? AND (end_date IS NULL OR end_date >= ?)
          ORDER BY start_date DESC LIMIT 1
        `, [member_id, reference_month, reference_month]);

if (tier.rows.length === 0) {
  await createAlert({
    type: 'contribuicao',
    category: 'bulk_generation',
    message: `Sócio ${member_id} sem escalão válido em ${reference_month}`,
    member_id,
    related_id: null,
    description: `Contribuição não gerada para o sócio ${member_id} porque não possui escalão ativo em ${reference_month}.`
  });
  continue;
}

const quota_amount = parseFloat(tier.rows[0].quota_amount);

        // Verificar se já existe contribuição para este mês
        const existing = await db.raw(`
          SELECT 1 FROM contributions 
          WHERE member_id = ? AND reference_month = ? AND is_active = true
        `, [member_id, reference_month]);

        if (existing.rows.length > 0) continue;

        // Criar contribuição de quota
        await db.raw(`
          INSERT INTO contributions 
            (member_id, reference_month, type, amount_due, due_date, status, is_active, created_at)
          VALUES 
            (?, ?, 'quota', ?, ?, 'por_pagar', true, NOW())
        `, [member_id, reference_month, quota_amount, due_date]);

        // Criar contribuição de taxa
        await db.raw(`
          INSERT INTO contributions 
            (member_id, reference_month, type, amount_due, due_date, status, is_active, created_at)
          VALUES 
            (?, ?, 'taxa', ?, ?, 'por_pagar', true, NOW())
        `, [member_id, reference_month, tax_amount, due_date]);
      }
    }

    res.status(200).json({ message: "Contribuições geradas com sucesso." });
  } catch (err) {
    console.error("Erro ao gerar contribuições:", err);
    res.status(500).json({ message: "Erro interno ao gerar contribuições." });
  }
};


module.exports = {
  getAllContributions,
  getContributionById,
  createContribution,
  updateContribution,
  deleteContribution,
  getStatusByMember,
  generateBulkContributions
};
