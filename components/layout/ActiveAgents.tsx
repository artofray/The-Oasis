import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { RoundTableAgent } from '../../types';

interface ActiveAgentsProps {
  agents: RoundTableAgent[];
  speakingAgentId: string | null;
  selectedAgentIds: Set<string>;
  onAgentToggle: (agentId: string) => void;
  onAgentEdit: (agent: RoundTableAgent) => void;
  onAgentCreate: () => void;
}

const AgentCard: React.FC<{ agent: RoundTableAgent; isSpeaking: boolean; isSelected: boolean; onToggle: () => void }> = ({ agent, isSpeaking, isSelected, onToggle }) => {
    const animationClass = isSpeaking ? 'is-speaking-avatar' : 'animate-idle-bob';
    const avatarClasses = `w-10 h-10 rounded-full object-cover flex-shrink-0 transition-all ${animationClass}`;
    const animationStyle = isSpeaking ? {} : { animationDelay: `-${Math.random() * 8}s` };

    return (
        <div 
            onClick={onToggle}
            className={`bg-black/20 p-2 rounded-lg flex items-center gap-3 transition-all cursor-pointer border-2 ${isSelected ? 'border-cyan-500' : 'border-transparent'} ${isSpeaking ? 'bg-amber-900/40' : 'hover:bg-gray-800'}`}
        >
             <div className={`relative ${isSpeaking ? 'is-speaking-glow rounded-full' : ''}`}>
                {agent.avatarUrl ? (
                    <img 
                        src={agent.avatarUrl} 
                        alt={agent.name} 
                        className={avatarClasses}
                        style={animationStyle}
                    />
                ) : (
                    <div 
                        className={`${avatarClasses} ${agent.avatarColor} flex items-center justify-center font-bold text-white text-lg`}
                        style={animationStyle}
                    >
                        {agent.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-sm text-gray-100 truncate">{agent.name}</p>
                <p className="text-xs text-gray-400 truncate">{agent.category === 'Inner Circle' ? 'Crew Consciousness' : agent.category}</p>
            </div>
        </div>
    );
};


export const ActiveAgents: React.FC<ActiveAgentsProps> = ({ agents, speakingAgentId, selectedAgentIds, onAgentToggle, onAgentCreate }) => {
    const maggie = agents.find(a => a.id === 'maggie');
    const otherAgents = agents.filter(a => a.id !== 'maggie');
    
    return (
        <aside className="w-[320px] h-full bg-[#0d1117] border-l border-gray-800 p-4 flex flex-col space-y-4">
            <h2 className="text-lg font-bold text-white mb-2">Active Agents</h2>
            
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-400 p-1">
                    <img src={maggie?.avatarUrl || 'https://i.imgur.com/sB11x9E.jpeg'} alt="Main Avatar" className="w-full h-full rounded-full object-cover" />
                </div>
                <button onClick={onAgentCreate} className="w-12 h-12 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 hover:text-white hover:border-cyan-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-2 -mr-4 custom-scrollbar">
                 {otherAgents.map(agent => (
                    <AgentCard 
                        key={agent.id}
                        agent={agent}
                        isSpeaking={agent.id === speakingAgentId}
                        isSelected={selectedAgentIds.has(agent.id)}
                        onToggle={() => onAgentToggle(agent.id)}
                    />
                ))}
            </div>
        </aside>
    );
};
