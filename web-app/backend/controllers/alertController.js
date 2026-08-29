const sensorService = require('../services/sensorService');

const FILTER_MAP = { '24h': 24, '7d': 24 * 7, '30d': 24 * 30 };

async function getAlerts(req, res, next) {
  try {
    const filter = req.query.filter || '24h';
    const hours = FILTER_MAP[filter] || 24;
    const alerts = await sensorService.getAlerts(hours);

    const rows = alerts.map((a) => ({
      id: a.id,
      date: a.date,
      type: a.type,
      aiScore: a.ai_score,
      action: a.action_triggered,
      systemState: a.system_state,
      severity: a.severity,
      description: a.description,
    }));

    res.json({ filter, count: rows.length, rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAlerts };
