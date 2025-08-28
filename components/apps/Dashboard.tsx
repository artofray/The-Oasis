

import React from 'react';
import { GlassCard } from '../ui/GlassCard';

export const Dashboard: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <GlassCard className="p-10">
        <h1 className="text-5xl font-bold">
          Welcome to <span className="text-cyan-400">The Oasis</span>
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl">
          A cloud-native, AI-driven operating system to automate your digital workflows. Your autonomous cloud employees are ready for instructions.
        </p>
        <p className="mt-2 text-sm text-fuchsia-400">
          Example: "Show me my agents" or "Teach a new workflow for processing invoices."
        </p>
      </GlassCard>
    </div>
  );
};