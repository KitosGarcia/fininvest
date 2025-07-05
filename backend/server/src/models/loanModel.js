const db = require("../config/db");


const Loan = {
  // Find all loans
findAll: async (filters = {}) => {
  let query = `
    SELECT l.*, c.name as client_name 
    FROM loans l 
    JOIN clients c ON l.client_id = c.client_id
  `;
  const conditions = [];
  const values = [];
  let valueIndex = 1;

  if (filters.loanId) {
    conditions.push(`l.loan_id = $${valueIndex++}`);
    values.push(filters.loanId);
  }
  if (filters.clientName) {
    conditions.push(`LOWER(c.name) ILIKE $${valueIndex++}`);
    values.push(`%${filters.clientName.toLowerCase()}%`);
  }
  if (filters.status) {
    conditions.push(`l.status = $${valueIndex++}`);
    values.push(filters.status);
  }
  if (filters.startDate) {
    conditions.push(`l.application_date >= $${valueIndex++}`);
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push(`l.application_date <= $${valueIndex++}`);
    values.push(filters.endDate);
  }

  // ⚠️ Aqui estava o erro: só adiciona WHERE se houver condições
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ' ORDER BY l.application_date DESC, l.created_at DESC';

  try {
    const { rows } = values.length > 0 
      ? await db.query(query, values) 
      : await db.query(query); // 🚨 este era o ponto do erro
    return rows;
  } catch (error) {
    console.error("Error finding all loans:", error);
    throw error;
  }
},


  // Find a loan by ID
  findById: async (id) => {
    const query = `
        SELECT l.*, c.name as client_name 
        FROM loans l 
        JOIN clients c ON l.client_id = c.client_id 
        WHERE l.loan_id = $1`;
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error finding loan with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new loan request (status is now passed in)
  create: async ({ client_id, amount_requested, interest_rate, loan_purpose, repayment_term_months, created_by_user_id, status = 'pending_approval', guarantees, application_form_data }) => {
    // DEBUG: Temporarily bypass finalStatus logic to force the passed status
    console.log(`DEBUG: Received status in Loan.create: ${status}`); // Add logging
    const debugStatus = status || 'pending_approval'; // Use passed status or default
    console.log(`DEBUG: Using status for INSERT: ${debugStatus}`);

    const query = `
      INSERT INTO loans (client_id, amount_requested, interest_rate, loan_purpose, repayment_term_months, status, created_by_user_id, guarantees, application_form_data, application_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
      RETURNING *;
    `;
    
    // Use the debugStatus directly in the values array
    const values = [client_id, amount_requested, interest_rate, loan_purpose, repayment_term_months, debugStatus, created_by_user_id, guarantees, application_form_data];
    
    try {
      console.log(`DEBUG: Executing query: ${query} with values: ${JSON.stringify(values)}`);
      const { rows } = await db.query(query, values);
      console.log(`DEBUG: Result from DB: ${JSON.stringify(rows[0])}`);
      return rows[0];
    } catch (error) {
      console.error("Error creating loan request:", error);
      // Handle foreign key constraint violation (e.g., client_id doesn't exist)
      if (error.code === '23503') { 
          throw new Error('Client not found.');
      }
      throw error;
    }
  },

  // Update loan details (e.g., status, approved amount, dates, URLs)
  update: async (id, updateData) => {
    // Build the update query dynamically based on provided fields
    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Add allowed fields to update
    const allowedFields = ["amount_approved", "approval_date", "disbursement_date", "status", "contract_url", "signed_contract_url", "credit_approval_proof_url", "approved_by_user_id"];

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            // Special handling for dates if needed (e.g., ensuring correct format)
            // if (field.includes('_date') && updateData[field]) { ... }
            fields.push(`${field} = $${valueIndex++}`);
            values.push(updateData[field]);
        }
    }

    if (fields.length === 0) {
        // No valid fields to update, return the existing loan
        console.warn(`No valid fields provided for updating loan ID ${id}`);
        return await Loan.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id); // Add the ID for the WHERE clause

    const query = `
      UPDATE loans
      SET ${fields.join(', ')}
      WHERE loan_id = $${valueIndex}
      RETURNING *;
    `;

    try {
      const { rows } = await db.query(query, values);
       if (rows.length === 0) {
          throw new Error(`Loan with ID ${id} not found for update.`);
      }
      return rows[0];
    } catch (error) {
      console.error(`Error updating loan with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a loan (Generally not recommended, prefer changing status)
  delete: async (id) => {
    // Check if loan status allows deletion (e.g., only 'pending_approval', 'rejected', 'cancelled')
    const loan = await Loan.findById(id);
    if (!loan) {
        throw new Error(`Loan with ID ${id} not found for deletion.`);
    }
    if (!['pending_approval', 'rejected', 'cancelled'].includes(loan.status)) {
        throw new Error(`Cannot delete loan with status: ${loan.status}. Consider cancelling it instead.`);
    }

    const query = "DELETE FROM loans WHERE loan_id = $1 RETURNING *;";
    try {
      // Consider transaction if related entities need cleanup (e.g., notifications)
      const { rows } = await db.query(query, [id]);
      // Note: Associated payments should not exist for these statuses, but check FKs/triggers
      return rows[0];
    } catch (error) {
       // Handle potential foreign key issues if payments exist and cascade isn't set
      console.error(`Error deleting loan with ID ${id}:`, error);
      if (error.code === '23503') { // FK violation
          throw new Error(`Cannot delete loan ID ${id} due to associated records (e.g., payments, transactions).`);
      }
      throw error;
    }
  },

  // Find loan payments (Requires LoanPayment model)
  findPayments: async (loanId) => {
      // This should ideally call LoanPayment.findByLoanId(loanId)
      console.warn("findPayments method in Loan model is a placeholder. Use LoanPayment model directly.");
      try {
          const paymentQuery = "SELECT * FROM loan_payments WHERE loan_id = $1 ORDER BY installment_number ASC";
          const { rows } = await db.query(paymentQuery, [loanId]);
          return rows;
      } catch (error) {
          console.error(`Error fetching payments for loan ID ${loanId}:`, error);
          throw error;
      }
  }

};

module.exports = Loan;

