import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Police/components/ui/card';
import { Button } from '@/Police/components/ui/button';
import { Input } from '@/Police/components/ui/input';
import { Textarea } from '@/Police/components/ui/textarea';
import { Badge } from '@/Police/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Police/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Police/components/ui/dialog';
import { ScrollArea } from '@/Police/components/ui/scroll-area';
import { FileText, Plus, Clock, MapPin, User, MessageSquare } from 'lucide-react';
import { IncidentLog as IncidentLogType } from '@/types/crowd';

interface IncidentLogProps {
  incidents: IncidentLogType[];
  onCreateIncident: (incident: Omit<IncidentLogType, 'id' | 'timestamp'>) => void;
  onUpdateIncident: (incidentId: string, updates: Partial<IncidentLogType>) => void;
  onAddNote: (incidentId: string, note: string) => void;
}

export const IncidentLog: React.FC<IncidentLogProps> = ({
  incidents,
  onCreateIncident,
  onUpdateIncident,
  onAddNote
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentLogType | null>(null);
  const [newIncident, setNewIncident] = useState({
    type: '',
    description: '',
    location: [12.9716, 77.5946] as [number, number],
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'reported' as 'reported' | 'investigating' | 'resolved',
    assignedTo: '',
    notes: [] as string[]
  });
  const [newNote, setNewNote] = useState('');

  const handleCreateIncident = () => {
    if (newIncident.type && newIncident.description) {
      onCreateIncident(newIncident);
      setNewIncident({
        type: '',
        description: '',
        location: [12.9716, 77.5946],
        severity: 'medium',
        status: 'reported',
        assignedTo: '',
        notes: []
      });
      setIsCreateDialogOpen(false);
    }
  };

  const handleAddNote = () => {
    if (selectedIncident && newNote.trim()) {
      onAddNote(selectedIncident.id, newNote);
      setNewNote('');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'investigating': return 'secondary';
      case 'reported': return 'outline';
      default: return 'secondary';
    }
  };

  const incidentTypes = [
    'Crowd Congestion',
    'Medical Emergency',
    'Security Breach',
    'Equipment Failure',
    'Weather Related',
    'Panic Incident',
    'Fire/Evacuation',
    'Traffic Issue',
    'Other'
  ];

  const personnel = [
    'Security Team Alpha',
    'Security Team Beta',
    'Medical Team',
    'Emergency Response',
    'Maintenance',
    'Traffic Control'
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Incident Log
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Incident
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Incident</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newIncident.type} onValueChange={(value) => setNewIncident({...newIncident, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {incidentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Incident description..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select value={newIncident.severity} onValueChange={(value: any) => setNewIncident({...newIncident, severity: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={newIncident.assignedTo} onValueChange={(value) => setNewIncident({...newIncident, assignedTo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {personnel.map(person => (
                        <SelectItem key={person} value={person}>{person}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCreateIncident} className="w-full">
                  Create Incident
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {incidents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No incidents logged</p>
          </div>
        ) : (
          incidents
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map(incident => (
              <div 
                key={incident.id}
                className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{incident.type}</h4>
                  <div className="flex gap-2">
                    <Badge variant={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                    <Badge variant={getStatusColor(incident.status)}>
                      {incident.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {incident.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {incident.timestamp.toLocaleTimeString()}
                  </div>
                  {incident.assignedTo && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {incident.assignedTo}
                    </div>
                  )}
                  {incident.notes.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {incident.notes.length} notes
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </CardContent>

      {/* Incident Detail Dialog */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIncident?.type}
              <Badge variant={getSeverityColor(selectedIncident?.severity || '')}>
                {selectedIncident?.severity}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          {selectedIncident && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedIncident.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    <Select 
                      value={selectedIncident.status} 
                      onValueChange={(value: any) => onUpdateIncident(selectedIncident.id, { status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reported">Reported</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Assigned To</h4>
                    <Select 
                      value={selectedIncident.assignedTo || ''} 
                      onValueChange={(value) => onUpdateIncident(selectedIncident.id, { assignedTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        {personnel.map(person => (
                          <SelectItem key={person} value={person}>{person}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Notes ({selectedIncident.notes.length})</h4>
                  <div className="space-y-2 mb-3">
                    {selectedIncident.notes.map((note, index) => (
                      <div key={index} className="bg-muted p-2 rounded text-sm">
                        {note}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};