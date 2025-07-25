// src/Police/components/IncidentLog.tsx

import React, { useState } from 'react';
import { IncidentLog as Incident } from '@/types/crowd';
import { Button } from '@/Police/components/ui/button';
import { Input } from '@/Police/components/ui/input';
import { Textarea } from '@/Police/components/ui/textarea';
import { useIncidents } from '@/lib/useIncidents';

export const IncidentLog = () => {
  const { incidents, createIncident, updateIncident, addNote } = useIncidents();

  const [newIncident, setNewIncident] = useState({
    type: '',
    description: '',
    severity: 'medium',
    assignedTo: '',
    location_lat: '',
    location_lng: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewIncident({ ...newIncident, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.type || !newIncident.description) return;

    await createIncident({
      type: newIncident.type,
      description: newIncident.description,
      severity: newIncident.severity,
      assignedTo: newIncident.assignedTo,
      location: [parseFloat(newIncident.location_lat), parseFloat(newIncident.location_lng)],
      status: 'reported',
      notes: [],
    });

    setNewIncident({
      type: '',
      description: '',
      severity: 'medium',
      assignedTo: '',
      location_lat: '',
      location_lng: '',
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Incident Log</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <Input name="type" placeholder="Incident Type" value={newIncident.type} onChange={handleChange} />
        <Input name="assignedTo" placeholder="Assigned To" value={newIncident.assignedTo} onChange={handleChange} />
        <Input name="severity" placeholder="Severity (low, medium, high)" value={newIncident.severity} onChange={handleChange} />
        <Input name="location_lat" placeholder="Latitude" value={newIncident.location_lat} onChange={handleChange} />
        <Input name="location_lng" placeholder="Longitude" value={newIncident.location_lng} onChange={handleChange} />
        <Textarea name="description" placeholder="Description" className="col-span-2" value={newIncident.description} onChange={handleChange} />
        <Button type="submit" className="col-span-2">Create Incident</Button>
      </form>

      {/* Table */}
      <div className="overflow-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-2 py-1">Type</th>
              <th className="px-2 py-1">Severity</th>
              <th className="px-2 py-1">Assigned</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-t">
                <td className="px-2 py-1">{incident.type}</td>
                <td className="px-2 py-1">{incident.severity}</td>
                <td className="px-2 py-1">{incident.assignedTo}</td>
                <td className="px-2 py-1">{incident.status}</td>
                <td className="px-2 py-1">{new Date(incident.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
