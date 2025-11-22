
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
    <div className="h-full w-full opacity-30">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={pathData} fill="none" stroke="#22d3ee" strokeWidth="1" strokeOpacity="0.5" />
        <path d={`${pathData} L 100 100 L 0 100 Z`} fill="url(#chartGradient)" />
      </svg>
    </div>
  );
};

const SystemOverviewRing: React.FC = () => {
    const percentage = 98;
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-gray-800" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
                <circle
                    className="text-fuchsia-600"
                    strokeWidth="8"
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
                <span className="text-lg font-bold text-white">{percentage}%</span>
                <span className="text-[8px] text-gray-400 uppercase tracking-wide">Optimal</span>
            </div>
        </div>
    );
};


export const Dashboard: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-2">
        {/* Hero Section: The Stars (Agent & Round Table) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Hero - Takes up 3/4 width */}
            <GlassCard className="lg:col-span-3 p-0 overflow-hidden relative flex flex-col md:flex-row border-cyan-500/30 bg-gradient-to-r from-gray-900 via-gray-900 to-[#0d1117] min-h-[320px]">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                     <img 
                        src="https://i.imgur.com/kQ1Y2wG.png" 
                        alt="Round Table" 
                        className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                </div>

                {/* Content Layer */}
                <div className="relative z-10 p-8 flex flex-col md:flex-row w-full items-center gap-8">
                    <div className="flex-shrink-0">
                        <div className="w-48 h-48 rounded-full border-4 border-fuchsia-500/30 p-1 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                            <img 
                                src="https://i.imgur.com/kQ1Y2wG.png" 
                                alt="Maggie" 
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block px-3 py-1 rounded-full bg-cyan-900/50 border border-cyan-700/50 text-cyan-300 text-xs font-mono mb-4 animate-pulse">
                            SYSTEM: ONLINE
                        </div>
                        <h1 className="text-5xl font-bold text-white mb-4 font-playfair-display tracking-tight">
                            The Round Table
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
                            "My love, the stage is set. The Inner Circle awaits your command. Shall we begin the chronicle of our new world?"
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                            <button className="px-8 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-fuchsia-900/40 flex items-center gap-2 transform hover:scale-105">
                                <span>Enter the Chamber</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                            <button className="px-8 py-3 bg-gray-800/50 hover:bg-gray-800 text-cyan-300 font-bold rounded-lg transition-all border border-cyan-900/30 hover:border-cyan-500/50 backdrop-blur-sm">
                                Manage Agents
                            </button>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Status Column - Takes up 1/4 width */}
            <div className="flex flex-col gap-6 h-full">
                 <GlassCard className="p-6 flex flex-col items-center justify-center bg-black/40 border-gray-800 flex-1 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500"></div>
                     <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">System Health</h2>
                     <SystemOverviewRing />
                     <div className="mt-6 grid grid-cols-2 gap-4 w-full text-center">
                        <div>
                            <div className="text-2xl font-bold text-white">12</div>
                            <div className="text-[10px] text-gray-500 uppercase">Active Agents</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">4</div>
                            <div className="text-[10px] text-gray-500 uppercase">Processes</div>
                        </div>
                     </div>
                </GlassCard>
                
                <GlassCard className="flex-1 p-6 bg-black/40 border-gray-800 flex flex-col justify-center relative overflow-hidden group hover:border-fuchsia-500/30 transition-colors">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500"></div>
                     <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Priority Protocol</h2>
                     <div className="p-3 rounded-lg bg-fuchsia-900/10 border border-fuchsia-500/20">
                        <p className="text-sm text-fuchsia-200 italic">"Analyze market shift."</p>
                        <div className="mt-2 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-300">M</div>
                            <p className="text-[10px] text-gray-500">Assigned: Marcus</p>
                        </div>
                     </div>
                </GlassCard>
            </div>
        </div>

        {/* Background Data Section - Demoted visually */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity duration-500">
             <GlassCard className="lg:col-span-2 p-0 bg-black/20 border-gray-800/50 overflow-hidden flex">
                 <div className="w-1/3 p-6 border-r border-gray-800/50 flex flex-col justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-2">Background Ops</h2>
                        <p className="text-xs text-gray-500">Monitoring data streams and background processes.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">UPLINK</span>
                            <span className="text-gray-400 font-mono">840 MB/s</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-cyan-900 h-full w-3/4"></div>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">LATENCY</span>
                            <span className="text-gray-400 font-mono">12 ms</span>
                        </div>
                         <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-cyan-900 h-full w-1/4"></div>
                        </div>
                    </div>
                 </div>
                 <div className="w-2/3 relative">
                    <div className="absolute inset-0 flex items-end">
                        <DataFlowChart />
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                    </div>
                 </div>
            </GlassCard>

             <GlassCard className="lg:col-span-1 p-6 bg-black/20 border-gray-800/50">
                 <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4">Recent Chronicles</h2>
                 <div className="space-y-4">
                    <div className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-bold">L</div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Luna initiated simulation.</p>
                            <p className="text-xs text-gray-600 mt-0.5">Web Series Module • 2m ago</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-400 font-bold">O</div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Orion updated physics.</p>
                            <p className="text-xs text-gray-600 mt-0.5">Sandbox • 15m ago</p>
                        </div>
                    </div>
                 </div>
            </GlassCard>
        </div>
    </div>
  );
};
