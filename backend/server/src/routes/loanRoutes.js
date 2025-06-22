const express = require("express");
const db = require("../config/db"); // Required for transaction
const Loan = require("../models/loanModel");
const LoanPayment = require("../models/loanPaymentModel"); // Needed for schedule generation
const FundTransaction = require("../models/fundTransactionModel"); // Needed for disbursement transaction
const BankAccount = require("../models/bankAccountModel"); // Needed for balance update
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const AuditLogService = require("../services/auditLogService"); // Added
const NotificationService = require("../services/notificationService"); // Added for approval/rejection notifications

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authenticateToken); // Ensure user is logged in

// GET all loans (with optional filters: status, clientId)
router.get("/", async (req, res) => {
  try {
    const filters = { status: req.query.status, clientId: req.query.clientId };
    // TODO: Add authorization logic if non-admins should only see specific loans
    const loans = await Loan.findAll(filters);
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loans", error: error.message });
  }
});

// GET a specific loan by ID
router.get("/:id", async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    // TODO: Add authorization check: req.user.role === 'admin' || (loan.client_id === req.user.clientId) // Assuming clientId is available in user token
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loan", error: error.message });
  }
});

// POST create a new loan request
router.post("/request", async (req, res) => {
  const { client_id, amount_requested, interest_rate, loan_purpose, repayment_term_months, guarantees, application_form_data } = req.body;
  const created_by_user_id = req.user.userId;
  const ip_address = req.ip;

  if (!client_id || !amount_requested || !interest_rate || !repayment_term_months) {
      return res.status(400).json({ message: "Client ID, amount requested, interest rate, and repayment term are required."}) ;
  }

  try {
    const newLoanRequest = await Loan.create({ 
        client_id, 
        amount_requested, 
        interest_rate, 
        loan_purpose, 
        repayment_term_months, 
        guarantees,
        application_form_data, 
        created_by_user_id,
        status: "pending_approval"
    });
    
    // Log successful request
    AuditLogService.logAction({
        user_id: created_by_user_id,
        action: "loan_request_created",
        entity_type: "loan",
        entity_id: newLoanRequest.loan_id,
        details: { client_id, amount_requested },
        ip_address: ip_address
    });

    res.status(201).json({ message: "Loan request submitted successfully", loan: newLoanRequest });
  } catch (error) {
     // Log failed request
     AuditLogService.logAction({
        user_id: created_by_user_id,
        action: "loan_request_failed",
        details: { error: error.message, client_id, amount_requested },
        ip_address: ip_address
    });
     if (error.message.includes("Client not found")) {
        return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error creating loan request", error: error.message });
  }
});

// PUT approve a loan request (Admin access only)
router.put("/:id/approve", authorizeRole("admin"), async (req, res) => {
  const { amount_approved, contract_url, disbursement_bank_account_id, credit_approval_proof_url } = req.body;
  const approved_by_user_id = req.user.userId;
  const loan_id = req.params.id;
  const ip_address = req.ip;

  if (!amount_approved || !disbursement_bank_account_id) {
       return res.status(400).json({ message: "Approved amount and disbursement bank account ID are required."}) ;
  }

  const client = await db.pool.connect(); // Use transaction
  let loanBeforeUpdate = null; // To log changes

  try {
    await client.query("BEGIN");

    // 1. Find the loan and lock it
    const loanResult = await client.query("SELECT * FROM loans WHERE loan_id = $1 FOR UPDATE", [loan_id]);
    loanBeforeUpdate = loanResult.rows[0];

    if (!loanBeforeUpdate) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Loan not found" });
    }
    if (loanBeforeUpdate.status !== 'pending_approval') {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: `Loan is not pending approval (status: ${loanBeforeUpdate.status}).` });
    }

    // --- Steps 2-5: Update loan, create schedule, create transaction, update status ---
    // (Existing logic from previous step remains here)
    const approval_date = new Date();
    const updateLoanQuery = `UPDATE loans SET amount_approved = $1, approval_date = $2, status = $3, contract_url = $4, approved_by_user_id = $5, credit_approval_proof_url = $6, updated_at = CURRENT_TIMESTAMP WHERE loan_id = $7 RETURNING *;`;
    const updateLoanValues = [amount_approved, approval_date, "approved", contract_url, approved_by_user_id, credit_approval_proof_url, loan_id];
    const updatedLoanResult = await client.query(updateLoanQuery, updateLoanValues);
    const updatedLoan = updatedLoanResult.rows[0];

    const schedule = []; 
    const monthlyRate = updatedLoan.interest_rate / 100 / 12;
    const term = updatedLoan.repayment_term_months;
    const principal = parseFloat(updatedLoan.amount_approved);
    let monthlyPayment = 0;
    if (monthlyRate > 0) {
        monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
    } else { monthlyPayment = principal / term; }
    let remainingBalance = principal;
    for (let i = 1; i <= term; i++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;
        const finalPrincipalPayment = (i === term && remainingBalance > -0.01 && remainingBalance < 0.01) ? principalPayment + remainingBalance : principalPayment;
        remainingBalance = (i === term) ? 0 : remainingBalance;
        const dueDate = new Date(approval_date); dueDate.setMonth(dueDate.getMonth() + i);
        schedule.push({ loan_id: loan_id, installment_number: i, due_date: dueDate.toISOString().split('T')[0], amount_due: monthlyPayment.toFixed(2), principal_amount: finalPrincipalPayment.toFixed(2), interest_amount: interestPayment.toFixed(2), status: 'pending' });
    }
    await LoanPayment.createSchedule(loan_id, schedule, client);

    const disbursement_date = new Date();
    await FundTransaction.create({ bank_account_id: disbursement_bank_account_id, transaction_type: "loan_disbursement", amount: -Math.abs(parseFloat(updatedLoan.amount_approved)), transaction_date: disbursement_date, description: `Desembolso Empréstimo ID: ${loan_id} | Cliente ID: ${updatedLoan.client_id}`, related_entity_type: "loan", related_entity_id: loan_id, recorded_by_user_id: approved_by_user_id }, client);

    const finalLoanUpdateQuery = `UPDATE loans SET status = $1, disbursement_date = $2, updated_at = CURRENT_TIMESTAMP WHERE loan_id = $3 RETURNING *;`;
    const finalLoanResult = await client.query(finalLoanUpdateQuery, ["active", disbursement_date, loan_id]);
    const finalLoan = finalLoanResult.rows[0];
    // --- End of existing logic ---

    // 6. Log successful approval
    AuditLogService.logAction({
        user_id: approved_by_user_id,
        action: "loan_approved",
        entity_type: "loan",
        entity_id: loan_id,
        details: { 
            approved_amount: amount_approved,
            previous_status: loanBeforeUpdate.status,
            new_status: finalLoan.status,
            disbursement_account_id: disbursement_bank_account_id
        },
        ip_address: ip_address
    }, client); // Log within the transaction

    // 7. Send notification (after commit)
    // NotificationService.notifyLoanApproved(finalLoan); // Pass client? Maybe better outside transaction

    await client.query("COMMIT");
    
    // Send notification outside transaction
    NotificationService.notifyLoanApproved(finalLoan).catch(err => console.error("Failed to send loan approval notification:", err));

    res.json({ message: "Loan approved, schedule generated, and disbursed successfully", loan: finalLoan });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Loan approval error:", error);
    // Log failed approval
    AuditLogService.logAction({
        user_id: approved_by_user_id,
        action: "loan_approval_failed",
        entity_type: "loan",
        entity_id: loan_id,
        details: { error: error.message, requested_amount: loanBeforeUpdate?.amount_requested, approved_amount_attempted: amount_approved },
        ip_address: ip_address
    });
    res.status(500).json({ message: "Error approving loan", error: error.message });
  } finally {
      client.release();
  }
});

// PUT reject a loan request (Admin access only)
router.put("/:id/reject", authorizeRole("admin"), async (req, res) => {
    const loan_id = req.params.id;
    const rejected_by_user_id = req.user.userId;
    const ip_address = req.ip;
    let loanBeforeUpdate = null;

    try {
        loanBeforeUpdate = await Loan.findById(loan_id);
        if (!loanBeforeUpdate) {
            return res.status(404).json({ message: "Loan not found" });
        }
        if (loanBeforeUpdate.status !== 'pending_approval') {
            return res.status(400).json({ message: `Loan is not pending rejection (status: ${loanBeforeUpdate.status}).` });
        }

        const updatedLoan = await Loan.update(loan_id, { 
            status: "rejected",
            approved_by_user_id: rejected_by_user_id // Log who actioned it
        });
        
        // Log successful rejection
        AuditLogService.logAction({
            user_id: rejected_by_user_id,
            action: "loan_rejected",
            entity_type: "loan",
            entity_id: loan_id,
            details: { previous_status: loanBeforeUpdate.status, new_status: updatedLoan.status },
            ip_address: ip_address
        });
        
        // Send notification
        NotificationService.notifyLoanRejected(updatedLoan).catch(err => console.error("Failed to send loan rejection notification:", err));

        res.json({ message: "Loan rejected successfully", loan: updatedLoan });
    } catch (error) {
        // Log failed rejection
        AuditLogService.logAction({
            user_id: rejected_by_user_id,
            action: "loan_rejection_failed",
            entity_type: "loan",
            entity_id: loan_id,
            details: { error: error.message, current_status: loanBeforeUpdate?.status },
            ip_address: ip_address
        });
        res.status(500).json({ message: "Error rejecting loan", error: error.message });
    }
});


// GET payments for a specific loan
router.get("/:id/payments", async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ message: "Loan not found" });
        }
        // TODO: Authorization check if non-admin
        const payments = await LoanPayment.findByLoanId(req.params.id);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching loan payments", error: error.message });
    }
});

// DELETE a loan (Admin only - Use with caution)
router.delete("/:id", authorizeRole("admin"), async (req, res) => {
  const loan_id = req.params.id;
  const deleted_by_user_id = req.user.userId;
  const ip_address = req.ip;
  let loanToDelete = null;

  try {
    loanToDelete = await Loan.findById(loan_id);
     if (!loanToDelete) {
      return res.status(404).json({ message: "Loan not found" });
    }
    // Deletion logic might need transactions if it involves reversing things
    const deletedLoan = await Loan.delete(loan_id);
    // Model's delete should throw if not allowed

    // Log successful deletion
    AuditLogService.logAction({
        user_id: deleted_by_user_id,
        action: "loan_deleted",
        entity_type: "loan",
        entity_id: loan_id,
        details: { deleted_loan_status: loanToDelete.status, client_id: loanToDelete.client_id },
        ip_address: ip_address
    });

    res.json({ message: "Loan deleted successfully (if status allowed)", loan: deletedLoan });
  } catch (error) {
     // Log failed deletion
     AuditLogService.logAction({
        user_id: deleted_by_user_id,
        action: "loan_deletion_failed",
        entity_type: "loan",
        entity_id: loan_id,
        details: { error: error.message, loan_status: loanToDelete?.status },
        ip_address: ip_address
    });
     if (error.message.includes("Cannot delete loan")) {
         return res.status(409).json({ message: error.message }); // Conflict
     }
    res.status(500).json({ message: "Error deleting loan", error: error.message });
  }
});


module.exports = router;

