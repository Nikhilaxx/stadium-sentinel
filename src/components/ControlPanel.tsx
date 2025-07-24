import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Settings, Filter, History, MapPin } from 'lucide-react';

interface ControlPanelProps {
  isSimulationRunning: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  showFlowVectors: boolean;
  onToggleFlowVectors: (show: boolean) => void;
  showHeatmap: boolean;
  onToggleHeatmap: (show: boolean) => void;
  selectedZoneFilter: string;
  onZoneFilterChange: (zone: string) => void;
  selectedSeverityFilter: string;
  onSeverityFilterChange: (severity: string) => void;
  historicDataMode: boolean;
  onToggleHistoricData: (enabled: boolean) => void;
  geofencingEnabled: boolean;
  onToggleGeofencing: (enabled: boolean) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isSimulationRunning,
  onToggleSimulation,
  onResetSimulation,
  showFlowVectors,
  onToggleFlowVectors,
  showHeatmap,
  onToggleHeatmap,
  selectedZoneFilter,
  onZoneFilterChange,
  selectedSeverityFilter,
  onSeverityFilterChange,
  historicDataMode,
  onToggleHistoricData,
  geofencingEnabled,
  onToggleGeofencing
}) => {
  const zones = [
    'all',
    'zone1',
    'zone2', 
    'zone3',
    'zone4',
    'zone5',
    'zone6'
  ];

  const severityLevels = [
    'all',
    'critical',
    'high',
    'medium',
    'low'
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Control Panel
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Simulation Controls */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Play className="h-4 w-4" />
            Simulation Controls
          </h4>
          
          <div className="flex gap-2">
            <Button
              onClick={onToggleSimulation}
              variant={isSimulationRunning ? "destructive" : "default"}
              className="flex-1"
            >
              {isSimulationRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            
            <Button
              onClick={onResetSimulation}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Simulation Status:</span>
            <Badge variant={isSimulationRunning ? "default" : "secondary"}>
              {isSimulationRunning ? "RUNNING" : "STOPPED"}
            </Badge>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Display Options
          </h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Flow Vectors</span>
              <Switch
                checked={showFlowVectors}
                onCheckedChange={onToggleFlowVectors}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Density Heatmap</span>
              <Switch
                checked={showHeatmap}
                onCheckedChange={onToggleHeatmap}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Historic Data Mode</span>
              <Switch
                checked={historicDataMode}
                onCheckedChange={onToggleHistoricData}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Geofencing Alerts</span>
              <Switch
                checked={geofencingEnabled}
                onCheckedChange={onToggleGeofencing}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </h4>
          
          <div className="space-y-2">
            <div>
              <label className="text-xs text-muted-foreground">Zone Filter</label>
              <Select value={selectedZoneFilter} onValueChange={onZoneFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(zone => (
                    <SelectItem key={zone} value={zone}>
                      {zone === 'all' ? 'All Zones' : `Zone ${zone.slice(-1)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Severity Filter</label>
              <Select value={selectedSeverityFilter} onValueChange={onSeverityFilterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level === 'all' ? 'All Severities' : level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Historic Data Toggle */}
        {historicDataMode && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <History className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Historic Mode Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Comparing current flow with past event data from similar events.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};