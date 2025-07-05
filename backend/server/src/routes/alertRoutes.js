const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { authorizePermission } = require('../middleware/authMiddleware');

// Apenas administradores podem ver alertas
router.get('/', authorizePermission("alerts","view"), alertController.getAlerts);
router.put('/:id/read', authorizePermission("alerts","update"), alertController.markAlertAsRead);
router.post('/check-missing', authorizePermission("alerts", "create"), alertController.checkMissingContributions);


module.exports = router;
