const sensorService = require('../services/sensorService');

async function getStatus(req, res, next) {
  try {
    const status = await sensorService.getPublicStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStatus };
