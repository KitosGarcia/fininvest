const express = require("express");
const Member = require("../models/memberModel");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const AuditLogService = require("../services/auditLogService"); // Added

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authenticateToken); // Ensure user is logged in

// GET all members (Admin/Member access)
router.get("/", async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Error fetching members", error: error.message });
  }
});

// GET a specific member by ID (Admin/Member access)
router.get("/:id", async (req, res) => {
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
router.post("/", authorizeRole("admin"), async (req, res) => {
  const { name, document_id, contact_info, join_date, status } = req.body;
  const created_by_user_id = req.user.userId;
  const ip_address = req.ip;

  if (!name || !document_id || !contact_info) {
      return res.status(400).json({ message: "Name, document ID, and contact info are required."}) ;
  }

  try {
    const newMember = await Member.create({ name, document_id, contact_info, join_date, status });
    
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
router.put("/:id", authorizeRole("admin"), async (req, res) => {
  const member_id = req.params.id;
  const updateData = req.body; // { name, document_id, contact_info, status }
  const updated_by_user_id = req.user.userId;
  const ip_address = req.ip;
  let memberBeforeUpdate = null;

   if (!updateData.name || !updateData.document_id || !updateData.contact_info || !updateData.status) {
      return res.status(400).json({ message: "Name, document ID, contact info and status are required for update."}) ;
  }

  try {
    // Fetch member before update for logging comparison
    memberBeforeUpdate = await Member.findById(member_id);
    if (!memberBeforeUpdate) {
      return res.status(404).json({ message: "Member not found" });
    }

    const updatedMember = await Member.update(member_id, updateData);
    // Member.update should return null/throw if not found, but we check above anyway

    // Log successful update
    AuditLogService.logAction({
        user_id: updated_by_user_id,
        action: "member_updated",
        entity_type: "member",
        entity_id: member_id,
        details: { 
            // Simple logging: just note which fields were intended for update
            updated_fields: Object.keys(updateData),
            // More complex: Diff between memberBeforeUpdate and updatedMember
            // previous_status: memberBeforeUpdate.status, 
            // new_status: updatedMember.status 
        },
        ip_address: ip_address
    });

    res.json({ message: "Member updated successfully", member: updatedMember });
  } catch (error) {
     // Log failed update
     AuditLogService.logAction({
        user_id: updated_by_user_id,
        action: "member_update_failed",
        entity_type: "member",
        entity_id: member_id,
        details: { error: error.message, attempted_updates: Object.keys(updateData) },
        ip_address: ip_address
    });
     if (error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
    }
     if (error.message.includes("not found")) { // Should be caught by the findById check
         return res.status(404).json({ message: "Member not found" });
     }
    res.status(500).json({ message: "Error updating member", error: error.message });
  }
});

// DELETE a member by ID (soft delete - Admin access only)
router.delete("/:id", authorizeRole("admin"), async (req, res) => {
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

