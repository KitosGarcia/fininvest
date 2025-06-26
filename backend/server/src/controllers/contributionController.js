const Contribution = require("../models/contributionModel");
const { authorizePermission } = require("../middleware/authMiddleware");

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

module.exports = {
  getAllContributions,
  getContributionById,
  createContribution,
  updateContribution,
  deleteContribution
};
