const jwt = require("jsonwebtoken");
require("dotenv").config();

/* --- Autenticação com JWT --- */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.user = {
      user_id: payload.user_id,
      username: payload.username,
      role_id: payload.role_id,
      permissions: payload.permissions  // 🔥 Importante!
    };

    next();
  });
};

/* --- Autorização por Role ID --- */
function authorizeRole(requiredRoleId) {
  return (req, res, next) => {
    if (!req.user || req.user.role_id !== requiredRoleId) {
      return res.status(403).json({ message: "Acesso negado: perfil insuficiente." });
    }
    next();
  };
}

/* --- Autorização baseada em permissões CRUD --- */
function authorizePermission(module, action) {
  return (req, res, next) => {
    
    const user = req.user;
    if (!user || !user.permissions) {
      return res.status(403).json({ message: "Permissões não encontradas." });
    }

    const perm = user.permissions.find(p => p.module === module);
    if (!perm || !perm[`can_${action}`]) {
      return res.status(403).json({ message: "Permissão insuficiente." });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizePermission
};
