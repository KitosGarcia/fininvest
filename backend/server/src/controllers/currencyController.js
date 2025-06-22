const db = require("../config/db"); // ou ../db/pool dependendo do teu setup

// 📌 Obter todas as moedas
exports.getAllCurrencies = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM currencies ORDER BY code");
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar moedas:", err);
    res.status(500).json({ error: "Erro ao buscar moedas." });
  }
};

// 📌 Criar nova moeda
exports.createCurrency = async (req, res) => {
  const { code, name, symbol, is_main } = req.body;

  if (!code || !name || !symbol) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
  }

  try {
    const insert = `
      INSERT INTO currencies (code, name, symbol, is_primary)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const values = [code, name, symbol, is_main || false];
    const result = await db.query(insert, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao criar moeda:", err);
    res.status(500).json({ error: "Erro ao criar moeda." });
  }
};

// 📌 Atualizar moeda existente
exports.updateCurrency = async (req, res) => {
  const { code } = req.params;
  const { name, symbol, is_main } = req.body;

  try {
    const result = await db.query(
      `UPDATE currencies SET name = $1, symbol = $2, is_primary = $3 WHERE code = $4 RETURNING *`,
      [name, symbol, is_main ?? false, code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Moeda não encontrada." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao atualizar moeda:", err);  // <-- importante para debug
    res.status(500).json({ error: "Erro ao atualizar moeda." });
  }
};


// 📌 Eliminar moeda
exports.deleteCurrency = async (req, res) => {
  const { code } = req.params;

  try {
    const result = await db.query("DELETE FROM currencies WHERE code = $1 RETURNING *", [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Moeda não encontrada." });
    }

    res.json({ message: "Moeda eliminada com sucesso." });
  } catch (err) {
    console.error("Erro ao eliminar moeda:", err);
    res.status(500).json({ error: "Erro ao eliminar moeda." });
  }
};
