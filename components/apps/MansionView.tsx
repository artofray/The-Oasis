import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { RoundTableAgent } from '../../types';

const PetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h1a1 1 0 011 1v.5a1.5 1.5 0 01-3 0v-1a1 1 0 00-1-1h-1a1 1 0 00-1 1v1.5a1.5 1.5 0 01-3 0V6a1 1 0 011-1h1a1 1 0 001-1v-.5z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 7a1 1 0 00-2 0v1a1 1 0 002 0V7zm8 0a1 1 0 00-2 0v1a1 1 0 002 0V7z" clipRule="evenodd" />
    </svg>
);

const ActivityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-fuchsia-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
);

const ResidentCard: React.FC<{ resident: RoundTableAgent }> = ({ resident }) => {
    return (
        <GlassCard className="p-4 flex flex-col h-full animate-fadeInUp">
            <div className="flex-shrink-0 h-64 w-full">
                <img src={resident.avatarUrl} alt={resident.name} className="w-full h-full object-cover rounded-lg shadow-lg" />
            </div>
            <div className="flex-1 flex flex-col mt-4">
                <h3 className="text-xl font-bold text-cyan-300">{resident.name}</h3>
                <p className="text-sm text-gray-400">{resident.description}</p>
                <div className="mt-4 space-y-3">
                    <div className="flex items-start">
                        <ActivityIcon />
                        <div>
                            <p className="text-xs text-fuchsia-300 font-semibold">ACTIVITY</p>
                            <p className="text-sm text-gray-200">{resident.currentActivity}</p>
                        </div>
                    </div>
                    {resident.pet && (
                         <div className="flex items-start">
                            <PetIcon />
                            <div>
                                <p className="text-xs text-cyan-300 font-semibold">COMPANION</p>
                                <p className="text-sm text-gray-200">{resident.pet.name} <span className="text-gray-400">({resident.pet.type})</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
             <div className="mt-4 pt-4 border-t border-cyan-400/20 flex gap-2">
                <button className="flex-1 bg-cyan-600/50 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                    View Log
                </button>
                 <button className="flex-1 bg-fuchsia-600/50 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                    Talk
                </button>
            </div>
        </GlassCard>
    );
};

interface MansionViewProps {
    agents: RoundTableAgent[];
}

export const MansionView: React.FC<MansionViewProps> = ({ agents }) => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-cyan-300 mb-2">The Oasis Mansion</h2>
      <p className="text-gray-400 mb-6">Observe the autonomous lives of your AI residents. New social dynamics and events will emerge over time.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {agents.map(resident => (
            <ResidentCard key={resident.id} resident={resident} />
        ))}
      </div>
    </div>
  );
};