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

// ======================= CREATE =======================
create: async ({
  member_id,
  name,
  document_id,
  email,
  phone,
  address,
  client_type,
  birth_date,
  gender,
  nationality,
  marital_status,
  occupation,
  income_range,
  pep_flag,
  status,
  risk_profile,
  credit_rating,
  documents
}) => {
  const query = `
    INSERT INTO clients (
      member_id, name, document_id, email, phone, address,
      client_type, birth_date, gender, nationality, marital_status,
      occupation, income_range, pep_flag, status,
      risk_profile, credit_rating, documents
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11,
      $12, $13, $14, $15,
      $16, $17, $18
    )
    RETURNING *;
  `;

  const finalMemberId = member_id ? parseInt(member_id, 10) : null;
  const values = [
    finalMemberId,             // $1
    name,                      // $2
    document_id,               // $3
    email,                     // $4
    phone,                     // $5
    address,                   // $6
    client_type,               // $7
    birth_date || null,        // $8   (DATE)
    gender,                    // $9
    nationality,               // $10
    marital_status,            // $11
    occupation,                // $12
    income_range,              // $13
    pep_flag ?? false,         // $14  (BOOLEAN)
    status || 'ativo',         // $15
    risk_profile,              // $16
    credit_rating,             // $17
    documents || null          // $18  (JSONB ou TEXT)
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
},

// ======================= UPDATE =======================
update: async (
  id,
  {
    member_id,
    name,
    document_id,
    email,
    phone,
    address,
    client_type,
    birth_date,
    gender,
    nationality,
    marital_status,
    occupation,
    income_range,
    pep_flag,
    status,
    risk_profile,
    credit_rating,
    documents
  }
) => {
  const query = `
    UPDATE clients SET
      member_id       = $1,
      name            = $2,
      document_id     = $3,
      email           = $4,
      phone           = $5,
      address         = $6,
      client_type     = $7,
      birth_date      = $8,
      gender          = $9,
      nationality     = $10,
      marital_status  = $11,
      occupation      = $12,
      income_range    = $13,
      pep_flag        = $14,
      status          = $15,
      risk_profile    = $16,
      credit_rating   = $17,
      documents       = $18,
      updated_at      = CURRENT_TIMESTAMP
    WHERE client_id = $19
    RETURNING *;
  `;

  const finalMemberId = member_id ? parseInt(member_id, 10) : null;
  const values = [
    finalMemberId,             // $1
    name,                      // $2
    document_id,               // $3
    email,                     // $4
    phone,                     // $5
    address,                   // $6
    client_type,               // $7
    birth_date || null,        // $8
    gender,                    // $9
    nationality,               // $10
    marital_status,            // $11
    occupation,                // $12
    income_range,              // $13
    pep_flag ?? false,         // $14
    status,                    // $15
    risk_profile,              // $16
    credit_rating,             // $17
    documents || null,         // $18
    id                         // $19
  ];

  const { rows } = await db.query(query, values);
  return rows[0];
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
  },

  // Find client by member_id
findByMemberId: async (member_id) => {
  const query = "SELECT * FROM clients WHERE member_id = $1";
  const { rows } = await db.query(query, [member_id]);
  return rows[0] || null;
}

};

module.exports = Client;
