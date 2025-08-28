
import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const TeachView: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-fuchsia-400 mb-4">No-Code Teaching Mode</h2>
      <p className="text-gray-400 mb-6">Teach a new workflow by performing it once. The agent will observe your actions and learn to automate the task.</p>
      <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <h3 className="text-xl font-bold mb-4">Start a new lesson</h3>
        <p className="text-gray-400 mb-6 text-center">The visual interaction stream will appear here. <br/>Simply demonstrate a task within a simulated desktop environment.</p>
        <button className="bg-fuchsia-500/80 hover:bg-fuchsia-500 text-white font-bold py-3 px-8 rounded-lg transition-colors">
            Begin Recording Session
        </button>
      </GlassCard>
    </div>
  );
};