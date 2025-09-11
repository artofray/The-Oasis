import React, { useState, useEffect } from 'react';
import type { RoundTableAgent, BedtimeStory } from '../../../types';
import * as storytellerService from '../../../services/storytellerService';
import { useSpeech } from '../../../hooks/useSpeech';
import { GlassCard } from '../../ui/GlassCard';
import { AgentAvatar } from '../round-table/AgentAvatar';
import Spinner from '../tarot-journal/Spinner';

interface BedtimeStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: RoundTableAgent[];
}

export const BedtimeStoryModal: React.FC<BedtimeStoryModalProps> = ({ isOpen, onClose, agents }) => {
    const [selectedAgent, setSelectedAgent] = useState<RoundTableAgent | null>(null);
    const [prompt, setPrompt] = useState('');
    const [story, setStory] = useState<BedtimeStory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { speak, stop, isSpeaking, voices } = useSpeech();
    const [agentVoice, setAgentVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (!selectedAgent || voices.length === 0) return;
        const hash = selectedAgent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        setAgentVoice(englishVoices[hash % englishVoices.length]);
    }, [selectedAgent, voices]);

    const resetState = () => {
        setSelectedAgent(null);
        setPrompt('');
        setStory(null);
        setIsLoading(false);
        setError(null);
        stop();
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleGenerate = async () => {
        if (!selectedAgent || !prompt) return;
        setIsLoading(true);
        setError(null);
        setStory(null);
        stop();
        try {
            const result = await storytellerService.generateBedtimeStory(selectedAgent, prompt);
            setStory(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayNarration = () => {
        if (story && agentVoice) {
            speak(story.story, { voice: agentVoice });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden m-4 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
                {!story && !isLoading && !error && (
                     <div className="w-full p-8 flex flex-col items-center justify-center text-center animate-fadeIn">
                        <h2 className="text-4xl font-bold text-purple-300 font-playfair-display mb-4">Dream Weaver</h2>
                         <div className="w-full max-w-md space-y-6">
                            <div>
                                <label className="block text-lg font-medium text-gray-300 mb-2">1. Choose a Storyteller</label>
                                <select 
                                    onChange={(e) => setSelectedAgent(agents.find(a => a.id === e.target.value) || null)}
                                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                                >
                                    <option value="">Select an agent...</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-lg font-medium text-gray-300 mb-2">2. What's the story about?</label>
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., a brave squirrel who travels to the moon"
                                    className="w-full h-24 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={!selectedAgent || !prompt}
                                className="w-full px-6 py-4 bg-purple-600 text-white font-bold text-lg rounded-lg hover:bg-purple-700 disabled:bg-gray-500"
                            >
                                Weave Dream
                            </button>
                         </div>
                     </div>
                )}
                
                {(isLoading || error || story) && (
                    <div className="w-full flex">
                        <div className="w-1/3 p-6 bg-black/20 flex flex-col items-center justify-center">
                            {isLoading ? (
                                <Spinner />
                            ) : error ? (
                                <div className="text-center text-red-400">
                                    <p className="font-bold text-lg mb-2">An Error Occurred</p>
                                    <p>{error}</p>
                                </div>
                            ) : story ? (
                                <>
                                 <img src={story.coverImageUrl} alt="Story cover" className="w-full aspect-square object-cover rounded-lg shadow-2xl mb-4" />
                                 <button onClick={resetState} className="mt-4 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Tell Another Story</button>
                                </>
                            ) : null}
                        </div>
                        <div className="w-2/3 p-8 flex flex-col">
                            {story && (
                                <div className="flex-1 overflow-y-auto pr-4 animate-fadeIn">
                                    <h2 className="text-3xl font-bold text-purple-300 font-playfair-display mb-2">{story.title}</h2>
                                    <div className="flex items-center gap-3 mb-4">
                                        {selectedAgent && <AgentAvatar agent={selectedAgent} size="sm" />}
                                        <p className="text-gray-400">A story by {selectedAgent?.name}</p>
                                    </div>
                                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed font-lora">{story.story}</p>
                                </div>
                            )}
                            {story && (
                                <div className="mt-auto pt-4 border-t border-gray-700">
                                    <button 
                                        onClick={isSpeaking ? stop : handlePlayNarration}
                                        className={`w-full px-6 py-3 font-bold rounded-lg transition-colors ${isSpeaking ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                                    >
                                        {isSpeaking ? 'Stop Narration' : 'Read Aloud'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};