import React, { useEffect, useRef } from 'react';

// Add debugging for map component
console.log('CrowdMap.tsx: Starting imports...');

try {
  // Commented out Leaflet imports temporarily to isolate the issue
  // import { MapContainer, TileLayer, Circle, Marker, Popup, Polygon } from 'react-leaflet';
  // import L from 'leaflet';
  // import 'leaflet/dist/leaflet.css';
  console.log('CrowdMap.tsx: Leaflet imports skipped for debugging');
} catch (error) {
  console.error('CrowdMap.tsx: Error importing Leaflet:', error);
}

import { Zone, Gate, Person, Alert } from '@/types/crowd';
import { CHINNASWAMY_CENTER } from '@/utils/simulation';

console.log('CrowdMap.tsx: All imports completed');

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
  console.log('CrowdMap component: Rendering with props:', { 
    zonesCount: zones.length, 
    gatesCount: gates.length, 
    peopleCount: people.length,
    alertsCount: alerts.length 
  });

  // Temporarily render a simple placeholder to isolate the map issue
  return (
    <div className="relative w-full h-full bg-card border rounded-lg">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-bold text-foreground">Crowd Map Loading...</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Zones: {zones.length}</p>
            <p>Gates: {gates.length}</p>
            <p>People: {people.length.toLocaleString()}</p>
            <p>Alerts: {alerts.length}</p>
            <p>Show Vectors: {showFlowVectors ? 'Yes' : 'No'}</p>
            <p>Show Heatmap: {showHeatmap ? 'Yes' : 'No'}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Map temporarily disabled for debugging
          </div>
        </div>
      </div>
    </div>
  );
};