require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// ✅ Registra a rota de upload ANTES dos parsers que quebram multipart/form-data
const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload", uploadRoutes);

// ✅ Servir os ficheiros da pasta uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🟢 Agora sim: parse JSON e URL-encoded (não afeta mais o upload)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const clientRoutes = require("./routes/clientRoutes");
const loanRoutes = require("./routes/loanRoutes");
const contributionRoutes = require("./routes/contributionRoutes");
const loanPaymentRoutes = require("./routes/loanPaymentRoutes");
const fundTransactionRoutes = require("./routes/fundTransactionRoutes");
const bankAccountRoutes = require("./routes/bankAccountRoutes");
const internalTransferRoutes = require("./routes/internalTransferRoutes");
const automationRoutes = require("./routes/automationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const currencyRoutes = require("./routes/currencyRoutes");
const companyRoutes = require("./routes/companyRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const contributionPaymentRoutes = require("./routes/contributionPaymentRoutes");
const paymentMethodRoutes = require("./routes/paymentMethodRoutes");
const tierRoutes = require('./routes/tierRoutes');

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Fininvest API V2!" });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/payments", loanPaymentRoutes);
app.use("/api/transactions", fundTransactionRoutes);
app.use("/api/accounts", bankAccountRoutes);
app.use("/api/transfers", internalTransferRoutes);
app.use("/api/automation", automationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contribution-payments", contributionPaymentRoutes);
app.use("/api/bank-accounts", bankAccountRoutes);
app.use("/api/payment-methods", paymentMethodRoutes);
app.use('/api/tiers', tierRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  const errorDetails = process.env.NODE_ENV === "development" ? err.message : "An internal server error occurred.";
  res.status(err.status || 500).json({ message: "Something broke!", error: errorDetails });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Resource not found at ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
