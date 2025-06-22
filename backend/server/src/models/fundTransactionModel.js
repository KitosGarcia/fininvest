const db = require("../config/db");
const BankAccount = require("./bankAccountModel"); // Import BankAccount model for balance updates

const FundTransaction = {
    // Create a new fund transaction
    // Note: This function assumes the balance update logic is handled here or in a service layer.
    // For simplicity, we might call BankAccount.updateBalance directly here.
    create: async ({ bank_account_id, transaction_type, amount, transaction_date, description, related_entity_type, related_entity_id, proof_url, recorded_by_user_id }, client) => {
        const queryRunner = client || db; // Use provided transaction client or default pool
        const query = `
            INSERT INTO fund_transactions 
                (bank_account_id, transaction_type, amount, transaction_date, description, related_entity_type, related_entity_id, proof_url, recorded_by_user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *;
        `;
        const values = [
            bank_account_id,
            transaction_type,
            amount,
            transaction_date || new Date(),
            description,
            related_entity_type,
            related_entity_id,
            proof_url,
            recorded_by_user_id
        ];
        try {
            const result = await queryRunner.query(query, values);
            const newTransaction = result.rows[0];

            // Update bank account balance - Amount is positive for inflow, negative for outflow
            // The sign of the amount passed to create() should reflect the direction.
            await BankAccount.updateBalance(bank_account_id, amount, queryRunner);

            return newTransaction;
        } catch (error) {
            console.error("Error creating fund transaction:", error);
            // Check for foreign key violation if bank account doesn't exist
            if (error.code === "23503" && error.constraint === "fund_transactions_bank_account_id_fkey") {
                throw new Error(`Bank account with ID ${bank_account_id} not found.`);
            }
            throw error; // Re-throw for transaction handling
        }
    },

    // Find all fund transactions (with optional filters)
    findAll: async (filters = {}) => {
        let query = "SELECT t.*, ba.account_name as bank_account_name, u.username as recorded_by_username FROM fund_transactions t LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.account_id LEFT JOIN users u ON t.recorded_by_user_id = u.user_id";
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        if (filters.bankAccountId) {
            conditions.push(`t.bank_account_id = $${paramIndex++}`);
            values.push(filters.bankAccountId);
        }
        if (filters.transactionType) {
            conditions.push(`t.transaction_type = $${paramIndex++}`);
            values.push(filters.transactionType);
        }
        if (filters.startDate) {
            conditions.push(`t.transaction_date >= $${paramIndex++}`);
            values.push(filters.startDate);
        }
        if (filters.endDate) {
            conditions.push(`t.transaction_date <= $${paramIndex++}`);
            values.push(filters.endDate);
        }
        if (filters.relatedEntityType) {
            conditions.push(`t.related_entity_type = $${paramIndex++}`);
            values.push(filters.relatedEntityType);
        }
        if (filters.relatedEntityId) {
            conditions.push(`t.related_entity_id = $${paramIndex++}`);
            values.push(filters.relatedEntityId);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY t.transaction_date DESC, t.transaction_id DESC;"; // Order by date, then ID

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error("Error finding fund transactions:", error);
            throw error;
        }
    },

    // Find a fund transaction by ID
    findById: async (id) => {
        const query = "SELECT t.*, ba.account_name as bank_account_name, u.username as recorded_by_username FROM fund_transactions t LEFT JOIN bank_accounts ba ON t.bank_account_id = ba.account_id LEFT JOIN users u ON t.recorded_by_user_id = u.user_id WHERE t.transaction_id = $1;";
        try {
            const result = await db.query(query, [id]);
            return result.rows[0]; // Returns undefined if not found
        } catch (error) {
            console.error(`Error finding fund transaction with ID ${id}:`, error);
            throw error;
        }
    },

    // Update a fund transaction (Use with extreme caution - usually adjustments are preferred)
    update: async (id, updates) => {
        // Financial transactions are typically immutable. Updates are risky.
        // Consider creating adjusting entries instead.
        console.warn(`Attempting to update fund transaction ID ${id}. This is generally discouraged.`);
        
        // Example: Allow updating description or proof_url
        const fields = [];
        const values = [];
        let query = "UPDATE fund_transactions SET ";
        let paramIndex = 1;

        if (updates.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(updates.description); }
        if (updates.proof_url !== undefined) { fields.push(`proof_url = $${paramIndex++}`); values.push(updates.proof_url); }
        // Add other updatable fields if absolutely necessary

        if (fields.length === 0) {
            throw new Error("No valid fields provided for update.");
        }

        query += fields.join(", ");
        query += ` WHERE transaction_id = $${paramIndex++} RETURNING *;`;
        values.push(id);

        try {
            const result = await db.query(query, values);
            if (result.rows.length === 0) {
                throw new Error("Fund transaction not found for update.");
            }
            return result.rows[0];
        } catch (error) {
            console.error(`Error updating fund transaction with ID ${id}:`, error);
            throw error;
        }
    },

    // Delete a fund transaction (HIGHLY DISCOURAGED - use adjustments)
    delete: async (id, client) => {
        console.error(`Attempting to DELETE fund transaction ID ${id}. This breaks audit trails and balances! Use adjusting entries.`);
        throw new Error("Deleting fund transactions is not permitted. Create an adjusting entry instead.");
        
        // // If deletion were allowed (BAD PRACTICE):
        // const queryRunner = client || db;
        // const query = "DELETE FROM fund_transactions WHERE transaction_id = $1 RETURNING *;";
        // try {
        //     const result = await queryRunner.query(query, [id]);
        //     if (result.rows.length === 0) {
        //         throw new Error("Fund transaction not found for deletion.");
        //     }
        //     const deletedTx = result.rows[0];
        //     // !!! Need to reverse the balance update !!!
        //     await BankAccount.updateBalance(deletedTx.bank_account_id, -deletedTx.amount, queryRunner);
        //     return deletedTx;
        // } catch (error) {
        //     console.error(`Error deleting fund transaction with ID ${id}:`, error);
        //     throw error;
        // }
    },

    // Get current balance for a specific bank account (calculated from transactions)
    // This provides a way to verify the stored current_balance if needed
    calculateBalanceForAccount: async (bankAccountId) => {
        const query = `
            SELECT COALESCE(SUM(amount), 0) as calculated_balance 
            FROM fund_transactions 
            WHERE bank_account_id = $1;
        `;
        try {
            const result = await db.query(query, [bankAccountId]);
            return parseFloat(result.rows[0].calculated_balance);
        } catch (error) {
            console.error(`Error calculating balance for bank account ID ${bankAccountId}:`, error);
            throw error;
        }
    },

    // Get total fund balance across all active accounts (using stored balances)
    getTotalFundBalance: async () => {
        const query = "SELECT COALESCE(SUM(current_balance), 0) as total_balance FROM bank_accounts WHERE is_active = TRUE;";
        try {
            const result = await db.query(query);
            return parseFloat(result.rows[0].total_balance);
        } catch (error) {
            console.error("Error getting total fund balance:", error);
            throw error;
        }
    }
};

module.exports = FundTransaction;
