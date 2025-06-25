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
  const {
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
  } = req.body;

  const created_by_user_id = req.user.userId;
  const ip_address = req.ip;

  if (!name?.trim() || !document_id?.trim() || !client_type) {
    return res.status(400).json({ message: "Campos obrigatórios em falta." });
  }

  try {
    const newClient = await Client.create({
      member_id: member_id || null,
      name: name.trim(),
      document_id: document_id.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      client_type,
      birth_date: birth_date || null,
      gender: gender || null,
      nationality: nationality?.trim() || null,
      marital_status: marital_status?.trim() || null,
      occupation: occupation?.trim() || null,
      income_range: income_range?.trim() || null,
      pep_flag: Boolean(pep_flag),
      status: status || "ativo",
      risk_profile: "",
      credit_rating: "",
      documents: "",
    });

    AuditLogService.logAction({
      user_id: created_by_user_id,
      action: "client_created",
      entity_type: "client",
      entity_id: newClient.client_id,
      details: { name: newClient.name, client_type },
      ip_address,
    });

    return res.status(201).json({
      message: "Cliente criado com sucesso",
      client: newClient,
    });

  } catch (error) {
    AuditLogService.logAction({
      user_id: created_by_user_id,
      action: "client_creation_failed",
      entity_type: "client",
      details: { error: error.message, document_id },
      ip_address,
    });

    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro ao criar cliente", error: error.message });
  }
});


// 🟠 ATUALIZAR CLIENTE
router.put("/:id", authorizePermission("clients", "update"), async (req, res) => {
  const client_id = parseInt(req.params.id, 10);
  const {
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
  } = req.body;

  const updated_by_user_id = req.user.userId;
  const ip_address = req.ip;

  if (!name?.trim() || !document_id?.trim() || !client_type) {
    return res.status(400).json({ message: "Campos obrigatórios em falta." });
  }

  try {
    const existingClient = await Client.findById(client_id);
    if (!existingClient) {
      return res.status(404).json({ message: "Cliente não encontrado." });
    }

    const updatedClient = await Client.update(client_id, {
      member_id: member_id || null,
      name: name.trim(),
      document_id: document_id.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      client_type,
      birth_date: birth_date || null,
      gender: gender || null,
      nationality: nationality?.trim() || null,
      marital_status: marital_status?.trim() || null,
      occupation: occupation?.trim() || null,
      income_range: income_range?.trim() || null,
      pep_flag: Boolean(pep_flag),
      status: status || "ativo",
      risk_profile: existingClient.risk_profile || "",
      credit_rating: existingClient.credit_rating || "",
      documents: existingClient.documents || "",
    });

    AuditLogService.logAction({
      user_id: updated_by_user_id,
      action: "client_updated",
      entity_type: "client",
      entity_id: client_id,
      details: { updated_fields: Object.keys(req.body) },
      ip_address,
    });

    return res.json({ message: "Cliente atualizado com sucesso", client: updatedClient });

  } catch (error) {
    AuditLogService.logAction({
      user_id: updated_by_user_id,
      action: "client_update_failed",
      entity_type: "client",
      entity_id: client_id,
      details: { error: error.message, attempted_updates: Object.keys(req.body) },
      ip_address,
    });

    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }

    return res.status(500).json({ message: "Erro ao atualizar cliente", error: error.message });
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

// GET client by member_id
router.get('/by-member/:member_id', async (req, res) => {
  const memberId = req.params.member_id;
  try {
    const client = await Client.findByMemberId(memberId);
    if (!client) {
      return res.status(404).json({ message: "Client not found for this member" });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Error fetching client", error: err.message });
  }
});

module.exports = router;
