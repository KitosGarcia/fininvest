const db = require("../config/db");
const FundTransaction = require("./fundTransactionModel"); // Needed to create related transactions
const BankAccount = require("./bankAccountModel"); // Needed for balance updates

const InternalTransfer = {
    // Create a new internal transfer record and associated fund transactions
    create: async ({ from_account_id, to_account_id, amount, description, proof_url, recorded_by_user_id }, client) => {
        const queryRunner = client || db; // Use provided transaction client or default pool
        const transfer_date = new Date();
        const numericAmount = parseFloat(amount);

        if (isNaN(numericAmount) || numericAmount <= 0) {
            throw new Error("Transfer amount must be a positive number.");
        }
        if (from_account_id === to_account_id) {
            throw new Error("Cannot transfer funds to the same account.");
        }

        // Check if accounts exist and have sufficient balance (within transaction)
        // This check might be better placed in the route/service layer before calling create

        const insertTransferQuery = `
            INSERT INTO internal_transfers 
                (from_account_id, to_account_id, amount, transfer_date, description, proof_url, recorded_by_user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const transferValues = [
            from_account_id,
            to_account_id,
            numericAmount,
            transfer_date,
            description,
            proof_url,
            recorded_by_user_id
        ];

        try {
            // Insert the main transfer record
            const transferResult = await queryRunner.query(insertTransferQuery, transferValues);
            const newTransfer = transferResult.rows[0];

            // Create the outgoing fund transaction
            await FundTransaction.create({
                bank_account_id: from_account_id,
                transaction_type: "internal_transfer_out",
                amount: -Math.abs(numericAmount), // Negative for outflow
                transaction_date: transfer_date,
                description: `Transfer Out to Account ID: ${to_account_id} - ${description || ""}`,
                related_entity_type: "internal_transfer",
                related_entity_id: newTransfer.transfer_id,
                recorded_by_user_id: recorded_by_user_id
            }, queryRunner); // Pass client

            // Create the incoming fund transaction
            await FundTransaction.create({
                bank_account_id: to_account_id,
                transaction_type: "internal_transfer_in",
                amount: Math.abs(numericAmount), // Positive for inflow
                transaction_date: transfer_date,
                description: `Transfer In from Account ID: ${from_account_id} - ${description || ""}`,
                related_entity_type: "internal_transfer",
                related_entity_id: newTransfer.transfer_id,
                recorded_by_user_id: recorded_by_user_id
            }, queryRunner); // Pass client

            return newTransfer;
        } catch (error) {
            console.error("Error creating internal transfer:", error);
            // Check for foreign key violations
            if (error.code === "23503") {
                 if (error.constraint === "internal_transfers_from_account_id_fkey") {
                    throw new Error(`Source bank account with ID ${from_account_id} not found.`);
                 } else if (error.constraint === "internal_transfers_to_account_id_fkey") {
                    throw new Error(`Destination bank account with ID ${to_account_id} not found.`);
                 }
            }
            throw error; // Re-throw for transaction handling
        }
    },

    // Find all internal transfers (with optional filters)
    findAll: async (filters = {}) => {
        let query = `
            SELECT 
                it.*, 
                from_ba.account_name as from_account_name, 
                to_ba.account_name as to_account_name, 
                u.username as recorded_by_username 
            FROM internal_transfers it
            LEFT JOIN bank_accounts from_ba ON it.from_account_id = from_ba.account_id
            LEFT JOIN bank_accounts to_ba ON it.to_account_id = to_ba.account_id
            LEFT JOIN users u ON it.recorded_by_user_id = u.user_id
        `;
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        if (filters.fromAccountId) {
            conditions.push(`it.from_account_id = $${paramIndex++}`);
            values.push(filters.fromAccountId);
        }
        if (filters.toAccountId) {
            conditions.push(`it.to_account_id = $${paramIndex++}`);
            values.push(filters.toAccountId);
        }
        if (filters.startDate) {
            conditions.push(`it.transfer_date >= $${paramIndex++}`);
            values.push(filters.startDate);
        }
        if (filters.endDate) {
            conditions.push(`it.transfer_date <= $${paramIndex++}`);
            values.push(filters.endDate);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY it.transfer_date DESC, it.transfer_id DESC;";

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error("Error finding internal transfers:", error);
            throw error;
        }
    },

    // Find an internal transfer by ID
    findById: async (id) => {
        const query = `
            SELECT 
                it.*, 
                from_ba.account_name as from_account_name, 
                to_ba.account_name as to_account_name, 
                u.username as recorded_by_username 
            FROM internal_transfers it
            LEFT JOIN bank_accounts from_ba ON it.from_account_id = from_ba.account_id
            LEFT JOIN bank_accounts to_ba ON it.to_account_id = to_ba.account_id
            LEFT JOIN users u ON it.recorded_by_user_id = u.user_id
            WHERE it.transfer_id = $1;
        `;
        try {
            const result = await db.query(query, [id]);
            return result.rows[0]; // Returns undefined if not found
        } catch (error) {
            console.error(`Error finding internal transfer with ID ${id}:`, error);
            throw error;
        }
    },

    // Update an internal transfer (VERY DANGEROUS - generally not allowed)
    update: async (id, updates) => {
        console.error(`Attempting to update internal transfer ID ${id}. This is not allowed.`);
        throw new Error("Updating internal transfers is not permitted. Create adjusting entries if necessary.");
    },

    // Delete an internal transfer (VERY DANGEROUS - generally not allowed)
    delete: async (id) => {
        console.error(`Attempting to delete internal transfer ID ${id}. This breaks audit trails and balances!`);
        throw new Error("Deleting internal transfers is not permitted. Create adjusting entries if necessary.");
    },
    
    // Update the proof URL after PDF generation
    updateProofUrl: async (id, proof_url, client) => {
        const queryRunner = client || db;
        const query = "UPDATE internal_transfers SET proof_url = $1 WHERE transfer_id = $2 RETURNING *;";
        try {
            const result = await queryRunner.query(query, [proof_url, id]);
            if (result.rows.length === 0) {
                throw new Error(`Internal transfer with ID ${id} not found for updating proof URL.`);
            }
            return result.rows[0];
        } catch (error) {
            console.error(`Error updating proof URL for internal transfer ID ${id}:`, error);
            throw error;
        }
    }
};

module.exports = InternalTransfer;
