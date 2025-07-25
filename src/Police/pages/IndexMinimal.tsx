import React from 'react';
import { Shield } from 'lucide-react';

console.log('Minimal Index: Component starting...');

const Index = () => {
  console.log('Minimal Index: Rendering basic component...');

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Shield className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold">Police Command Center</h1>
        </div>
        
        <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span>System:</span>
              <span className="text-success">Online</span>
            </div>
            <div className="flex justify-between">
              <span>Location:</span>
              <span>Chinnaswamy Stadium</span>
            </div>
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="text-warning">Debug</span>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground max-w-md mx-auto">
          <p>Simplified interface for debugging the render2 error.</p>
          <p>If you see this, the basic React setup is working correctly.</p>
        </div>
      </div>
    </div>
  );
};

console.log('Minimal Index: Component defined successfully');

export default Index;