const db = require("../config/db");

const Client = {
  // Find all clients
  findAll: async () => {
    const query = "SELECT * FROM clients ORDER BY name ASC";
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Error finding all clients:", error);
      throw error;
    }
  },

  // Find a client by ID
  findById: async (id) => {
    const query = "SELECT * FROM clients WHERE client_id = $1";
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error finding client with ID ${id}:`, error);
      throw error;
    }
  },

  // Find clients by type (internal/external)
  findByType: async (clientType) => {
    const query = "SELECT * FROM clients WHERE client_type = $1 ORDER BY name ASC";
    try {
      const { rows } = await db.query(query, [clientType]);
      return rows;
    } catch (error) {
      console.error(`Error finding clients of type ${clientType}:`, error);
      throw error;
    }
  },

  // Create a new client
  create: async ({ member_id, name, document_id, contact_info, client_type, risk_profile, credit_rating, documents }) => {
    const query = `
      INSERT INTO clients (member_id, name, document_id, contact_info, client_type, risk_profile, credit_rating, documents)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    // Ensure member_id is null if not provided or empty
    const finalMemberId = member_id ? parseInt(member_id, 10) : null;
    const values = [finalMemberId, name, document_id, contact_info, client_type, risk_profile, credit_rating, documents];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error creating client:", error);
      if (error.code === '23505') { // Unique violation (e.g., document_id, member_id if unique)
          throw new Error('Client with this document ID or linked member ID already exists.');
      }
      throw error;
    }
  },

  // Update an existing client
  update: async (id, { member_id, name, document_id, contact_info, client_type, risk_profile, credit_rating, documents }) => {
    const query = `
      UPDATE clients
      SET member_id = $1, name = $2, document_id = $3, contact_info = $4, client_type = $5, risk_profile = $6, credit_rating = $7, documents = $8, updated_at = CURRENT_TIMESTAMP
      WHERE client_id = $9
      RETURNING *;
    `;
    const finalMemberId = member_id ? parseInt(member_id, 10) : null;
    const values = [finalMemberId, name, document_id, contact_info, client_type, risk_profile, credit_rating, documents, id];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error(`Error updating client with ID ${id}:`, error);
       if (error.code === '23505') { 
          throw new Error('Another client with this document ID or linked member ID already exists.');
      }
      throw error;
    }
  },

  // Delete a client (Consider implications, maybe prevent deletion if active loans exist)
  delete: async (id) => {
    // Check for active loans before deleting? Requires Loan model interaction.
    // For now, simple delete:
    const query = "DELETE FROM clients WHERE client_id = $1 RETURNING *;";
    try {
      const { rows } = await db.query(query, [id]);
      // Check if any rows were returned (i.e., if deletion happened)
      if (rows.length === 0) {
          return null; // Or throw an error indicating client not found
      }
      return rows[0];
    } catch (error) {
      // Handle foreign key constraints (e.g., if loans reference this client)
      if (error.code === '23503') { // Foreign key violation
          throw new Error('Cannot delete client because they have associated records (e.g., loans).');
      }
      console.error(`Error deleting client with ID ${id}:`, error);
      throw error;
    }
  },

  // Find client loans (Example - requires Loan model/logic)
  findLoans: async (clientId) => {
    console.warn("findLoans method needs implementation with Loan model.");
    // Example placeholder:
    // const loanQuery = "SELECT * FROM loans WHERE client_id = $1 ORDER BY loan_date DESC";
    // const { rows } = await db.query(loanQuery, [clientId]);
    // return rows;
    return [];
  }
};

module.exports = Client;
