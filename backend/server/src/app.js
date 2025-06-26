require("dotenv").config();
const express = require("express");
const cors = require("cors");



// Import routes
const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const clientRoutes = require("./routes/clientRoutes");
const loanRoutes = require("./routes/loanRoutes");
const contributionRoutes = require("./routes/contributionRoutes");
const loanPaymentRoutes = require("./routes/loanPaymentRoutes");
const fundTransactionRoutes = require("./routes/fundTransactionRoutes");
const bankAccountRoutes = require("./routes/bankAccountRoutes"); // Added
const internalTransferRoutes = require("./routes/internalTransferRoutes"); // Added
const automationRoutes = require("./routes/automationRoutes"); // Added
const dashboardRoutes = require("./routes/dashboardRoutes"); // Added
const currencyRoutes = require("./routes/currencyRoutes"); // Added
const companyRoutes = require("./routes/companyRoutes"); //Added
const roleRoutes = require("./routes/roleRoutes"); // Added
const userRoutes = require("./routes/userRoutes");
const contributionPaymentRoutes = require("./routes/contributionPaymentRoutes");



// Import controllers


const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Basic Route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Fininvest API V2!" });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes); // Auth handled within route file
app.use("/api/clients", clientRoutes); // Auth handled within route file
app.use("/api/loans", loanRoutes); // Auth handled within route file
app.use("/api/contributions", contributionRoutes); // Auth handled within route file
app.use("/api/payments", loanPaymentRoutes); // Auth handled within route file
app.use("/api/transactions", fundTransactionRoutes); // Auth handled within route file
app.use("/api/accounts", bankAccountRoutes); // Auth handled within route file
app.use("/api/transfers", internalTransferRoutes); // Auth handled within route file
app.use("/api/automation", automationRoutes); // Auth handled within route file
app.use("/api/dashboard", dashboardRoutes); // Auth handled within route file
app.use("/api/currencies", currencyRoutes); // Auth handled within route file
app.use("/api/company", companyRoutes); 
app.use("/api/roles", roleRoutes);
app.use("/api/users",  userRoutes);
app.use("/api/contributionpayments", contributionPaymentRoutes); // Auth handled within route file

// Global Error Handler (Basic Example)
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  // Provide more details in development
  const errorDetails = process.env.NODE_ENV === "development" ? err.message : "An internal server error occurred.";
  res.status(err.status || 500).json({ message: "Something broke!", error: errorDetails });
});

// 404 Handler for unhandled routes
app.use((req, res, next) => {
    res.status(404).json({ message: `Resource not found at ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export for potential testing

