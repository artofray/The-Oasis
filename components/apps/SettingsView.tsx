

import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const SettingsView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-cyan-300 mb-4">System Settings</h2>
      <p className="text-gray-400 mb-6">Configure security, role-based access controls, and system preferences for The Oasis.</p>
      <GlassCard className="p-6">
        <p className="text-gray-300">Configuration options for security, agent permissions, and API integrations will be available here.</p>
      </GlassCard>
    </div>
  );
};