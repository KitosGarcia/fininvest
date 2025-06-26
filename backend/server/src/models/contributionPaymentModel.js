const db = require("../config/db");
const Contribution = require("./contributionModel");

const ContributionPayment = {
// Registrar um pagamento (pode saldar várias contribuições)
create: async ({ bank_account_id, amount, created_by, receipt_url = null }) => {
const client = await db.connect();
try {
await client.query("BEGIN");

  let remaining = parseFloat(amount);
  const now = new Date();

  // Buscar contribuições pendentes ordenadas por data (mais antigas primeiro)
  const contribQuery = `
    SELECT * FROM contributions 
    WHERE status IN ('por_pagar', 'parcial') 
    ORDER BY due_date ASC
    FOR UPDATE;
  `;
  const { rows: pendingContributions } = await client.query(contribQuery);

  const paymentIds = [];
  for (const contrib of pendingContributions) {
    const due = parseFloat(contrib.amount_due);
    const paid = parseFloat(contrib.amount_paid);
    const toPay = due - paid;

    if (toPay <= 0 || remaining <= 0) continue;

    const payNow = Math.min(remaining, toPay);

    // Registrar pagamento parcial ou total
    const insertPayment = `
      INSERT INTO contribution_payments (
        contribution_id, bank_account_id, amount,
        receipt_url, created_by
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [
      contrib.contribution_id,
      bank_account_id,
      payNow,
      receipt_url,
      created_by
    ];
    const { rows } = await client.query(insertPayment, values);
    paymentIds.push(rows[0]);

    // Atualizar contribuição
    const newAmountPaid = paid + payNow;
    let newStatus = "parcial";
    let paidAt = null;
    if (newAmountPaid >= due) {
      newStatus = "pago";
      paidAt = now;
    }

    const updateContrib = `
      UPDATE contributions 
      SET amount_paid = $1, status = $2, paid_at = $3, updated_at = CURRENT_TIMESTAMP
      WHERE contribution_id = $4;
    `;
    await client.query(updateContrib, [
      newAmountPaid,
      newStatus,
      paidAt,
      contrib.contribution_id
    ]);

    // Atualizar saldo da conta bancária
    const updateBalance = `
      UPDATE bank_accounts 
      SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP
      WHERE account_id = $2;
    `;
    await client.query(updateBalance, [payNow, bank_account_id]);

    remaining -= payNow;
  }

  // Se ainda sobra valor, podemos preparar geração adiantada de contribuição futura (a implementar)
  if (remaining > 0) {
    console.warn("Pagamento excedente. Valor restante: " + remaining);
    // lógica futura para criar contribuição do próximo mês
  }

  await client.query("COMMIT");
  return paymentIds;
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Erro ao registrar pagamento de contribuição:", error);
  throw error;
} finally {
  client.release();
}

},

// Listar pagamentos por contribuição
findByContributionId: async (contribution_id) => {
const query = 'SELECT * FROM contribution_payments WHERE contribution_id = $1 ORDER BY payment_date ASC;';
const { rows } = await db.query(query, [contribution_id]);
return rows;
},

// Listar pagamentos por sócio
findByMemberId: async (member_id) => {
const query = 'SELECT p.* FROM contribution_payments p JOIN contributions c ON c.contribution_id = p.contribution_id WHERE c.member_id = $1 ORDER BY p.payment_date ASC;';
const { rows } = await db.query(query, [member_id]);
return rows;
},

};

module.exports = ContributionPayment;