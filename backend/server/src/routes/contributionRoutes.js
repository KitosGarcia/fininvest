const express = require("express");
const router = express.Router();
const {
  getAllContributions,
  getContributionById,
  createContribution,
  updateContribution,
  deleteContribution
} = require("../controllers/contributionController");

const { authenticateToken, authorizePermission } = require("../middleware/authMiddleware");

// Protege todas as rotas
router.use(authenticateToken);

// Listar contribuições (com filtros)
router.get("/", authorizePermission("contributions", "view"), getAllContributions);

// Ver uma contribuição específica
router.get("/:id", authorizePermission("contributions", "view"), getContributionById);

// Criar contribuição
router.post("/", authorizePermission("contributions", "create"), createContribution);

// Editar contribuição
router.put("/:id", authorizePermission("contributions", "update"), updateContribution);

// Apagar contribuição
router.delete("/:id", authorizePermission("contributions", "delete"), deleteContribution);

module.exports = router;
