const ContributionPayment = require("../models/contributionPaymentModel");
const Contribution = require("../models/contributionModel");
const AuditLogService = require("../services/auditLogService");
const { authenticateToken } = require("../middleware/authMiddleware");

const contributionPaymentController = {
  // 🔍 Buscar todas as contribuições pendentes por sócio
  getPendingForMember: async (req, res) => {
    const member_id = parseInt(req.params.member_id, 10);
    try {
      const pendentes = await Contribution.findPendingByMember(member_id);
      res.json(pendentes);
    } catch (err) {
      console.error("Erro ao buscar contribuições pendentes:", err);
      res.status(500).json({
        message: "Erro ao buscar contribuições pendentes",
        error: err.message,
      });
    }
  },

  // 🔍 Buscar pagamentos vinculados a uma contribuição específica
  getByContribution: async (req, res) => {
    const contribution_id = parseInt(req.params.contribution_id, 10);
    try {
      const result = await ContributionPayment.findByContributionId(contribution_id);
      res.json(result);
    } catch (err) {
      console.error("Erro ao buscar pagamentos da contribuição:", err);
      res.status(500).json({
        message: "Erro ao buscar pagamentos",
        error: err.message,
      });
    }
  },

  // 💰 Criar e distribuir pagamento
createPayment: async (req, res) => {
    const {
      member_id,
      amount,
      bank_account_id,
      receipt_url,
      payment_date,
      method,
      notes,
      contribution_ids,
    } = req.body;

    const created_by = req.user?.user_id;
    const ip_address = req.ip;

      if (!created_by) {
    return res.status(401).json({ message: "Usuário não autenticado corretamente" });
  }

    if (!member_id || !amount || !bank_account_id || !contribution_ids?.length) {
      return res.status(400).json({
        message: "Campos obrigatórios em falta",
      });
    }

    try {
      const result = await ContributionPayment.processPayment({
        member_id,
        amount,
        bank_account_id,
        created_by,
        receipt_url,
        payment_date,
        method,
        notes,
        contribution_ids,
      });

      AuditLogService.logAction({
        user_id: created_by,
        action: "contribution_payment_created",
        entity_type: "contribution_payment",
        entity_id: result.payment_ids?.[0] || null,
        details: { member_id, amount, payment_date, saldadas: result.applied_to },
        ip_address,
      });

      res.status(201).json({
        message: "Pagamento processado com sucesso",
        ...result,
      });
    } catch (err) {
      AuditLogService.logAction({
        user_id: created_by,
        action: "contribution_payment_failed",
        entity_type: "contribution_payment",
        details: { error: err.message, member_id, amount },
        ip_address,
      });

      res.status(500).json({
        message: "Erro ao processar pagamento",
        error: err.message,
      });
    }
  },
};

module.exports = contributionPaymentController;
