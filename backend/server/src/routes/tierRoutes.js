const express = require('express');
const router = express.Router();
const tierController = require('../controllers/tierController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', tierController.createTier);
router.get('/', tierController.getTiers);
router.put('/:tier_id', tierController.updateTier);
router.delete('/:tier_id', tierController.deleteTier);

module.exports = router;
