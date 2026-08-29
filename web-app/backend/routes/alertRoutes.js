const express = require('express');
const alertController = require('../controllers/alertController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.get('/', alertController.getAlerts);

module.exports = router;
