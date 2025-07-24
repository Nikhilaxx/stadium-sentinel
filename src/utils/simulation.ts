import { Person, Zone, Gate, Alert, RedirectionSuggestion } from '@/types/crowd';

// Chinnaswamy Stadium configuration
export const CHINNASWAMY_CENTER: [number, number] = [12.9716, 77.5946];
export const STADIUM_BOUNDS: [number, number][] = [
  [12.9708, 77.5938],
  [12.9724, 77.5954]
];

export const GATES: Gate[] = [
  { id: 'gate1', name: 'Gate 1 (Main)', position: [12.9720, 77.5940], capacity: 500, currentLoad: 0, status: 'open' },
  { id: 'gate2', name: 'Gate 2 (North)', position: [12.9722, 77.5946], capacity: 400, currentLoad: 0, status: 'open' },
  { id: 'gate3', name: 'Gate 3 (East)', position: [12.9716, 77.5952], capacity: 350, currentLoad: 0, status: 'open' },
  { id: 'gate4', name: 'Gate 4 (South)', position: [12.9710, 77.5946], capacity: 400, currentLoad: 0, status: 'open' },
  { id: 'gate5', name: 'Gate 5 (West)', position: [12.9716, 77.5940], capacity: 300, currentLoad: 0, status: 'open' },
  { id: 'gate6', name: 'Gate 6 (VIP)', position: [12.9718, 77.5944], capacity: 200, currentLoad: 0, status: 'restricted' }
];

export const ZONES: Zone[] = [
  {
    id: 'zone1', name: 'Main Entrance Area', capacity: 1000, currentCount: 0, density: 0, riskLevel: 'low',
    bounds: [[12.9718, 77.5938], [12.9722, 77.5942]],
    flowVector: { x: 0, y: 0, speed: 0 }
  },
  {
    id: 'zone2', name: 'North Concourse', capacity: 800, currentCount: 0, density: 0, riskLevel: 'low',
    bounds: [[12.9720, 77.5944], [12.9724, 77.5948]],
    flowVector: { x: 0, y: 0, speed: 0 }
  },
  {
    id: 'zone3', name: 'East Corridor', capacity: 600, currentCount: 0, density: 0, riskLevel: 'low',
    bounds: [[12.9714, 77.5950], [12.9718, 77.5954]],
    flowVector: { x: 0, y: 0, speed: 0 }
  },
  {
    id: 'zone4', name: 'South Plaza', capacity: 700, currentCount: 0, density: 0, riskLevel: 'low',
    bounds: [[12.9708, 77.5944], [12.9712, 77.5948]],
    flowVector: { x: 0, y: 0, speed: 0 }
  },
  {
    id: 'zone5', name: 'West Stands', capacity: 900, currentCount: 0, density: 0, riskLevel: 'low',
    bounds: [[12.9714, 77.5938], [12.9718, 77.5942]],
    flowVector: { x: 0, y: 0, speed: 0 }
  },
  {
    id: 'zone6', name: 'Central Arena', capacity: 500, currentCount: 0, density: 0, riskLevel: 'low',
    bounds: [[12.9714, 77.5944], [12.9718, 77.5948]],
    flowVector: { x: 0, y: 0, speed: 0 }
  }
];

export class CrowdSimulation {
  private people: Person[] = [];
  private zones: Zone[] = [...ZONES];
  private gates: Gate[] = [...GATES];
  private alerts: Alert[] = [];
  private redirections: RedirectionSuggestion[] = [];
  private isRunning: boolean = false;
  private tickCount: number = 0;

  constructor() {
    this.initializeCrowd();
  }

  private initializeCrowd() {
    // Generate initial crowd of 2000-4000 people
    const crowdSize = 2000 + Math.floor(Math.random() * 2000);
    
    for (let i = 0; i < crowdSize; i++) {
      const person: Person = {
        id: `person-${i}`,
        position: this.getRandomPositionInStadium(),
        velocity: [0, 0],
        targetGate: this.getRandomGate().id,
        state: Math.random() > 0.7 ? 'moving' : 'waiting'
      };
      this.people.push(person);
    }
  }

  private getRandomPositionInStadium(): [number, number] {
    const minLat = 12.9708, maxLat = 12.9724;
    const minLng = 77.5938, maxLng = 77.5954;
    return [
      minLat + Math.random() * (maxLat - minLat),
      minLng + Math.random() * (maxLng - minLng)
    ];
  }

  private getRandomGate(): Gate {
    return this.gates[Math.floor(Math.random() * this.gates.length)];
  }

  private updatePersonMovement(person: Person) {
    if (person.state === 'waiting') {
      if (Math.random() > 0.95) person.state = 'moving';
      return;
    }

    const targetGate = this.gates.find(g => g.id === person.targetGate);
    if (!targetGate) return;

    // Calculate direction to target gate
    const dx = targetGate.position[0] - person.position[0];
    const dy = targetGate.position[1] - person.position[1];
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.0001) {
      person.state = 'exiting';
      return;
    }

    // Add some randomness and crowd behavior
    const baseSpeed = 0.00002;
    const crowdInfluence = this.getCrowdInfluence(person.position);
    const speed = baseSpeed * (1 - crowdInfluence * 0.8);

    person.velocity = [
      (dx / distance) * speed + (Math.random() - 0.5) * 0.00001,
      (dy / distance) * speed + (Math.random() - 0.5) * 0.00001
    ];

    person.position[0] += person.velocity[0];
    person.position[1] += person.velocity[1];
  }

  private getCrowdInfluence(position: [number, number]): number {
    let influence = 0;
    const radius = 0.0005;
    
    this.people.forEach(other => {
      const dx = other.position[0] - position[0];
      const dy = other.position[1] - position[1];
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < radius && distance > 0) {
        influence += (radius - distance) / radius;
      }
    });

    return Math.min(influence / 20, 1);
  }

  private updateZoneDensity() {
    this.zones.forEach(zone => {
      zone.currentCount = 0;
      let totalVelocityX = 0, totalVelocityY = 0;
      
      this.people.forEach(person => {
        if (this.isPersonInZone(person.position, zone)) {
          zone.currentCount++;
          totalVelocityX += person.velocity[0];
          totalVelocityY += person.velocity[1];
        }
      });

      zone.density = zone.currentCount / zone.capacity;
      
      // Calculate flow vector
      if (zone.currentCount > 0) {
        zone.flowVector = {
          x: totalVelocityX / zone.currentCount,
          y: totalVelocityY / zone.currentCount,
          speed: Math.sqrt((totalVelocityX / zone.currentCount) ** 2 + (totalVelocityY / zone.currentCount) ** 2)
        };
      }

      // Update risk level
      if (zone.density < 0.3) zone.riskLevel = 'low';
      else if (zone.density < 0.6) zone.riskLevel = 'medium';
      else if (zone.density < 0.85) zone.riskLevel = 'high';
      else zone.riskLevel = 'critical';
    });
  }

  private isPersonInZone(position: [number, number], zone: Zone): boolean {
    const [lat, lng] = position;
    const bounds = zone.bounds;
    return lat >= bounds[0][0] && lat <= bounds[1][0] && 
           lng >= bounds[0][1] && lng <= bounds[1][1];
  }

  private updateGateLoad() {
    this.gates.forEach(gate => {
      const radius = 0.0003;
      gate.currentLoad = this.people.filter(person => {
        const dx = person.position[0] - gate.position[0];
        const dy = person.position[1] - gate.position[1];
        return Math.sqrt(dx * dx + dy * dy) < radius;
      }).length;
    });
  }

  private generateAlerts() {
    const currentTime = new Date();
    
    // Check for congestion alerts
    this.zones.forEach(zone => {
      if (zone.riskLevel === 'critical' && 
          !this.alerts.some(a => a.zone === zone.id && a.type === 'congestion' && !a.acknowledged)) {
        this.alerts.push({
          id: `alert-${Date.now()}-${Math.random()}`,
          type: 'congestion',
          severity: 'critical',
          zone: zone.id,
          message: `Critical congestion in ${zone.name} - ${Math.round(zone.density * 100)}% capacity`,
          timestamp: currentTime,
          acknowledged: false,
          location: [
            (zone.bounds[0][0] + zone.bounds[1][0]) / 2,
            (zone.bounds[0][1] + zone.bounds[1][1]) / 2
          ]
        });
      }
    });

    // Check for gate capacity alerts
    this.gates.forEach(gate => {
      const loadPercent = gate.currentLoad / gate.capacity;
      if (loadPercent > 0.8 && 
          !this.alerts.some(a => a.zone === gate.id && a.type === 'gate_full' && !a.acknowledged)) {
        this.alerts.push({
          id: `alert-${Date.now()}-${Math.random()}`,
          type: 'gate_full',
          severity: loadPercent > 0.95 ? 'critical' : 'high',
          zone: gate.id,
          message: `${gate.name} at ${Math.round(loadPercent * 100)}% capacity`,
          timestamp: currentTime,
          acknowledged: false,
          location: gate.position
        });
      }
    });

    // Simulate random incidents
    if (Math.random() > 0.999) {
      const randomZone = this.zones[Math.floor(Math.random() * this.zones.length)];
      this.alerts.push({
        id: `alert-${Date.now()}-${Math.random()}`,
        type: 'panic',
        severity: 'high',
        zone: randomZone.id,
        message: `Panic incident reported in ${randomZone.name}`,
        timestamp: currentTime,
        acknowledged: false,
        location: [
          (randomZone.bounds[0][0] + randomZone.bounds[1][0]) / 2,
          (randomZone.bounds[0][1] + randomZone.bounds[1][1]) / 2
        ]
      });
    }
  }

  private generateRedirections() {
    this.redirections = [];
    
    this.gates.forEach(gate => {
      const loadPercent = gate.currentLoad / gate.capacity;
      
      if (loadPercent > 0.7) {
        // Find alternative gates
        const alternatives = this.gates
          .filter(g => g.id !== gate.id && g.status === 'open')
          .map(g => ({
            gate: g,
            loadPercent: g.currentLoad / g.capacity,
            distance: Math.sqrt(
              (g.position[0] - gate.position[0]) ** 2 + 
              (g.position[1] - gate.position[1]) ** 2
            )
          }))
          .sort((a, b) => (a.loadPercent + a.distance * 10) - (b.loadPercent + b.distance * 10));

        if (alternatives.length > 0) {
          const best = alternatives[0];
          this.redirections.push({
            id: `redirect-${Date.now()}-${gate.id}`,
            fromGate: gate.id,
            toGate: best.gate.id,
            reason: `${gate.name} at ${Math.round(loadPercent * 100)}% capacity`,
            estimatedTime: Math.round(best.distance * 100000),
            confidence: Math.round((1 - best.loadPercent) * 100),
            path: this.calculatePath(gate, best.gate)
          });
        }
      }
    });
  }

  private calculatePath(from: Gate, to: Gate): string {
    // Simple path calculation based on cardinal directions
    const dx = to.position[0] - from.position[0];
    const dy = to.position[1] - from.position[1];
    
    let path = '';
    if (Math.abs(dx) > Math.abs(dy)) {
      path = dx > 0 ? 'North Corridor' : 'South Corridor';
    } else {
      path = dy > 0 ? 'East Corridor' : 'West Corridor';
    }
    
    return `via ${path}`;
  }

  public tick() {
    this.tickCount++;
    
    // Update people movement
    this.people.forEach(person => this.updatePersonMovement(person));
    
    // Remove people who have exited
    this.people = this.people.filter(person => person.state !== 'exiting');
    
    // Add new people occasionally
    if (Math.random() > 0.98 && this.people.length < 5000) {
      for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
        this.people.push({
          id: `person-${Date.now()}-${i}`,
          position: this.getRandomPositionInStadium(),
          velocity: [0, 0],
          targetGate: this.getRandomGate().id,
          state: 'moving'
        });
      }
    }
    
    this.updateZoneDensity();
    this.updateGateLoad();
    this.generateAlerts();
    this.generateRedirections();
  }

  public start() {
    this.isRunning = true;
  }

  public stop() {
    this.isRunning = false;
  }

  public getState() {
    return {
      people: this.people,
      zones: this.zones,
      gates: this.gates,
      alerts: this.alerts.filter(a => !a.acknowledged).slice(-50),
      redirections: this.redirections,
      isRunning: this.isRunning,
      totalPeople: this.people.length,
      tickCount: this.tickCount
    };
  }

  public acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }
}