const express = require("express");
const router  = express.Router();
const User    = require("../models/userModel");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

/* Apenas admin (role_id === 1) pode gerir utilizadores */
router.use(authenticateToken);
router.use(authorizeRole(1));

/* Listar utilizadores */
router.get("/", async (_req, res) => {
  try {
    const users = await User.listAll();
    res.json(users);
  } catch (err) {
    console.error("Error listing users:", err);
    res.status(500).json({ message: "Error listing users" });
  }
});

/* Criar novo utilizador */
router.post("/", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Erro ao criar utilizador:", err);
    res.status(400).json({ message: err.message || "Erro ao criar utilizador" });
  }
});

/* Atualizar utilizador */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await User.update(id, req.body);
    res.json(updatedUser);
  } catch (err) {
    console.error(`Erro ao atualizar utilizador com ID ${id}:`, err);
    res.status(400).json({ message: err.message || "Erro ao atualizar utilizador" });
  }
});

module.exports = router;
