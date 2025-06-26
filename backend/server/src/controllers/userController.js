const User = require("../models/userModel");

// Listar utilizadores
exports.listUsers = async (req, res) => {
  try {
    const users = await User.listAll();
    res.json(users);
  } catch (err) {
    console.error("Erro ao listar utilizadores:", err);
    res.status(500).json({ message: "Erro ao listar utilizadores" });
  }
};

// Criar utilizador
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    console.error("Erro ao criar utilizador:", err);
    res.status(400).json({ message: err.message || "Erro ao criar utilizador" });
  }
};

// Atualizar utilizador
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await User.update(id, req.body);
    res.json(updatedUser);
  } catch (err) {
    console.error(`Erro ao atualizar utilizador ${id}:`, err);
    res.status(400).json({ message: err.message || "Erro ao atualizar utilizador" });
  }
};
