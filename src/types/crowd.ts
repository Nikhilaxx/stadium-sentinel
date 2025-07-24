export interface Gate {
  id: string;
  name: string;
  position: [number, number];
  capacity: number;
  currentLoad: number;
  status: 'open' | 'closed' | 'restricted';
}

export interface Zone {
  id: string;
  name: string;
  bounds: [number, number][];
  density: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flowVector: { x: number; y: number; speed: number };
  capacity: number;
  currentCount: number;
}

export interface Person {
  id: string;
  position: [number, number];
  velocity: [number, number];
  targetGate: string;
  state: 'moving' | 'waiting' | 'exiting';
}

export interface Alert {
  id: string;
  type: 'congestion' | 'bottleneck' | 'panic' | 'gate_full' | 'evacuation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  location: [number, number];
}

export interface RedirectionSuggestion {
  id: string;
  fromGate: string;
  toGate: string;
  reason: string;
  estimatedTime: number;
  confidence: number;
  path: string;
}

export interface CommunicationMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  acknowledged: boolean;
}

export interface IncidentLog {
  id: string;
  type: string;
  description: string;
  location: [number, number];
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved';
  assignedTo?: string;
  notes: string[];
}