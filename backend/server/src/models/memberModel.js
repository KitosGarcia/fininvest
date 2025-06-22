const db = require("../config/db");

const Member = {
  // Find all members
  findAll: async () => {
    const query = "SELECT * FROM members ORDER BY name ASC";
    try {
      const { rows } = await db.query(query);
      return rows;
    } catch (error) {
      console.error("Error finding all members:", error);
      throw error;
    }
  },

  // Find a member by ID
  findById: async (id) => {
    const query = "SELECT * FROM members WHERE member_id = $1";
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0]; // Return the first row or undefined
    } catch (error) {
      console.error(`Error finding member with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new member
  create: async ({ name, document_id, contact_info, join_date, status = 'active' }) => {
    const query = `
      INSERT INTO members (name, document_id, contact_info, join_date, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [name, document_id, contact_info, join_date || new Date(), status];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error("Error creating member:", error);
      // Handle potential unique constraint violation (e.g., document_id)
      if (error.code === '23505') { // Unique violation error code in PostgreSQL
          throw new Error('Member with this document ID already exists.');
      }
      throw error;
    }
  },

  // Update an existing member
  update: async (id, { name, document_id, contact_info, status }) => {
    const query = `
      UPDATE members
      SET name = $1, document_id = $2, contact_info = $3, status = $4, updated_at = CURRENT_TIMESTAMP
      WHERE member_id = $5
      RETURNING *;
    `;
    const values = [name, document_id, contact_info, status, id];
    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      console.error(`Error updating member with ID ${id}:`, error);
      if (error.code === '23505') { 
          throw new Error('Another member with this document ID already exists.');
      }
      throw error;
    }
  },

  // Delete a member (consider soft delete by changing status instead)
  delete: async (id) => {
    // Option 1: Hard delete
    // const query = "DELETE FROM members WHERE member_id = $1 RETURNING *;";
    // Option 2: Soft delete (recommended)
    const query = `UPDATE members SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE member_id = $1 RETURNING *;`;
    try {
      const { rows } = await db.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error deleting member with ID ${id}:`, error);
      throw error;
    }
  },

  // Find member contributions (Example - requires Contribution model/logic)
  findContributions: async (memberId) => {
    // This would typically involve a join or a separate query using the Contribution model
    console.warn("findContributions method needs implementation with Contribution model.");
    // Example placeholder:
    // const contributionQuery = "SELECT * FROM contributions WHERE member_id = $1 ORDER BY contribution_date DESC";
    // const { rows } = await db.query(contributionQuery, [memberId]);
    // return rows;
    return [];
  },

  // Calculate participation percentage (Placeholder - requires complex logic)
  calculateParticipation: async (memberId) => {
    // This requires summing contributions and comparing to total fund contributions
    console.warn("calculateParticipation method requires complex logic involving total fund value.");
    return 0; // Placeholder
  }
};

module.exports = Member;
