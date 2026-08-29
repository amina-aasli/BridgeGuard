/**
 * Injection de données simulées uniquement — aucune logique de décision côté app.
 * Reproduit une montée d'eau séquentielle telle qu'alimentée par le terrain/ML externe.
 */
const sensorService = require('./sensorService');

const FLOOD_SEQUENCE = [
  {
    water_level: 42,
    flow_rate: 1.8,
    rainfall: 12,
    risk_score: 0.28,
    events: ['Montée détectée'],
    severity: 'medium',
    bridge: 'vigilance',
    risk: 'medium',
  },
  {
    water_level: 58,
    flow_rate: 2.4,
    rainfall: 18,
    risk_score: 0.38,
    events: ['Seuil vigilance'],
    severity: 'medium',
    bridge: 'vigilance',
    risk: 'medium',
  },
  {
    water_level: 68,
    flow_rate: 3.2,
    rainfall: 22,
    risk_score: 0.52,
    events: ['SMS envoyé'],
    severity: 'high',
    bridge: 'vigilance',
    risk: 'medium',
  },
  {
    water_level: 84,
    flow_rate: 4.7,
    rainfall: 28,
    risk_score: 0.81,
    events: ['Passage en risque critique'],
    severity: 'critical',
    bridge: 'closed',
    risk: 'high',
  },
  {
    water_level: 93,
    flow_rate: 5.3,
    rainfall: 32,
    risk_score: 0.95,
    events: ['Barrière fermée', 'Géofencing activé'],
    severity: 'critical',
    bridge: 'closed',
    risk: 'high',
  },
];

const activeSimulations = new Map();

function buildReading(step) {
  return {
    timestamp: new Date().toISOString(),
    water_level: step.water_level,
    flow_rate: step.flow_rate,
    rainfall: step.rainfall,
    risk_score: step.risk_score,
    vibration_x: 0.02 + step.risk_score * 0.1,
    vibration_y: -0.01 + step.risk_score * 0.08,
    vibration_z: 9.85 + step.risk_score * 0.05,
    ultrasonic_cm: step.water_level * 4.2,
    camera_status: 'ok',
    network_4g: 'connected',
  };
}

function startFloodSimulation(sessionId) {
  if (activeSimulations.has(sessionId)) {
    return { alreadyRunning: true };
  }

  let stepIndex = 0;
  const events = [];

  const runStep = async () => {
    if (stepIndex >= FLOOD_SEQUENCE.length) {
      activeSimulations.delete(sessionId);
      return;
    }

    const step = FLOOD_SEQUENCE[stepIndex];
    const reading = buildReading(step);
    await sensorService.insertReading(reading);

    for (const evt of step.events) {
      const alert = {
        type: evt,
        description: `${evt} — simulation terrain`,
        severity: step.severity,
        ai_score: step.risk_score,
        action_triggered: evt,
        system_state: step.bridge,
      };
      await sensorService.insertAlert(alert);
      events.push({ time: new Date().toISOString(), message: evt });
    }

    await sensorService.updateSystemStatus({
      bridge_state: step.bridge,
      risk_level: step.risk,
      active_alert: stepIndex >= 2,
      raspberry_status: 'online',
      yolo_status: 'running',
      network_4g: 'connected',
    });

    stepIndex += 1;
    if (stepIndex < FLOOD_SEQUENCE.length) {
      const timer = setTimeout(runStep, 3000);
      activeSimulations.set(sessionId, { timer, events });
    } else {
      activeSimulations.delete(sessionId);
    }
  };

  runStep();
  return { started: true, steps: FLOOD_SEQUENCE.length, intervalMs: 3000 };
}

function getSimulationEvents(sessionId) {
  const sim = activeSimulations.get(sessionId);
  return sim?.events || [];
}

function stopSimulation(sessionId) {
  const sim = activeSimulations.get(sessionId);
  if (sim?.timer) clearTimeout(sim.timer);
  activeSimulations.delete(sessionId);
}

module.exports = {
  FLOOD_SEQUENCE,
  startFloodSimulation,
  getSimulationEvents,
  stopSimulation,
};
