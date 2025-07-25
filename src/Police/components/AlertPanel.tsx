import React from 'react';
import { Alert, AlertDescription } from '@/Police/components/ui/alert';
import { Button } from '@/Police/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Police/components/ui/card';
import { Badge } from '@/Police/components/ui/badge';
import { AlertTriangle, X, Clock, MapPin } from 'lucide-react';
import { Alert as CrowdAlert } from '@/types/crowd';

interface AlertPanelProps {
  alerts: CrowdAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onAcknowledgeAlert }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'congestion': return '🚶‍♂️';
      case 'bottleneck': return '⚠️';
      case 'panic': return '🚨';
      case 'gate_full': return '🚪';
      case 'evacuation': return '🚪';
      default: return '⚠️';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Live Alerts
          </div>
          <div className="flex gap-2">
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive">{criticalAlerts.length} Critical</Badge>
            )}
            {highAlerts.length > 0 && (
              <Badge variant="destructive" className="bg-warning text-warning-foreground">
                {highAlerts.length} High
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {activeAlerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No active alerts</p>
          </div>
        ) : (
          activeAlerts
            .sort((a, b) => {
              const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
              return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                     (severityOrder[a.severity as keyof typeof severityOrder] || 0);
            })
            .map(alert => (
              <Alert 
                key={alert.id} 
                className={`${alert.severity === 'critical' ? 'border-destructive' : 
                            alert.severity === 'high' ? 'border-warning' : 'border-border'}`}
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getAlertIcon(alert.type)}</span>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{alert.type.replace('_', ' ').toUpperCase()}</Badge>
                    </div>
                    <AlertDescription className="text-sm mb-2">
                      {alert.message}
                    </AlertDescription>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.zone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))
        )}
      </CardContent>
    </Card>
  );
};