const db = require("../config/db");

const Notification = {
    // Create a new notification
    create: async ({ user_id, member_id, client_id, notification_type, title, message, related_entity_type, related_entity_id }, client) => {
        const queryRunner = client || db;
        const query = `
            INSERT INTO notifications 
                (user_id, member_id, client_id, notification_type, title, message, related_entity_type, related_entity_id, created_at, is_read)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, FALSE)
            RETURNING *;
        `;
        // Ensure only one target ID is provided (user, member, or client)
        const values = [
            user_id || null,
            member_id || null,
            client_id || null,
            notification_type,
            title,
            message,
            related_entity_type || null,
            related_entity_id || null
        ];
        try {
            const result = await queryRunner.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("Error creating notification:", error);
            // Handle potential foreign key errors if needed
            throw error;
        }
    },

    // Find notifications for a specific user, member, or client
    findByRecipient: async (recipientType, recipientId, includeRead = false, limit = 50) => {
        let recipientColumn;
        switch (recipientType) {
            case "user": recipientColumn = "user_id"; break;
            case "member": recipientColumn = "member_id"; break;
            case "client": recipientColumn = "client_id"; break;
            default: throw new Error("Invalid recipient type specified.");
        }

        let query = `SELECT * FROM notifications WHERE ${recipientColumn} = $1`;
        const values = [recipientId];
        let paramIndex = 2;

        if (!includeRead) {
            query += ` AND is_read = FALSE`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex++};`;
        values.push(limit);

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error(`Error finding notifications for ${recipientType} ID ${recipientId}:`, error);
            throw error;
        }
    },
    
    // Find unread notifications count for a recipient
    countUnreadByRecipient: async (recipientType, recipientId) => {
        let recipientColumn;
        switch (recipientType) {
            case "user": recipientColumn = "user_id"; break;
            case "member": recipientColumn = "member_id"; break;
            case "client": recipientColumn = "client_id"; break;
            default: throw new Error("Invalid recipient type specified.");
        }
        const query = `SELECT COUNT(*) FROM notifications WHERE ${recipientColumn} = $1 AND is_read = FALSE;`;
        try {
            const result = await db.query(query, [recipientId]);
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error(`Error counting unread notifications for ${recipientType} ID ${recipientId}:`, error);
            throw error;
        }
    },

    // Mark a notification as read
    markAsRead: async (notificationId, client) => {
        const queryRunner = client || db;
        const query = "UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE notification_id = $1 AND is_read = FALSE RETURNING *;";
        try {
            const result = await queryRunner.query(query, [notificationId]);
            return result.rows[0]; // Returns the updated notification or undefined if not found/already read
        } catch (error) {
            console.error(`Error marking notification ID ${notificationId} as read:`, error);
            throw error;
        }
    },

    // Mark all unread notifications for a recipient as read
    markAllAsReadForRecipient: async (recipientType, recipientId, client) => {
        const queryRunner = client || db;
        let recipientColumn;
        switch (recipientType) {
            case "user": recipientColumn = "user_id"; break;
            case "member": recipientColumn = "member_id"; break;
            case "client": recipientColumn = "client_id"; break;
            default: throw new Error("Invalid recipient type specified.");
        }
        const query = `UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE ${recipientColumn} = $1 AND is_read = FALSE RETURNING notification_id;`;
        try {
            const result = await queryRunner.query(query, [recipientId]);
            return result.rows.length; // Return the count of notifications marked as read
        } catch (error) {
            console.error(`Error marking all notifications as read for ${recipientType} ID ${recipientId}:`, error);
            throw error;
        }
    },
    
    // Delete a notification (use with caution)
    delete: async (notificationId, client) => {
        const queryRunner = client || db;
        const query = "DELETE FROM notifications WHERE notification_id = $1 RETURNING *;";
        try {
            const result = await queryRunner.query(query, [notificationId]);
            if (result.rows.length === 0) {
                throw new Error(`Notification with ID ${notificationId} not found for deletion.`);
            }
            return result.rows[0];
        } catch (error) {
            console.error(`Error deleting notification ID ${notificationId}:`, error);
            throw error;
        }
    }
};

module.exports = Notification;

