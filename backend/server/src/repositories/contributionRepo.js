/**
 * Repositório de contributions
 * ----------------------------
 * Funções específicas usadas no recibo
 */

const db = require("../db/db");
// Contribuições quitadas por um pagamento
exports.findSettledByPayment = (paymentId) => {
  return db("contribution_payments as cp")
    .join("contributions as c", "c.contribution_id", "cp.contribution_id")
    .select(

      "c.contribution_id",
      "c.type",
      "c.reference_month as month",   // alias evita mudar o restante código
      "c.status",
      "cp.amount"
    )
    .where("cp.payment_id", paymentId);
};
// (Opcional) Contribuições pendentes de um sócio — caso
// prefiras chamar directamente do repositório em vez do model.
exports.findPendingByMember = (memberId) => {
  return db("contributions")
    .where({
      member_id: memberId,
    })
    .andWhere(function () {
      this.where("status", "por_pagar").orWhere("status", "parcial");
    })
    .orderBy("month");
};
