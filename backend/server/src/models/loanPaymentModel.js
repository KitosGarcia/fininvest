const db = require("../config/db");

const LoanPayment = {
  // Find all payments for a specific loan
  findByLoanId: async (loanId) => {
    const query = `
        SELECT lp.* 
        FROM loan_payments lp 
        WHERE lp.loan_id = $1 
        ORDER BY lp.installment_number ASC`;
    try {
      const { rows } = await db.query(query, [loanId]);
      return rows;
    } catch (error) {
      console.error(`Error finding payments for loan ID ${loanId}:`, error);
      throw error;
    }
  },

  // Find a specific payment by ID
  findById: async (id) => {
    const query = "SELECT * FROM loan_payments WHERE payment_id = $1";
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error finding payment with ID ${id}:`, error);
      throw error;
    }
  },

  // Create multiple payment schedule entries for a loan (usually done when loan is activated)
  createSchedule: async (loanId, schedule) => {
    // schedule should be an array of objects: 
    // [{ installment_number, due_date, amount_due, principal_amount, interest_amount }, ...]
    if (!schedule || schedule.length === 0) {
      throw new Error("Payment schedule cannot be empty.");
    }

    const client = await db.pool.connect(); // Use a transaction
    try {
      await client.query("BEGIN");

      const query = `
        INSERT INTO loan_payments (loan_id, installment_number, due_date, amount_due, principal_amount, interest_amount, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *;
      `;

      const results = [];
      for (const payment of schedule) {
        const values = [
          loanId,
          payment.installment_number,
          payment.due_date,
          payment.amount_due,
          payment.principal_amount,
          payment.interest_amount,
        ];
        const { rows } = await client.query(query, values);
        results.push(rows[0]);
      }

      await client.query("COMMIT");
      return results;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Error creating payment schedule for loan ID ${loanId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  },

  // Record a payment received for an installment
  recordPayment: async (id, { amount_paid, payment_date, status, payment_proof_url, notes }) => {
    const query = `
      UPDATE loan_payments
      SET amount_paid = $1, payment_date = $2, status = $3, payment_proof_url = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
      WHERE payment_id = $6
      RETURNING *;
    `;
    const values = [amount_paid, payment_date || new Date(), status, payment_proof_url, notes, id];
    try {
      const { rows } = await db.query(query, values);
      // TODO: Consider creating a corresponding FundTransaction entry here or in a service layer
      return rows[0];
    } catch (error) {
      console.error(`Error recording payment for ID ${id}:`, error);
      throw error;
    }
  },

  // Update payment details (e.g., correct an entry, change status manually)
  update: async (id, updates) => {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Dynamically build SET clause
    for (const key in updates) {
        if (updates.hasOwnProperty(key) && key !== 'payment_id') { // Ensure key is valid and not the ID
            fields.push(`${key} = $${valueIndex++}`);
            values.push(updates[key]);
        }
    }

    if (fields.length === 0) {
        return await LoanPayment.findById(id); // No fields to update
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id); // Add the ID for the WHERE clause

    const query = `
      UPDATE loan_payments
      SET ${fields.join(', ')}
      WHERE payment_id = $${valueIndex}
      RETURNING *;
    `;

    try {
        const { rows } = await db.query(query, values);
        return rows[0];
    } catch (error) {
        console.error(`Error updating payment with ID ${id}:`, error);
        throw error;
    }
  },

  // Delete a specific payment record (Use with extreme caution, usually better to adjust)
  delete: async (id) => {
    const query = "DELETE FROM loan_payments WHERE payment_id = $1 RETURNING *;";
    try {
      const { rows } = await db.query(query, [id]);
      // TODO: Consider reversing any associated FundTransaction
      if (rows.length === 0) {
          return null;
      }
      return rows[0];
    } catch (error) {
      console.error(`Error deleting payment with ID ${id}:`, error);
      throw error;
    }
  }
};

module.exports = LoanPayment;
