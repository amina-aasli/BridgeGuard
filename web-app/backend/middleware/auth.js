const jwt = require('jsonwebtoken');
const config = require('../config');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (!config.allowedEngineers.includes(payload.email)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Session invalide ou expirée' });
  }
}

module.exports = { authMiddleware };
