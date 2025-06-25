const express = require("express");
const Member = require("../models/memberModel");
const { authenticateToken, authorizePermission } = require("../middleware/authMiddleware");
const AuditLogService = require("../services/auditLogService"); // Added
const Client = require("../models/clientModel");

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authenticateToken); // Ensure user is logged in

// GET all members (Admin/Member access)
router.get("/", authorizePermission("members", "view"), async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Error fetching members", error: error.message });
  }
});

// GET a specific member by ID (Admin/Member access)
router.get("/:id", authorizePermission("members", "view"), async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: "Error fetching member", error: error.message });
  }
});

// POST create a new member (Admin access only)
router.post("/", authorizePermission("members", "create"), async (req, res) => {
  const {
  name,
  document_id,
  join_date,
  status,
  email,
  phone,
  address,
  birth_date,
  gender,
  nationality,
  marital_status,
  occupation,
  income_range,
  pep_flag
} = req.body;
  const created_by_user_id = req.user.userId;
  const ip_address = req.ip;

  if (!name || !document_id ) {
      return res.status(400).json({ message: "Name, document ID, and contact info are required."}) ;
  }

  try {
    const newMember = await Member.create({ name, document_id, join_date, status });

    await Client.create({
  member_id: newMember.member_id,
  name: name,
  document_id: document_id,
  email: email || null,
  phone: phone || null,
  address: address || null,
  birth_date: birth_date || null,
  gender: gender || null,
  nationality: nationality || null,
  marital_status: marital_status || null,
  occupation: occupation || null,
  income_range: income_range || null,
  pep_flag: pep_flag || false,
  status: 'ativo',
  client_type: 'internal',
  risk_profile: '',
  credit_rating: '',
  documents: ''
});
    
    // Log successful creation
    AuditLogService.logAction({
        user_id: created_by_user_id,
        action: "member_created",
        entity_type: "member",
        entity_id: newMember.member_id,
        details: { name: newMember.name, document_id: newMember.document_id, status: newMember.status },
        ip_address: ip_address
    });

    res.status(201).json({ message: "Member created successfully", member: newMember });
  } catch (error) {
     // Log failed creation
     AuditLogService.logAction({
        user_id: created_by_user_id,
        action: "member_creation_failed",
        details: { error: error.message, name, document_id },
        ip_address: ip_address
    });
     if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Error creating member", error: error.message });
  }
});

// PUT update a member by ID (Admin access only)
router.put("/:id", authorizePermission("members", "update"), async (req, res) => {
  const member_id = parseInt(req.params.id, 10);
  const {
    name,
    document_id,
    join_date,
    status,
    email,
    phone,
    address,
    birth_date,
    gender,
    nationality,
    marital_status,
    occupation,
    income_range,
    pep_flag,
  } = req.body;

  const updated_by_user_id = req.user.userId;
  const ip_address = req.ip;

  // ✅ Validação mínima
  if (!name?.trim() || !document_id?.trim() || !status?.trim()) {
    return res.status(400).json({ message: "Campos obrigatórios em falta." });
  }

  try {
    // ⚠️ Verifica se o membro existe
    const existingMember = await Member.findById(member_id);
    if (!existingMember) {
      return res.status(404).json({ message: "Sócio não encontrado." });
    }

    // ✅ Atualiza dados da tabela `members`
    const updatedMember = await Member.update(member_id, {
      name: name.trim(),
      document_id: document_id.trim(),
      join_date: join_date || existingMember.join_date,
      status,
    });

    // ✅ Verifica e atualiza o cliente interno associado
    const internalClient = await Client.findByMemberId(member_id);
    if (internalClient) {
      await Client.update(internalClient.client_id, {
        member_id,
        name: name.trim(),
        document_id: document_id.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        birth_date: birth_date || null,
        gender: gender || null,
        nationality: nationality?.trim() || null,
        marital_status: marital_status?.trim() || null,
        occupation: occupation?.trim() || null,
        income_range: income_range?.trim() || null,
        pep_flag: Boolean(pep_flag),
        status,
        client_type: "internal",
        risk_profile: "",   // ❗️se não usas ainda, mantém string vazia
        credit_rating: "",
        documents: "",
      });
    }

    // ✅ Log de sucesso
    AuditLogService.logAction({
      user_id: updated_by_user_id,
      action: "member_updated",
      entity_type: "member",
      entity_id: member_id,
      details: { updated_fields: Object.keys(req.body) },
      ip_address,
    });

    return res.json({
      message: "Sócio atualizado com sucesso",
      member: updatedMember,
    });

  } catch (error) {
    // ❌ Log de erro
    AuditLogService.logAction({
      user_id: updated_by_user_id,
      action: "member_update_failed",
      entity_type: "member",
      entity_id: member_id,
      details: {
        error: error.message,
        attempted_updates: Object.keys(req.body),
      },
      ip_address,
    });

    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Erro ao atualizar sócio",
      error: error.message,
    });
  }
});


// DELETE a member by ID (soft delete - Admin access only)
router.delete("/:id", authorizePermission("members", "delete"), async (req, res) => {
  const member_id = req.params.id;
  const deactivated_by_user_id = req.user.userId;
  const ip_address = req.ip;
  let memberBeforeDelete = null;

  try {
    memberBeforeDelete = await Member.findById(member_id);
     if (!memberBeforeDelete || !memberBeforeDelete.is_active) {
      return res.status(404).json({ message: "Member not found or already inactive" });
    }

    const deletedMember = await Member.delete(member_id); // Uses soft delete
    
    // Log successful deactivation
    AuditLogService.logAction({
        user_id: deactivated_by_user_id,
        action: "member_deactivated",
        entity_type: "member",
        entity_id: member_id,
        details: { previous_status: memberBeforeDelete.status },
        ip_address: ip_address
    });

    res.json({ message: "Member deactivated successfully", member: deletedMember });
  } catch (error) {
    // Log failed deactivation
    AuditLogService.logAction({
        user_id: deactivated_by_user_id,
        action: "member_deactivation_failed",
        entity_type: "member",
        entity_id: member_id,
        details: { error: error.message, member_status: memberBeforeDelete?.status },
        ip_address: ip_address
    });
    res.status(500).json({ message: "Error deactivating member", error: error.message });
  }
});

// --- Additional Member-Related Routes (Examples) ---

// GET contributions for a specific member
router.get("/:id/contributions", async (req, res) => {
    try {
        const contributions = await Member.findContributions(req.params.id);
        res.json(contributions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching member contributions", error: error.message });
    }
});

// GET participation percentage for a specific member
router.get("/:id/participation", async (req, res) => {
    try {
        const participation = await Member.calculateParticipation(req.params.id);
        res.json({ member_id: req.params.id, participation_percentage: participation });
    } catch (error) {
        res.status(500).json({ message: "Error calculating member participation", error: error.message });
    }
});


module.exports = router;

