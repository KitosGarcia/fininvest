const express = require("express");
const router = express.Router();

const clientController = require("../controllers/clientController");
const { authenticateToken, authorizePermission } = require("../middleware/authMiddleware");

// Aplica autenticação a todas as rotas
router.use(authenticateToken);

// 🟢 LISTAR TODOS
router.get("/", authorizePermission("clients", "view"), clientController.getAll);

// 🟢 LISTAR POR TIPO (internal / external)
router.get("/type/:clientType", authorizePermission("clients", "view"), clientController.getByType);

// 🟢 OBTER UM CLIENTE POR ID
router.get("/:id", authorizePermission("clients", "view"), clientController.getById);

// 🟢 OBTER CLIENTE POR MEMBER_ID
router.get("/by-member/:member_id", authorizePermission("clients", "view"), clientController.getByMemberId);

// 🟡 CRIAR CLIENTE
router.post("/", authorizePermission("clients", "create"), clientController.create);

// 🟠 ATUALIZAR CLIENTE
router.put("/:id", authorizePermission("clients", "update"), clientController.update);

// 🔴 REMOVER CLIENTE
router.delete("/:id", authorizePermission("clients", "delete"), clientController.delete);

// 🔎 GET empréstimos do cliente (placeholder)
router.get("/:id/loans", authorizePermission("clients", "view"), clientController.getLoans);

module.exports = router;
