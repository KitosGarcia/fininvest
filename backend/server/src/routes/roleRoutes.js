const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// Verifica se só o admin pode ver perfis
router.use(authenticateToken);
router.use(authorizeRole(1)); // ← usa role_id = 1 (admin)

router.get("/", async (_req, res) => {
  try {
    const result = await db.query("SELECT role_id, role_name FROM roles ORDER BY role_id");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar perfis:", err);
    res.status(500).json({ message: "Erro ao buscar perfis" });
  }
});

module.exports = router;
