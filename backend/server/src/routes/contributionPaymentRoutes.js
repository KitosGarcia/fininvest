const express = require("express");
const router = express.Router();
const { authenticateToken, authorizePermission } = require("../middleware/authMiddleware");
const controller = require("../controllers/contributionPaymentController");

router.use(authenticateToken);

router.get("/pending/:member_id", authorizePermission("contributions", "view"), controller.getPendingForMember);
router.get("/by-contribution/:contribution_id", authorizePermission("contributions", "view"), controller.getByContribution);
router.post("/", authorizePermission("contributions", "create"), controller.createPayment);

module.exports = router;
