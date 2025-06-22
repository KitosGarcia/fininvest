const db = require("../config/db");

const Contribution = {
  // Find all contributions (potentially with filters)
  findAll: async (filters = {}) => {
    let query = "SELECT c.*, m.name as member_name FROM contributions c JOIN members m ON c.member_id = m.member_id";
    const conditions = [];
    const values = [];
    let valueIndex = 1;

    if (filters.memberId) {
      conditions.push(`c.member_id = $${valueIndex++}`);
      values.push(filters.memberId);
    }
    if (filters.status) {
      conditions.push(`c.status = $${valueIndex++}`);
      values.push(filters.status);
    }
    if (filters.year) {
      conditions.push(`c.payment_year = $${valueIndex++}`);
      values.push(filters.year);
    }
     if (filters.month) {
      conditions.push(`c.payment_month = $${valueIndex++}`);
      values.push(filters.month);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY c.contribution_date DESC, c.created_at DESC";

    try {
      const { rows } = await db.query(query, values);
      return rows;
    } catch (error) {
      console.error("Error finding all contributions:", error);
      throw error;
    }
  },

  // Find a contribution by ID
  findById: async (id) => {
    const query = `
        SELECT c.*, m.name as member_name 
        FROM contributions c 
        JOIN members m ON c.member_id = m.member_id 
        WHERE c.contribution_id = $1`;
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error finding contribution with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new contribution record
  create: async ({ member_id, amount, contribution_date, payment_month, payment_year, payment_proof_url, status = 'pending' }) => {
    const query = `
      INSERT INTO contributions (member_id, amount, contribution_date, payment_month, payment_year, payment_proof_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [member_id, amount, contribution_date, payment_month, payment_year, payment_proof_url, status];
    try {
      const { rows } = await db.query(query, values);
      // TODO: Consider creating a corresponding FundTransaction entry here or in a service layer
      return rows[0];
    } catch (error) {
      console.error("Error creating contribution:", error);
      if (error.code === '23503') { // Foreign key violation
          throw new Error('Member not found.');
      }
      throw error;
    }
  },

  // Update an existing contribution (e.g., change status, add proof)
  update: async (id, { amount, contribution_date, payment_month, payment_year, payment_proof_url, status }) => {
    // Build the update query dynamically
    const fields = [];
    const values = [];
    let valueIndex = 1;

    if (amount !== undefined) { fields.push(`amount = $${valueIndex++}`); values.push(amount); }
    if (contribution_date !== undefined) { fields.push(`contribution_date = $${valueIndex++}`); values.push(contribution_date); }
    if (payment_month !== undefined) { fields.push(`payment_month = $${valueIndex++}`); values.push(payment_month); }
    if (payment_year !== undefined) { fields.push(`payment_year = $${valueIndex++}`); values.push(payment_year); }
    if (payment_proof_url !== undefined) { fields.push(`payment_proof_url = $${valueIndex++}`); values.push(payment_proof_url); }
    if (status !== undefined) { fields.push(`status = $${valueIndex++}`); values.push(status); }

    if (fields.length === 0) {
        return await Contribution.findById(id); // No fields to update
    }

    values.push(id); // Add the ID for the WHERE clause

    const query = `
      UPDATE contributions
      SET ${fields.join(', ')}
      WHERE contribution_id = $${valueIndex}
      RETURNING *;
    `;

    try {
      const { rows } = await db.query(query, values);
       // TODO: If status changes to 'confirmed', consider creating/updating FundTransaction
      return rows[0];
    } catch (error) {
      console.error(`Error updating contribution with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a contribution (Use with caution)
  delete: async (id) => {
    const query = "DELETE FROM contributions WHERE contribution_id = $1 RETURNING *;";
    try {
      const { rows } = await db.query(query, [id]);
      // TODO: Consider reversing any associated FundTransaction
      if (rows.length === 0) {
          return null; 
      }
      return rows[0];
    } catch (error) {
      console.error(`Error deleting contribution with ID ${id}:`, error);
      throw error;
    }
  },

  // Calculate total contributions for a member
  sumByMember: async (memberId) => {
      const query = "SELECT SUM(amount) as total_contributions FROM contributions WHERE member_id = $1 AND status = 'confirmed'";
      try {
          const { rows } = await db.query(query, [memberId]);
          return rows[0]?.total_contributions || 0;
      } catch (error) {
          console.error(`Error summing contributions for member ID ${memberId}:`, error);
          throw error;
      }
  },

   // Calculate total contributions for the fund
  sumTotalConfirmed: async () => {
      const query = "SELECT SUM(amount) as total_fund_contributions FROM contributions WHERE status = 'confirmed'";
      try {
          const { rows } = await db.query(query);
          return rows[0]?.total_fund_contributions || 0;
      } catch (error) {
          console.error("Error summing total confirmed contributions:", error);
          throw error;
      }
  }

};

module.exports = Contribution;
