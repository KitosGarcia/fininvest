const BankAccount = require("../models/bankAccountModel");

// GET all bank accounts
exports.getAll = async (req, res) => {
   console.log("🧠 Usuário autenticado:", req.user); // 👈 Log útil
  const includeInactive = req.query.includeInactive === "true";
  try {
    const accounts = await BankAccount.findAll(includeInactive);
    res.json(accounts);
  } catch (error) {
    console.error("❌ Erro ao buscar contas bancárias:", error); // 👈 Log de erro
    res.status(500).json({ message: "Erro ao buscar contas bancárias", error: error.message });
  }
};

// GET a specific bank account by ID
exports.getById = async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: "Conta bancária não encontrada" });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar conta", error: error.message });
  }
};

// POST create a new bank account
exports.create = async (req, res) => {
  const { account_name, bank_name, iban, account_type, initial_balance } = req.body;
  if (!account_name) {
    return res.status(400).json({ message: "Nome da conta é obrigatório." });
  }

  try {
    const newAccount = await BankAccount.create({ account_name, bank_name, iban, account_type, initial_balance });
    res.status(201).json({ message: "Conta criada com sucesso", account: newAccount });
  } catch (error) {
    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Erro ao criar conta bancária", error: error.message });
  }
};

// PUT update bank account
exports.update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);
  if (!Object.keys(updates).length) {
    return res.status(400).json({ message: "Nenhum campo enviado para atualização." });
  }

  try {
    const updated = await BankAccount.update(id, updates);
    res.json({ message: "Conta atualizada com sucesso", account: updated });
  } catch (error) {
    if (error.message.includes("não encontrada")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Erro ao atualizar conta", error: error.message });
  }
};

// DELETE bank account
exports.remove = async (req, res) => {
  const { id } = req.params;

  try {
    const account = await BankAccount.findById(id);
    if (!account) {
      return res.status(404).json({ message: "Conta bancária não encontrada" });
    }

    if (account.is_active) {
      await BankAccount.update(id, { is_active: false });
      return res.json({ message: "Conta marcada como inativa com sucesso." });
    }

    try {
      const deleted = await BankAccount.delete(id);
      return res.json({ message: "Conta inativa removida permanentemente", account: deleted });
    } catch (delErr) {
      if (delErr.message.includes("transações associadas")) {
        return res.status(409).json({ message: delErr.message });
      }
      throw delErr;
    }
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar/inativar conta", error: error.message });
  }
};
