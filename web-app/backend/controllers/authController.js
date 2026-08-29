const jwt = require('jsonwebtoken');
const config = require('../config');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!config.allowedEngineers.includes(normalizedEmail)) {
      return res.status(403).json({ error: 'Compte non autorisé' });
    }

    if (password !== config.simulationPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { email: normalizedEmail, role: 'engineer' },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      token,
      user: { email: normalizedEmail, role: 'engineer' },
      expiresIn: config.jwtExpiresIn,
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
