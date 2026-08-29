-- BridgeGuard - Schéma Supabase
-- Exécuter dans l'éditeur SQL Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ingénieurs autorisés
CREATE TABLE IF NOT EXISTS engineers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'engineer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lectures capteurs (alimentées par Raspberry Pi / simulation)
CREATE TABLE IF NOT EXISTS sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  water_level DOUBLE PRECISION NOT NULL,
  flow_rate DOUBLE PRECISION NOT NULL,
  rainfall DOUBLE PRECISION NOT NULL DEFAULT 0,
  vibration_x DOUBLE PRECISION DEFAULT 0,
  vibration_y DOUBLE PRECISION DEFAULT 0,
  vibration_z DOUBLE PRECISION DEFAULT 0,
  risk_score DOUBLE PRECISION NOT NULL,
  ultrasonic_cm DOUBLE PRECISION,
  camera_status TEXT DEFAULT 'ok',
  network_4g TEXT DEFAULT 'connected'
);

-- Alertes historiques
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ai_score DOUBLE PRECISION,
  action_triggered TEXT,
  system_state TEXT
);

-- État système (lecture seule côté dashboard)
CREATE TABLE IF NOT EXISTS system_status (
  id INT PRIMARY KEY DEFAULT 1,
  raspberry_status TEXT DEFAULT 'online',
  supabase_status TEXT DEFAULT 'connected',
  yolo_status TEXT DEFAULT 'running',
  network_4g TEXT DEFAULT 'connected',
  bridge_state TEXT DEFAULT 'accessible',
  risk_level TEXT DEFAULT 'low',
  active_alert BOOLEAN DEFAULT false,
  latitude DOUBLE PRECISION DEFAULT 31.6345,
  longitude DOUBLE PRECISION DEFAULT -7.9812,
  geofence_radius_m INT DEFAULT 500,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO system_status (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Index performance
CREATE INDEX IF NOT EXISTS idx_sensors_timestamp ON sensors (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_date ON alerts (date DESC);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE sensors;
ALTER PUBLICATION supabase_realtime ADD TABLE system_status;

-- RLS : lecture publique limitée via API backend uniquement
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineers ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;

-- Politique service role (backend utilise service key)
-- Configurer selon votre déploiement
