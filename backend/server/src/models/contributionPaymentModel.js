const db = require("../config/db");

const ContributionPayment = {
  processPayment: async ({
    member_id,
    amount,
    bank_account_id,
    created_by,
    receipt_url,
    payment_date,
    method,
    notes,
    contribution_ids
  }) => {
    const client = await db.pool.connect();
    try {
      await client.query("BEGIN");

      const now = new Date();
      let remaining = parseFloat(amount);

      // 1. Criar o pagamento principal
      const insertPayment = `
        INSERT INTO payments (
          member_id, amount, payment_date, bank_account_id, method, notes, receipt_url, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING payment_id;
      `;
      const { rows: paymentRows } = await client.query(insertPayment, [
        member_id,
        amount,
        payment_date || now,
        bank_account_id,
        method,
        notes,
        receipt_url,
        created_by,
      ]);
      const payment_id = paymentRows[0].payment_id;

      const applied_to = [];
      for (const id of contribution_ids) {
        const { rows } = await client.query(
          "SELECT * FROM contributions WHERE contribution_id = $1 FOR UPDATE",
          [id]
        );
        const contrib = rows[0];
        if (!contrib) continue;

        const due = parseFloat(contrib.amount_due);
        const paid = parseFloat(contrib.amount_paid);
        const toPay = due - paid;
        if (toPay <= 0 || remaining <= 0) continue;

        const payNow = Math.min(remaining, toPay);

        // 2. Criar ligação em contribution_payments
        await client.query(
          `INSERT INTO contribution_payments (contribution_id, payment_id, amount)
           VALUES ($1, $2, $3)`,
          [id, payment_id, payNow]
        );

        // 3. Atualizar a contribuição
        const newPaid = paid + payNow;
        const newStatus = newPaid >= due ? "pago" : "parcial";
        const paidAt = newPaid >= due ? now : null;

        await client.query(
          `UPDATE contributions
           SET amount_paid = $1, status = $2, paid_at = $3, updated_at = CURRENT_TIMESTAMP
           WHERE contribution_id = $4`,
          [newPaid, newStatus, paidAt, id]
        );

        applied_to.push({ contribution_id: id, paid: payNow });
        remaining -= payNow;
      }

      // 4. Atualizar saldo da conta bancária
      await client.query(
        `UPDATE bank_accounts
         SET current_balance = current_balance + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE account_id = $2`,
        [amount, bank_account_id]
      );

      await client.query("COMMIT");
      return {
        payment_id,
        applied_to,
        remaining_amount: remaining,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = ContributionPayment;
