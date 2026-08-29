const sensorService = require('../services/sensorService');

async function getDashboard(req, res, next) {
  try {
    const data = await sensorService.getEngineerDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getLatest(req, res, next) {
  try {
    const data = await sensorService.getLatest();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const hours = parseInt(req.query.hours || '24', 10);
    const data = await sensorService.getHistory(hours);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getSystemStatus(req, res, next) {
  try {
    const data = await sensorService.getSystemStatus();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getLatest, getHistory, getSystemStatus };
