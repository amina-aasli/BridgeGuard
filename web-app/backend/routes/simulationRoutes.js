const express = require('express');
const simulationController = require('../controllers/simulationController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);
router.post('/flood-rise', simulationController.startFlood);

module.exports = router;
