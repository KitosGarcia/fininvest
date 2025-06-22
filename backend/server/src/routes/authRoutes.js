const express = require("express");
const jwt     = require("jsonwebtoken");
const bcrypt  = require("bcryptjs");
const User    = require("../models/userModel");
const AuditLogService = require("../services/auditLogService");
require("dotenv").config();
const { getPermissionsForRole } = require("../utils/permissions");


const router = express.Router();

/* ---------- REGISTO ---------- */
router.post("/register", async (req, res) => {
  const { member_id, username, password, role_id } = req.body;        // <- usa role_id
  const ip_address = req.ip;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    /* username já existente? */
    if (await User.findByUsername(username)) {
      AuditLogService.logAction({
        action_type: "register_failed",
        details: { reason: "Username already exists", username },
        ip_address,
      });
      return res.status(409).json({ message: "Username already exists." });
    }

    /* cria utilizador */
    const newUser = await User.create({ member_id, username, password, role_id });

    /* regista no audit */
    AuditLogService.logAction({
      user_id: newUser.user_id,
      action_type: "register_success",
      entity_type: "user",
      entity_id: newUser.user_id,
      ip_address,
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    AuditLogService.logAction({
      action_type: "register_failed",
      details: { reason: error.message, username },
      ip_address,
    });
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
});

/* ---------- LOGIN ---------- */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const ip_address = req.ip;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await User.findByUsername(username);
    if (!user) {
      AuditLogService.logAction({
        action_type: "login_failed",
        details: { reason: "User not found", username },
        ip_address,
      });
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      AuditLogService.logAction({
        user_id: user.user_id,
        action_type: "login_failed",
        details: { reason: "Invalid password", username },
        ip_address,
      });
      return res.status(401).json({ message: "Invalid credentials." });
    }

    /* gera JWT */
const token = jwt.sign(
  { user_id: user.user_id, username: user.username, role_id: user.role_id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
);

    User.updateLastLogin(user.user_id);  // async “fire-and-forget”

    AuditLogService.logAction({
      user_id: user.user_id,
      action_type: "login_success",
      ip_address,
    });

const permissions = await getPermissionsForRole(user.role_id);
const { password_hash, ...safeUser } = user;

res.json({
  message: "Login successful",
  token,
  user: safeUser,
  permissions, // ← agora enviamos isto ao front
});
  } catch (error) {
    console.error("Login error:", error);
    AuditLogService.logAction({
      action_type: "login_failed",
      details: { reason: error.message, username },
      ip_address,
    });
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

module.exports = router;
