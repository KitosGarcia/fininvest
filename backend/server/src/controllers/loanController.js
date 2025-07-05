const db = require('../config/db');
const { createInstallments, getInstallmentsByLoanId } = require('../models/loanInstallmentModel');
const loanSimulationService = require('../services/loanSimulationService');
const generateLoanSimulationPdf = loanSimulationService.generateLoanSimulationPdf;

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

const disburseLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { disbursement_date, disbursement_account } = req.body;

    await db.query(
      `UPDATE loans SET
        status = 'desembolsado',
        disbursement_date = $1,
        disbursement_account = $2,
        updated_at = NOW()
      WHERE loan_id = $3`,
      [disbursement_date || new Date(), disbursement_account, loanId]
    );

    res.sendStatus(200);
  } catch (error) {
    console.error('Erro ao registar desembolso:', error);
    res.status(500).json({ error: 'Erro ao registar desembolso' });
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
    const result = await db.query('SELECT l.*, c.name AS client_name FROM loans l JOIN clients c ON l.client_id = c.client_id ORDER BY l.created_at DESC');
    res.json(result.rows);
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



module.exports = {
  createLoan,
  approveLoan,
  rejectLoan,
  disburseLoan,
  getLoanDetails,
  getInstallments,
  getAllLoans, // agora funciona
  getLoanPdf,
};