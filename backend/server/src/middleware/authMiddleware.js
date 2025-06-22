const jwt = require("jsonwebtoken");
require("dotenv").config();

/* --- Autenticação com JWT --- */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // formato: Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      const message = err.name === 'TokenExpiredError'
        ? "Token expired."
        : "Invalid or expired token.";
      return res.status(403).json({ message });
    }

    req.user = user; // payload: { user_id, username, role_id }
    next();
  });
};

/* --- Autorização por role_id (ex: 1 = admin) --- */
function authorizeRole(requiredRoleId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Acesso negado: usuário não autenticado." });
    }

    if (req.user.role_id !== requiredRoleId) {
      return res.status(403).json({ message: "Acesso negado: perfil insuficiente." });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole
};
