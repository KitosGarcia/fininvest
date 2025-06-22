const express = require("express");
const Client = require("../models/clientModel");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const AuditLogService = require("../services/auditLogService"); // Added

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authenticateToken); // Ensure user is logged in

// GET all clients (Admin/Member access)
router.get("/", async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients", error: error.message });
  }
});

// GET clients by type (internal/external)
router.get("/type/:clientType", async (req, res) => {
    const { clientType } = req.params;
    if (!["internal", "external"].includes(clientType)) {
        return res.status(400).json({ message: "Invalid client type. Use 'internal' or 'external'." });
    }
    try {
        const clients = await Client.findByType(clientType);
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: `Error fetching ${clientType} clients`, error: error.message });
    }
});

// GET a specific client by ID (Admin/Member access)
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client", error: error.message });
  }
});

// POST create a new client (Admin access only)
router.post("/", authorizeRole("admin"), async (req, res) => {
  const clientData = req.body; // { member_id, name, document_id, contact_info, client_type, ... }
  const created_by_user_id = req.user.userId;
  const ip_address = req.ip;

  if (!clientData.name || !clientData.document_id || !clientData.contact_info || !clientData.client_type) {
      return res.status(400).json({ message: "Name, document ID, contact info, and client type are required."}) ;
  }
   if (!["internal", "external"].includes(clientData.client_type)) {
        return res.status(400).json({ message: "Invalid client type. Use 'internal' or 'external'." });
    }
   if (clientData.client_type === 'internal' && !clientData.member_id) {
       return res.status(400).json({ message: "Member ID is required for internal clients."}) ;
   }
    if (clientData.client_type === 'external' && clientData.member_id) {
       clientData.member_id = null;
   }

  try {
    const newClient = await Client.create(clientData);
    
    // Log successful creation
    AuditLogService.logAction({
        user_id: created_by_user_id,
        action: "client_created",
        entity_type: "client",
        entity_id: newClient.client_id,
        details: { name: newClient.name, type: newClient.client_type, member_id: newClient.member_id },
        ip_address: ip_address
    });

    res.status(201).json({ message: "Client created successfully", client: newClient });
  } catch (error) {
     // Log failed creation
     AuditLogService.logAction({
        user_id: created_by_user_id,
        action: "client_creation_failed",
        details: { error: error.message, name: clientData.name, type: clientData.client_type },
        ip_address: ip_address
    });
     if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
    }
     if (error.code === '23503') { // Foreign key violation (member_id)
         return res.status(404).json({ message: "Associated Member ID not found." });
     }
    res.status(500).json({ message: "Error creating client", error: error.message });
  }
});

// PUT update a client by ID (Admin access only)
router.put("/:id", authorizeRole("admin"), async (req, res) => {
  const client_id = req.params.id;
  const updateData = req.body; // { member_id, name, document_id, contact_info, client_type, ... }
  const updated_by_user_id = req.user.userId;
  const ip_address = req.ip;
  let clientBeforeUpdate = null;

   if (!updateData.name || !updateData.document_id || !updateData.contact_info || !updateData.client_type) {
      return res.status(400).json({ message: "Name, document ID, contact info, and client type are required for update."}) ;
  }
    if (!["internal", "external"].includes(updateData.client_type)) {
        return res.status(400).json({ message: "Invalid client type. Use 'internal' or 'external'." });
    }
    if (updateData.client_type === 'internal' && !updateData.member_id) {
       return res.status(400).json({ message: "Member ID is required for internal clients."}) ;
   }
    if (updateData.client_type === 'external' && updateData.member_id) {
       updateData.member_id = null; // Ensure member_id is null for external clients
   }

  try {
    clientBeforeUpdate = await Client.findById(client_id);
    if (!clientBeforeUpdate) {
        return res.status(404).json({ message: "Client not found" });
    }

    const updatedClient = await Client.update(client_id, updateData);
    
    // Log successful update
    AuditLogService.logAction({
        user_id: updated_by_user_id,
        action: "client_updated",
        entity_type: "client",
        entity_id: client_id,
        details: { 
            updated_fields: Object.keys(updateData),
            // previous_type: clientBeforeUpdate.client_type, // Example of more detail
            // new_type: updatedClient.client_type
        },
        ip_address: ip_address
    });

    res.json({ message: "Client updated successfully", client: updatedClient });
  } catch (error) {
     // Log failed update
     AuditLogService.logAction({
        user_id: updated_by_user_id,
        action: "client_update_failed",
        entity_type: "client",
        entity_id: client_id,
        details: { error: error.message, attempted_updates: Object.keys(updateData) },
        ip_address: ip_address
    });
     if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
    }
     if (error.code === '23503') { // Foreign key violation (member_id)
         return res.status(404).json({ message: "Associated Member ID not found." });
     }
     if (error.message.includes("not found")) { // Should be caught by findById
         return res.status(404).json({ message: "Client not found" });
     }
    res.status(500).json({ message: "Error updating client", error: error.message });
  }
});

// DELETE a client by ID (Admin access only)
router.delete("/:id", authorizeRole("admin"), async (req, res) => {
  const client_id = req.params.id;
  const deleted_by_user_id = req.user.userId;
  const ip_address = req.ip;
  let clientToDelete = null;

  try {
    clientToDelete = await Client.findById(client_id);
    if (!clientToDelete) {
        return res.status(404).json({ message: "Client not found" });
    }

    const deletedClient = await Client.delete(client_id);
    // Model should throw error if deletion is prevented (e.g., by FK constraints)

    // Log successful deletion
    AuditLogService.logAction({
        user_id: deleted_by_user_id,
        action: "client_deleted",
        entity_type: "client",
        entity_id: client_id,
        details: { name: clientToDelete.name, type: clientToDelete.client_type },
        ip_address: ip_address
    });

    res.json({ message: "Client deleted successfully", client: deletedClient });
  } catch (error) {
     // Log failed deletion
     AuditLogService.logAction({
        user_id: deleted_by_user_id,
        action: "client_deletion_failed",
        entity_type: "client",
        entity_id: client_id,
        details: { error: error.message, name: clientToDelete?.name },
        ip_address: ip_address
    });
     if (error.message.includes("associated records")) {
         return res.status(409).json({ message: error.message }); // Conflict - cannot delete
     }
     if (error.message.includes("not found")) { // Should be caught by findById
         return res.status(404).json({ message: "Client not found" });
     }
    res.status(500).json({ message: "Error deleting client", error: error.message });
  }
});

// --- Additional Client-Related Routes (Examples) ---

// GET loans for a specific client
router.get("/:id/loans", async (req, res) => {
    try {
        const loans = await Client.findLoans(req.params.id);
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: "Error fetching client loans", error: error.message });
    }
});

module.exports = router;

