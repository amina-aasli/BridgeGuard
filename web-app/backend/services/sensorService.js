const { getSupabase, isConfigured } = require('./supabaseClient');
const dataStore = require('./dataStore');

const DEFAULT_WATER_LEVEL = 19;

function mapRiskLevel(score, waterLevel) {
  if (score >= 0.7 || waterLevel >= 85) return 'high';
  if (score >= 0.4 || waterLevel >= 60) return 'medium';
  return 'low';
}

function mapBridgeState(riskLevel, waterLevel) {
  if (riskLevel === 'high' || waterLevel >= 90) return 'closed';
  if (riskLevel === 'medium' || waterLevel >= 65) return 'vigilance';
  return 'accessible';
}

function normalizeStatusString(value) {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toLowerCase();
  if (/^local(?:[_-].*)?$/.test(normalized)) return 'local';
  if (/^connect(?:ed)?(?:[_-].*)?$/.test(normalized)) return 'connected';
  if (/^run(?:ning)?(?:[_-].*)?$/.test(normalized)) return 'running';
  return normalized.replace(/[_-]m$/i, '');
}

function mapPublicRiskLabel(riskLevel) {
  if (riskLevel === 'high') return 'Elevé';
  if (riskLevel === 'medium') return 'Modéré';
  return 'Faible';
}

function mapBridgeLabel(state) {
  if (state === 'closed') return 'Fermé';
  if (state === 'vigilance') return 'Vigilance';
  return 'Accessible';
}

const sensorService = {
  async getLatest() {
    if (isConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) return data;
    }
    return dataStore.getLatestSensor();
  },

  async getHistory(hours = 24) {
    const since = new Date(Date.now() - hours * 3600000).toISOString();
    if (isConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .gte('timestamp', since)
        .order('timestamp', { ascending: true });
      if (!error && data?.length) return data;
    }
    return dataStore.getSensorsHistory(hours);
  },

  async getAlerts(filterHours) {
    if (isConfigured()) {
      const supabase = getSupabase();
      let query = supabase.from('alerts').select('*').order('date', { ascending: false });
      if (filterHours) {
        const since = new Date(Date.now() - filterHours * 3600000).toISOString();
        query = query.gte('date', since);
      }
      const { data, error } = await query.limit(500);
      if (!error && data) return data;
    }
    return dataStore.getAlerts(filterHours);
  },

  async getSystemStatus() {
    if (isConfigured()) {
      const supabase = getSupabase();
      const { data } = await supabase.from('system_status').select('*').eq('id', 1).single();
      if (data) return data;
    }
    return dataStore.getSystemStatus();
  },

  async insertReading(row) {
    if (isConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('sensors').insert(row).select().single();
      if (!error) return data;
    }
    return dataStore.insertSensor(row);
  },

  async insertAlert(alert) {
    if (isConfigured()) {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('alerts').insert(alert).select().single();
      if (!error) return data;
    }
    return dataStore.insertAlert(alert);
  },

  async updateSystemStatus(partial) {
    if (isConfigured()) {
      const supabase = getSupabase();
      await supabase.from('system_status').update({ ...partial, updated_at: new Date().toISOString() }).eq('id', 1);
    }
    return dataStore.updateSystemStatus(partial);
  },

  async getPublicStatus() {
    const latest = await this.getLatest();
    const system = await this.getSystemStatus();
    const score = latest?.risk_score ?? 0.2;
    const water = latest?.water_level ?? DEFAULT_WATER_LEVEL;
    const riskLevel = mapRiskLevel(score, water);
    const bridgeState = mapBridgeState(riskLevel, water);

    return {
      riskLevel: mapPublicRiskLabel(riskLevel),
      riskLevelKey: riskLevel,
      bridgeState: mapBridgeLabel(bridgeState),
      bridgeStateKey: bridgeState,
      activeAlert: system.active_alert || score > 0.55 || water > 70,
      lastUpdate: latest?.timestamp || system.updated_at,
    };
  },

  async getEngineerDashboard() {
    const latest = await this.getLatest();
    const system = await this.getSystemStatus();
    const score = latest?.risk_score ?? 0;
    const water = latest?.water_level ?? DEFAULT_WATER_LEVEL;

    return {
      metrics: {
        waterLevel: water,
        flowRate: latest?.flow_rate ?? 0,
        rainfall: latest?.rainfall ?? 0,
        aiScore: score,
        raspberry: normalizeStatusString(system.raspberry_status || 'online'),
        supabase: normalizeStatusString(isConfigured() ? system.supabase_status || 'connected' : 'local_mode'),
        yolo: normalizeStatusString(system.yolo_status || 'running'),
        network4g: normalizeStatusString(latest?.network_4g || system.network_4g || 'connected'),
      },
      sensors: {
        hcsr04: { label: 'HC-SR04', value: latest?.ultrasonic_cm ?? water * 4.2, unit: 'cm' },
        mpu6050: {
          label: 'MPU6050',
          x: latest?.vibration_x ?? 0,
          y: latest?.vibration_y ?? 0,
          z: latest?.vibration_z ?? 9.8,
        },
        flowmeter: { label: 'Débitmètre', value: latest?.flow_rate ?? 0, unit: 'm³/s' },
        camera: { label: 'Caméra 5MP', status: latest?.camera_status ?? 'ok' },
        rainGauge: { label: 'Pluviomètre', value: latest?.rainfall ?? 0, unit: 'mm/h' },
      },
      location: {
        lat: system.latitude ?? 31.6345,
        lng: system.longitude ?? -7.9812,
        geofenceRadius: system.geofence_radius_m ?? 500,
        name: 'Pont Oued Tensift',
      },
    };
  },

  mapRiskLevel,
  mapBridgeState,
};

module.exports = sensorService;
