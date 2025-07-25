import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Police/components/ui/card';
import { Button } from '@/Police/components/ui/button';
import { Badge } from '@/Police/components/ui/badge';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface ControlPanelProps {
  isSimulationRunning: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isSimulationRunning,
  onToggleSimulation,
  onResetSimulation,
}) => {
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
              variant={isSimulationRunning ? 'destructive' : 'default'}
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

            <Button onClick={onResetSimulation} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Simulation Status:</span>
            <Badge variant={isSimulationRunning ? 'default' : 'secondary'}>
              {isSimulationRunning ? 'RUNNING' : 'STOPPED'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};