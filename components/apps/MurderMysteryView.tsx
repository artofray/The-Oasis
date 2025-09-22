import React, { useState, useCallback, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import * as gameService from '../../services/gameService';
import type { MurderMysteryPlot, MurderMysteryCharacter, RoundTableAgent } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';

const PlotSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-300">
        <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-semibold animate-pulse">Crafting a tale of intrigue...</p>
        <p className="text-sm text-gray-400">The stage is being set, and whispers fill the air.</p>
    </div>
);

const InitialState: React.FC<{ onGenerate: () => void }> = ({ onGenerate }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <GlassCard className="p-10 animate-fadeIn">
            <h1 className="text-5xl font-bold font-playfair-display">
                <span className="text-cyan-400">Murder</span> Mystery
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl font-lora">
                An AI-driven story generator for dark and intriguing tales. Each mystery is unique, crafted in real-time for your AI residents to enact.
            </p>
            <button
                onClick={onGenerate}
                className="mt-8 px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-fuchsia-400 focus:ring-opacity-50"
            >
                Generate a New Mystery
            </button>
        </GlassCard>
    </div>
);

const SpeakIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);


const CharacterCard: React.FC<{ character: MurderMysteryCharacter; agent: RoundTableAgent | undefined; onSpeak: () => void }> = ({ character, agent, onSpeak }) => {
    const isVictim = character.role === 'Victim';
    const roleColor = isVictim ? 'text-red-400' : 'text-amber-400';
    const borderColor = isVictim ? 'border-red-500/50' : 'border-cyan-400/20';

    return (
        <GlassCard className={`p-4 flex flex-col h-full ${borderColor}`}>
            <div className="relative">
                {agent?.avatarUrl && (
                    <img src={agent.avatarUrl} alt={character.name} className={`w-full h-48 object-cover rounded-lg mb-4 ${isVictim ? 'grayscale' : ''}`} />
                )}
                <button onClick={onSpeak} className="absolute bottom-6 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-cyan-500/80 transition-colors" aria-label={`Speak ${character.name}'s story`}>
                    <SpeakIcon className="w-5 h-5" />
                </button>
            </div>
            <h4 className="text-lg font-bold text-cyan-300">{character.name}</h4>
            <p className={`font-semibold text-sm mb-2 ${roleColor}`}>Role: {character.role}</p>
            <p className="text-sm text-gray-300 font-lora flex-1">{character.backstoryInPlot}</p>
        </GlassCard>
    );
};


const PlotDisplay: React.FC<{ plot: MurderMysteryPlot; onGenerate: () => void; agents: RoundTableAgent[]; speak: Function; voices: SpeechSynthesisVoice[]; unleashedMode: boolean }> = ({ plot, onGenerate, agents, speak, voices, unleashedMode }) => {
    const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [videoGenerationOperation, setVideoGenerationOperation] = useState<any>(null);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [videoStatusMessage, setVideoStatusMessage] = useState('');
    
    const [agentVoiceMap, setAgentVoiceMap] = useState<Record<string, SpeechSynthesisVoice | undefined>>({});
    const [narratorVoice, setNarratorVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (voices.length > 0) {
            const newMap: Record<string, SpeechSynthesisVoice> = {};
            const englishVoices = voices.filter(v => v.lang.startsWith('en'));
            
            // Find a good narrator voice
            const idealNarrator = englishVoices.find(v => v.name.includes('David') || v.name.includes('Zira') || v.lang === 'en-GB');
            setNarratorVoice(idealNarrator || englishVoices[0] || voices[0]);

            // Assign unique voices to agents
            agents.forEach((agent, index) => {
                newMap[agent.id] = englishVoices[index % englishVoices.length];
            });
            setAgentVoiceMap(newMap);
        }
    }, [voices, agents]);
    
     useEffect(() => {
        if (plot && narratorVoice) {
            const narration = `${plot.title}. ${plot.synopsis}. The opening scene: ${plot.openingScene}`;
            speak(narration, { voice: narratorVoice, rate: 0.9 });
        }
    }, [plot, narratorVoice, speak]);


    useEffect(() => {
        setSceneImageUrl(null);
        setIsGeneratingImage(false);
        setImageError(null);
        setVideoGenerationOperation(null);
        setIsGeneratingVideo(false);
        setVideoUrl(null);
        setVideoError(null);
        setVideoStatusMessage('');
    }, [plot]);
    
    useEffect(() => {
        if (!videoGenerationOperation) return;

        const reassuringMessages = [
            "The director is setting up the shot...",
            "Actors are taking their places...",
            "Sound department is adding dramatic effects...",
            "Rendering the final cut...",
            "This can take a few minutes, thank you for your patience."
        ];
        let messageIndex = 0;

        const intervalId = setInterval(async () => {
            try {
                setVideoStatusMessage(reassuringMessages[messageIndex++ % reassuringMessages.length]);

                const updatedOperation = await gameService.checkVideoStatus(videoGenerationOperation);
                
                if (updatedOperation.done) {
                    clearInterval(intervalId);
                    const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink && process.env.API_KEY) {
                        const finalVideoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
                        setVideoUrl(finalVideoUrl);
                        setVideoGenerationOperation(null);
                        setIsGeneratingVideo(false);
                    } else {
                        throw new Error("Video generation finished but no video was found.");
                    }
                } else {
                    setVideoGenerationOperation(updatedOperation);
                }
            } catch (error) {
                console.error("Error polling video status:", error);
                setVideoError(error instanceof Error ? error.message : "An error occurred while fetching video status.");
                clearInterval(intervalId);
                setIsGeneratingVideo(false);
                setVideoGenerationOperation(null);
            }
        }, 10000);

        return () => clearInterval(intervalId);

    }, [videoGenerationOperation]);

    const handleVisualizeScene = async () => {
        setIsGeneratingImage(true);
        setImageError(null);
        try {
            const imageUrl = await gameService.generateSceneImage(plot.openingScene, unleashedMode);
            if(imageUrl) {
                setSceneImageUrl(imageUrl);
            } else {
                throw new Error("The AI was unable to visualize the scene.");
            }
        } catch (e) {
            setImageError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsGeneratingImage(false);
        }
    }
    
    const handleAnimateScene = async () => {
        if (!sceneImageUrl) return;
        setIsGeneratingVideo(true);
        setVideoError(null);
        setVideoStatusMessage("Initializing video generation...");
        try {
            const base64Image = sceneImageUrl.split(',')[1];
            const operation = await gameService.generateSceneVideo(plot.openingScene, base64Image, unleashedMode);
            setVideoGenerationOperation(operation);
        } catch (e) {
            setVideoError(e instanceof Error ? e.message : "An unknown error occurred.");
            setIsGeneratingVideo(false);
        }
    };
    
    const getAgentById = (agentId: string): RoundTableAgent | undefined => {
        return agents.find(a => a.id === agentId);
    };
    
    const handleSpeakCharacter = (character: MurderMysteryCharacter) => {
        const voice = agentVoiceMap[character.agentId];
        const textToSpeak = `${character.name}, the ${character.role}. ${character.backstoryInPlot}`;
        speak(textToSpeak, { voice });
    };

    const suspects = plot.characters.filter(c => c.role !== 'Murderer'); // Hide the murderer from the cast list

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-4xl font-bold text-cyan-300 font-playfair-display animate-fadeInUp">{plot.title}</h2>
                    <p className="text-gray-400 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>{plot.setting.name}</p>
                </div>
                 <button
                    onClick={onGenerate}
                    className="bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                    Generate New Mystery
                </button>
            </div>

            <GlassCard className="p-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl font-semibold text-fuchsia-400 mb-2 font-playfair-display">Synopsis</h3>
                <p className="text-gray-300 font-lora">{plot.synopsis}</p>
            </GlassCard>

            <GlassCard className="p-6 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-xl font-semibold text-fuchsia-400 mb-2 font-playfair-display">The Setting</h3>
                <p className="text-gray-300 font-lora">{plot.setting.description}</p>
            </GlassCard>

            <div className="animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <h3 className="text-2xl font-bold text-cyan-300 mb-4 font-playfair-display">Cast of Characters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suspects.map((character, index) => (
                         <div key={character.agentId} className="animate-fadeInUp" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                            <CharacterCard 
                                character={character} 
                                agent={getAgentById(character.agentId)} 
                                onSpeak={() => handleSpeakCharacter(character)}
                            />
                        </div>
                    ))}
                </div>
            </div>

             <GlassCard className="p-6 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-xl font-semibold text-fuchsia-400 mb-2 font-playfair-display">The Opening Scene</h3>
                <p className="text-gray-300 font-lora whitespace-pre-wrap">{plot.openingScene}</p>
                <div className="mt-4 pt-4 border-t border-cyan-500/20">
                    {videoUrl ? (
                        <div className="mt-4 animate-fadeIn">
                            <video src={videoUrl} controls autoPlay muted loop className="w-full h-auto rounded-lg shadow-lg">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    ) : isGeneratingVideo ? (
                         <div className="text-center p-4">
                            <svg className="animate-spin h-8 w-8 text-cyan-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-lg font-semibold text-white">Animating Scene...</p>
                            <p className="text-sm text-gray-400">{videoStatusMessage}</p>
                        </div>
                    ) : sceneImageUrl ? (
                         <div className="mt-4 animate-fadeIn">
                             <img src={sceneImageUrl} alt="Visualization of the opening scene" className="w-full h-auto rounded-lg shadow-lg" />
                             <button onClick={handleAnimateScene} className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors">
                                Animate Scene
                             </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleVisualizeScene} 
                            disabled={isGeneratingImage}
                            className="w-full flex items-center justify-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-wait"
                        >
                             {isGeneratingImage ? (
                                <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 Generating...
                                </>
                            ) : "Visualize Scene"}
                        </button>
                    )}
                    {imageError && !sceneImageUrl && <p className="text-red-400 text-sm mt-2 text-center">{imageError}</p>}
                    {videoError && <p className="text-red-400 text-sm mt-2 text-center">{videoError}</p>}
                </div>
            </GlassCard>
        </div>
    );
}

interface MurderMysteryViewProps {
    agents: RoundTableAgent[];
    unleashedMode: boolean;
}

export const MurderMysteryView: React.FC<MurderMysteryViewProps> = ({ agents, unleashedMode }) => {
  const [plot, setPlot] = useState<MurderMysteryPlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { speak, voices } = useSpeech();

  const handleGenerateMystery = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPlot(null);
    try {
      const generatedPlot = await gameService.generateMurderMysteryPlot(agents, unleashedMode);
      setPlot(generatedPlot);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [agents, unleashedMode]);

  const renderContent = () => {
    if (isLoading) {
        return <PlotSpinner />;
    }
    if (error) {
        return (
            <div className="text-center text-red-400">
                <p>Failed to generate mystery: {error}</p>
                <button onClick={handleGenerateMystery} className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg">Try Again</button>
            </div>
        );
    }
    if (plot) {
        return <PlotDisplay plot={plot} onGenerate={handleGenerateMystery} agents={agents} speak={speak} voices={voices} unleashedMode={unleashedMode} />;
    }
    return <InitialState onGenerate={handleGenerateMystery} />;
  }

  return (
    <div className="h-full w-full">
      {renderContent()}
    </div>
  );
};