import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/User/components/ui/card';
import { Progress } from '@/User/components/ui/progress';
import { Badge } from '@/User/components/ui/badge';
import { Users, Activity, AlertTriangle, DoorOpen } from 'lucide-react';
import { Zone, Gate } from '@/types/crowd';

interface StatsPanelProps {
  zones: Zone[];
  gates: Gate[];
  totalPeople: number;
  totalAlerts: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ 
  zones, 
  gates, 
  totalPeople, 
  totalAlerts 
}) => {
  const totalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);
  const currentOccupancy = zones.reduce((sum, zone) => sum + zone.currentCount, 0);
  const overallDensity = currentOccupancy / totalCapacity;

  const criticalZones = zones.filter(zone => zone.riskLevel === 'critical').length;
  const highRiskZones = zones.filter(zone => zone.riskLevel === 'high').length;

  const overloadedGates = gates.filter(gate => (gate.currentLoad / gate.capacity) > 0.8).length;

  const getGateStats = () => {
    return gates.map(gate => ({
      ...gate,
      loadPercent: Math.round((gate.currentLoad / gate.capacity) * 100)
    })).sort((a, b) => b.loadPercent - a.loadPercent);
  };

  const getZoneStats = () => {
    return zones.map(zone => ({
      ...zone,
      densityPercent: Math.round(zone.density * 100)
    })).sort((a, b) => b.densityPercent - a.densityPercent);
  };

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalPeople.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Crowd</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{Math.round(overallDensity * 100)}%</p>
                <p className="text-xs text-muted-foreground">Overall Density</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{totalAlerts}</p>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{overloadedGates}</p>
                <p className="text-xs text-muted-foreground">Overloaded Gates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Zone Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Zone Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {getZoneStats().map(zone => (
            <div key={zone.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{zone.name}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      zone.riskLevel === 'critical' ? 'destructive' :
                      zone.riskLevel === 'high' ? 'destructive' :
                      zone.riskLevel === 'medium' ? 'secondary' : 'outline'
                    }
                    className={
                      zone.riskLevel === 'high' ? 'bg-warning text-warning-foreground' : ''
                    }
                  >
                    {zone.riskLevel}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {zone.densityPercent}%
                  </span>
                </div>
              </div>
              <Progress 
                value={zone.densityPercent} 
                className="h-2"
                style={{
                  backgroundColor: 'hsl(var(--muted))'
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Gate Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Gate Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {getGateStats().map(gate => (
            <div key={gate.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{gate.name}</span>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={gate.status === 'open' ? 'outline' : 'secondary'}
                    className={
                      gate.status === 'restricted' ? 'bg-warning text-warning-foreground' :
                      gate.status === 'closed' ? 'bg-destructive text-destructive-foreground' : ''
                    }
                  >
                    {gate.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {gate.loadPercent}%
                  </span>
                </div>
              </div>
              <Progress 
                value={gate.loadPercent} 
                className="h-2"
                style={{
                  backgroundColor: 'hsl(var(--muted))'
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </div>
  );
};