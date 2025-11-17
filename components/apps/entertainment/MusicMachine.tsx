import React, { useState, useEffect } from 'react';
import type { RoundTableAgent } from '../../../types';
import * as musicService from '../../../services/musicService';
import { useSpeech } from '../../../hooks/useSpeech';
import { GlassCard } from '../../ui/GlassCard';
import { AgentAvatar } from '../round-table/AgentAvatar';
import Spinner from '../tarot-journal/Spinner';

interface MusicMachineProps {
    agents: RoundTableAgent[];
    unleashedMode: boolean;
}

const PlayIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>);
const StopIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>);

export const MusicMachine: React.FC<MusicMachineProps> = ({ agents, unleashedMode }) => {
    const [vocalistId, setVocalistId] = useState<string>('');
    const [genre, setGenre] = useState('Synthwave');
    const [mood, setMood] = useState('Nostalgic');
    const [instrumentation, setInstrumentation] = useState('Synthesizers, Drum Machine, Electric Guitar');
    const [prompt, setPrompt] = useState('A drive through a neon-lit city at night');
    
    const [song, setSong] = useState<musicService.Song | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { speak, stop, isSpeaking, voices } = useSpeech();
    const [vocalistVoice, setVocalistVoice] = useState<SpeechSynthesisVoice | null>(null);

    const vocalist = agents.find(a => a.id === vocalistId);

    useEffect(() => {
        if (!vocalist || voices.length === 0) return;
        const hash = vocalist.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        setVocalistVoice(englishVoices[hash % englishVoices.length]);
    }, [vocalist, voices]);
    
    useEffect(() => {
        return () => stop();
    }, [stop]);

    const handleGenerate = async () => {
        if (!vocalistId) {
            setError('Please select a vocalist.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSong(null);
        stop();
        try {
            const result = await musicService.generateSong(genre, mood, instrumentation, prompt, unleashedMode);
            setSong(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePlay = () => {
        if (song && vocalistVoice) {
            const pitch = 1 + (Math.random() - 0.5) * 0.2; // slight random pitch variation
            const rate = 1 + (Math.random() - 0.5) * 0.1; // slight random rate variation
            speak(song.lyrics, { voice: vocalistVoice, pitch, rate });
        }
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 flex flex-col">
                <GlassCard className="p-4 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">DAW Controls</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Vocalist</label>
                            <select value={vocalistId} onChange={e => setVocalistId(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md">
                                <option value="">-- Select Agent --</option>
                                {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Genre</label>
                            <input type="text" value={genre} onChange={e => setGenre(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Mood</label>
                            <input type="text" value={mood} onChange={e => setMood(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Instrumentation</label>
                            <input type="text" value={instrumentation} onChange={e => setInstrumentation(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-1">Lyrical Theme</label>
                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 p-2 bg-gray-800 border border-gray-600 rounded-md resize-none" />
                        </div>
                    </div>
                     <button onClick={handleGenerate} disabled={isLoading || !vocalistId} className="w-full mt-4 flex justify-center items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white font-semibold rounded-lg hover:bg-fuchsia-700 disabled:bg-gray-500">
                        {isLoading ? <Spinner /> : "Generate Song"}
                    </button>
                    {error && <p className="text-red-400 mt-2 text-sm text-center">{error}</p>}
                </GlassCard>
            </div>
            <div className="w-2/3 flex flex-col">
                <GlassCard className="flex-1 p-6 flex flex-col bg-black/50 relative overflow-hidden">
                    {isLoading ? (
                        <div className="m-auto text-center">
                            <Spinner />
                            <p className="mt-2 text-lg text-gray-300">Composing...</p>
                        </div>
                    ) : song ? (
                        <div className="flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-4">
                                {vocalist && <AgentAvatar agent={vocalist} size="md" />}
                                <div>
                                    <h2 className="text-3xl font-bold text-fuchsia-300 font-playfair-display">{song.title}</h2>
                                    <p className="text-gray-400">Performed by {vocalist?.name || 'Unknown'}</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                                <p className="text-lg text-gray-200 whitespace-pre-wrap leading-relaxed font-lora">{song.lyrics}</p>
                            </div>
                             <div className="mt-auto pt-4 border-t border-gray-700 flex justify-center">
                                <button onClick={isSpeaking ? stop : handlePlay} className="flex items-center gap-3 px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-full text-lg shadow-lg shadow-cyan-500/20">
                                    {isSpeaking ? <><StopIcon className="w-6 h-6" /> Stop</> : <><PlayIcon className="w-6 h-6" /> Play</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="m-auto text-center text-gray-500">
                            <p className="text-2xl">Music Machine</p>
                            <p>Your generated song will appear here.</p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};
