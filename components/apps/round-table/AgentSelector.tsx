import React from 'react';
import type { RoundTableAgent } from '../../../types';
import { AgentAvatar } from './AgentAvatar';
import { EditIcon, VoiceClonedIcon } from './Icons';

interface AgentSelectorProps {
    agents: RoundTableAgent[];
    selectedAgentIds: Set<string>;
    onAgentToggle: (agentId: string) => void;
    onEditAgent: (agentId: string) => void;
    onCreateAgent: () => void;
}

const CreateAgentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);


export const AgentSelector: React.FC<AgentSelectorProps> = ({ agents, selectedAgentIds, onAgentToggle, onEditAgent, onCreateAgent }) => {
    return (
        <div className="w-80 bg-[#161B22] p-4 flex flex-col border-r border-gray-800">
            <h2 className="text-xl font-bold mb-4 text-gray-200">Select Agents</h2>
            <button
                onClick={onCreateAgent}
                className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg mb-4 transition-colors"
            >
                <CreateAgentIcon />
                Create Agent
            </button>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <ul className="space-y-1">
                    {agents.map(agent => (
                        <li key={agent.id} className="group">
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${selectedAgentIds.has(agent.id) ? 'bg-blue-900/50' : 'hover:bg-gray-800/60'}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedAgentIds.has(agent.id)}
                                    onChange={() => onAgentToggle(agent.id)}
                                    className="form-checkbox h-5 w-5 bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500 rounded"
                                    aria-label={`Select ${agent.name}`}
                                />
                                <div className="ml-4 flex items-center flex-1">
                                    <AgentAvatar agent={agent} size="sm" />
                                    <div className="ml-3 overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold truncate text-gray-100">{agent.name}</p>
                                            {agent.voiceCloned && <VoiceClonedIcon className="w-4 h-4 flex-shrink-0" />}
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">{agent.description}</p>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.preventDefault(); onEditAgent(agent.id); }} className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Edit ${agent.name}`}>
                                    <EditIcon className="w-4 h-4" />
                                </button>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};