/**
 * Stockage local (visualisation uniquement) quand Supabase n'est pas configuré.
 * Les données simulent une base externe alimentée par le terrain.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dataDir = path.join(__dirname, '../data');
const sensorsPath = path.join(dataDir, 'sensors.json');
const alertsPath = path.join(dataDir, 'alerts.json');

function ensureData() {
  if (!fs.existsSync(sensorsPath)) {
    console.log('[BridgeGuard] Génération des données locales (seed)...');
    execSync('node ../database/seed/seed.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  }
}

function readJson(filePath, fallback = []) {
  ensureData();
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 0));
}

let systemStatus = {
  raspberry_status: 'online',
  supabase_status: 'local_store',
  yolo_status: 'running',
  network_4g: 'connected',
  bridge_state: 'accessible',
  risk_level: 'low',
  active_alert: false,
  latitude: 31.6345,
  longitude: -7.9812,
  geofence_radius_m: 500,
  updated_at: new Date().toISOString(),
};

const dataStore = {
  getLatestSensor() {
    const sensors = readJson(sensorsPath);
    if (!sensors.length) return null;
    return sensors.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  },

  getSensorsSince(since) {
    const sensors = readJson(sensorsPath);
    const sinceDate = new Date(since);
    return sensors
      .filter((s) => new Date(s.timestamp) >= sinceDate)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  getSensorsHistory(hours = 24) {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    return this.getSensorsSince(since);
  },

  insertSensor(row) {
    const sensors = readJson(sensorsPath);
    const entry = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: row.timestamp || new Date().toISOString(),
      ...row,
    };
    sensors.push(entry);
    writeJson(sensorsPath, sensors);
    return entry;
  },

  getAlerts(filterHours) {
    let alerts = readJson(alertsPath);
    if (filterHours) {
      const since = Date.now() - filterHours * 3600000;
      alerts = alerts.filter((a) => new Date(a.date) >= since);
    }
    return alerts.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  insertAlert(alert) {
    const alerts = readJson(alertsPath);
    const entry = {
      id: `alert-${Date.now()}`,
      date: alert.date || new Date().toISOString(),
      ...alert,
    };
    alerts.unshift(entry);
    writeJson(alertsPath, alerts);
    return entry;
  },

  getSystemStatus() {
    return { ...systemStatus, updated_at: new Date().toISOString() };
  },

  updateSystemStatus(partial) {
    systemStatus = { ...systemStatus, ...partial, updated_at: new Date().toISOString() };
    return systemStatus;
  },
};

module.exports = dataStore;
