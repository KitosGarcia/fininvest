/**
 * Controller de Pagamentos de Contribuição
 * ----------------------------------------
 * Rotas atendidas:
 *   GET  /contribution-payments/pending/:member_id
 *   GET  /contribution-payments/by-contribution/:contribution_id
 *   POST /contribution-payments/               (criar pagamento)
 *   POST /contribution-payments/:payment_id/receipt  (gerar recibo)
 */

const ContributionPayment = require("../models/contributionPaymentModel");
const Contribution        = require("../models/contributionModel");
const AuditLogService     = require("../services/auditLogService");
const receiptService      = require("../services/receiptService");  // gera PDF
const paymentRepo         = require("../repositories/paymentRepo"); // findByContribution

// ────────────────────────────────────────────────────────────────────────────────
// 🔍 Contribuições pendentes por sócio
async function getPendingForMember(req, res) {
  const memberId = Number(req.params.member_id);
  if (!Number.isFinite(memberId))
    return res.status(400).json({ message: "member_id inválido" });

  try {
    const pendentes = await Contribution.findPendingByMember(memberId);
    return res.json(pendentes);                       // 200 OK
  } catch (err) {
    console.error("Erro ao buscar contribuições pendentes:", err);
    return res.status(500).json({
      message: "Erro ao buscar contribuições pendentes",
      error:   err.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// 🔍 Pagamentos ligados a UMA contribuição
async function listByContribution(req, res) {
  const contributionId = Number(req.params.contribution_id);
  if (!Number.isFinite(contributionId))
    return res.status(400).json({ message: "contribution_id inválido" });

  try {
    const rows = await paymentRepo.findByContribution(contributionId);
    return res.json(rows);                            // 200 OK
  } catch (err) {
    console.error("Erro ao buscar pagamentos da contribuição:", err);
    return res.status(500).json({
      message: "Erro ao buscar pagamentos",
      error:   err.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// 💰 Criar e distribuir pagamento
async function createPayment(req, res) {
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

  if (!created_by)
    return res.status(401).json({ message: "Usuário não autenticado corretamente" });

  if (!member_id || !amount || !bank_account_id || !contribution_ids?.length)
    return res.status(400).json({ message: "Campos obrigatórios em falta" });

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

    await AuditLogService.logAction({
      user_id:     created_by,
      action:      "contribution_payment_created",
      entity_type: "contribution_payment",
      entity_id:   result.payment_ids?.[0] ?? null,
      details:     { member_id, amount, payment_date, saldadas: result.applied_to },
      ip_address,
    });

    return res.status(201).json({
      message: "Pagamento processado com sucesso",
      ...result,
    });
  } catch (err) {
    await AuditLogService.logAction({
      user_id:     created_by,
      action:      "contribution_payment_failed",
      entity_type: "contribution_payment",
      details:     { error: err.message, member_id, amount },
      ip_address,
    });

    return res.status(500).json({
      message: "Erro ao processar pagamento",
      error:   err.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// 🧾 Gerar (ou devolver) recibo em PDF
async function generateReceipt(req, res) {
  const paymentId  = Number(req.params.payment_id);
  const requestedBy = req.user?.user_id;

  if (!Number.isFinite(paymentId))
    return res.status(400).json({ message: "payment_id inválido" });

  try {
    const pdfBuffer = await receiptService.buildPDF(paymentId, requestedBy);

    // devolve o ficheiro para download imediato
    return res
      .status(201)
      .set({ "Content-Type": "application/pdf" })
      .send(pdfBuffer);
  } catch (err) {
    console.error("Erro ao gerar recibo:", err);
    return res.status(500).json({
      message: "Erro ao gerar recibo",
      error:   err.message,
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────────
module.exports = {
  getPendingForMember,
  listByContribution,
  createPayment,
  generateReceipt,
};
