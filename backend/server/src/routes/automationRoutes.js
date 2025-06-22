const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const AutomationService = require("../services/automationService");

const router = express.Router();

// Middleware: Ensure only admins can access these routes
router.use(authenticateToken);
router.use(authorizeRole("admin"));

// POST endpoint to trigger monthly quota generation
router.post("/generate-monthly-quotas", async (req, res) => {
    const { year, month } = req.body; // Expect year and month in the request body
    const triggered_by_user_id = req.user.userId;

    if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required in the request body." });
    }

    // Validate year and month (basic validation)
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < currentYear - 5 || year > currentYear + 5 || isNaN(month) || month < 1 || month > 12) {
         return res.status(400).json({ message: "Invalid year or month provided." });
    }

    console.log(`Quota generation triggered for ${month}/${year} by User ID: ${triggered_by_user_id}`);

    try {
        const result = await AutomationService.generateMonthlyQuotas(year, month, triggered_by_user_id);

        if (result.success) {
            res.status(200).json({ message: result.message, details: result.details });
        } else {
            // If the service layer indicates partial or full failure
            res.status(500).json({ message: result.message || "Error during quota generation.", details: result.details });
        }

    } catch (error) {
        console.error(`Error triggering quota generation for ${month}/${year}:`, error);
        res.status(500).json({ message: "Internal server error during quota generation trigger.", error: error.message });
    }
});

// POST endpoint to check for overdue quotas and send notifications
router.post("/check-overdue-quotas", async (req, res) => {
    const { days_overdue } = req.body; // Optional: number of days past due date to consider overdue
    const triggered_by_user_id = req.user.userId;
    
    // Default to 5 days if not specified or invalid
    const daysOverdue = (!days_overdue || isNaN(days_overdue) || days_overdue < 1) ? 5 : parseInt(days_overdue);

    console.log(`Overdue quota check triggered by User ID: ${triggered_by_user_id} (days overdue: ${daysOverdue})`);

    try {
        const result = await AutomationService.checkOverdueQuotas(daysOverdue, triggered_by_user_id);

        if (result.success) {
            res.status(200).json({ message: result.message, details: result.details });
        } else {
            // If the service layer indicates partial or full failure
            res.status(500).json({ message: result.message || "Error during overdue quota check.", details: result.details });
        }

    } catch (error) {
        console.error(`Error triggering overdue quota check:`, error);
        res.status(500).json({ message: "Internal server error during overdue quota check.", error: error.message });
    }
});

module.exports = router;
