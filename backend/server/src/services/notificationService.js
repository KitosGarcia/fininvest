const Notification = require("../models/notificationModel");
const Member = require("../models/memberModel");
const Client = require("../models/clientModel");
const User = require("../models/userModel");
// Placeholder for actual email/app notification sending logic
// const emailService = require("./emailService"); 

const NotificationService = {

    /**
     * Creates a notification record in the database.
     * Optionally, triggers external notifications (email, push) - Placeholder.
     */
    createNotification: async (data, client) => {
        try {
            const notification = await Notification.create(data, client);
            console.log(`Notification created: ${notification.notification_type} for ID ${notification.user_id || notification.member_id || notification.client_id}`);
            
            // Placeholder: Trigger external notification (e.g., email)
            // await NotificationService.sendExternalNotification(notification);

            return notification;
        } catch (error) {
            console.error("Error in NotificationService.createNotification:", error);
            // Don't re-throw usually, as notification failure shouldn't block main process
            // unless it's critical for the operation.
        }
    },

    /**
     * Placeholder for sending email or push notifications.
     */
    sendExternalNotification: async (notification) => {
        console.log(`Placeholder: Sending external notification for type ${notification.notification_type} (ID: ${notification.notification_id})`);
        // Example logic:
        // let recipientEmail = null;
        // if (notification.user_id) { recipientEmail = await User.findEmailById(notification.user_id); }
        // else if (notification.member_id) { recipientEmail = await Member.findEmailById(notification.member_id); }
        // else if (notification.client_id) { recipientEmail = await Client.findEmailById(notification.client_id); }
        // 
        // if (recipientEmail) {
        //     await emailService.send({ to: recipientEmail, subject: notification.title, body: notification.message });
        // } else {
        //     console.warn(`Could not find recipient email for notification ID ${notification.notification_id}`);
        // }
        return Promise.resolve(); // Simulate async operation
    },

    // --- Specific Notification Trigger Functions ---

    notifyQuotaGenerated: async (memberId, quotaDetails, client) => {
        // Find member details if needed (e.g., for user_id if members are users)
        // const member = await Member.findById(memberId);
        // const userId = member.user_id; // Assuming members are linked to users
        
        await NotificationService.createNotification({
            member_id: memberId, // Target the member
            // user_id: userId, // Or target the user linked to the member
            notification_type: "quota_generated",
            title: `Nova Quota Gerada - ${quotaDetails.month}/${quotaDetails.year}`,
            message: `Foi gerada a quota de ${quotaDetails.month}/${quotaDetails.year} no valor de ${quotaDetails.amount} EUR, com vencimento em ${quotaDetails.due_date}.`,
            related_entity_type: "contribution",
            related_entity_id: quotaDetails.contribution_id // Link to the contribution record
        }, client);
    },

    notifyPaymentReceived: async (paymentDetails, client) => {
        // paymentDetails should contain recipient info (member_id or client_id), amount, type (quota/loan)
        let recipient = {};
        let title = "Pagamento Recebido";
        let message = `Recebemos o seu pagamento no valor de ${paymentDetails.amount} EUR.`;
        let related_entity_type = null;
        let related_entity_id = null;

        if (paymentDetails.type === "quota") {
            recipient.member_id = paymentDetails.member_id;
            title = "Pagamento de Quota Recebido";
            message = `Recebemos o pagamento da sua quota no valor de ${paymentDetails.amount} EUR referente a ${paymentDetails.period}.`;
            related_entity_type = "contribution";
            related_entity_id = paymentDetails.contribution_id;
        } else if (paymentDetails.type === "loan_installment") {
            recipient.client_id = paymentDetails.client_id;
            title = "Pagamento de Prestação Recebido";
            message = `Recebemos o pagamento da prestação ${paymentDetails.installment_number} do empréstimo ${paymentDetails.loan_id} no valor de ${paymentDetails.amount} EUR.`;
            related_entity_type = "loan_payment";
            related_entity_id = paymentDetails.payment_id;
        }
        
        if (recipient.member_id || recipient.client_id) {
             await NotificationService.createNotification({
                ...recipient,
                notification_type: "payment_received",
                title: title,
                message: message,
                related_entity_type: related_entity_type,
                related_entity_id: related_entity_id
            }, client);
        }
    },

    notifyLoanApproved: async (loanDetails, client) => {
        await NotificationService.createNotification({
            client_id: loanDetails.client_id,
            notification_type: "loan_approved",
            title: "Empréstimo Aprovado!",
            message: `O seu pedido de empréstimo (ID: ${loanDetails.loan_id}) no valor de ${loanDetails.amount_approved} EUR foi aprovado. Será contactado em breve para formalização.`,
            related_entity_type: "loan",
            related_entity_id: loanDetails.loan_id
        }, client);
    },
    
    notifyLoanRejected: async (loanDetails, client) => {
        await NotificationService.createNotification({
            client_id: loanDetails.client_id,
            notification_type: "loan_rejected",
            title: "Pedido de Empréstimo Não Aprovado",
            message: `Lamentamos informar que o seu pedido de empréstimo (ID: ${loanDetails.loan_id}) não foi aprovado neste momento.`,
            related_entity_type: "loan",
            related_entity_id: loanDetails.loan_id
        }, client);
    },

    notifyPaymentOverdue: async (paymentDetails, client) => {
        // paymentDetails should include recipient (member/client), due date, amount, type
        let recipient = {};
        let title = "Pagamento em Atraso";
        let message = `Verificamos que existe um pagamento em atraso no valor de ${paymentDetails.amount} EUR com vencimento em ${paymentDetails.due_date}.`;
        let related_entity_type = null;
        let related_entity_id = null;

        if (paymentDetails.type === "quota") {
            recipient.member_id = paymentDetails.member_id;
            title = "Quota em Atraso";
            message = `Verificamos que a sua quota referente a ${paymentDetails.period}, no valor de ${paymentDetails.amount} EUR e com vencimento em ${paymentDetails.due_date}, se encontra em atraso. Por favor, regularize a situação.`;
            related_entity_type = "contribution";
            related_entity_id = paymentDetails.contribution_id;
        } else if (paymentDetails.type === "loan_installment") {
            recipient.client_id = paymentDetails.client_id;
            title = "Prestação de Empréstimo em Atraso";
            message = `Verificamos que a prestação ${paymentDetails.installment_number} do empréstimo ${paymentDetails.loan_id}, no valor de ${paymentDetails.amount} EUR e com vencimento em ${paymentDetails.due_date}, se encontra em atraso. Por favor, regularize a situação.`;
            related_entity_type = "loan_payment";
            related_entity_id = paymentDetails.payment_id;
        }
        
         if (recipient.member_id || recipient.client_id) {
             await NotificationService.createNotification({
                ...recipient,
                notification_type: "payment_overdue",
                title: title,
                message: message,
                related_entity_type: related_entity_type,
                related_entity_id: related_entity_id
            }, client);
        }
    },
    
    notifyLowBalance: async (accountDetails, adminUserId, client) => {
        // Notify specific admin user(s)
         await NotificationService.createNotification({
            user_id: adminUserId, // Target specific admin or role
            notification_type: "low_balance_warning",
            title: `Alerta: Saldo Baixo na Conta ${accountDetails.account_name}`,
            message: `A conta bancária "${accountDetails.account_name}" (ID: ${accountDetails.account_id}) atingiu um saldo baixo: ${accountDetails.current_balance} EUR.`,
            related_entity_type: "bank_account",
            related_entity_id: accountDetails.account_id
        }, client);
    }

    // Add more notification triggers as needed...

};

module.exports = NotificationService;

