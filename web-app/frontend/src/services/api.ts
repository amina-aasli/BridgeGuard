const API_BASE = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('bg_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }

  return res.json();
}

export interface LoginResponse {
  token: string;
  user: { email: string; role: string };
}

export interface DashboardData {
  metrics: {
    waterLevel: number;
    flowRate: number;
    rainfall: number;
    aiScore: number;
    raspberry: string;
    supabase: string;
    yolo: string;
    network4g: string;
  };
  sensors: Record<string, unknown>;
  location: { lat: number; lng: number; geofenceRadius: number; name: string };
}

export interface PublicStatus {
  riskLevel: string;
  riskLevelKey: string;
  bridgeState: string;
  bridgeStateKey: string;
  activeAlert: boolean;
  lastUpdate: string;
}

export interface SensorHistory {
  timestamp: string;
  water_level: number;
  flow_rate: number;
  rainfall: number;
  risk_score: number;
}

export interface AlertRow {
  id: string;
  date: string;
  type: string;
  aiScore: number;
  action: string;
  systemState: string;
  severity: string;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ user: { email: string } }>('/api/auth/me'),

  getDashboard: () => request<DashboardData>('/api/sensors/dashboard'),

  getHistory: (hours: number) =>
    request<SensorHistory[]>(`/api/sensors/history?hours=${hours}`),

  getAlerts: (filter: string) =>
    request<{ rows: AlertRow[]; count: number }>(`/api/alerts?filter=${filter}`),

  getPublicStatus: () => request<PublicStatus>('/api/public/status'),

  startSimulation: () =>
    request<{ message: string; started: boolean }>('/api/simulation/flood-rise', {
      method: 'POST',
    }),
};
