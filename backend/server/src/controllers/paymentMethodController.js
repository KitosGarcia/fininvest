// src/controllers/paymentMethodController.js
const db = require("../config/db"); 

exports.getPaymentMethods = async (req, res) => {
  try {
    const result = await db.query("select method_id,description from payment_methods");
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar métodos de pagamento:", error);
    res.status(500).json({ message: "Erro ao buscar métodos de pagamento" });
  }
};
