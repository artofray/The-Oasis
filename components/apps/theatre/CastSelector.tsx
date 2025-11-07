import React from 'react';
import type { RoundTableAgent, PerformanceMode } from '../../../types';
import { AgentAvatar } from '../round-table/AgentAvatar';

interface CastSelectorProps {
    agents: RoundTableAgent[];
    selectedAgentIds: Set<string>;
    onAgentToggle: (agentId: string) => void;
    speakingAgentId: string | null;
    disabled: boolean;
    performanceMode: PerformanceMode;
    characterAssignments: Record<string, string>;
    characters: string[];
}

export const CastSelector: React.FC<CastSelectorProps> = ({ agents, selectedAgentIds, onAgentToggle, speakingAgentId, disabled, performanceMode, characterAssignments, characters }) => {
    
    const getCharacterForAgent = (agentId: string): string | null => {
        const entry = Object.entries(characterAssignments).find(([, aId]) => aId === agentId);
        return entry ? entry[0] : null;
    };
    
    return (
        <div className="flex-1 flex flex-col">
            <h3 className="text-lg font-bold mb-2 text-gray-200">
                {performanceMode === 'scripted' && characters.length > 0 ? `Cast (${characters.length} Roles)`: 'Select Your Cast'}
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-1">
                {agents.map(agent => {
                    const characterName = getCharacterForAgent(agent.id);
                    const isSelected = selectedAgentIds.has(agent.id);

                    return (
                        <label key={agent.id} 
                            className={`flex items-center p-2 rounded-lg transition-all ${speakingAgentId === agent.id ? 'bg-amber-500/30' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-800/60'}`}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onAgentToggle(agent.id)}
                                className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500 rounded"
                                disabled={disabled}
                            />
                            <div className="ml-3 flex items-center flex-1">
                                <AgentAvatar agent={agent} size="sm" />
                                <div className="ml-3 overflow-hidden">
                                    <p className={`font-semibold truncate ${speakingAgentId === agent.id ? 'text-amber-300' : 'text-gray-100'}`}>
                                        {agent.name}
                                    </p>
                                    {performanceMode === 'scripted' && isSelected && characterName && (
                                        <p className="text-xs text-fuchsia-300 italic truncate">as {characterName}</p>
                                    )}
                                </div>
                            </div>
                        </label>
                    )
                })}
            </div>
        </div>
    );
};