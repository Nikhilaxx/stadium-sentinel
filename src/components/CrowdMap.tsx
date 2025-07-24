import React, { useEffect, useRef, useState } from 'react';
import { Zone, Gate, Person, Alert } from '@/types/crowd';
import { CHINNASWAMY_CENTER } from '@/utils/simulation';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Load Leaflet dynamically to avoid SSR issues
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (mapRef.current && !mapReady) {
          const map = L.map(mapRef.current).setView(CHINNASWAMY_CENTER, 17);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          // Add zones
          zones.forEach(zone => {
            const color = getZoneColor(zone.riskLevel);
            const opacity = showHeatmap ? zone.density * 0.6 + 0.2 : 0.2;
            
            L.polygon(zone.bounds, {
              fillColor: color,
              fillOpacity: opacity,
              color: color,
              weight: 2
            })
            .bindPopup(`
              <div>
                <h3><strong>${zone.name}</strong></h3>
                <p>Density: ${Math.round(zone.density * 100)}%</p>
                <p>Count: ${zone.currentCount}/${zone.capacity}</p>
                <p>Risk: <strong>${zone.riskLevel.toUpperCase()}</strong></p>
                ${showFlowVectors ? `<p>Flow Speed: ${(zone.flowVector.speed * 100000).toFixed(1)} m/s</p>` : ''}
              </div>
            `)
            .addTo(map);

            // Add flow vectors
            if (showFlowVectors && zone.flowVector.speed > 0.00001) {
              const centerLat = (zone.bounds[0][0] + zone.bounds[1][0]) / 2;
              const centerLng = (zone.bounds[0][1] + zone.bounds[1][1]) / 2;
              const angle = Math.atan2(zone.flowVector.y, zone.flowVector.x) * 180 / Math.PI;
              
              L.marker([centerLat, centerLng], {
                icon: L.divIcon({
                  html: `<div style="
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    color: #1f2937;
                    transform: rotate(${angle}deg);
                  ">→</div>`,
                  className: '',
                  iconSize: [40, 40],
                  iconAnchor: [20, 20]
                })
              }).addTo(map);
            }
          });

          // Add gates
          gates.forEach(gate => {
            const loadPercent = gate.currentLoad / gate.capacity;
            let color = '#22c55e';
            if (loadPercent > 0.7) color = '#eab308';
            if (loadPercent > 0.85) color = '#ef4444';

            L.marker(gate.position, {
              icon: L.divIcon({
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
                ">${gate.name.split(' ')[1] || 'G'}</div>`,
                className: '',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
              })
            })
            .bindPopup(`
              <div>
                <h3><strong>${gate.name}</strong></h3>
                <p>Capacity: ${gate.currentLoad}/${gate.capacity}</p>
                <p>Load: ${Math.round(loadPercent * 100)}%</p>
                <p>Status: <strong>${gate.status.toUpperCase()}</strong></p>
              </div>
            `)
            .addTo(map);
          });

          // Add alerts
          alerts.forEach(alert => {
            const color = alert.severity === 'critical' ? '#ef4444' : 
                         alert.severity === 'high' ? '#f97316' : '#eab308';
            
            L.marker(alert.location, {
              icon: L.divIcon({
                html: `<div style="
                  background-color: ${color};
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  border: 2px solid white;
                  animation: pulse 2s infinite;
                "></div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                </style>`,
                className: '',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })
            })
            .bindPopup(`
              <div>
                <h3 style="color: ${color}"><strong>${alert.type.toUpperCase()}</strong></h3>
                <p>${alert.message}</p>
                <p style="font-size: 12px; color: #666;">
                  ${alert.timestamp.toLocaleTimeString()}
                </p>
              </div>
            `)
            .addTo(map);
          });

          // Add sample crowd visualization
          people.slice(0, 200).forEach(person => {
            L.circle(person.position, {
              radius: 1,
              fillColor: '#3b82f6',
              fillOpacity: 0.6,
              stroke: false
            }).addTo(map);
          });

          setMapReady(true);
        }
      } catch (error) {
        console.error('Error loading map:', error);
        setMapReady(false);
      }
    };

    loadMap();
  }, [zones, gates, people, alerts, showFlowVectors, showHeatmap, mapReady]);

  const getZoneColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#22c55e';
      case 'medium': return '#eab308';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-card border rounded-lg">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Loading Chinnaswamy Stadium Map</h3>
              <div className="space-y-1 text-sm text-muted-foreground mt-2">
                <p>Zones: {zones.length} | Gates: {gates.length}</p>
                <p>People: {people.length.toLocaleString()} | Alerts: {alerts.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 bg-card border rounded-lg p-2 space-y-2 shadow-lg">
        <div className="text-xs font-medium">Map Controls</div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-3 h-3 rounded-full ${showHeatmap ? 'bg-primary' : 'bg-muted'}`}></div>
          Heatmap
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-3 h-3 rounded-full ${showFlowVectors ? 'bg-primary' : 'bg-muted'}`}></div>
          Flow Vectors
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card border rounded-lg p-3 space-y-2 shadow-lg">
        <div className="text-xs font-medium">Risk Levels</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded" style={{backgroundColor: '#22c55e'}}></div>
            Low Risk
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded" style={{backgroundColor: '#eab308'}}></div>
            Medium Risk
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded" style={{backgroundColor: '#f97316'}}></div>
            High Risk
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded" style={{backgroundColor: '#ef4444'}}></div>
            Critical Risk
          </div>
        </div>
      </div>
    </div>
  );
};