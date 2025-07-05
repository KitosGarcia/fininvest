const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { findByUsername } = require("../models/userModel");
const { getPermissionsForRole } = require("../utils/permissions");
require("dotenv").config();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username e password são obrigatórios." });
  }

  try {
    const user = await findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const permissions = await getPermissionsForRole(user.role_id);

    // 🔥 Adiciona role_name para o frontend poder verificar permissões visuais
    const role_name = user.role_name || "user";

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role_id: user.role_id,
        role_name,
        permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    // Remover hash antes de enviar
    const { password_hash, ...safeUser } = user;

    res.json({
      message: "Login efetuado com sucesso",
      token,
      user: {
        ...safeUser,
        role_name,
        permissions
      }
    });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: "Erro no servidor durante o login." });
  }
});

module.exports = router;
