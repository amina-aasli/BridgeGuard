import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const bridgeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface BridgeMapProps {
  lat: number;
  lng: number;
  geofenceRadius: number;
  alertActive?: boolean;
}

export default function BridgeMap({ lat, lng, geofenceRadius, alertActive }: BridgeMapProps) {
  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-cyan-200">GPS — Pont Oued Tensift</h3>
        <p className="text-xs text-slate-500">Maroc · Géofencing {geofenceRadius} m</p>
      </div>
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        className="h-64 w-full md:h-80"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Circle
          center={[lat, lng]}
          radius={geofenceRadius}
          pathOptions={{
            color: alertActive ? '#ef4444' : '#22d3ee',
            fillColor: alertActive ? '#ef4444' : '#22d3ee',
            fillOpacity: 0.12,
            weight: 2,
          }}
        />
        <Marker position={[lat, lng]} icon={bridgeIcon}>
          <Popup>
            <strong>Pont Oued Tensift</strong>
            <br />
            Système BridgeGuard
            {alertActive && (
              <>
                <br />
                <span style={{ color: '#ef4444' }}>Alerte géolocalisée</span>
              </>
            )}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
