const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const roleController = require("../controllers/roleController");

// Apenas admin (role_id = 1) pode listar perfis
router.use(authenticateToken);
router.use(authorizeRole(1));

// GET /api/roles
router.get("/", roleController.getAllRoles);

module.exports = router;
