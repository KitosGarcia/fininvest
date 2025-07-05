const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Empréstimos
router.post('/', loanController.createLoan);
router.put('/:loanId/disburse', loanController.disburseLoan);
router.get('/:loanId', loanController.getLoanDetails);
router.get('/', loanController.getAllLoans); // <-- importante
router.get('/:loanId/simulation-pdf', loanController.getLoanPdf);


// Prestações
router.get('/:loanId/installments', loanController.getInstallments);

//Accoes Permissoes: 

router.put('/:id/approve', loanController.approveLoan);



module.exports = router;