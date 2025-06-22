const express = require("express");
const InternalTransfer = require("../models/internalTransferModel");
const BankAccount = require("../models/bankAccountModel"); // For balance check
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const db = require("../config/db"); // Required for transaction
// TODO: Import PDF generation utility for transfer proof

const router = express.Router();

// Middleware: Only admins can manage internal transfers
router.use(authenticateToken);
router.use(authorizeRole("admin"));

// GET all internal transfers (with optional filters)
router.get("/", async (req, res) => {
    try {
        const filters = {
            fromAccountId: req.query.fromAccountId,
            toAccountId: req.query.toAccountId,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };
        const transfers = await InternalTransfer.findAll(filters);
        res.json(transfers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching internal transfers", error: error.message });
    }
});

// GET a specific internal transfer by ID
router.get("/:id", async (req, res) => {
    try {
        const transfer = await InternalTransfer.findById(req.params.id);
        if (!transfer) {
            return res.status(404).json({ message: "Internal transfer not found" });
        }
        res.json(transfer);
    } catch (error) {
        res.status(500).json({ message: "Error fetching internal transfer", error: error.message });
    }
});

// POST create a new internal transfer
router.post("/", async (req, res) => {
    const { from_account_id, to_account_id, amount, description } = req.body;
    const recorded_by_user_id = req.user.userId;

    if (!from_account_id || !to_account_id || !amount) {
        return res.status(400).json({ message: "Source account ID, destination account ID, and amount are required." });
    }
    if (from_account_id === to_account_id) {
        return res.status(400).json({ message: "Source and destination accounts cannot be the same." });
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number." });
    }

    const client = await db.pool.connect(); // Use transaction

    try {
        await client.query("BEGIN");

        // 1. Check if accounts exist and source has sufficient balance
        const fromAccount = await client.query("SELECT * FROM bank_accounts WHERE account_id = $1 FOR UPDATE", [from_account_id]);
        const toAccount = await client.query("SELECT * FROM bank_accounts WHERE account_id = $1 FOR UPDATE", [to_account_id]);

        if (fromAccount.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: `Source bank account with ID ${from_account_id} not found.` });
        }
        if (toAccount.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: `Destination bank account with ID ${to_account_id} not found.` });
        }
        if (parseFloat(fromAccount.rows[0].current_balance) < numericAmount) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: `Insufficient balance in source account ${fromAccount.rows[0].account_name}. Current balance: ${fromAccount.rows[0].current_balance}` });
        }

        // 2. Create the internal transfer record and associated fund transactions
        const newTransfer = await InternalTransfer.create({
            from_account_id,
            to_account_id,
            amount: numericAmount,
            description,
            // proof_url will be generated later
            recorded_by_user_id
        }, client); // Pass transaction client

        // 3. TODO: Generate PDF Justification (optional, can be done later or on demand)
        let proofPath = null;
        // try {
        //     proofPath = await generateTransferProofPDF(newTransfer, fromAccount.rows[0], toAccount.rows[0]);
        //     await InternalTransfer.updateProofUrl(newTransfer.transfer_id, proofPath, client);
        //     newTransfer.proof_url = proofPath;
        // } catch (pdfError) {
        //     console.error("Failed to generate or save transfer proof PDF path:", pdfError);
        //     // Decide if this should rollback or just log
        // }

        await client.query("COMMIT");
        res.status(201).json({ message: "Internal transfer created successfully", transfer: newTransfer });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error creating internal transfer:", error);
        // Handle specific errors like FK violation if not caught by initial checks
        res.status(500).json({ message: "Error creating internal transfer", error: error.message });
    } finally {
        client.release();
    }
});

// PUT update transfer (DISABLED)
router.put("/:id", (req, res) => {
    res.status(405).json({ message: "Updating internal transfers is not allowed." });
});

// DELETE transfer (DISABLED)
router.delete("/:id", (req, res) => {
    res.status(405).json({ message: "Deleting internal transfers is not allowed." });
});

module.exports = router;
