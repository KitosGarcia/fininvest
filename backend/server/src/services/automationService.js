const db = require("../config/db");
const Member = require("../models/memberModel"); // Assuming memberModel.js exists and is updated
const Contribution = require("../models/contributionModel"); // Assuming contributionModel.js exists and is updated
const AuditLog = require("../models/auditLogModel"); // Assuming auditLogModel.js will be created

const AutomationService = {
  /**
   * Generates monthly quota contribution records for all active members.
   * @param {number} year - The year for which to generate quotas.
   * @param {number} month - The month (1-12) for which to generate quotas.
   * @param {number} triggeredByUserId - The ID of the user triggering the action.
   * @returns {object} - Result summary { success, message, details: { generated, skipped_existing, skipped_no_amount, errors } }
   */
  generateMonthlyQuotas: async (year, month, triggeredByUserId) => {
    const results = { generated: 0, skipped_existing: 0, skipped_no_amount: 0, errors: 0 };
    let overallSuccess = true;
    const logDetails = [];

    try {
      // 1. Get all active members with their default quota amount
      // Assuming memberModel has a method like findAllActiveWithQuota
      // Or adapt findAll to filter by status and include default_quota_amount
      const activeMembers = await db.query("SELECT member_id, name, default_quota_amount FROM members WHERE status = $1", ["active"]);

      if (!activeMembers.rows || activeMembers.rows.length === 0) {
        return { success: true, message: "No active members found to generate quotas for.", details: results };
      }

      // 2. Determine the due date for this month/year (e.g., 1st of the month)
      const dueDate = new Date(year, month - 1, 1); // Month is 0-indexed

      // 3. Iterate through each active member
      for (const member of activeMembers.rows) {
        try {
          // Check if quota already exists for this member, month, and year
          const existingQuota = await db.query(
            "SELECT contribution_id FROM contributions WHERE member_id = $1 AND payment_year = $2 AND payment_month = $3",
            [member.member_id, year, month]
          );

          if (existingQuota.rows.length > 0) {
            console.log(`Quota already exists for member ${member.member_id} for ${month}/${year}. Skipping.`);
            results.skipped_existing++;
            logDetails.push({ member_id: member.member_id, status: "skipped_existing" });
            continue; // Skip to the next member
          }

          // Check if member has a default quota amount defined
          const amountDue = member.default_quota_amount;
          if (!amountDue || parseFloat(amountDue) <= 0) {
            console.warn(`Member ${member.member_id} (${member.name}) has no valid default quota amount defined. Skipping.`);
            results.skipped_no_amount++;
            logDetails.push({ member_id: member.member_id, status: "skipped_no_amount", reason: "Missing default quota amount" });
            continue; // Skip to the next member
          }

          // 4. Create the contribution record
          await Contribution.create({
            member_id: member.member_id,
            amount_due: amountDue,
            amount_paid: 0,
            due_date: dueDate.toISOString().split("T")[0], // Format YYYY-MM-DD
            payment_month: month,
            payment_year: year,
            status: "due",
            generated_automatically: true,
            // payment_method, payment_proof_url, receipt_url, notes are null initially
          });

          results.generated++;
          logDetails.push({ member_id: member.member_id, status: "generated", amount: amountDue });

        } catch (memberError) {
          console.error(`Error generating quota for member ${member.member_id} (${member.name}):`, memberError);
          results.errors++;
          logDetails.push({ member_id: member.member_id, status: "error", message: memberError.message });
          overallSuccess = false; // Mark overall process as potentially failed if any error occurs
        }
      }

      // 5. Log the overall action
      // Assuming AuditLog model and create method exist
      // await AuditLog.create({
      //     user_id: triggeredByUserId,
      //     action_type: "generate_monthly_quotas",
      //     details: { year, month, results, logDetails }
      // });

      const message = `Quota generation for ${month}/${year} completed. Generated: ${results.generated}, Skipped (Existing): ${results.skipped_existing}, Skipped (No Amount): ${results.skipped_no_amount}, Errors: ${results.errors}.`;
      console.log(message);
      return { success: overallSuccess, message: message, details: results };

    } catch (error) {
      console.error(`Fatal error during quota generation process for ${month}/${year}:`, error);
      // Log fatal error
      // await AuditLog.create({
      //     user_id: triggeredByUserId,
      //     action_type: "generate_monthly_quotas_failed",
      //     details: { year, month, error: error.message, results }
      // });
      return { success: false, message: "A fatal error occurred during the quota generation process.", details: results };
    }
  },

  /**
   * Checks for overdue quotas and creates notifications for members.
   * @param {number} daysOverdue - Number of days past due date to consider overdue (default: 5)
   * @param {number} triggeredByUserId - The ID of the user triggering the action.
   * @returns {object} - Result summary { success, message, details: { checked, overdue_found, notified, errors } }
   */
  checkOverdueQuotas: async (daysOverdue = 5, triggeredByUserId) => {
    const results = { checked: 0, overdue_found: 0, notified: 0, errors: 0 };
    let overallSuccess = true;
    const logDetails = [];

    try {
      // Calculate the cutoff date (today - daysOverdue)
      const today = new Date();
      const cutoffDate = new Date(today);
      cutoffDate.setDate(today.getDate() - daysOverdue);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      console.log(`Checking for quotas due before ${cutoffDateStr}`);

      // 1. Find contributions with status 'due' where due_date is past the cutoff date
      const overdueContributions = await db.query(
        `SELECT c.contribution_id, c.member_id, c.amount_due, c.due_date, c.payment_month, c.payment_year, 
                m.name as member_name, m.email as member_email
         FROM contributions c
         JOIN members m ON c.member_id = m.member_id
         WHERE c.status = $1 AND c.due_date < $2`,
        ['due', cutoffDateStr]
      );

      results.checked = overdueContributions.rowCount;

      if (!overdueContributions.rows || overdueContributions.rows.length === 0) {
        return { 
          success: true, 
          message: `No overdue quotas found (checked quotas due before ${cutoffDateStr}).`, 
          details: results 
        };
      }

      results.overdue_found = overdueContributions.rows.length;
      console.log(`Found ${results.overdue_found} overdue quotas.`);

      // Get the NotificationService to send notifications
      const NotificationService = require('./notificationService');

      // 2. Process each overdue contribution
      for (const contribution of overdueContributions.rows) {
        try {
          // Update the contribution status to 'overdue'
          await db.query(
            "UPDATE contributions SET status = $1, updated_at = NOW() WHERE contribution_id = $2",
            ['overdue', contribution.contribution_id]
          );

          // 3. Create a notification for the member
          await NotificationService.notifyPaymentOverdue({
            type: 'quota',
            member_id: contribution.member_id,
            contribution_id: contribution.contribution_id,
            amount: contribution.amount_due,
            due_date: contribution.due_date,
            period: `${contribution.payment_month}/${contribution.payment_year}`
          });

          results.notified++;
          logDetails.push({ 
            contribution_id: contribution.contribution_id, 
            member_id: contribution.member_id,
            member_name: contribution.member_name,
            status: 'notified',
            due_date: contribution.due_date,
            amount: contribution.amount_due
          });

        } catch (contributionError) {
          console.error(`Error processing overdue quota for contribution ${contribution.contribution_id}:`, contributionError);
          results.errors++;
          logDetails.push({ 
            contribution_id: contribution.contribution_id, 
            member_id: contribution.member_id,
            status: 'error', 
            message: contributionError.message 
          });
          overallSuccess = false;
        }
      }

      // 4. Log the overall action using AuditLogService
      const AuditLogService = require('./auditLogService');
      await AuditLogService.logAction({
        user_id: triggeredByUserId,
        action_type: 'check_overdue_quotas',
        entity_type: 'contribution',
        details: { 
          cutoff_date: cutoffDateStr,
          days_overdue: daysOverdue,
          results, 
          log_details: logDetails 
        }
      });

      const message = `Overdue quota check completed. Checked: ${results.checked}, Found overdue: ${results.overdue_found}, Notified: ${results.notified}, Errors: ${results.errors}.`;
      console.log(message);
      return { success: overallSuccess, message: message, details: results };

    } catch (error) {
      console.error(`Fatal error during overdue quota check process:`, error);
      
      // Log fatal error
      const AuditLogService = require('./auditLogService');
      await AuditLogService.logAction({
        user_id: triggeredByUserId,
        action_type: 'check_overdue_quotas_failed',
        entity_type: 'contribution',
        details: { 
          error: error.message, 
          results 
        }
      });
      
      return { 
        success: false, 
        message: "A fatal error occurred during the overdue quota check process.", 
        details: results 
      };
    }
  }

};

module.exports = AutomationService;
