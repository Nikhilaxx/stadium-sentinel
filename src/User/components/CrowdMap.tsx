import React, { useEffect, useRef, useState } from 'react';
import { Zone, Gate, Person, Alert } from '@/types/crowd';
import { CHINNASWAMY_CENTER } from '@/utils/simulation';
import L from 'leaflet';

interface CrowdMapProps {
  zones: Zone[];
  gates: Gate[];
  people: Person[];
  alerts: Alert[];
  showHeatmap: boolean;
}

export const CrowdMap: React.FC<CrowdMapProps> = ({
  zones,
  gates,
  people,
  alerts,
  showHeatmap,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const zoneLabels = useRef<Record<string, any>>({});
  const gateMarkers = useRef<Record<string, any>>({});
  const [clickedGates, setClickedGates] = useState<Record<string, number>>({});
  const [mapReady, setMapReady] = useState(false);

  // Gate animation and popup logic
  const handleGateClick = (gateId: string) => {
    setClickedGates((prev) => {
      const newCount = (prev[gateId] || 0) + 1;
      return { ...prev, [gateId]: newCount };
    });
    const marker = gateMarkers.current[gateId];
    if (marker && marker.getElement()) {
      marker.setZIndexOffset(1200);
      marker.getElement().style.transform = 'scale(1.2)';
      setTimeout(() => {
        if (marker.getElement()) marker.getElement().style.transform = 'scale(1)';
      }, 250);
      marker.openPopup();
    }
  };

  // Map initialization: only base map/tile, runs ONCE
  useEffect(() => {
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (mapRef.current && !mapInstance.current) {
          const map = L.map(mapRef.current, {
            maxZoom: 21,
            minZoom: 16,
            zoomControl: false,
          }).setView(CHINNASWAMY_CENTER, 18);

          L.control.zoom({ position: 'topright' }).addTo(map);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 21,
          }).addTo(map);

          mapInstance.current = map;
          setMapReady(true);
        }
      } catch (err) {
        setMapReady(false);
      }
    };
    loadMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Dynamic layers: Zones, Gates, Alerts, People with zone labels
  useEffect(() => {
    if (!mapInstance.current) return;
    const loadLayers = async () => {
      const L = await import('leaflet');

      // Clear previous non-base layers
      mapInstance.current.eachLayer((layer: any) => {
        if (layer._url === undefined) mapInstance.current.removeLayer(layer);
      });

      // Clear existing zone labels
      Object.values(zoneLabels.current).forEach(label => {
        if (label) mapInstance.current.removeLayer(label);
      });
      zoneLabels.current = {};

      // Zones and labels
      zones.forEach(zone => {
        const color = getZoneColor(zone.riskLevel);
        const opacity = showHeatmap ? zone.density * 0.6 + 0.2 : 0.2;

        // Draw zone polygon
        L.polygon(zone.bounds, {
          fillColor: color,
          fillOpacity: opacity,
          color: color,
          weight: 2,
        })
          .bindPopup(
            `<div style="min-width: 200px;">
               <h3 style="margin:0 0 8px 0;font-size:16px;color:${color};"><strong>${zone.name}</strong></h3>
               <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                 <div>
                   <p style="margin:0;font-size:12px;">Density: <strong>${Math.round(zone.density * 100)}%</strong></p>
                   <p style="margin:0;font-size:12px;">Count: <strong>${zone.currentCount}/${zone.capacity}</strong></p>
                 </div>
                 <div>
                   <p style="margin:0;font-size:12px;">Risk: <strong style="color:${color}">${zone.riskLevel.toUpperCase()}</strong></p>
                 </div>
               </div>
             </div>`
          )
          .addTo(mapInstance.current);

        // Calculate center of zone to place label
        const latCenter = (zone.bounds[0][0] + zone.bounds[1][0]) / 2 - 0.0002;
        const lngCenter = (zone.bounds[0][1] + zone.bounds[1][1]) / 2;

        // Create a divIcon label
        const labelIcon = L.divIcon({
          className: 'zone-label',
          html: `<div style="
            background: rgba(255, 255, 255, 0.85);
            border: 1px solid ${color};
            padding: 2px 6px;
            border-radius: 2px;
            font-weight: 600;
            color: ${color};
            font-size: 12px;
            user-select: none;
            pointer-events: none;
          ">${zone.name}</div>`,
          iconSize: [100, 20],
          iconAnchor: [50, 10]
        });

        // Add label to map and store reference
        const labelMarker = L.marker([latCenter, lngCenter], {
          icon: labelIcon,
          interactive: false,
          pane: 'overlayPane'
        }).addTo(mapInstance.current);

        zoneLabels.current[zone.id] = labelMarker;
      });

      // Gates (same as before)
      gateMarkers.current = {};
      gates.forEach(gate => {
        const loadPercent = gate.currentLoad / gate.capacity;
        let color = '#22c55e';
        if (loadPercent > 0.7) color = '#eab308';
        if (loadPercent > 0.85) color = '#ef4444';

        const baseSize = 23;
        const clickBoost = clickedGates[gate.id] ? clickedGates[gate.id] * 6 : 0;
        const size = Math.min(86, baseSize + (loadPercent * 34) + clickBoost);
        const marker = L.marker(gate.position, {
          icon: L.divIcon({
            html: `<div style="
              background: radial-gradient(circle at 44% 30%, ${color} 60%, #1e293b 100%);
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              border: 5px solid #fff;
              box-shadow: 0 0 34px ${color}ba, 0 0 72px #101b;
              display: flex; align-items: center; justify-content: center;
              font-size: ${size * 0.52}px;
              font-weight: bold;
              color: #fff;
              text-shadow: 0 0 9px #1e293b, 0 0 3px #fff;
              user-select: none;
              cursor: pointer;
              animation: popPulse 2.1s infinite alternate;
              transition: all .25s cubic-bezier(.3,1,.5,1);
              ">
                ${gate.name.split(' ')[1] || 'G'}
                <style>
                  @keyframes popPulse {
                    from { box-shadow: 0 0 20px ${color}cc, 0 0 28px #fff3; }
                    to   { box-shadow: 0 0 65px #fff3, 0 0 94px #6366f1cc; transform:scale(1.09);}
                  }
                </style>
              </div>`,
            className: '',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          }),
          zIndexOffset: 1100,
        })
          .bindPopup(
            `<div style="min-width: 200px;">
               <h3 style="margin:0 0 8px 0;font-size:16px;color:${color};"><strong>${gate.name}</strong></h3>
               <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                 <div>
                   <p style="margin:0;font-size:12px;">Capacity: <strong>${gate.currentLoad}/${gate.capacity}</strong></p>
                   <p style="margin:0;font-size:12px;">Load: <strong>${Math.round(loadPercent * 100)}%</strong></p>
                 </div>
                 <div>
                   <p style="margin:0;font-size:12px;">Status: <strong style="color:${color}">${gate.status.toUpperCase()}</strong></p>
                 </div>
               </div>
             </div>`
          )
          .on('click', () => handleGateClick(gate.id))
          .addTo(mapInstance.current);

        gateMarkers.current[gate.id] = marker;
      });

      // Alerts and People code stay unchanged...

      alerts.forEach(alert => {
        const color =
          alert.severity === 'critical'
            ? '#ef4444'
            : alert.severity === 'high'
            ? '#f97316'
            : '#eab308';
        L.marker(alert.location, {
          icon: L.divIcon({
            html: `<div style="
                background-color: ${color};
                width: 10px; height: 10px;
                border-radius: 50%;
                border: 2px solid #fff;
                animation: pulse 1.5s infinite;
                box-shadow: 0 0 0 0 ${color};
              "></div>
              <style>
                @keyframes pulse {
                  0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${color}bb; }
                  70% { transform: scale(1.13); box-shadow: 0 0 0 12px ${color}00; }
                  100% { transform: scale(0.95); box-shadow: 0 0 0 0 ${color}00; }
                }
              </style>`,
            className: '',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
          zIndexOffset: 1400,
        })
          .bindPopup(
            `<div style="min-width: 200px;">
               <h3 style="margin:0 0 8px 0;font-size:16px;color:${color};"><strong>${alert.type.toUpperCase()}</strong></h3>
               <p style="margin:0 0 8px 0;font-size:14px;">${alert.message}</p>
               <p style="margin:0;font-size:12px;color:#666;">
                 ${
                   typeof alert.timestamp === "string"
                     ? alert.timestamp
                     : alert.timestamp.toLocaleTimeString()
                 }
               </p>
             </div>`
          )
          .addTo(mapInstance.current);
      });

    //   people.slice(0, 150).forEach(person => {
    //     L.circleMarker(person.position, {
    //       radius: 3.5,
    //       fillColor: '#3b82f6',
    //       fillOpacity: 0.75,
    //       color: '#e5e7eb',
    //       weight: 1,
    //       interactive: false,
    //     }).addTo(mapInstance.current);
    //   });
    };
// Scatter fake people around each gate

    loadLayers();
  }, [zones, gates, people, alerts, showHeatmap, clickedGates, mapReady]);

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
    <div className="relative w-full h-full flex">
      {/* Left Sidebar with Heatmap Legend */}
      <div className="flex flex-col gap-4 p-4 bg-white/90 backdrop-blur-sm border-r rounded-l-lg shadow-xl z-30 w-[160px]">

        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Heatmap Legend</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: '#22c55e' }}></div>
              <span className="text-sm font-medium text-gray-700">Low Risk</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: '#eab308' }}></div>
              <span className="text-sm font-medium text-gray-700">Medium Risk</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: '#f97316' }}></div>
              <span className="text-sm font-medium text-gray-700">High Risk</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: '#ef4444' }}></div>
              <span className="text-sm font-medium text-gray-700">Critical Risk</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Density Indicator</h4>
            <div className="text-xs text-gray-600">
              <p>Darker shades indicate higher crowd density within zones.</p>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="bg-white rounded-lg p-4 shadow-md mt-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Map Controls</h3>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${showHeatmap ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={showHeatmap ? 'text-sm font-medium text-gray-800' : 'text-sm text-gray-600'}>Heatmap</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="flex-grow rounded-r-lg overflow-hidden" />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-card border rounded-lg">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Loading Chinnaswamy Stadium Map
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground mt-2">
                <p>Zones: {zones.length} | Gates: {gates.length}</p>
                <p>People: {people.length.toLocaleString()} | Alerts: {alerts.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};