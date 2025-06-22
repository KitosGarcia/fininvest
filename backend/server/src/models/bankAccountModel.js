const db = require("../config/db");

const BankAccount = {
    // Create a new bank account
   create: async ({ account_name, bank_name, iban, account_type, initial_balance, currency }) => {
    const current_balance = initial_balance || 0;
    const query = `
        INSERT INTO bank_accounts (
            account_name, bank_name, iban, account_type,
            initial_balance, current_balance, currency, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        RETURNING *;
    `;
    const values = [
        account_name,
        bank_name,
        iban,
        account_type,
        initial_balance || 0,
        current_balance,
        currency || 'EUR'
    ];

    try {
        const result = await db.query(query, values);

        // Opcional: registrar transação inicial
        if (parseFloat(current_balance) !== 0) {
            await db.query(`
                INSERT INTO fund_transactions 
                    (bank_account_id, transaction_type, amount, transaction_date, description, related_entity_type, related_entity_id)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6);
            `, [
                result.rows[0].account_id,
                "initial_balance",
                current_balance,
                "Saldo inicial da conta",
                "bank_account",
                result.rows[0].account_id
            ]);
        }

        return result.rows[0];
    } catch (error) {
        console.error("Error creating bank account:", error);
        if (error.code === "23505") {
            throw new Error("Bank account with this IBAN already exists.");
        }
        throw error;
    }
},

    // Find all bank accounts (optionally filter by active status)
    findAll: async (includeInactive = false) => {
        let query = "SELECT * FROM bank_accounts";
        if (!includeInactive) {
            query += " WHERE is_active = TRUE";
        }
        query += " ORDER BY account_name;";
        try {
            const result = await db.query(query);
            // TODO: Consider calculating current_balance based on transactions if not stored directly
            return result.rows;
        } catch (error) {
            console.error("Error finding bank accounts:", error);
            throw error;
        }
    },

    // Find a bank account by ID
    findById: async (id) => {
        const query = "SELECT * FROM bank_accounts WHERE account_id = $1;";
        try {
            const result = await db.query(query, [id]);
            // TODO: Consider calculating current_balance
            return result.rows[0]; // Returns undefined if not found
        } catch (error) {
            console.error(`Error finding bank account with ID ${id}:`, error);
            throw error;
        }
    },

    // Update a bank account
    // Update a bank account
update: async (id, { account_name, bank_name, iban, account_type, is_active, currency }) => {
    const fields = [];
    const values = [];
    let query = "UPDATE bank_accounts SET ";
    let paramIndex = 1;

    if (account_name !== undefined) { fields.push(`account_name = $${paramIndex++}`); values.push(account_name); }
    if (bank_name !== undefined) { fields.push(`bank_name = $${paramIndex++}`); values.push(bank_name); }
    if (iban !== undefined) { fields.push(`iban = $${paramIndex++}`); values.push(iban); }
    if (account_type !== undefined) { fields.push(`account_type = $${paramIndex++}`); values.push(account_type); }
    if (is_active !== undefined) { fields.push(`is_active = $${paramIndex++}`); values.push(is_active); }
    if (currency !== undefined) { fields.push(`currency = $${paramIndex++}`); values.push(currency); }

    if (fields.length === 0) {
        throw new Error("No valid fields provided for update.");
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    query += fields.join(", ");
    query += ` WHERE account_id = $${paramIndex++} RETURNING *;`;
    values.push(id);

    try {
        const result = await db.query(query, values);
        if (result.rows.length === 0) {
            throw new Error("Bank account not found for update.");
        }
        return result.rows[0];
    } catch (error) {
        console.error(`Error updating bank account with ID ${id}:`, error);
        if (error.code === "23505") {
            throw new Error("Update failed: Bank account with this IBAN already exists.");
        }
        throw error;
    }
},



    // Delete a bank account (soft delete by marking inactive is safer)
    // Hard delete is generally discouraged if transactions are linked.
    delete: async (id) => {
        // Check if there are transactions linked to this account
        const transactionCheck = await db.query("SELECT 1 FROM fund_transactions WHERE bank_account_id = $1 LIMIT 1;", [id]);
        if (transactionCheck.rows.length > 0) {
            throw new Error("Cannot delete bank account with associated transactions. Consider marking it as inactive instead.");
        }
        
        const query = "DELETE FROM bank_accounts WHERE account_id = $1 RETURNING *;";
        try {
            const result = await db.query(query, [id]);
             if (result.rows.length === 0) {
                throw new Error("Bank account not found for deletion.");
            }
            console.warn(`Hard deleted bank account with ID: ${id}. This is generally discouraged.`);
            return result.rows[0];
        } catch (error) {
            console.error(`Error deleting bank account with ID ${id}:`, error);
            throw error;
        }
    },
    
    // Method to update balance (use with transactions)
    updateBalance: async (accountId, amountChange, client) => {
        const queryRunner = client || db; // Use provided transaction client or default pool
        const query = `
            UPDATE bank_accounts 
            SET current_balance = current_balance + $1, updated_at = CURRENT_TIMESTAMP 
            WHERE account_id = $2
            RETURNING current_balance;
        `;
        try {
            const result = await queryRunner.query(query, [amountChange, accountId]);
            if (result.rows.length === 0) {
                throw new Error(`Bank account with ID ${accountId} not found for balance update.`);
            }
            console.log(`Balance updated for account ${accountId}. New balance: ${result.rows[0].current_balance}`);
            return result.rows[0].current_balance;
        } catch (error) {
            console.error(`Error updating balance for account ${accountId}:`, error);
            throw error; // Re-throw to be caught by transaction logic if applicable
        }
    }
};

module.exports = BankAccount;
