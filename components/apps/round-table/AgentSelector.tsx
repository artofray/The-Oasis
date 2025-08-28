import React from 'react';
import type { RoundTableAgent } from '../../../types';
import { AgentAvatar } from './AgentAvatar';
import { EditIcon } from './Icons';

interface AgentSelectorProps {
    agents: RoundTableAgent[];
    selectedAgentIds: Set<string>;
    onAgentToggle: (agentId: string) => void;
    onEditAgent: (agentId: string) => void;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({ agents, selectedAgentIds, onAgentToggle, onEditAgent }) => {
    return (
        <div className="w-80 bg-[#171a21] p-4 flex flex-col border-r border-gray-700">
            <h2 className="text-xl font-bold mb-4">Select Agents</h2>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mb-4 transition-colors">
                + Create Agent
            </button>
            <div className="flex-1 overflow-y-auto pr-2">
                <ul className="space-y-2">
                    {agents.map(agent => (
                        <li key={agent.id} className="group">
                            <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${selectedAgentIds.has(agent.id) ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}>
                                <input
                                    type="checkbox"
                                    checked={selectedAgentIds.has(agent.id)}
                                    onChange={() => onAgentToggle(agent.id)}
                                    className="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 text-blue-500 focus:ring-blue-500 rounded"
                                />
                                <div className="ml-4 flex items-center flex-1">
                                    <AgentAvatar agent={agent} size="sm" />
                                    <div className="ml-3">
                                        <p className="font-semibold">{agent.name}</p>
                                        <p className="text-xs text-gray-400">{agent.description}</p>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.preventDefault(); onEditAgent(agent.id); }} className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
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
