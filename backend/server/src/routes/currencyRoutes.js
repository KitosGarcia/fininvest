const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");

// GET /api/currencies  -> lista todas as moedas
router.get("/", currencyController.getAllCurrencies);

// POST /api/currencies -> cria nova moeda
router.post("/", currencyController.createCurrency);

// PUT /api/currencies/:code -> atualiza moeda existente
router.put("/:code", currencyController.updateCurrency);

// DELETE /api/currencies/:code -> remove moeda
router.delete("/:code", currencyController.deleteCurrency);

module.exports = router;
