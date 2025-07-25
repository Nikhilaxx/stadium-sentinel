import React, { useState, useEffect } from 'react';
import { CrowdSimulation } from '@/utils/simulation';
import { CrowdMap } from '@/Police/components/CrowdMap';
import { AlertPanel } from '@/Police/components/AlertPanel';
import { StatsPanel } from '@/Police/components/StatsPanel';
import { RedirectionPanel } from '@/Police/components/RedirectionPanel';
import { CommunicationPanel } from '@/Police/components/CommunicationPanel';
import { ControlPanel } from '@/Police/components/ControlPanel';
import { IncidentLog } from '@/Police/components/IncidentLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Police/components/ui/tabs';
import { Badge } from '@/Police/components/ui/badge';
import { CommunicationMessage, IncidentLog as IncidentLogType } from '@/types/crowd';
import { Shield, Radio, Map, BarChart3, AlertTriangle, Navigation, FileText, Users } from 'lucide-react';

const Index = () => {
  const [simulation] = useState(() => new CrowdSimulation());
  const [simulationState, setSimulationState] = useState(simulation.getState());
  const [isRunning, setIsRunning] = useState(false);
  
  // UI Controls
  const [showFlowVectors, setShowFlowVectors] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('all');
  const [historicDataMode, setHistoricDataMode] = useState(false);
  const [geofencingEnabled, setGeofencingEnabled] = useState(true);
  
  // Communication and Incident Management
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [incidents, setIncidents] = useState<IncidentLogType[]>([]);

  // Simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        simulation.tick();
        setSimulationState(simulation.getState());
        
        // Simulate receiving messages occasionally
        if (Math.random() > 0.995) {
          const teams = ['Security Team Alpha', 'Security Team Beta', 'Medical Team'];
          const randomTeam = teams[Math.floor(Math.random() * teams.length)];
          const messageContent = [
            'Position confirmed, all clear',
            'Crowd movement looks normal',
            'Request backup at current position',
            'Medical kit restocked and ready',
            'Gate flow operating smoothly'
          ];
          
          const newMessage: CommunicationMessage = {
            id: `msg-${Date.now()}`,
            from: randomTeam,
            to: 'Command Center',
            message: messageContent[Math.floor(Math.random() * messageContent.length)],
            timestamp: new Date(),
            priority: Math.random() > 0.8 ? 'high' : 'medium',
            acknowledged: false
          };
          
          setMessages(prev => [newMessage, ...prev].slice(0, 20));
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, simulation]);

  const handleToggleSimulation = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      simulation.start();
    } else {
      simulation.stop();
    }
  };

  const handleResetSimulation = () => {
    setIsRunning(false);
    simulation.stop();
    // Create new simulation instance
    const newSim = new CrowdSimulation();
    setSimulationState(newSim.getState());
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    simulation.acknowledgeAlert(alertId);
    setSimulationState(simulation.getState());
  };

  const handleSendMessage = (message: Omit<CommunicationMessage, 'id' | 'timestamp'>) => {
    const newMessage: CommunicationMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    };
    setMessages(prev => [newMessage, ...prev].slice(0, 20));
  };

  const handleAcknowledgeMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, acknowledged: true } : msg
    ));
  };

  const handleCreateIncident = (incident: Omit<IncidentLogType, 'id' | 'timestamp'>) => {
    const newIncident: IncidentLogType = {
      ...incident,
      id: `incident-${Date.now()}`,
      timestamp: new Date()
    };
    setIncidents(prev => [newIncident, ...prev]);
  };

  const handleUpdateIncident = (incidentId: string, updates: Partial<IncidentLogType>) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId ? { ...incident, ...updates } : incident
    ));
  };

  const handleAddNote = (incidentId: string, note: string) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, notes: [...incident.notes, `${new Date().toLocaleTimeString()}: ${note}`] }
        : incident
    ));
  };

  // Filter data based on current filters
  const filteredAlerts = simulationState.alerts.filter(alert => {
    if (selectedZoneFilter !== 'all' && alert.zone !== selectedZoneFilter) return false;
    if (selectedSeverityFilter !== 'all' && alert.severity !== selectedSeverityFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Police Command Center</h1>
                <p className="text-sm text-muted-foreground">Chinnaswamy Stadium - Crowd Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-bold">{simulationState.totalPeople.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">People</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {simulationState.alerts.length} Active Alerts
                </div>
              </div>
              
              <Badge variant={isRunning ? "default" : "secondary"} className="text-sm">
                {isRunning ? "LIVE" : "PAUSED"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Panel - Map */}
          <div className="col-span-8">
            <Tabs defaultValue="map" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Live Map
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="incidents" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Incidents
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="flex-1 mt-4">
                <div className="h-full border rounded-lg overflow-hidden">
                  <CrowdMap
                    zones={simulationState.zones}
                    gates={simulationState.gates}
                    people={simulationState.people}
                    alerts={filteredAlerts}
                    showHeatmap={showHeatmap}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="flex-1 mt-4">
                <div className="h-full overflow-y-auto">
                  <StatsPanel
                    zones={simulationState.zones}
                    gates={simulationState.gates}
                    totalPeople={simulationState.totalPeople}
                    totalAlerts={simulationState.alerts.length}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="incidents" className="flex-1 mt-4">
                <IncidentLog
                  incidents={incidents}
                  onCreateIncident={handleCreateIncident}
                  onUpdateIncident={handleUpdateIncident}
                  onAddNote={handleAddNote}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Controls and Alerts */}
          <div className="col-span-4 space-y-6">
            {/* Control Panel */}
            <ControlPanel
              isSimulationRunning={isRunning}
              onToggleSimulation={handleToggleSimulation}
              onResetSimulation={handleResetSimulation}
              selectedZoneFilter={selectedZoneFilter}
              onZoneFilterChange={setSelectedZoneFilter}
              selectedSeverityFilter={selectedSeverityFilter}
              onSeverityFilterChange={setSelectedSeverityFilter}
              historicDataMode={historicDataMode}
              onToggleHistoricData={setHistoricDataMode}
              geofencingEnabled={geofencingEnabled}
              onToggleGeofencing={setGeofencingEnabled}
            />

            {/* Tabs for different panels */}
            <Tabs defaultValue="alerts" className="flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="alerts" className="flex items-center gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  Alerts
                </TabsTrigger>
                <TabsTrigger value="redirections" className="flex items-center gap-1 text-xs">
                  <Navigation className="h-3 w-3" />
                  Routes
                </TabsTrigger>
                <TabsTrigger value="comms" className="flex items-center gap-1 text-xs">
                  <Radio className="h-3 w-3" />
                  Comms
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="alerts" className="mt-4">
                <AlertPanel
                  alerts={filteredAlerts}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                />
              </TabsContent>
              
              <TabsContent value="redirections" className="mt-4">
                <RedirectionPanel
                  suggestions={simulationState.redirections}
                />
              </TabsContent>
              
              <TabsContent value="comms" className="mt-4">
                <CommunicationPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onAcknowledgeMessage={handleAcknowledgeMessage}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;