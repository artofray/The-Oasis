import React from 'react';
import { GlassCard } from '../ui/GlassCard';

const DataFlowChart: React.FC = () => {
  const dataPoints = [20, 25, 15, 30, 22, 35, 28, 40, 30, 20, 25, 18];
  const maxVal = 40;
  
  const pathData = dataPoints.map((p, i) => {
    const x = (i / (dataPoints.length - 1)) * 100;
    const y = 100 - (p / maxVal) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="h-48 w-full">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={pathData} fill="none" stroke="#22d3ee" strokeWidth="1" />
        <path d={`${pathData} L 100 100 L 0 100 Z`} fill="url(#chartGradient)" />
      </svg>
    </div>
  );
};

const SystemOverviewRing: React.FC = () => {
    const percentage = 40;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-700" strokeWidth="5" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
                <circle
                    className="text-cyan-400"
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{percentage}%</span>
                <span className="text-xs text-gray-400">System Load</span>
            </div>
        </div>
    );
};


export const Dashboard: React.FC = () => {
  return (
    <div className="h-full">
        <div className="mb-6">
            <h1 className="text-4xl font-bold text-white">Welcome to Maggie's Oasis</h1>
            <p className="text-gray-400 mt-1">Orchestrating intelligence with unflawed precision.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <GlassCard className="lg:col-span-2 xl:col-span-2 p-4">
                <h2 className="text-lg font-semibold text-white mb-2">Data Flow (Gb/s)</h2>
                <DataFlowChart />
            </GlassCard>
            
            <GlassCard className="p-4 flex flex-col items-center justify-center">
                 <h2 className="text-lg font-semibold text-white mb-2">System Overview</h2>
                 <SystemOverviewRing />
            </GlassCard>

            <GlassCard className="p-4">
                 <h2 className="text-lg font-semibold text-white mb-2">Active Tasks</h2>
                 <p className="text-sm text-gray-400">The network grows silent. Evasive troublemakers, bona fide hustlers, or loyalists?</p>
            </GlassCard>
            
            <GlassCard className="lg:col-span-2 xl:col-span-2 p-4">
                 <h2 className="text-lg font-semibold text-white mb-2">System Overview</h2>
                 <div className="flex items-center gap-4">
                    <img src="https://i.imgur.com/k7b9ytE.png" alt="Agent" className="w-24 h-24 rounded-lg object-cover" />
                    <p className="text-sm text-gray-400">Five teams seek access to your system. Their best bet: use an insider. You're building a team too. Your goal is to secure the network.</p>
                 </div>
            </GlassCard>

             <GlassCard className="lg:col-span-1 xl:col-span-2 p-4">
                 <h2 className="text-lg font-semibold text-white mb-2">Recent Activities</h2>
                 <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">A</div>
                        <p className="text-gray-300">Active Tasks for 'Stonemaul' are now available.</p>
                    </li>
                     <li className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">B</div>
                        <p className="text-gray-300">Five teams seek access to your system. Their best bet...</p>
                    </li>
                 </ul>
            </GlassCard>
        </div>
    </div>
  );
};