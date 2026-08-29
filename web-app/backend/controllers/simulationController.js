const simulationService = require('../services/simulationService');

async function startFlood(req, res, next) {
  try {
    const sessionId = req.user?.email || req.ip || 'default';
    const result = simulationService.startFloodSimulation(sessionId);
    res.json({
      message: 'Simulation démarrée — injection de données uniquement',
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { startFlood };
