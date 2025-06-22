const AuditLog = require("../models/auditLogModel");
const AuditLogService = {

    /**
     * Logs an action performed in the system.
     * This function should not throw errors to avoid blocking the main operation.
     * 
     * @param {object} logData - The data to log.
     * @param {number | null} logData.user_id - ID of the user performing the action (null if system action).
     * @param {string} logData.action_type - A code representing the action (e.g., 'login_success', 'loan_approved', 'member_created').
     * @param {string | null} logData.entity_type - The type of entity affected (e.g., 'loan', 'member', 'user').
     * @param {number | string | null} logData.entity_id - The ID of the affected entity.
     * @param {object | null} logData.details - Optional JSON object with details (e.g., changed fields, snapshot).
     * @param {string | null} logData.ip_address - Optional IP address of the user.
     * @param {object | null} client - Optional database client for transactions.
     */
logAction: async (logData, client) => {
    try {
        // Verificar e normalizar o campo action_type
        // Aceitar tanto action quanto action_type para compatibilidade
        const actionType = logData.action_type || logData.action || 'unknown_action';
        
        await AuditLog.create({
            user_id: logData.user_id || null,
            action_type: actionType,
            entity_type: logData.entity_type || null,
            entity_id: logData.entity_id || null,
            details: logData.details || null,
            ip_address: logData.ip_address || null
        }, client);

        // Optional: Log to console in development for easier debugging
        if (process.env.NODE_ENV === "development") {
             console.log(`Audit Logged: [User: ${logData.user_id || 'System'}] Action: ${actionType} | Entity: ${logData.entity_type || 'N/A'}:${logData.entity_id || 'N/A'}`);
        }
    } catch (error) {
        // Log the error but do not re-throw
        console.error(`AuditLogService Error logging action "${logData?.action_type || logData?.action || 'unknown'}":`, error);
    }
}

    // Example of how to use it within a route or another service:
    /*
    const AuditLogService = require('../services/auditLogService');
     // Inside an Express route after a successful operation:
    AuditLogService.logAction({
        user_id: req.user.userId, 
        action_type: 'member_update',
        entity_type: 'member',
        entity_id: updatedMember.member_id,
        details: { 
            // Optionally include changes, e.g., using a diff library
            // Or just a snapshot of the updated data
            updatedFields: Object.keys(req.body) 
        },
        ip_address: req.ip // Get IP from request object
    });
    */
};
module.exports = AuditLogService;
