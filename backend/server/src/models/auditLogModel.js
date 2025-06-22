const db = require("../config/db");

const AuditLog = {
    // Create a new audit log entry
    create: async ({ user_id, action_type, entity_type, entity_id, details, ip_address }, client) => {
        const queryRunner = client || db;
        const query = `
            INSERT INTO audit_logs 
                (user_id, action_type, entity_type, entity_id, details, ip_address, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            RETURNING *;
        `;
        // Ensure details is a JSON string or null
        const detailsJson = details ? JSON.stringify(details) : null;
        const values = [
            user_id, // Can be null if action is system-generated
            action_type, // Corrected from action
            entity_type, // e.g., 'loan', 'member', 'user'
            entity_id, // ID of the affected entity
            detailsJson, // JSON object with before/after state or relevant info
            ip_address // Optional: IP address of the user performing the action
        ];
        try {
            const result = await queryRunner.query(query, values);
            // console.log(`Audit log created: User ${user_id} performed ${action_type} on ${entity_type} ${entity_id}`);
            return result.rows[0];
        } catch (error) {
            console.error("Error creating audit log:", error);
            // Avoid throwing error here to prevent blocking the main operation
            // Log the error internally instead
        }
    },

    // Find audit logs (with filters)
    findAll: async (filters = {}, limit = 100, offset = 0) => {
        let query = `
            SELECT a.*, u.username as user_username 
            FROM audit_logs a 
            LEFT JOIN users u ON a.user_id = u.user_id
        `;
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        if (filters.userId) {
            conditions.push(`a.user_id = $${paramIndex++}`);
            values.push(filters.userId);
        }
        if (filters.actionType) { // Changed filter name for consistency
            conditions.push(`a.action_type = $${paramIndex++}`); // Corrected from action
            values.push(filters.actionType);
        }
        if (filters.entityType) {
            conditions.push(`a.entity_type = $${paramIndex++}`);
            values.push(filters.entityType);
        }
        if (filters.entityId) {
            conditions.push(`a.entity_id = $${paramIndex++}`);
            values.push(filters.entityId);
        }
        if (filters.startDate) {
            conditions.push(`a.timestamp >= $${paramIndex++}`);
            values.push(filters.startDate);
        }
        if (filters.endDate) {
            conditions.push(`a.timestamp <= $${paramIndex++}`);
            values.push(filters.endDate);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += ` ORDER BY a.timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++};`;
        values.push(limit);
        values.push(offset);

        try {
            const result = await db.query(query, values);
            // Parse details JSON string back into an object
            return result.rows.map(row => ({
                ...row,
                details: row.details ? JSON.parse(row.details) : null
            }));
        } catch (error) {
            console.error("Error finding audit logs:", error);
            throw error;
        }
    },
    
    // Count total audit logs matching filters (for pagination)
    countAll: async (filters = {}) => {
        let query = "SELECT COUNT(*) FROM audit_logs a";
        const conditions = [];
        const values = [];
        let paramIndex = 1;

        // Apply same filters as findAll
        if (filters.userId) { conditions.push(`a.user_id = $${paramIndex++}`); values.push(filters.userId); }
        if (filters.actionType) { conditions.push(`a.action_type = $${paramIndex++}`); values.push(filters.actionType); } // Corrected from action
        if (filters.entityType) { conditions.push(`a.entity_type = $${paramIndex++}`); values.push(filters.entityType); }
        if (filters.entityId) { conditions.push(`a.entity_id = $${paramIndex++}`); values.push(filters.entityId); }
        if (filters.startDate) { conditions.push(`a.timestamp >= $${paramIndex++}`); values.push(filters.startDate); }
        if (filters.endDate) { conditions.push(`a.timestamp <= $${paramIndex++}`); values.push(filters.endDate); }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        try {
            const result = await db.query(query, values);
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error counting audit logs:", error);
            throw error;
        }
    }
};

module.exports = AuditLog;

