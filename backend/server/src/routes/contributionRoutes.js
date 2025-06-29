const express = require("express");
const router  = express.Router();
const {
  getAllContributions,
  getContributionById,
  createContribution,
  updateContribution,
  deleteContribution,
  getStatusByMember
 
} = require("../controllers/contributionController");
const contributionPaymentController = require("../controllers/contributionPaymentController");
const {
  authenticateToken,
  authorizePermission,
} = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", authorizePermission("contributions", "view"), getAllContributions);
router.get("/:contribution_id/payments", authorizePermission("contributions", "view"), contributionPaymentController.listByContribution);
router.get("/:id", authorizePermission("contributions", "view"), getContributionById);
router.post("/", authorizePermission("contributions", "create"), createContribution);
router.put("/:id", authorizePermission("contributions", "update"), updateContribution);
router.delete("/:id", authorizePermission("contributions", "delete"), deleteContribution);

// ✅ Correto agora:
router.get("/status/:memberId", authorizePermission("contributions", "view"), getStatusByMember);

module.exports = router;
