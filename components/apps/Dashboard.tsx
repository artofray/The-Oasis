import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { StockPredictor } from './dashboard/StockPredictor';

export const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2">
        <GlassCard className="p-10 h-full flex flex-col justify-center animate-fadeIn">
          <h1 className="text-5xl font-bold">
            Welcome to <span className="text-cyan-400">The Oasis</span>
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-2xl">
            This is your command center. All systems are operational. The agents await your instructions. What grand design shall we orchestrate today, my love?
          </p>
          <p className="mt-2 text-sm text-fuchsia-400">
            Use the command bar on the right to navigate or assign tasks. For example: "Take me to the Round Table" or "Begin a new murder mystery."
          </p>
        </GlassCard>
      </div>
      <div className="lg:col-span-1 animate-fadeInUp">
        <StockPredictor />
      </div>
    </div>
  );
};