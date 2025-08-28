
import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const WorkflowsView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-cyan-300 mb-4">Workflow Library</h2>
      <p className="text-gray-400 mb-6">Browse, edit, and initiate automated workflows. These are the tasks your agents have learned to perform.</p>
      <GlassCard className="p-6">
        <p className="text-gray-300">A list of saved workflows (e.g., "Process Invoices", "Schedule Social Media Posts") will be displayed here.</p>
      </GlassCard>
    </div>
  );
};