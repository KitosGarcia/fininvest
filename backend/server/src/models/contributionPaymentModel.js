const { pool } = require("../config/db");
const Contribution = require("./contributionModel");

const ContributionPayment = {
  processPayment: async ({
    member_id,
    amount,
    bank_account_id,
    created_by,
    receipt_url = null,
    payment_date,
    method = null,
    notes = null,
    contribution_ids = [],
  }) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let remaining = parseFloat(amount);
      const now = new Date();

      const getContribsQuery = `
        SELECT * FROM contributions 
        WHERE contribution_id = ANY($1::int[]) 
        ORDER BY due_date ASC
        FOR UPDATE;
      `;
      const { rows: selectedContributions } = await client.query(getContribsQuery, [contribution_ids]);

      const paymentIds = [];

      for (const contrib of selectedContributions) {
        const due = parseFloat(contrib.amount_due);
        const paid = parseFloat(contrib.amount_paid);
        const toPay = due - paid;

        if (toPay <= 0 || remaining <= 0) continue;

        const payNow = Math.min(remaining, toPay);

        const insertPayment = `
          INSERT INTO contribution_payments (
            contribution_id, bank_account_id, amount,
            payment_date, receipt_url, method, notes, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *;
        `;
        const values = [
          contrib.contribution_id,
          bank_account_id,
          payNow,
          payment_date || now,
          receipt_url,
          method,
          notes,
          created_by,
        ];
        const { rows } = await client.query(insertPayment, values);
        paymentIds.push(rows[0]);

        const newAmountPaid = paid + payNow;
        let newStatus = "parcial";
        let paidAt = null;
        if (newAmountPaid >= due) {
          newStatus = "pago";
          paidAt = payment_date || now;
        }

        await client.query(
          `UPDATE contributions SET amount_paid = $1, status = $2, paid_at = $3, updated_at = CURRENT_TIMESTAMP WHERE contribution_id = $4`,
          [newAmountPaid, newStatus, paidAt, contrib.contribution_id]
        );

        await client.query(
          `UPDATE bank_accounts SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP WHERE account_id = $2`,
          [payNow, bank_account_id]
        );

        await client.query(
          `INSERT INTO fund_transactions (
            bank_account_id, transaction_type, amount, transaction_date,
            description, related_entity_type, related_entity_id, recorded_by_user_id
          ) VALUES ($1, 'contribution_received', $2, $3, $4, 'contribution', $5, $6)`,
          [
            bank_account_id,
            payNow,
            payment_date || now,
            `Pagamento de contribuição ID ${contrib.contribution_id} (${contrib.type})`,
            contrib.contribution_id,
            created_by,
          ]
        );

        remaining -= payNow;
      }

      await client.query("COMMIT");
      return { payment_ids: paymentIds.map(p => p.payment_id), applied_to: contribution_ids, remaining_amount: remaining };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Listar pagamentos por contribuição
  findByContributionId: async (contribution_id) => {
    const query = `
      SELECT * FROM contribution_payments 
      WHERE contribution_id = $1 
      ORDER BY payment_date ASC;
    `;
    const { rows } = await pool.query(query, [contribution_id]);
    return rows;
  },

  // Listar pagamentos por sócio
  findByMemberId: async (member_id) => {
    const query = `
      SELECT p.* 
      FROM contribution_payments p 
      JOIN contributions c ON c.contribution_id = p.contribution_id 
      WHERE c.member_id = $1 
      ORDER BY p.payment_date ASC;
    `;
    const { rows } = await pool.query(query, [member_id]);
    return rows;
  },
};

module.exports = ContributionPayment;
