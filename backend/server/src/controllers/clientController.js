const Client = require("../models/clientModel");
const AuditLogService = require("../services/auditLogService");

const clientController = {
  // GET /clients
  getAll: async (_req, res) => {
    try {
      const clients = await Client.findAll();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar clientes", error: error.message });
    }
  },

  // GET /clients/type/:clientType
  getByType: async (req, res) => {
    const { clientType } = req.params;
    if (!["internal", "external"].includes(clientType)) {
      return res.status(400).json({ message: "Tipo inválido (internal/external)" });
    }

    try {
      const clients = await Client.findByType(clientType);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: `Erro ao buscar clientes ${clientType}`, error: error.message });
    }
  },

  // GET /clients/:id
  getById: async (req, res) => {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) return res.status(404).json({ message: "Cliente não encontrado" });
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar cliente", error: error.message });
    }
  },

  // GET /clients/by-member/:member_id
  getByMemberId: async (req, res) => {
    try {
      const client = await Client.findByMemberId(req.params.member_id);
      if (!client) return res.status(404).json({ message: "Cliente não encontrado para este membro" });
      res.json(client);
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar cliente", error: err.message });
    }
  },

  // POST /clients
  create: async (req, res) => {
    const {
      member_id, name, document_id, email, phone, address,
      client_type, birth_date, gender, nationality,
      marital_status, occupation, income_range,
      pep_flag, status
    } = req.body;

    const user_id = req.user.userId;
    const ip = req.ip;

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
        documents: ""
      });

      AuditLogService.logAction({
        user_id,
        action: "client_created",
        entity_type: "client",
        entity_id: newClient.client_id,
        details: { name: newClient.name, client_type },
        ip_address: ip
      });

      return res.status(201).json({ message: "Cliente criado com sucesso", client: newClient });
    } catch (error) {
      AuditLogService.logAction({
        user_id,
        action: "client_creation_failed",
        entity_type: "client",
        details: { error: error.message, document_id },
        ip_address: ip
      });

      if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
      }

      res.status(500).json({ message: "Erro ao criar cliente", error: error.message });
    }
  },

  // PUT /clients/:id
  update: async (req, res) => {
    const client_id = parseInt(req.params.id, 10);
    const {
      member_id, name, document_id, email, phone, address,
      client_type, birth_date, gender, nationality,
      marital_status, occupation, income_range,
      pep_flag, status
    } = req.body;

    const user_id = req.user.userId;
    const ip = req.ip;

    if (!name?.trim() || !document_id?.trim() || !client_type) {
      return res.status(400).json({ message: "Campos obrigatórios em falta." });
    }

    try {
      const existing = await Client.findById(client_id);
      if (!existing) {
        return res.status(404).json({ message: "Cliente não encontrado." });
      }

      const updated = await Client.update(client_id, {
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
        risk_profile: existing.risk_profile || "",
        credit_rating: existing.credit_rating || "",
        documents: existing.documents || ""
      });

      AuditLogService.logAction({
        user_id,
        action: "client_updated",
        entity_type: "client",
        entity_id: client_id,
        details: { updated_fields: Object.keys(req.body) },
        ip_address: ip
      });

      return res.json({ message: "Cliente atualizado com sucesso", client: updated });
    } catch (error) {
      AuditLogService.logAction({
        user_id,
        action: "client_update_failed",
        entity_type: "client",
        entity_id: client_id,
        details: { error: error.message },
        ip_address: ip
      });

      if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
      }

      res.status(500).json({ message: "Erro ao atualizar cliente", error: error.message });
    }
  },

  // DELETE /clients/:id
  delete: async (req, res) => {
    const client_id = req.params.id;
    const user_id = req.user.userId;
    const ip = req.ip;

    try {
      const existing = await Client.findById(client_id);
      if (!existing) return res.status(404).json({ message: "Cliente não encontrado." });

      const deleted = await Client.delete(client_id);

      AuditLogService.logAction({
        user_id,
        action: "client_deleted",
        entity_type: "client",
        entity_id: client_id,
        details: { name: existing.name },
        ip_address: ip
      });

      res.json({ message: "Cliente removido com sucesso", client: deleted });
    } catch (error) {
      AuditLogService.logAction({
        user_id,
        action: "client_deletion_failed",
        entity_type: "client",
        entity_id: client_id,
        details: { error: error.message },
        ip_address: ip
      });

      res.status(500).json({ message: "Erro ao remover cliente", error: error.message });
    }
  },

  // GET /clients/:id/loans
  getLoans: async (req, res) => {
    try {
      const loans = await Client.findLoans(req.params.id);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar empréstimos", error: error.message });
    }
  }
};

module.exports = clientController;
