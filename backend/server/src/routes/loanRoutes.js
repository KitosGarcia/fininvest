const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Protege todas as rotas
router.use(authenticateToken);
router.use(authorizeRole(1));

// Empréstimos
router.post('/', loanController.createLoan);
router.get('/', loanController.getAllLoans);
router.get('/:loanId', loanController.getLoanDetails);
router.get('/:loanId/simulation-pdf', loanController.getLoanPdf);
router.get('/:loanId/contract-pdf', loanController.getLoanContractPdf);

// ✅ Corrige aqui: rota PUT com autenticação funcionando
router.put('/:loanId/disburse', loanController.disburseLoan);

// Prestações
router.get('/:loanId/installments', loanController.getInstallments);

// Ações adicionais
router.put('/:id/approve', loanController.approveLoan);


module.exports = router;