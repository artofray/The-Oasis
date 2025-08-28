
import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const AgentsView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-cyan-300 mb-4">Cloud Employee Management</h2>
      <p className="text-gray-400 mb-6">Monitor, manage, and deploy your autonomous AI agents. Each agent operates in its own secure, persistent workspace.</p>
      <GlassCard className="p-6">
        <p className="text-gray-300">Agent list and real-time monitoring dashboard will be displayed here.</p>
      </GlassCard>
    </div>
  );
};