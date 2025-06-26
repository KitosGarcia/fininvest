const Role = require("../models/roleModel");

// Lista todos os perfis (roles)
exports.getAllRoles = async (_req, res) => {
  try {
    const roles = await Role.getAll();
    res.json(roles);
  } catch (error) {
    console.error("Erro ao listar perfis:", error);
    res.status(500).json({ message: "Erro ao buscar perfis" });
  }
};
