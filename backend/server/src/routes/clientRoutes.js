const express = require("express");
const Client = require("../models/clientModel");
const { authenticateToken, authorizePermission } = require("../middleware/authMiddleware");
const AuditLogService = require("../services/auditLogService");

const router = express.Router();

// Aplica autenticação a todas as rotas
router.use(authenticateToken);

// 🟢 LISTAR TODOS
router.get("/", authorizePermission("clients", "view"), async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients", error: error.message });
  }
});

// 🟢 LISTAR POR TIPO (internal / external)
router.get("/type/:clientType", authorizePermission("clients", "view"), async (req, res) => {
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

// 🟢 OBTER UM CLIENTE
router.get("/:id", authorizePermission("clients", "view"), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error fetching client", error: error.message });
  }
});

// 🟡 CRIAR CLIENTE
router.post("/", authorizePermission("clients", "create"), async (req, res) => {
  const clientData = req.body;
  const created_by_user_id = req.user.user_id;
  const ip_address = req.ip;

  if (!clientData.name || !clientData.document_id || !clientData.client_type) {
    return res.status(400).json({ message: "Name, document ID, contact info, and client type are required." });
  }
  if (!["internal", "external"].includes(clientData.client_type)) {
    return res.status(400).json({ message: "Invalid client type." });
  }
  if (clientData.client_type === 'internal' && !clientData.member_id) {
    return res.status(400).json({ message: "Member ID is required for internal clients." });
  }
  if (clientData.client_type === 'external') {
    clientData.member_id = null;
  }

  try {
    const newClient = await Client.create(clientData);

    AuditLogService.logAction({
      user_id: created_by_user_id,
      action: "client_created",
      entity_type: "client",
      entity_id: newClient.client_id,
      details: { name: newClient.name, type: newClient.client_type },
      ip_address
    });

    res.status(201).json({ message: "Client created successfully", client: newClient });
  } catch (error) {
    AuditLogService.logAction({
      user_id: created_by_user_id,
      action: "client_creation_failed",
      details: { error: error.message },
      ip_address
    });

    res.status(500).json({ message: "Error creating client", error: error.message });
  }
});

// 🟠 ATUALIZAR CLIENTE
router.put("/:id", authorizePermission("clients", "update"), async (req, res) => {
  const client_id = req.params.id;
  const updateData = req.body;
  const updated_by_user_id = req.user.user_id;
  const ip_address = req.ip;

  if (!updateData.name || !updateData.document_id || !updateData.contact_info || !updateData.client_type) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  if (!["internal", "external"].includes(updateData.client_type)) {
    return res.status(400).json({ message: "Invalid client type." });
  }

  if (updateData.client_type === 'internal' && !updateData.member_id) {
    return res.status(400).json({ message: "Member ID is required for internal clients." });
  }

  if (updateData.client_type === 'external') {
    updateData.member_id = null;
  }

  try {
    const clientBeforeUpdate = await Client.findById(client_id);
    if (!clientBeforeUpdate) return res.status(404).json({ message: "Client not found" });

    const updatedClient = await Client.update(client_id, updateData);

    AuditLogService.logAction({
      user_id: updated_by_user_id,
      action: "client_updated",
      entity_type: "client",
      entity_id: client_id,
      details: { updated_fields: Object.keys(updateData) },
      ip_address
    });

    res.json({ message: "Client updated successfully", client: updatedClient });
  } catch (error) {
    AuditLogService.logAction({
      user_id: updated_by_user_id,
      action: "client_update_failed",
      entity_type: "client",
      entity_id: client_id,
      details: { error: error.message },
      ip_address
    });

    res.status(500).json({ message: "Error updating client", error: error.message });
  }
});

// 🔴 REMOVER CLIENTE
router.delete("/:id", authorizePermission("clients", "delete"), async (req, res) => {
  const client_id = req.params.id;
  const deleted_by_user_id = req.user.user_id;
  const ip_address = req.ip;

  try {
    const clientToDelete = await Client.findById(client_id);
    if (!clientToDelete) return res.status(404).json({ message: "Client not found" });

    const deleted = await Client.delete(client_id);

    AuditLogService.logAction({
      user_id: deleted_by_user_id,
      action: "client_deleted",
      entity_type: "client",
      entity_id: client_id,
      details: { name: clientToDelete.name },
      ip_address
    });

    res.json({ message: "Client deleted", client: deleted });
  } catch (error) {
    AuditLogService.logAction({
      user_id: deleted_by_user_id,
      action: "client_deletion_failed",
      entity_type: "client",
      entity_id: client_id,
      details: { error: error.message },
      ip_address
    });

    res.status(500).json({ message: "Error deleting client", error: error.message });
  }
});

// 🔎 GET loans for client
router.get("/:id/loans", authorizePermission("clients", "view"), async (req, res) => {
  try {
    const loans = await Client.findLoans(req.params.id);
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loans", error: error.message });
  }
});

module.exports = router;
