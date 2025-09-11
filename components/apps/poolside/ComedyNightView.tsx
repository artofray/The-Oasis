import React, { useState, useEffect } from 'react';
import type { RoundTableAgent } from '../../../types';
import * as poolsideService from '../../../services/poolsideService';
import { useSpeech } from '../../../hooks/useSpeech';
import { useTypedText } from '../../../hooks/useTypedText';
import { GlassCard } from '../../ui/GlassCard';
import { AgentAvatar } from '../round-table/AgentAvatar';
import { MicIcon } from './Icons';

interface ComedyNightViewProps {
    agents: RoundTableAgent[];
}

export const ComedyNightView: React.FC<ComedyNightViewProps> = ({ agents }) => {
    const [roastmaster, setRoastmaster] = useState<RoundTableAgent | null>(null);
    const [target, setTarget] = useState('');
    const [joke, setJoke] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { speak, stop, isSpeaking, voices } = useSpeech();
    const { displayText: typedJoke } = useTypedText(joke, 50);
    const [roastmasterVoice, setRoastmasterVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (!roastmaster || voices.length === 0) return;
        const hash = roastmaster.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        setRoastmasterVoice(englishVoices[hash % englishVoices.length]);
    }, [roastmaster, voices]);

    const handleGenerateRoast = async () => {
        if (!roastmaster || !target) return;
        setIsLoading(true);
        setJoke('');
        try {
            const newJoke = await poolsideService.generateRoastJoke(roastmaster, target);
            setJoke(newJoke);
            if (roastmasterVoice) {
                speak(newJoke, { voice: roastmasterVoice });
            }
        } catch (error) {
            console.error("Error generating roast:", error);
            setJoke("Looks like my wit is buffering... try again!");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Stop speech if component unmounts
        return () => stop();
    }, [stop]);

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 flex flex-col gap-4">
                <GlassCard className="p-4">
                    <h3 className="text-xl font-bold text-cyan-300 mb-2">Select a Roastmaster</h3>
                    <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
                        {agents.map(agent => (
                            <button key={agent.id} onClick={() => setRoastmaster(agent)} className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${roastmaster?.id === agent.id ? 'bg-cyan-600/50' : 'hover:bg-gray-700'}`}>
                                <AgentAvatar agent={agent} size="sm" />
                                <span>{agent.name}</span>
                            </button>
                        ))}
                    </div>
                </GlassCard>
                <GlassCard className="p-4">
                     <h3 className="text-xl font-bold text-fuchsia-300 mb-2">Who's Getting Roasted?</h3>
                     <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="e.g., 'The concept of Mondays'"
                        className="w-full bg-gray-800 border border-fuchsia-500/50 rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                    />
                    <button onClick={handleGenerateRoast} disabled={isLoading || !roastmaster || !target} className="w-full mt-3 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? 'Writing joke...' : 'Roast \'em!'}
                    </button>
                </GlassCard>
            </div>
            <div className="w-2/3 flex flex-col">
                <GlassCard className="flex-1 p-6 flex flex-col items-center justify-center bg-black/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0"></div>
                     <div className="absolute top-4 left-4 right-4 text-center z-10">
                         {roastmaster && <p className="text-xl text-white">Up Next: <span className="font-bold text-cyan-300">{roastmaster.name}</span></p>}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                        {joke ? (
                            <div className="w-full max-w-lg p-4">
                                 <p className="text-3xl text-yellow-200 font-semibold whitespace-pre-wrap font-lora leading-relaxed">{typedJoke}</p>
                            </div>
                        ) : roastmaster ? (
                           <div className="flex flex-col items-center">
                                <AgentAvatar agent={roastmaster} size="md" />
                                <p className="mt-4 text-2xl text-white">{roastmaster.name} is looking for a target...</p>
                           </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <MicIcon className="w-24 h-24 mb-4" />
                                <p className="text-2xl">The stage is empty.</p>
                                <p>Select a comedian to start the show.</p>
                            </div>
                        )}
                    </div>
                     {isSpeaking && (
                        <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-red-600/80 px-3 py-1 rounded-full text-white text-sm font-bold animate-pulse">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            LIVE
                        </div>
                     )}
                </GlassCard>
            </div>
        </div>
    );
};
