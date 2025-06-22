const express = require("express");
const LoanPayment = require("../models/loanPaymentModel");
const FundTransaction = require("../models/fundTransactionModel"); // Needed for transaction creation
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
// TODO: Import a service layer for transaction logic

const router = express.Router();

// Middleware applied to all routes in this file
router.use(authenticateToken); // Ensure user is logged in

// Note: Loan payments are usually managed in the context of a specific loan.
// Routes here might be for specific admin actions or detailed views.

// GET a specific payment by ID
router.get("/:id", async (req, res) => {
  try {
    const payment = await LoanPayment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Loan payment record not found" });
    }
    // Add authorization check? Only admin or related member/client?
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loan payment record", error: error.message });
  }
});

// POST record a payment received for an installment (Admin Role)
// It might be better to have this under /loans/:loanId/payments/:paymentId/pay
router.post("/:id/pay", authorizeRole("admin"), async (req, res) => {
    const payment_id = req.params.id;
    const { amount_paid, payment_date, payment_proof_url, notes } = req.body;
    const recorded_by_user_id = req.user.userId;

    if (!amount_paid) {
        return res.status(400).json({ message: "Amount paid is required."} );
    }

    try {
        const payment = await LoanPayment.findById(payment_id);
        if (!payment) {
            return res.status(404).json({ message: "Loan payment record not found" });
        }
        if (payment.status === 'paid') {
             return res.status(400).json({ message: "This installment has already been paid." });
        }

        // Determine new status based on amount paid and due date
        let status = 'pending'; // Default, should not happen if amount_paid > 0
        const paidAmount = parseFloat(amount_paid);
        const dueAmount = parseFloat(payment.amount_due);
        const paymentDate = payment_date ? new Date(payment_date) : new Date();
        const dueDate = new Date(payment.due_date);

        if (paidAmount >= dueAmount) {
            status = 'paid';
        } else if (paidAmount > 0) {
            status = 'partially_paid'; // Need to add this status to DB schema? Or handle differently?
            // For now, let's assume full payment is required to mark as 'paid'
             return res.status(400).json({ message: "Partial payments not fully supported yet. Amount paid must equal or exceed amount due." });
        } else {
             return res.status(400).json({ message: "Amount paid must be greater than zero." });
        }
        
        // Check if payment is late (optional)
        // if (status === 'paid' && paymentDate > dueDate) { status = 'paid_late'; } // Add status?

        const updatedPayment = await LoanPayment.recordPayment(payment_id, {
            amount_paid: paidAmount.toFixed(2),
            payment_date: paymentDate,
            status: status,
            payment_proof_url,
            notes
        });

        // Create Fund Transaction for the received payment
        // TODO: Move to service layer with DB transaction
        await FundTransaction.create({
            transaction_type: "loan_repayment",
            amount: updatedPayment.amount_paid,
            transaction_date: updatedPayment.payment_date,
            description: `Payment received for Loan ID: ${updatedPayment.loan_id}, Installment: ${updatedPayment.installment_number}`,
            related_entity_type: "loan_payment",
            related_entity_id: updatedPayment.payment_id,
            recorded_by_user_id: recorded_by_user_id
        });
        
        // TODO: Check if this payment completes the loan and update loan status if necessary (in service layer)

        res.json({ message: "Payment recorded successfully", payment: updatedPayment });

    } catch (error) {
        console.error("Error recording payment:", error);
        res.status(500).json({ message: "Error recording payment", error: error.message });
    }
});

// PUT update payment details (Admin only - e.g., correct notes, proof URL)
router.put("/:id", authorizeRole("admin"), async (req, res) => {
    const payment_id = req.params.id;
    const { notes, payment_proof_url, status } = req.body; // Allow limited updates

    const updates = {};
    if (notes !== undefined) updates.notes = notes;
    if (payment_proof_url !== undefined) updates.payment_proof_url = payment_proof_url;
    // Be careful allowing status updates here - it bypasses payment logic
    // if (status !== undefined) updates.status = status; 

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields provided for update."} );
    }

    try {
        const payment = await LoanPayment.findById(payment_id);
        if (!payment) {
            return res.status(404).json({ message: "Loan payment record not found" });
        }

        const updatedPayment = await LoanPayment.update(payment_id, updates);
        res.json({ message: "Payment record updated successfully", payment: updatedPayment });

    } catch (error) {
        res.status(500).json({ message: "Error updating payment record", error: error.message });
    }
});

// DELETE a payment record (Admin only - EXTREMELY DANGEROUS)
router.delete("/:id", authorizeRole("admin"), async (req, res) => {
    console.warn(`Attempting DELETE on loan payment ID: ${req.params.id}. This is highly discouraged.`);
    try {
        const payment = await LoanPayment.findById(req.params.id);
         if (!payment) {
            return res.status(404).json({ message: "Loan payment record not found" });
        }
        // Add checks? Prevent deleting 'paid' payments?

        const deletedPayment = await LoanPayment.delete(req.params.id);
        // TODO: Reverse the associated FundTransaction?

        res.json({ message: "Payment record deleted (use with caution!)", payment: deletedPayment });
    } catch (error) {
        res.status(500).json({ message: "Error deleting payment record", error: error.message });
    }
});


module.exports = router;
