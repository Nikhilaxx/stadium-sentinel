import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Zone, Gate, Person, Alert } from '@/types/crowd';
import { CHINNASWAMY_CENTER } from '@/utils/simulation';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CrowdMapProps {
  zones: Zone[];
  gates: Gate[];
  people: Person[];
  alerts: Alert[];
  showFlowVectors: boolean;
  showHeatmap: boolean;
}

export const CrowdMap: React.FC<CrowdMapProps> = ({
  zones,
  gates,
  people,
  alerts,
  showFlowVectors,
  showHeatmap
}) => {
  const mapRef = useRef<L.Map>(null);

  const getZoneColor = (zone: Zone) => {
    switch (zone.riskLevel) {
      case 'low': return '#22c55e';
      case 'medium': return '#eab308';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getGateIcon = (gate: Gate) => {
    const loadPercent = gate.currentLoad / gate.capacity;
    let color = '#22c55e';
    if (loadPercent > 0.7) color = '#eab308';
    if (loadPercent > 0.85) color = '#ef4444';

    return new L.DivIcon({
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
      ">${gate.name.split(' ')[1]}</div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  const getAlertIcon = (alert: Alert) => {
    const color = alert.severity === 'critical' ? '#ef4444' : 
                  alert.severity === 'high' ? '#f97316' : '#eab308';
    
    return new L.DivIcon({
      html: `<div style="
        background-color: ${color};
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid white;
        animation: pulse 2s infinite;
      "></div>`,
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  return (
    <div className="relative w-full h-full">
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      
      <MapContainer
        center={CHINNASWAMY_CENTER}
        zoom={17}
        className="w-full h-full"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Zone overlays with heatmap */}
        {zones.map(zone => (
          <React.Fragment key={zone.id}>
            <Polygon
              positions={zone.bounds}
              fillColor={getZoneColor(zone)}
              fillOpacity={showHeatmap ? zone.density * 0.6 + 0.2 : 0.2}
              color={getZoneColor(zone)}
              weight={2}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold">{zone.name}</h3>
                  <p>Density: {Math.round(zone.density * 100)}%</p>
                  <p>Count: {zone.currentCount}/{zone.capacity}</p>
                  <p>Risk: <span className={`font-bold ${
                    zone.riskLevel === 'critical' ? 'text-red-500' :
                    zone.riskLevel === 'high' ? 'text-orange-500' :
                    zone.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>{zone.riskLevel.toUpperCase()}</span></p>
                  {showFlowVectors && (
                    <p>Flow Speed: {(zone.flowVector.speed * 100000).toFixed(1)} m/s</p>
                  )}
                </div>
              </Popup>
            </Polygon>

            {/* Flow vectors */}
            {showFlowVectors && zone.flowVector.speed > 0.00001 && (
              <Marker
                position={[
                  (zone.bounds[0][0] + zone.bounds[1][0]) / 2,
                  (zone.bounds[0][1] + zone.bounds[1][1]) / 2
                ]}
                icon={new L.DivIcon({
                  html: `<div style="
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: #1f2937;
                    transform: rotate(${Math.atan2(zone.flowVector.y, zone.flowVector.x) * 180 / Math.PI}deg);
                  ">→</div>`,
                  className: '',
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })}
              />
            )}
          </React.Fragment>
        ))}

        {/* Gates */}
        {gates.map(gate => (
          <Marker
            key={gate.id}
            position={gate.position}
            icon={getGateIcon(gate)}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold">{gate.name}</h3>
                <p>Capacity: {gate.currentLoad}/{gate.capacity}</p>
                <p>Load: {Math.round((gate.currentLoad / gate.capacity) * 100)}%</p>
                <p>Status: <span className={`font-bold ${
                  gate.status === 'open' ? 'text-green-500' :
                  gate.status === 'restricted' ? 'text-yellow-500' : 'text-red-500'
                }`}>{gate.status.toUpperCase()}</span></p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Alerts */}
        {alerts.map(alert => (
          <Marker
            key={alert.id}
            position={alert.location}
            icon={getAlertIcon(alert)}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-red-600">{alert.type.toUpperCase()}</h3>
                <p>{alert.message}</p>
                <p className="text-xs text-gray-500">
                  {alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Crowd density visualization (sample of people) */}
        {people.slice(0, 200).map(person => (
          <Circle
            key={person.id}
            center={person.position}
            radius={1}
            fillColor="#3b82f6"
            fillOpacity={0.6}
            stroke={false}
          />
        ))}
      </MapContainer>
    </div>
  );
};