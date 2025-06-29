/**
 * Rotas de Contribution-Payments
 * ------------------------------
 * Base: /contribution-payments
 */

const express = require("express");
const router  = express.Router();
const {
  authenticateToken,
  authorizePermission,
} = require("../middleware/authMiddleware");
const controller = require("../controllers/contributionPaymentController");

// ⚙️ Protege todas as rotas
router.use(authenticateToken);

// 🔍 Contribuições pendentes por sócio
// GET /contribution-payments/pending/:member_id
router.get(
  "/pending/:member_id",
  authorizePermission("contributions", "view"),
  controller.getPendingForMember
);

// 🔍 Pagamentos de UMA contribuição
// GET /contribution-payments/by-contribution/:contribution_id
router.get(
  "/by-contribution/:contribution_id",
  authorizePermission("contributions", "view"),
  controller.listByContribution
);

// 💰 Criar pagamento
// POST /contribution-payments
router.post(
  "/",
  authorizePermission("contributions", "create"),
  controller.createPayment
);

// 🧾 Gerar / ver recibo
// POST /contribution-payments/:payment_id/receipt
router.post(
  "/:payment_id/receipt",
  authorizePermission("contributions", "view"),
  controller.generateReceipt
);

module.exports = router;
