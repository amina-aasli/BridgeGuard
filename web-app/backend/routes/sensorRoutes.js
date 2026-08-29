const express = require('express');
const sensorController = require('../controllers/sensorController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.get('/dashboard', sensorController.getDashboard);
router.get('/latest', sensorController.getLatest);
router.get('/history', sensorController.getHistory);
router.get('/system', sensorController.getSystemStatus);

module.exports = router;
