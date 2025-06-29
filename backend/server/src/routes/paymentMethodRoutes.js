// src/routes/paymentMethodRoutes.js
const express = require("express");
const router = express.Router();
const { getPaymentMethods } = require("../controllers/paymentMethodController");

router.get("/", getPaymentMethods);

module.exports = router;
