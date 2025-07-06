const db = require('../config/db')
const pool = db.pool;
const { createInstallments, getInstallmentsByLoanId } = require('../models/loanInstallmentModel');
const loanSimulationService = require('../services/loanSimulationService');
const generateLoanSimulationPdf = require('../services/loanContractService');
const { generateLoanContractPdf } = require('../services/loanContractService');
const Loan = require('../models/loanModel');
const { v4: uuidv4 } = require('uuid');


const createLoan = async (req, res) => {
  try {
    const {
      client_id, amount_requested, interest_rate, repayment_term_months,
      loan_purpose, repayment_plan_type, created_by_user_id, application_form_data,
    } = req.body;

    const total_to_repay = (amount_requested * (1 + (interest_rate / 100))).toFixed(2);
    const application_date = new Date();

    const result = await db.query(
      `INSERT INTO loans (
        client_id, amount_requested, amount_approved, interest_rate, loan_purpose,
        repayment_term_months, application_date, status, application_form_data,
        created_by_user_id, created_at, updated_at, repayment_plan_type
      ) VALUES (
        $1, $2, $2, $3, $4,
        $5, $6, $7, $8,
        $9, NOW(), NOW(), $10
      ) RETURNING loan_id`,
      [
        client_id, amount_requested, interest_rate, loan_purpose,
        repayment_term_months, application_date, 'pendente', application_form_data,
        created_by_user_id, repayment_plan_type
      ]
    );

    const loanId = result.rows[0].loan_id;

    const clientResult = await db.query(
  `SELECT name FROM clients WHERE client_id = $1`,
  [client_id]
);
const clientName = clientResult.rows[0]?.name || 'Desconhecido';

    // gerar prestações, se parcelado
    if (repayment_plan_type === 'parcelado') {
      await createInstallments(loanId, total_to_repay, repayment_term_months, application_date);
    }

    // notificação para admin
await db.query(
  `INSERT INTO alerts (description, type, related_id, is_read, created_at)
   VALUES ($1, $2, $3, false, NOW())`,
  [`Novo pedido de empréstimo: ${client_id} - ${clientName}`, 'emprestimo', loanId]
);

    res.status(201).json({ loan_id: loanId });
  } catch (error) {
    console.error('Erro ao criar empréstimo:', error);
    res.status(500).json({ error: 'Erro ao criar empréstimo' });
  }
};

const approveLoan = async (req, res) => {
  const { id } = req.params;
  const { approved_by_user_id, status } = req.body;

  if (!['aprovado', 'rejeitado'].includes(status)) {
    return res.status(400).json({ message: "Status inválido." });
  }

  try {
    const result = await db.query(
      `UPDATE loans
       SET status = $1,
           approval_date = NOW(),
           approved_by_user_id = $2
       WHERE loan_id = $3
       RETURNING *`,
      [status, approved_by_user_id, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Empréstimo não encontrado." });
    }

    return res.json({ message: "Status atualizado com sucesso", loan: result.rows[0] });

  } catch (err) {
    console.error("Erro ao aprovar/rejeitar empréstimo:", err);
    res.status(500).json({ message: "Erro interno ao atualizar status do empréstimo." });
  }
};

const rejectLoan = async (req, res) => {
  const { loanId } = req.params;

  try {
    await db.query(
      `UPDATE loans SET
        status = 'rejeitado',
        updated_at = NOW()
      WHERE loan_id = $1`,
      [loanId]
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao rejeitar empréstimo:', err);
    res.status(500).json({ message: 'Erro ao rejeitar empréstimo' });
  }
};


const getLoanDetails = async (req, res) => {
  try {
    const { loanId } = req.params;
    const result = await db.query(
      'SELECT l.*, c.name AS client_name FROM loans l JOIN clients c ON l.client_id = c.client_id  WHERE loan_id = $1 ORDER BY l.created_at DESC' ,
      [loanId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter empréstimo:', error);
    res.status(500).json({ error: 'Erro ao obter empréstimo' });
  }
};

const getInstallments = async (req, res) => {
  try {
    const { loanId } = req.params;
    const installments = await getInstallmentsByLoanId(loanId);
    res.json(installments);
  } catch (error) {
    console.error('Erro ao obter parcelas:', error);
    res.status(500).json({ error: 'Erro ao obter parcelas' });
  }
};

const getAllLoans = async (req, res) => {
  try {
    const filters = {
      loanId: req.query.loanId,
      clientName: req.query.clientName,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const loans = await Loan.findAll(filters);
    res.json(loans);
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};



const getLoanPdf = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loanRes = await db.query('SELECT * FROM loans WHERE loan_id = $1', [loanId]);
    const loan = loanRes.rows[0];
    if (!loan) return res.status(404).json({ message: 'Empréstimo não encontrado.' });

    const clientRes = await db.query('SELECT name FROM clients WHERE client_id = $1', [loan.client_id]);
    loan.client_name = clientRes.rows[0]?.name || 'N/D';

    const installmentsRes = await db.query('SELECT * FROM loan_installments WHERE loan_id = $1 ORDER BY due_date', [loanId]);
    const installments = installmentsRes.rows;

    const companyRes = await db.query('SELECT * FROM company_profile LIMIT 1');
    const company = companyRes.rows[0];

    const pdfBuffer = await generateLoanSimulationPdf({ loan, installments, company });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=simulacao_emprestimo_${loanId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Erro ao gerar PDF de empréstimo:', err);
    res.status(500).json({ message: 'Erro ao gerar PDF da simulação' });
  }
};

const getLoanContractPdf = async (req, res) => {
  const { loanId } = req.params;
  const loan = await Loan.findById(loanId);
  const company = await db.query('SELECT * FROM company_profile LIMIT 1');
  const pdfBuffer = await generateLoanContractPdf({ loan, company });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=contrato_emprestimo_${loanId}.pdf`);
  res.send(pdfBuffer);
};


const disburseLoan = async (req, res) => {
  const loanId = parseInt(req.params.loanId);
  const {
    disbursement_date,
    amount_disbursed,
    bank_account_id,
    signed_contract_url,
    user_id
  } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(`
        UPDATE loans
        SET disbursement_date = $1,
            status = 'desembolsado',
            signed_contract_url = $2
        WHERE loan_id = $3
      `, [disbursement_date, signed_contract_url || null, loanId]);

      const result = await client.query(`
        SELECT repayment_plan_type, repayment_term_months, amount_approved
        FROM loans
        WHERE loan_id = $1
      `, [loanId]);

      const loan = result.rows[0];
      if (!loan) throw new Error("Empréstimo não encontrado");

      if (loan.repayment_plan_type === 'parcelado') {
        const firstDueDate = new Date(disbursement_date);
        firstDueDate.setDate(firstDueDate.getDate() + 30);

        await client.query(`
  UPDATE loan_installments
  SET due_date = $1
  WHERE installment_id = (
    SELECT installment_id
    FROM loan_installments
    WHERE loan_id = $2
    ORDER BY installment_id ASC
    LIMIT 1
  )
`, [firstDueDate.toISOString().split('T')[0], loanId]);

      } else {
        const dueDate = new Date(disbursement_date);
        dueDate.setMonth(dueDate.getMonth() + loan.repayment_term_months);

        await client.query(`
          INSERT INTO loan_installments (loan_id, due_date, amount, status, paid_amount)
          VALUES ($1, $2, $3, 'por_pagar', 0)
        `, [loanId, dueDate.toLocaleDateString('sv-SE'), loan.amount_approved]);
      }

         // ✅ Insert direto na tabela fund_transactions
      await client.query(
        `
        INSERT INTO fund_transactions (
          transaction_type, amount, transaction_date, description,
          related_entity_id, bank_account_id, recorded_by_user_id
        )
        VALUES ('desembolso', $1, $2, $3, $4, $5, $6)
      `,
        [
          amount_disbursed,
          disbursement_date,
          `Desembolso do empréstimo #${loanId}`,
          loanId,
          bank_account_id,
          user_id,
        ]
      );

      // Atualiza o saldo do banco
      await client.query(
        `
        UPDATE bank_accounts
        SET current_balance = current_balance - $1
        WHERE account_id = $2
      `,
        [amount_disbursed, bank_account_id]
      );

      await client.query('COMMIT');
      res.status(200).json({ message: 'Desembolso realizado com sucesso.' });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Erro no desembolso:", error);
      res.status(500).json({ message: 'Erro ao realizar o desembolso', error: error.message });
    } finally {
      client.release();
    }

  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);
    res.status(500).json({ message: 'Erro interno ao conectar ao banco', error: error.message });
  }
};


module.exports = {
  createLoan,
  approveLoan,
  rejectLoan,
  getLoanDetails,
  getInstallments,
  getAllLoans, // agora funciona
  getLoanPdf,
  getLoanContractPdf,
  disburseLoan,
};