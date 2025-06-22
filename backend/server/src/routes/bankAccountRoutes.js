const express = require("express");
const BankAccount = require("../models/bankAccountModel");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware: Only admins can manage bank accounts
router.use(authenticateToken);
router.use(authorizeRole(1));

// GET all bank accounts (active by default, use ?includeInactive=true for all)
router.get("/", async (req, res) => {
    const includeInactive = req.query.includeInactive === "true";
    try {
        const accounts = await BankAccount.findAll(includeInactive);
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bank accounts", error: error.message });
    }
});

// GET a specific bank account by ID
router.get("/:id", async (req, res) => {
    try {
        const account = await BankAccount.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: "Bank account not found" });
        }
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bank account", error: error.message });
    }
});

// POST create a new bank account
router.post("/", async (req, res) => {
    const { account_name, bank_name, iban, account_type, initial_balance } = req.body;

    if (!account_name) {
        return res.status(400).json({ message: "Account name is required." });
    }

    try {
        const newAccount = await BankAccount.create({ 
            account_name, 
            bank_name, 
            iban, 
            account_type, 
            initial_balance 
        });
        res.status(201).json({ message: "Bank account created successfully", account: newAccount });
    } catch (error) {
        if (error.message.includes("already exists")) {
            return res.status(409).json({ message: error.message }); // Conflict
        }
        res.status(500).json({ message: "Error creating bank account", error: error.message });
    }
});

// PUT update a bank account
router.put("/:id", async (req, res) => {
const { account_name, bank_name, iban, account_type, is_active, currency } = req.body;
const updates = { account_name, bank_name, iban, account_type, is_active, currency };

    // Remove undefined fields so the model doesn't try to update them to null
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No update data provided." });
    }

    try {
        const updatedAccount = await BankAccount.update(req.params.id, updates);
        res.json({ message: "Bank account updated successfully", account: updatedAccount });
    } catch (error) {
         if (error.message.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        if (error.message.includes("already exists")) {
            return res.status(409).json({ message: error.message }); // Conflict
        }
        res.status(500).json({ message: "Error updating bank account", error: error.message });
    }
});

// DELETE a bank account (soft delete preferred, model prevents hard delete if transactions exist)
router.delete("/:id", async (req, res) => {
    try {
        // Attempt soft delete first by marking inactive
        const account = await BankAccount.findById(req.params.id);
        if (!account) {
             return res.status(404).json({ message: "Bank account not found" });
        }
        if (account.is_active) {
            await BankAccount.update(req.params.id, { is_active: false });
             return res.json({ message: "Bank account marked as inactive successfully." });
        } else {
            // If already inactive, maybe allow hard delete attempt (model will throw error if transactions exist)
            try {
                const deletedAccount = await BankAccount.delete(req.params.id);
                return res.json({ message: "Inactive bank account permanently deleted (use with caution!)", account: deletedAccount });
            } catch (deleteError) {
                 if (deleteError.message.includes("associated transactions")) {
                    return res.status(409).json({ message: deleteError.message }); // Conflict
                 } else {
                     throw deleteError; // Rethrow other delete errors
                 }
            }
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting/inactivating bank account", error: error.message });
    }
});

module.exports = router;
