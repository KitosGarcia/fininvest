const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const Contribution = require("../models/contributionModel");
const FundTransaction = require("../models/fundTransactionModel");
const Member = require("../models/memberModel"); // Needed to get member name for receipt
const BankAccount = require("../models/bankAccountModel"); // Assuming model exists, needed for transaction
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
// TODO: Import a service layer for transaction logic and PDF generation

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authenticateToken); // Ensure user is logged in

// Function to generate PDF receipt using the Python script
const generateReceiptPDF = (contribution, memberName) => {
    return new Promise((resolve, reject) => {
        // Define paths and filename
        const pdfDir = path.join(__dirname, "../../..", "receipts", "quotas"); // Store PDFs outside server code, e.g., /home/ubuntu/fininvest/receipts/quotas
        const filename = `quota_receipt_${contribution.contribution_id}_${contribution.member_id}_${contribution.payment_year}_${contribution.payment_month}.pdf`;
        const outputPath = path.join(pdfDir, filename);
        const relativePath = `/receipts/quotas/${filename}`; // Path to store in DB

        // Ensure directory exists
        fs.mkdirSync(pdfDir, { recursive: true });

        // Prepare data for the Python script
        const receiptData = {
            "Recibo_Nº": `Q${contribution.payment_year}${String(contribution.payment_month).padStart(2, "0")}-${String(contribution.contribution_id).padStart(3, "0")}`,
            "Data_Pagamento": contribution.payment_date ? new Date(contribution.payment_date).toLocaleString("pt-PT") : new Date().toLocaleString("pt-PT"),
            "Sócio": memberName,
            "Referente_a": "Quota Mensal",
            "Mês/Ano": `${String(contribution.payment_month).padStart(2, "0")}/${contribution.payment_year}`,
            "Valor_Pago": `${parseFloat(contribution.amount_paid).toFixed(2)} EUR`,
            "Método_Pagamento": contribution.payment_method || "N/A"
        };

        // Convert data object to command line arguments
        const args = [outputPath];
        for (const [key, value] of Object.entries(receiptData)) {
            args.push(key, String(value));
        }

        const pythonExecutable = "python3.11"; // Use the specific python version available
        const scriptPath = path.join(__dirname, "../utils/pdf_generators/generate_receipt.py");

        console.log(`Executing: ${pythonExecutable} ${scriptPath} ${args.join(" ")}`);
        const pythonProcess = spawn(pythonExecutable, [scriptPath, ...args]);

        let stdout = "";
        let stderr = "";

        pythonProcess.stdout.on("data", (data) => {
            stdout += data.toString();
            console.log(`PDF Script stdout: ${data}`);
        });

        pythonProcess.stderr.on("data", (data) => {
            stderr += data.toString();
            console.error(`PDF Script stderr: ${data}`);
        });

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                console.log(`PDF generation script finished successfully for contribution ${contribution.contribution_id}.`);
                resolve(relativePath); // Return the relative path for DB storage
            } else {
                console.error(`PDF generation script exited with code ${code} for contribution ${contribution.contribution_id}.`);
                reject(new Error(`PDF generation failed: ${stderr || stdout}`));
            }
        });

        pythonProcess.on("error", (err) => {
             console.error("Failed to start PDF generation script:", err);
             reject(err);
        });
    });
};


// GET all contributions (with optional filters: memberId, status, year, month)
// Access: Admin or Member (can see their own? Add logic)
router.get("/", async (req, res) => {
  try {
    const filters = {
        memberId: req.query.memberId,
        status: req.query.status,
        year: req.query.year,
        month: req.query.month
    };
    // TODO: Add logic to restrict non-admins to only see their own contributions if memberId filter isn't set or doesn't match req.user.memberId
    const contributions = await Contribution.findAll(filters);
    res.json(contributions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contributions", error: error.message });
  }
});

// GET a specific contribution by ID
// Access: Admin or the specific Member
router.get("/:id", async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }
    // TODO: Add authorization check: req.user.role === 'admin' || req.user.memberId === contribution.member_id
    res.json(contribution);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contribution", error: error.message });
  }
});

// POST create a new contribution record (Admin registers manually)
router.post("/", authorizeRole("admin"), async (req, res) => {
  const { member_id, amount_due, due_date, payment_month, payment_year, status } = req.body;
  const recorded_by_user_id = req.user.userId;

  if (!member_id || !amount_due || !due_date || !payment_month || !payment_year) {
      return res.status(400).json({ message: "Member ID, amount due, due date, payment month, and payment year are required."}) ;
  }

  try {
    // Manual creation implies it wasn't generated automatically
    const newContribution = await Contribution.create({
        member_id,
        amount_due,
        amount_paid: 0,
        due_date,
        payment_month,
        payment_year,
        status: status || 'due', // Default to due if not specified
        generated_automatically: false
    });

    // Manual creation usually doesn't trigger fund transaction immediately

    res.status(201).json({ message: "Contribution recorded successfully", contribution: newContribution });
  } catch (error) {
     if (error.message.includes("Member not found")) {
        return res.status(404).json({ message: error.message });
    }
     if (error.code === '23505') { // Unique constraint violation
         return res.status(409).json({ message: `Contribution record already exists for member ${member_id} for ${payment_month}/${payment_year}.` });
     }
    res.status(500).json({ message: "Error recording contribution", error: error.message });
  }
});

// PUT confirm a contribution payment (Admin only)
router.put("/:id/confirm", authorizeRole("admin"), async (req, res) => {
  const { amount_paid, payment_date, payment_method, payment_proof_url, bank_account_id, notes } = req.body;
  const contribution_id = req.params.id;
  const recorded_by_user_id = req.user.userId; // User performing the confirmation

  if (!amount_paid || !payment_date || !bank_account_id) {
      return res.status(400).json({ message: "Amount paid, payment date, and bank account ID are required for confirmation."} );
  }

  const client = await db.pool.connect(); // Use transaction

  try {
    await client.query("BEGIN");

    // 1. Find the contribution record
    const contribResult = await client.query("SELECT * FROM contributions WHERE contribution_id = $1 FOR UPDATE", [contribution_id]);
    const originalContribution = contribResult.rows[0];

    if (!originalContribution) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Contribution not found" });
    }
    if (originalContribution.status === 'paid') {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Contribution already marked as paid." });
    }

    // 2. Update the contribution record
    const newStatus = 'paid'; // Mark as paid upon confirmation
    const updateQuery = `
        UPDATE contributions 
        SET amount_paid = $1, payment_date = $2, status = $3, payment_method = $4, payment_proof_url = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
        WHERE contribution_id = $7
        RETURNING *;
    `;
    const updateValues = [amount_paid, payment_date, newStatus, payment_method, payment_proof_url, notes, contribution_id];
    const updatedResult = await client.query(updateQuery, updateValues);
    const updatedContribution = updatedResult.rows[0];

    // 3. Create the Fund Transaction
    const transactionQuery = `
        INSERT INTO fund_transactions 
            (bank_account_id, transaction_type, amount, transaction_date, description, related_entity_type, related_entity_id, recorded_by_user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const transactionValues = [
        bank_account_id,
        "contribution_received",
        updatedContribution.amount_paid, // Amount received
        updatedContribution.payment_date,
        `Quota received from Member ID: ${updatedContribution.member_id} for ${updatedContribution.payment_month}/${updatedContribution.payment_year}`,
        "contribution",
        updatedContribution.contribution_id,
        recorded_by_user_id
    ];
    await client.query(transactionQuery, transactionValues);

    // 4. Generate PDF Receipt
    const memberResult = await client.query("SELECT name FROM members WHERE member_id = $1", [updatedContribution.member_id]);
    const memberName = memberResult.rows[0]?.name || "Sócio Desconhecido";
    
    let receiptPath = null;
    try {
        receiptPath = await generateReceiptPDF(updatedContribution, memberName);
        // 5. Update contribution record with receipt URL
        await client.query("UPDATE contributions SET receipt_url = $1 WHERE contribution_id = $2", [receiptPath, contribution_id]);
        updatedContribution.receipt_url = receiptPath; // Update the object to return
    } catch (pdfError) {
        console.error("Failed to generate or save PDF receipt path:", pdfError);
        // Decide if this should rollback the transaction or just log the error
        // For now, let's log and continue, but mark the receipt as failed?
        // Maybe add a field like receipt_generation_status?
    }

    await client.query("COMMIT");
    res.json({ message: "Contribution payment confirmed successfully", contribution: updatedContribution });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error confirming contribution payment:", error);
    res.status(500).json({ message: "Error confirming contribution payment", error: error.message });
  } finally {
      client.release();
  }
});

// PUT update a contribution (e.g., correct details - Admin only)
// Avoid using this to change status, use the /confirm endpoint for that.
router.put("/:id", authorizeRole("admin"), async (req, res) => {
  const { amount_due, due_date, payment_month, payment_year, payment_method, payment_proof_url, notes, status } = req.body;
  const contribution_id = req.params.id;

  // Basic validation: Ensure at least one field is being updated
  if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No update data provided."} );
  }
  // Prevent changing status here if it's 'paid'
  if (status === 'paid') {
      return res.status(400).json({ message: "Cannot change status to 'paid' via this endpoint. Use the /confirm endpoint."} );
  }

  try {
    const originalContribution = await Contribution.findById(contribution_id);
    if (!originalContribution) {
        return res.status(404).json({ message: "Contribution not found" });
    }
    if (originalContribution.status === 'paid') {
         return res.status(400).json({ message: "Cannot modify a contribution that is already paid."} );
    }

    // Build update object carefully
    const updates = {};
    if (amount_due !== undefined) updates.amount_due = amount_due;
    if (due_date !== undefined) updates.due_date = due_date;
    if (payment_month !== undefined) updates.payment_month = payment_month;
    if (payment_year !== undefined) updates.payment_year = payment_year;
    if (payment_method !== undefined) updates.payment_method = payment_method;
    if (payment_proof_url !== undefined) updates.payment_proof_url = payment_proof_url;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined && status !== 'paid') updates.status = status; // Allow status change if not 'paid'

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update."} );
    }

    const updatedContribution = await Contribution.update(contribution_id, updates);

    res.json({ message: "Contribution updated successfully", contribution: updatedContribution });
  } catch (error) {
     if (error.code === '23505') { // Unique constraint violation
         return res.status(409).json({ message: `Update failed: Contribution record already exists for this member for ${payment_month || 'target'}/${payment_year || 'year'}.` });
     }
    res.status(500).json({ message: "Error updating contribution", error: error.message });
  }
});

// DELETE a contribution (Admin only - Use with caution, especially if paid)
router.delete("/:id", authorizeRole("admin"), async (req, res) => {
  const contribution_id = req.params.id;
  const client = await db.pool.connect(); // Use transaction
  try {
    await client.query("BEGIN");
    // Check if contribution exists and its status
    const contribResult = await client.query("SELECT * FROM contributions WHERE contribution_id = $1 FOR UPDATE", [contribution_id]);
    const contribution = contribResult.rows[0];

    if (!contribution) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Contribution not found" });
    }

    // If contribution was paid, it likely has an associated FundTransaction. Deleting it is problematic.
    // Consider creating a reversing transaction instead of deleting.
    if (contribution.status === 'paid') {
        console.warn(`Attempting to delete a PAID contribution (ID: ${contribution_id}). This is highly discouraged.`);
        // Option: Prevent deletion
        // await client.query("ROLLBACK");
        // return res.status(400).json({ message: "Cannot delete a contribution that has been paid. Consider creating an adjustment." });
        
        // Option: Allow deletion but log warning (current approach)
    }

    // Delete the contribution record
    const deleteResult = await client.query("DELETE FROM contributions WHERE contribution_id = $1 RETURNING *", [contribution_id]);
    const deletedContribution = deleteResult.rows[0];

    // TODO: Find and potentially reverse/mark the associated FundTransaction if status was 'paid'. Requires careful logic.
    // e.g., Find transaction where related_entity_type='contribution' and related_entity_id=contribution_id

    await client.query("COMMIT");
    res.json({ message: "Contribution deleted successfully (use with caution!)", contribution: deletedContribution });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`Error deleting contribution ID ${contribution_id}:`, error);
    res.status(500).json({ message: "Error deleting contribution", error: error.message });
  } finally {
      client.release();
  }
});

module.exports = router;
