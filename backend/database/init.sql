-- Database Initialization Script for Fininvest (V2 - Expanded Features)

-- Drop existing tables if they exist (for development/reset)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS internal_transfers CASCADE;
DROP TABLE IF EXISTS fund_transactions CASCADE; -- Depends on bank_accounts
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS loan_payments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS contributions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Bank Accounts Table (Fund's accounts)
CREATE TABLE bank_accounts (
    account_id SERIAL PRIMARY KEY,
    account_name VARCHAR(255) NOT NULL, -- e.g., "Main Operations", "Reserve"
    bank_name VARCHAR(255),
    iban VARCHAR(100) UNIQUE,
    account_type VARCHAR(100), -- e.g., "Current", "Savings"
    initial_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0, -- Might be calculated or updated via triggers/logic
    currency VARCHAR(3) DEFAULT 'EUR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Members Table
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    document_id VARCHAR(100) UNIQUE, -- e.g., NIF, BI
    contact_info JSONB, -- { "email": "...", "phone": "...", "address": "..." }
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, pending_adhesion
    default_quota_amount DECIMAL(15, 2), -- Default monthly quota amount
    adhesion_term_url VARCHAR(512), -- URL for the signed adhesion term PDF
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Authentication Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    member_id INT UNIQUE, -- Can be NULL for system admins not linked to a member
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member', -- admin, member
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL
);

-- Contributions Table (Quotas)
CREATE TABLE contributions (
    contribution_id SERIAL PRIMARY KEY,
    member_id INT NOT NULL,
    amount_due DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    due_date DATE NOT NULL, -- Date the quota is due
    payment_date TIMESTAMPTZ, -- Date the quota was actually paid/confirmed
    payment_month INT NOT NULL, -- e.g., 1 for January
    payment_year INT NOT NULL,
    status VARCHAR(50) DEFAULT 'due', -- due, pending_confirmation, paid, overdue, cancelled
    payment_method VARCHAR(100), -- e.g., bank_transfer, cash
    payment_proof_url VARCHAR(512),
    receipt_url VARCHAR(512), -- URL for the generated payment receipt PDF
    notes TEXT,
    generated_automatically BOOLEAN DEFAULT FALSE, -- Was this record created by the monthly job?
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    UNIQUE (member_id, payment_month, payment_year) -- Ensure only one quota record per member per month/year
);

-- Clients Table (Internal & External)
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    member_id INT UNIQUE, -- Link to member if internal client
    name VARCHAR(255) NOT NULL,
    document_id VARCHAR(100) UNIQUE, -- e.g., NIF, BI
    contact_info JSONB, -- { "email": "...", "phone": "...", "address": "..." }
    client_type VARCHAR(50) NOT NULL, -- internal, external
    risk_profile VARCHAR(100),
    credit_rating VARCHAR(50),
    documents JSONB, -- { "id_card": "url1", "proof_of_address": "url2" }
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE SET NULL
);

-- Loans Table
CREATE TABLE loans (
    loan_id SERIAL PRIMARY KEY,
    client_id INT NOT NULL,
    amount_requested DECIMAL(15, 2) NOT NULL,
    amount_approved DECIMAL(15, 2),
    interest_rate DECIMAL(5, 2) NOT NULL, -- Percentage
    loan_purpose TEXT,
    repayment_term_months INT NOT NULL,
    application_date DATE DEFAULT CURRENT_DATE,
    approval_date DATE,
    disbursement_date DATE,
    status VARCHAR(50) DEFAULT 'pending_approval', -- pending_approval, approved, active, paid, defaulted, rejected, cancelled
    application_form_data JSONB, -- Store data used to generate the form/contract
    guarantees TEXT,
    contract_url VARCHAR(512), -- URL for the generated contract PDF
    signed_contract_url VARCHAR(512), -- URL for the uploaded signed contract
    credit_approval_proof_url VARCHAR(512), -- URL for the credit approval document PDF
    created_by_user_id INT, -- User who registered the loan request
    approved_by_user_id INT, -- User who approved the loan
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(client_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id),
    FOREIGN KEY (approved_by_user_id) REFERENCES users(user_id)
);

-- Loan Payments Table (Amortization Schedule)
CREATE TABLE loan_payments (
    payment_id SERIAL PRIMARY KEY,
    loan_id INT NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    amount_due DECIMAL(15, 2) NOT NULL, -- Principal + Interest
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_amount DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    payment_date TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, partially_paid, overdue, paid_late, cancelled
    payment_method VARCHAR(100),
    payment_proof_url VARCHAR(512),
    receipt_url VARCHAR(512), -- URL for the generated payment receipt PDF
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
    UNIQUE (loan_id, installment_number) -- Ensure unique installment per loan
);

-- Fund Transactions Table (Ledger)
CREATE TABLE fund_transactions (
    transaction_id SERIAL PRIMARY KEY,
    bank_account_id INT NOT NULL, -- Which fund bank account was affected?
    transaction_type VARCHAR(100) NOT NULL, -- contribution_received, loan_disbursement, loan_repayment_received, operational_cost, interest_income, other_income, internal_transfer_out, internal_transfer_in, initial_balance, adjustment
    amount DECIMAL(15, 2) NOT NULL, -- Positive for inflow, Negative for outflow (or handle direction in logic)
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    related_entity_type VARCHAR(50), -- e.g., member, loan, client, contribution, loan_payment, internal_transfer
    related_entity_id INT,
    proof_url VARCHAR(512),
    recorded_by_user_id INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- updated_at? Financial transactions usually aren't updated, adjustments are made.
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(account_id) ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id)
);

-- Internal Transfers Table
CREATE TABLE internal_transfers (
    transfer_id SERIAL PRIMARY KEY,
    from_account_id INT NOT NULL,
    to_account_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    transfer_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    proof_url VARCHAR(512), -- URL for the generated transfer justification PDF
    recorded_by_user_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES bank_accounts(account_id) ON DELETE RESTRICT,
    FOREIGN KEY (to_account_id) REFERENCES bank_accounts(account_id) ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(user_id)
    -- Add constraint CHECK (from_account_id <> to_account_id)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT, -- Can be NULL for system actions
    action_type VARCHAR(255) NOT NULL, -- e.g., 'login', 'create_member', 'approve_loan', 'update_client', 'generate_quota'
    entity_type VARCHAR(100), -- e.g., 'member', 'loan', 'client', 'contribution'
    entity_id INT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    details JSONB, -- Store before/after values or specific details
    ip_address VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT, -- Target user (if applicable)
    member_id INT, -- Target member (if applicable)
    notification_type VARCHAR(100) NOT NULL, -- e.g., 'quota_due', 'quota_overdue', 'payment_received', 'loan_approved', 'low_balance'
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, read
    delivery_method VARCHAR(50) DEFAULT 'in_app', -- in_app, email, sms (placeholders)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    scheduled_send_time TIMESTAMPTZ, -- For delayed notifications
    sent_at TIMESTAMPTZ,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

-- Currencies Table
CREATE TABLE currencies (
    currency_id SERIAL PRIMARY KEY,
    code        VARCHAR(10)  UNIQUE NOT NULL,   -- EUR, USD, AOA …
    name        VARCHAR(100) NOT NULL,          -- Euro, Dólar, Kwanza
    symbol      VARCHAR(10),                    -- €, $, Kz
    is_primary  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Garantir que só pode haver UMA moeda principal
CREATE UNIQUE INDEX only_one_primary_currency
ON currencies(is_primary)
WHERE is_primary = TRUE;

-- Company Data Table
CREATE TABLE company_profile (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nif VARCHAR(100),
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    logo_url VARCHAR(512),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);



-- Indexes for performance
CREATE INDEX idx_members_name ON members(name);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_contributions_member_id ON contributions(member_id);
CREATE INDEX idx_contributions_status ON contributions(status);
CREATE INDEX idx_contributions_due_date ON contributions(due_date);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_type ON clients(client_type);
CREATE INDEX idx_loans_client_id ON loans(client_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX idx_loan_payments_status ON loan_payments(status);
CREATE INDEX idx_loan_payments_due_date ON loan_payments(due_date);
CREATE INDEX idx_bank_accounts_name ON bank_accounts(account_name);
CREATE INDEX idx_fund_transactions_type ON fund_transactions(transaction_type);
CREATE INDEX idx_fund_transactions_date ON fund_transactions(transaction_date);
CREATE INDEX idx_fund_transactions_bank_account_id ON fund_transactions(bank_account_id);
CREATE INDEX idx_fund_transactions_related ON fund_transactions(related_entity_type, related_entity_id);
CREATE INDEX idx_internal_transfers_date ON internal_transfers(transfer_date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_member_id ON notifications(member_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Trigger function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables that have updated_at
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_payments_updated_at BEFORE UPDATE ON loan_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Trigger to update bank account balance on fund transaction (can be complex, consider doing in application logic)
-- CREATE OR REPLACE FUNCTION update_bank_balance_on_transaction()
-- RETURNS TRIGGER AS $$
-- BEGIN
--    UPDATE bank_accounts
--    SET current_balance = current_balance + NEW.amount -- Assuming positive for inflow, negative for outflow
--    WHERE account_id = NEW.bank_account_id;
--    RETURN NEW;
-- END;
-- $$ language 'plpgsql';
-- 
-- CREATE TRIGGER trigger_update_bank_balance
-- AFTER INSERT ON fund_transactions
-- FOR EACH ROW
-- EXECUTE FUNCTION update_bank_balance_on_transaction();

-- Initial Data (Optional - Example Admin User & Default Bank Account)
-- INSERT INTO users (username, password_hash, role) VALUES ('admin', 'hashed_password_here', 'admin');
-- INSERT INTO bank_accounts (account_name, bank_name, initial_balance, current_balance) VALUES ('Caixa Geral', 'CGD', 10000.00, 10000.00);

INSERT INTO users (username, password_hash, role)
SELECT 'admin', '$2b$10$T7JGnmWP3M6iSwvEop6Rmu6hnFOHOHLDCybP92pxLyxkzGVyZZMJS', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'admin'
);

INSERT INTO currencies (code, name, symbol, is_primary) VALUES
  ('EUR', 'Euro',      '€', FALSE)     ON CONFLICT (code) DO NOTHING,
  ('USD', 'US Dollar', '$', FALSE)    ON CONFLICT (code) DO NOTHING,
  ('AOA', 'Kwanza',    'Kz', TRUE)   ON CONFLICT (code) DO NOTHING;

