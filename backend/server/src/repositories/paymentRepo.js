/**
 * Repositório de contribution_payments
 * ------------------------------------
 * Depende de Knex exportado em ../db
 */

const db = require("../db/db"); // ajuste o caminho se o ficheiro for diferente


// 🔍 Pagamento por ID (para recibo)
exports.findById = (paymentId) =>
  db("payments as p")
    .leftJoin("members as m", "m.member_id", "p.member_id")
    .select(
      "p.payment_id",
      "p.member_id",
      "m.name as member_name",
      "p.amount",
      "p.method",
      "p.payment_date",
      "p.receipt_url"
    )
    .where("p.payment_id", paymentId)
    .first();

// 🧾 URL do recibo (mantém em payments)
exports.attachReceipt = (paymentId, url, userId) =>
  db("payments")
    .where({ payment_id: paymentId })
    .update({
      receipt_url: url,
      updated_by : userId,
      updated_at : db.fn.now(),
    });


// 🔍 Pagamentos de UMA contribuição
exports.findByContribution = (contributionId) => {
  return db("contribution_payments as cp")        // pivô
    .join("payments as p", "p.payment_id", "cp.payment_id")
    .select(
      "p.payment_id",
      "p.payment_date",
      "p.method",
      "cp.amount",          // parte deste pagamento que salda a contribuição
      "p.receipt_url",
      "p.notes",
      "p.created_by"
    )
    .where("cp.contribution_id", contributionId)
    .orderBy("p.payment_date");
};
// — opcional (caso uses o worker que envia e-mail) —
// Pagamentos com recibo gerado mas ainda não enviado
exports.findNotSent = () => {
  return db("contribution_payments")
    .whereNull("is_sent")
    .andWhereNotNull("receipt_url");
};

// Marca como enviado
exports.markSent = (paymentId) => {
  return db("contribution_payments")
    .where({ payment_id: paymentId })
    .update({ is_sent: true });
};
