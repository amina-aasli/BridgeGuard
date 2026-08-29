function errorHandler(err, req, res, _next) {
  console.error('[BridgeGuard API]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route introuvable: ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFoundHandler };
