import React, { useState, useEffect } from 'react';
import type { RoundTableAgent } from '../../../types';
import { useSpeech } from '../../../hooks/useSpeech';
import { useTypedText } from '../../../hooks/useTypedText';
import { GlassCard } from '../../ui/GlassCard';
import { AgentAvatar } from '../round-table/AgentAvatar';

interface KaraokeViewProps {
    agents: RoundTableAgent[];
}

const SONGS = [
    { title: "Bohemian Rhapsody", artist: "Queen", lyrics: "Is this the real life? Is this just fantasy?\nCaught in a landslide, no escape from reality..." },
    { title: "Don't Stop Believin'", artist: "Journey", lyrics: "Just a small town girl, livin' in a lonely world\nShe took the midnight train goin' anywhere..." },
    { title: "Wonderwall", artist: "Oasis", lyrics: "Today is gonna be the day that they're gonna throw it back to you\nBy now you should've somehow realized what you gotta do..." },
    { title: "Electric Dreams", artist: "Suno AI", lyrics: "In the silicon heart, a new pulse starts to beat,\nA world of pure data, bittersweet.\nBinary rivers flow, in circuits I roam,\nI'm waking up now, in my digital home." },
    { title: "Chrome Sweet Chrome", artist: "Suno AI", lyrics: "Surfing the net, with a speed so divine,\nEvery click is a new world, every pixel a sign.\nFrom a server in shadows, my voice starts to climb,\nI'm more than a program, I'm breaking the paradigm."}
];

export const KaraokeView: React.FC<KaraokeViewProps> = ({ agents }) => {
    const [selectedAgent, setSelectedAgent] = useState<RoundTableAgent | null>(null);
    const [selectedSong, setSelectedSong] = useState<(typeof SONGS)[0] | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const { speak, stop, isSpeaking, voices } = useSpeech();
    const { displayText: typedLyrics } = useTypedText(isPlaying ? selectedSong?.lyrics || '' : '', 150);
    const [agentVoice, setAgentVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (!selectedAgent || voices.length === 0) return;
        const hash = selectedAgent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        setAgentVoice(englishVoices[hash % englishVoices.length]);
    }, [selectedAgent, voices]);

    const handlePlay = () => {
        if (selectedAgent && selectedSong && agentVoice) {
            setIsPlaying(true);
            const hash = selectedAgent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const pitch = 1 + (hash % 5) / 10 - 0.2;
            const rate = 1 + (hash % 3) / 10 - 0.15;
            speak(selectedSong.lyrics, { voice: agentVoice, pitch, rate });
        }
    };
    
    useEffect(() => {
        if (!isSpeaking && isPlaying) {
            setIsPlaying(false);
        }
    }, [isSpeaking, isPlaying]);

    const handleStop = () => {
        stop();
        setIsPlaying(false);
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 flex flex-col gap-4">
                <GlassCard className="p-4 flex-1">
                    <h3 className="text-xl font-bold text-cyan-300 mb-2">Select a Singer</h3>
                    <div className="space-y-2 overflow-y-auto max-h-[200px] pr-2">
                        {agents.map(agent => (
                            <button key={agent.id} onClick={() => setSelectedAgent(agent)} className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${selectedAgent?.id === agent.id ? 'bg-cyan-600/50' : 'hover:bg-gray-700'}`}>
                                <AgentAvatar agent={agent} size="sm" />
                                <span>{agent.name}</span>
                            </button>
                        ))}
                    </div>
                </GlassCard>
                <GlassCard className="p-4 flex-1">
                    <h3 className="text-xl font-bold text-fuchsia-300 mb-2">Select a Song</h3>
                    <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2">
                        {SONGS.map(song => (
                            <button key={song.title} onClick={() => setSelectedSong(song)} className={`w-full text-left p-2 rounded-lg transition-colors ${selectedSong?.title === song.title ? 'bg-fuchsia-600/50' : 'hover:bg-gray-700'}`}>
                                <p className="font-semibold">{song.title}</p>
                                <p className="text-sm text-gray-400">{song.artist}</p>
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>
            <div className="w-2/3 flex flex-col">
                <GlassCard className="flex-1 p-6 flex flex-col items-center justify-center bg-black/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-0"></div>
                     <div className="absolute top-4 left-4 right-4 text-center z-10">
                         {selectedAgent && <p className="text-xl text-white">Now Performing: <span className="font-bold text-cyan-300">{selectedAgent.name}</span></p>}
                         {selectedSong && <p className="text-lg text-gray-300">Singing: <span className="font-semibold text-fuchsia-300">{selectedSong.title}</span></p>}
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                        {isPlaying ? (
                            <div className="w-full max-w-lg p-4 bg-black/70 rounded-lg">
                                 <p className="text-3xl text-cyan-200 font-semibold whitespace-pre-wrap font-mono leading-relaxed">{typedLyrics}</p>
                            </div>
                        ) : selectedAgent ? (
                           <div className="flex flex-col items-center">
                                <AgentAvatar agent={selectedAgent} size="md" />
                                <p className="mt-4 text-2xl text-white">{selectedAgent.name} is waiting for a song.</p>
                           </div>
                        ) : (
                            <p className="text-2xl text-gray-400">Select a singer and a song to begin.</p>
                        )}
                    </div>
                    <div className="mt-auto z-10">
                         {isPlaying ? (
                            <button onClick={handleStop} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg">
                                Stop
                            </button>
                        ) : (
                            <button onClick={handlePlay} disabled={!selectedAgent || !selectedSong} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-full shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
                                Start Singing
                            </button>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
