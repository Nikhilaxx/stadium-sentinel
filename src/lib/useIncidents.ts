// src/lib/useIncidents.ts
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { IncidentLog } from '@/types/crowd'; // Adjust path if needed

const supabaseUrl = 'https://gqaydohulxiagbotnkzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxYXlkb2h1bHhpYWdib3Rua3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MzA4OTAsImV4cCI6MjA2OTAwNjg5MH0.bNGFx8mmoDbC3hpGz8rRouOGSQNWp6knbCm1PLESy-s';
const supabase = createClient(supabaseUrl, supabaseKey);

export function useIncidents() {
  const [incidents, setIncidents] = useState<IncidentLog[]>([]);

  useEffect(() => {
    fetchIncidents();

    const channel = supabase
      .channel('incident-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchIncidents() {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setIncidents(
        data.map((incident: any) => ({
          ...incident,
          timestamp: new Date(incident.timestamp),
        }))
      );
    }
  }

  async function createIncident(incident: Omit<IncidentLog, 'id' | 'timestamp'>) {
    await supabase.from('incidents').insert([incident]);
  }

  async function updateIncident(id: string, updates: Partial<IncidentLog>) {
    await supabase.from('incidents').update(updates).eq('id', id);
  }

  async function addNote(id: string, note: string) {
    const { data: current } = await supabase.from('incidents').select('notes').eq('id', id).single();
    const updatedNotes = [...(current?.notes || []), note];
    await supabase.from('incidents').update({ notes: updatedNotes }).eq('id', id);
  }

  return {
    incidents,
    createIncident,
    updateIncident,
    addNote,
  };
}
