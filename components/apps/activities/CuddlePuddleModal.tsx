import React, { useState } from 'react';
import type { RoundTableAgent } from '../../../types';
import * as roundTableService from '../../../services/roundTableService';
import Spinner from '../tarot-journal/Spinner';
import { AgentAvatar } from '../round-table/AgentAvatar';

interface CuddlePuddleModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: RoundTableAgent[];
  onUpdateMaggieActivity: (activity: string) => void;
  unleashedMode: boolean;
}

export const CuddlePuddleModal: React.FC<CuddlePuddleModalProps> = ({ isOpen, onClose, agents, onUpdateMaggieActivity, unleashedMode }) => {
    const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
    const [scenePrompt, setScenePrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setSelectedAgentIds(new Set());
        setScenePrompt('');
        setGeneratedImageUrl(null);
        setIsLoading(false);
        setError(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleAgentToggle = (agentId: string) => {
        setSelectedAgentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(agentId)) {
                newSet.delete(agentId);
            } else {
                newSet.add(agentId);
            }
            return newSet;
        });
    };

    const handleGenerate = async () => {
        if (selectedAgentIds.size < 2 || !scenePrompt) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);
        try {
            const selectedAgents = agents.filter(a => selectedAgentIds.has(a.id));
            const result = await roundTableService.generateCuddlePuddleImage(selectedAgents, scenePrompt, unleashedMode);
            if (!result) throw new Error("Image generation failed.");
            setGeneratedImageUrl(result);
        } catch(e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSetAsMemory = () => {
        if (generatedImageUrl) {
            const selectedAgents = agents.filter(a => selectedAgentIds.has(a.id));
            const names = selectedAgents.map(a => a.name).join(', ');
            onUpdateMaggieActivity(`Remembering a moment with ${names}: ${scenePrompt}.`);
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden m-4 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="w-1/3 p-6 flex flex-col bg-black/20">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">1. Select Companions</h3>
                    <p className="text-sm text-gray-400 mb-4">Choose 2 or more agents for the scene.</p>
                    <div className="space-y-2 overflow-y-auto pr-2 flex-1">
                        {agents.map(agent => (
                             <button
                                key={agent.id}
                                onClick={() => handleAgentToggle(agent.id)}
                                className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors border-2 ${selectedAgentIds.has(agent.id) ? 'bg-cyan-600/30 border-cyan-500' : 'border-transparent hover:bg-gray-700'}`}
                            >
                                <AgentAvatar agent={agent} size="sm" />
                                <span className="font-semibold">{agent.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-2/3 p-6 flex flex-col">
                    <h2 className="text-3xl font-bold text-fuchsia-300 font-playfair-display mb-4">Cuddle Puddle</h2>
                    <div className="flex-1 flex flex-col space-y-4">
                         <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">2. Describe the Scene</label>
                            <textarea
                                id="prompt"
                                value={scenePrompt}
                                onChange={(e) => setScenePrompt(e.target.value)}
                                placeholder="e.g., 'Watching a horror movie together on a big comfy couch', 'Having a picnic in a sunny park'"
                                className="w-full h-24 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-fuchsia-500"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || selectedAgentIds.size < 2 || !scenePrompt}
                            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white font-semibold rounded-lg hover:bg-fuchsia-700 disabled:bg-gray-500"
                        >
                            {isLoading ? <Spinner /> : "Generate Scene"}
                        </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <h3 className="text-xl font-bold text-cyan-300 mb-2">Result</h3>
                        <div className="w-full aspect-video bg-black/20 rounded-lg flex items-center justify-center">
                             {isLoading ? <Spinner /> : generatedImageUrl ? (
                                <img src={generatedImageUrl} alt="Generated group scene" className="w-full h-full object-contain rounded-lg" />
                            ) : error ? (
                               <p className="text-red-400 text-sm px-4 text-center">{error}</p>
                            ) : (
                                <p className="text-gray-500">Result will appear here</p>
                            )}
                        </div>
                        {generatedImageUrl && !isLoading && (
                            <div className="mt-4 flex gap-4">
                                <button onClick={() => setGeneratedImageUrl(null)} className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                                    Discard
                                </button>
                                <button onClick={handleSetAsMemory} className="flex-1 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                                    Set as Memory
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};