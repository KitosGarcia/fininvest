const express = require("express");
const FundTransaction = require("../models/fundTransactionModel");
const BankAccount = require("../models/bankAccountModel"); // Needed for validation
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const db = require("../config/db"); // For transactions if needed for manual adjustments

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authenticateToken);
router.use(authorizeRole("admin")); // Only admins can manage transactions directly

// GET all fund transactions (with optional filters)
router.get("/", async (req, res) => {
  try {
    const filters = {
        bankAccountId: req.query.bankAccountId,
        transactionType: req.query.transactionType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        relatedEntityType: req.query.relatedEntityType,
        relatedEntityId: req.query.relatedEntityId
    };
    const transactions = await FundTransaction.findAll(filters);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fund transactions", error: error.message });
  }
});

// GET a specific fund transaction by ID
router.get("/:id", async (req, res) => {
  try {
    const transaction = await FundTransaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Fund transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error fetching fund transaction", error: error.message });
  }
});

// POST create a manual fund transaction (e.g., operational cost, other income, adjustment)
router.post("/manual", async (req, res) => {
  const {
    bank_account_id,
    transaction_type, // e.g., operational_cost, other_income, adjustment
    amount, // Positive for income/inflow, Negative for cost/outflow
    transaction_date,
    description,
    proof_url
  } = req.body;
  const recorded_by_user_id = req.user.userId;

  // Validate required fields
  if (!bank_account_id || !transaction_type || amount === undefined || !description) {
    return res.status(400).json({ message: "Bank account ID, transaction type, amount, and description are required for manual transactions." });
  }

  // Validate transaction type for manual entry
  const allowedManualTypes = ["operational_cost", "other_income", "adjustment", "initial_balance"];
  if (!allowedManualTypes.includes(transaction_type)) {
      return res.status(400).json({ message: `Transaction type '${transaction_type}' cannot be created manually via this endpoint.` });
  }
  
  // Validate amount format
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) {
      return res.status(400).json({ message: "Amount must be a valid number." });
  }

  const client = await db.pool.connect(); // Use transaction for consistency

  try {
    await client.query("BEGIN");

    // Check if bank account exists
    const bankAccount = await BankAccount.findById(bank_account_id);
    if (!bankAccount) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: `Bank account with ID ${bank_account_id} not found.` });
    }

    const newTransaction = await FundTransaction.create({
      bank_account_id,
      transaction_type,
      amount: numericAmount, // Use the validated numeric amount
      transaction_date: transaction_date || new Date(), // Default to now if not provided
      description,
      proof_url,
      recorded_by_user_id,
      related_entity_type: "manual", // Indicate it was a manual entry
      related_entity_id: null
    }, client); // Pass transaction client

    await client.query("COMMIT");
    res.status(201).json({ message: "Manual fund transaction created successfully", transaction: newTransaction });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating manual fund transaction:", error);
    res.status(500).json({ message: "Error creating manual fund transaction", error: error.message });
  } finally {
      client.release();
  }
});

// GET current balance for a specific bank account
router.get("/balance/account/:accountId", async (req, res) => {
    try {
        const accountId = req.params.accountId;
        const account = await BankAccount.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: `Bank account with ID ${accountId} not found.` });
        }
        // Return the stored balance (assuming it's kept up-to-date)
        res.json({ 
            account_id: account.account_id,
            account_name: account.account_name,
            current_balance: account.current_balance 
        });
        // Optionally, calculate and return for verification:
        // const calculatedBalance = await FundTransaction.calculateBalanceForAccount(accountId);
        // res.json({ account_id: accountId, stored_balance: account.current_balance, calculated_balance: calculatedBalance });
    } catch (error) {
        res.status(500).json({ message: "Error fetching account balance", error: error.message });
    }
});

// GET total fund balance across all active accounts
router.get("/balance/total", async (req, res) => {
    try {
        const totalBalance = await FundTransaction.getTotalFundBalance();
        res.json({ total_fund_balance: totalBalance });
    } catch (error) {
        res.status(500).json({ message: "Error fetching total fund balance", error: error.message });
    }
});


// PUT update a transaction (Limited fields like description, proof_url - Use with caution)
router.put("/:id", async (req, res) => {
    const transaction_id = req.params.id;
    const { description, proof_url } = req.body;
    const updates = {};

    if (description !== undefined) updates.description = description;
    if (proof_url !== undefined) updates.proof_url = proof_url;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update (only description and proof_url allowed)." });
    }

    try {
        const updatedTransaction = await FundTransaction.update(transaction_id, updates);
        res.json({ message: "Fund transaction updated successfully", transaction: updatedTransaction });
    } catch (error) {
        if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error updating fund transaction", error: error.message });
    }
});

// DELETE a transaction (DISABLED - Use adjustments)
router.delete("/:id", (req, res) => {
    res.status(405).json({ message: "Deleting fund transactions is not allowed. Please create an adjusting transaction instead." });
});

module.exports = router;

