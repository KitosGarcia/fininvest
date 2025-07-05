const db = require('../config/db');

const createInstallments = async (loanId, totalAmount, months, firstDueDate) => {
  const amountPerMonth = (totalAmount / months).toFixed(2);
  const promises = [];

  for (let i = 0; i < months; i++) {
    const dueDate = new Date(firstDueDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    promises.push(
      db.query(
        `INSERT INTO loan_installments (loan_id, due_date, amount, paid_amount, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [loanId, dueDate, amountPerMonth, 0, 'por_pagar']
      )
    );
  }

  await Promise.all(promises);
};

const getInstallmentsByLoanId = async (loanId) => {
  const result = await db.query(
    `SELECT * FROM loan_installments WHERE loan_id = $1 ORDER BY due_date ASC`,
    [loanId]
  );
  return result.rows;
};

module.exports = {
  createInstallments,
  getInstallmentsByLoanId,
};
