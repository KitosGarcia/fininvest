const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const BankAccount = require("../models/bankAccountModel");
const FundTransaction = require("../models/fundTransactionModel");
const Loan = require("../models/loanModel");
const LoanPayment = require("../models/loanPaymentModel");
const Member = require("../models/memberModel");
const Contribution = require("../models/contributionModel");
const db = require("../config/db"); // For complex queries

const router = express.Router();

// Middleware: Only admins can access dashboard data (adjust if needed)
router.use(authenticateToken);
router.use(authorizeRole("admin"));

// GET /api/dashboard/summary
// Provides key metrics: total fund balance, total members, active loans, total loan amount
router.get("/summary", async (req, res) => {
    try {
        const totalBalancePromise = FundTransaction.getTotalFundBalance();
        const totalMembersPromise = db.query("SELECT COUNT(*) FROM members WHERE is_active = TRUE;");
        const activeLoansPromise = db.query("SELECT COUNT(*) as count, COALESCE(SUM(amount_approved), 0) as total_amount FROM loans WHERE status = 'active';");

        const [totalBalanceResult, totalMembersResult, activeLoansResult] = await Promise.all([
            totalBalancePromise,
            totalMembersPromise,
            activeLoansPromise
        ]);

        res.json({
            total_fund_balance: parseFloat(totalBalanceResult).toFixed(2),
            total_active_members: parseInt(totalMembersResult.rows[0].count, 10),
            total_active_loans: parseInt(activeLoansResult.rows[0].count, 10),
            total_active_loan_amount: parseFloat(activeLoansResult.rows[0].total_amount).toFixed(2)
        });

    } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        res.status(500).json({ message: "Error fetching dashboard summary", error: error.message });
    }
});

// GET /api/dashboard/balances-per-account
router.get("/balances-per-account", async (req, res) => {
    try {
        const accounts = await BankAccount.findAll(false); // Find only active accounts
        const balances = accounts.map(acc => ({
            account_id: acc.account_id,
            account_name: acc.account_name,
            current_balance: parseFloat(acc.current_balance).toFixed(2)
        }));
        res.json(balances);
    } catch (error) {
        console.error("Error fetching balances per account:", error);
        res.status(500).json({ message: "Error fetching balances per account", error: error.message });
    }
});

// GET /api/dashboard/delinquency
// Calculates basic delinquency rate (loans with overdue payments)
router.get("/delinquency", async (req, res) => {
    try {
        const overdueQuery = `
            SELECT 
                l.loan_id, 
                l.client_id, 
                c.name as client_name,
                MIN(lp.due_date) as first_overdue_date,
                SUM(lp.amount_due - COALESCE(lp.amount_paid, 0)) as total_overdue_amount
            FROM loan_payments lp
            JOIN loans l ON lp.loan_id = l.loan_id
            JOIN clients c ON l.client_id = c.client_id
            WHERE lp.status = 'pending' AND lp.due_date < CURRENT_DATE
            AND l.status = 'active'
            GROUP BY l.loan_id, l.client_id, c.name
            ORDER BY first_overdue_date ASC;
        `;
        const activeLoansQuery = "SELECT COUNT(*) as count FROM loans WHERE status = 'active';";

        const [overdueResult, activeLoansResult] = await Promise.all([
            db.query(overdueQuery),
            db.query(activeLoansQuery)
        ]);

        const overdueLoans = overdueResult.rows.map(row => ({
            ...row,
            total_overdue_amount: parseFloat(row.total_overdue_amount).toFixed(2)
        }));
        const totalActiveLoans = parseInt(activeLoansResult.rows[0].count, 10);
        const delinquencyRate = totalActiveLoans > 0 ? (overdueLoans.length / totalActiveLoans * 100).toFixed(2) : "0.00";

        res.json({
            overdue_loans_count: overdueLoans.length,
            total_active_loans: totalActiveLoans,
            delinquency_rate_percent: delinquencyRate,
            overdue_loans_details: overdueLoans
        });

    } catch (error) {
        console.error("Error fetching delinquency data:", error);
        res.status(500).json({ message: "Error fetching delinquency data", error: error.message });
    }
});

// GET /api/dashboard/fund-performance
// Placeholder: Needs actual calculation logic (e.g., comparing income vs expenses over time)
router.get("/fund-performance", async (req, res) => {
    try {
        // Example: Calculate total income (loan interest, contributions?) vs expenses (operational costs)
        const incomeQuery = `
            SELECT 
                SUM(CASE WHEN transaction_type = 'loan_repayment' THEN amount ELSE 0 END) as loan_repayments,
                SUM(CASE WHEN transaction_type = 'contribution' THEN amount ELSE 0 END) as contributions,
                SUM(CASE WHEN transaction_type = 'other_income' THEN amount ELSE 0 END) as other_income
            FROM fund_transactions 
            WHERE amount > 0;
            -- Add date filters (e.g., for last month/year)
        `;
        const expenseQuery = `
            SELECT 
                 SUM(CASE WHEN transaction_type = 'loan_disbursement' THEN ABS(amount) ELSE 0 END) as loan_disbursements,
                 SUM(CASE WHEN transaction_type = 'operational_cost' THEN ABS(amount) ELSE 0 END) as operational_costs
            FROM fund_transactions 
            WHERE amount < 0;
             -- Add date filters
        `;
        
        // This is a very basic placeholder. Real performance needs more complex calculations (ROI, yield, etc.)
        // const [incomeResult, expenseResult] = await Promise.all([db.query(incomeQuery), db.query(expenseQuery)]);
        
        res.json({ 
            message: "Fund performance endpoint placeholder. Needs implementation.",
            // income: incomeResult.rows[0],
            // expenses: expenseResult.rows[0]
            placeholder_yield: "5.2% (Example)" // Placeholder value
        });
    } catch (error) {
        console.error("Error fetching fund performance data:", error);
        res.status(500).json({ message: "Error fetching fund performance data", error: error.message });
    }
});

// GET /api/dashboard/member-activity
// Ranks members based on contributions or other metrics (placeholder)
router.get("/member-activity", async (req, res) => {
    try {
        // Example: Rank by total contribution amount
        const activityQuery = `
            SELECT 
                m.member_id, 
                m.name, 
                COALESCE(SUM(c.amount), 0) as total_contribution
            FROM members m
            LEFT JOIN contributions c ON m.member_id = c.member_id
            WHERE m.is_active = TRUE
            GROUP BY m.member_id, m.name
            ORDER BY total_contribution DESC
            LIMIT 10; -- Limit to top 10 for example
        `;
        const result = await db.query(activityQuery);
        const rankedMembers = result.rows.map(row => ({
            ...row,
            total_contribution: parseFloat(row.total_contribution).toFixed(2)
        }));

        res.json(rankedMembers);
    } catch (error) {
        console.error("Error fetching member activity data:", error);
        res.status(500).json({ message: "Error fetching member activity data", error: error.message });
    }
});


module.exports = router;

