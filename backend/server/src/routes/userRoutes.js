const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

// Apenas admin pode aceder
router.use(authenticateToken);
router.use(authorizeRole(1));

// Rotas
router.get("/", userController.listUsers);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);

module.exports = router;
