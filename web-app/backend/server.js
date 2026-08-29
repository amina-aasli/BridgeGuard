const express = require('express');
const cors = require('cors');
const config = require('./config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const alertRoutes = require('./routes/alertRoutes');
const publicRoutes = require('./routes/publicRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'BridgeGuard API',
    message: 'Welcome to BridgeGuard. Use /api/health or /api/* endpoints.',
    endpoints: ['/api/health', '/api/auth', '/api/sensors', '/api/alerts', '/api/public', '/api/simulation'],
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'BridgeGuard API', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/simulation', simulationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`BridgeGuard API → http://localhost:${config.port}`);
});
