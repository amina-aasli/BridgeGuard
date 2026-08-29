/**
 * Script de seed BridgeGuard - 1000+ lectures capteurs + alertes
 * Usage: node database/seed/seed.js (aucune dépendance requise en mode local)
 */

const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });
  require('dotenv').config({ path: path.join(__dirname, '../../.env') });
} catch {
  /* dotenv optionnel */
}

const ENGINEERS = [
  { email: 'aasliamina1@gmail.com', role: 'lead_engineer' },
  { email: 'kamal.anoune@gmail.com', role: 'engineer' },
];

const ALERT_TYPES = [
  'Montée eau détectée',
  'Seuil vigilance',
  'SMS envoyé',
  'Risque critique',
  'Barrière fermée',
  'Géofencing activé',
  'Pluie intense',
  'Anomalie vibration',
];

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function computeRiskScore(waterLevel, flowRate, rainfall) {
  const w = waterLevel / 100;
  const f = Math.min(flowRate / 6, 1);
  const r = Math.min(rainfall / 40, 1);
  return Math.min(0.99, w * 0.5 + f * 0.3 + r * 0.2 + (Math.random() - 0.5) * 0.05);
}

function generateSensorRows(count = 1200) {
  const rows = [];
  const now = Date.now();
  let baseWater = 28 + Math.random() * 12;
  let baseFlow = 1.2 + Math.random() * 0.5;
  let baseRain = 2 + Math.random() * 4;

  for (let i = 0; i < count; i++) {
    const hoursAgo = ((count - i) * (24 * 60 * 60 * 1000)) / (count / 30);
    const ts = new Date(now - hoursAgo);
    const rainCycle = Math.sin(i / 80) * 0.5 + 0.5;

    if (rainCycle > 0.7) {
      baseRain = Math.min(38, baseRain + randomBetween(0.5, 3));
      baseWater = Math.min(92, baseWater + randomBetween(0.2, 1.2));
      baseFlow = Math.min(5.8, baseFlow + randomBetween(0.05, 0.25));
    } else if (rainCycle < 0.3) {
      baseRain = Math.max(0, baseRain - randomBetween(0.2, 1));
      baseWater = Math.max(18, baseWater - randomBetween(0.05, 0.4));
      baseFlow = Math.max(0.8, baseFlow - randomBetween(0.02, 0.1));
    }

    baseRain += (Math.random() - 0.5) * 0.8;
    baseWater += (Math.random() - 0.5) * 0.3;
    baseFlow += (Math.random() - 0.5) * 0.08;

    const water_level = Math.round(Math.max(15, Math.min(98, baseWater)) * 10) / 10;
    const flow_rate = Math.round(Math.max(0.5, Math.min(6, baseFlow)) * 100) / 100;
    const rainfall = Math.round(Math.max(0, Math.min(45, baseRain)) * 10) / 10;
    const risk_score = Math.round(computeRiskScore(water_level, flow_rate, rainfall) * 100) / 100;

    rows.push({
      timestamp: ts.toISOString(),
      water_level,
      flow_rate,
      rainfall,
      vibration_x: Math.round(randomBetween(-0.15, 0.15) * 1000) / 1000,
      vibration_y: Math.round(randomBetween(-0.12, 0.12) * 1000) / 1000,
      vibration_z: Math.round(randomBetween(9.7, 10.3) * 1000) / 1000,
      risk_score,
      ultrasonic_cm: Math.round((water_level * 4.2 + randomBetween(-2, 2)) * 10) / 10,
      camera_status: Math.random() > 0.02 ? 'ok' : 'degraded',
      network_4g: Math.random() > 0.05 ? 'connected' : 'weak',
    });
  }
  return rows;
}

function generateAlerts(count = 90) {
  const rows = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now - daysAgo * 86400000 - Math.random() * 86400000);
    const type = ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
    const ai_score = Math.round(randomBetween(0.15, 0.98) * 100) / 100;
    let severity = 'low';
    if (ai_score > 0.75) severity = 'critical';
    else if (ai_score > 0.55) severity = 'high';
    else if (ai_score > 0.35) severity = 'medium';

    rows.push({
      id: `alert-seed-${i}`,
      date: date.toISOString(),
      type,
      description: `${type} - Pont Oued Tensift`,
      severity,
      ai_score,
      action_triggered:
        severity === 'critical'
          ? 'Barrière fermée, SMS opérateurs'
          : severity === 'high'
            ? 'SMS envoyé, vigilance renforcée'
            : 'Journalisation',
      system_state:
        severity === 'critical' ? 'fermé' : severity === 'high' ? 'vigilance' : 'normal',
    });
  }
  return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function seedLocalStore(rows, alerts) {
  const dataPath = path.join(__dirname, '../../backend/data');
  if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true });
  fs.writeFileSync(path.join(dataPath, 'sensors.json'), JSON.stringify(rows));
  fs.writeFileSync(path.join(dataPath, 'alerts.json'), JSON.stringify(alerts));
  fs.writeFileSync(
    path.join(dataPath, 'engineers.json'),
    JSON.stringify(ENGINEERS.map((e, i) => ({ id: `eng-${i + 1}`, ...e })), null, 2)
  );
  console.log(`Mode local: ${rows.length} capteurs, ${alerts.length} alertes -> backend/data/`);
}

async function seedSupabase(rows, alerts) {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, key);

  for (const eng of ENGINEERS) {
    await supabase.from('engineers').upsert(eng, { onConflict: 'email' });
  }

  const batchSize = 100;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('sensors').insert(batch);
    if (error) throw error;
  }

  await supabase.from('alerts').insert(alerts);
  await supabase.from('system_status').upsert({
    id: 1,
    bridge_state: 'accessible',
    risk_level: 'low',
    active_alert: false,
    latitude: 31.6345,
    longitude: -7.9812,
    updated_at: new Date().toISOString(),
  });
  console.log('Seed Supabase termine');
}

async function main() {
  const sensorRows = generateSensorRows(1200);
  const alertRows = generateAlerts(90);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key && !url.includes('your-project')) {
    try {
      await seedSupabase(sensorRows, alertRows);
      return;
    } catch (e) {
      console.warn('Supabase indisponible, fallback local:', e.message);
    }
  }

  await seedLocalStore(sensorRows, alertRows);
}

main().catch(console.error);
