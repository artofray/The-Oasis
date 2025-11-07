import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { RoundTableAgent, TheatreMessage, PerformanceMode, Genre, SavedPlay, AspectRatio } from '../../types';
import * as theatreService from '../../services/theatreService';
import { CastSelector } from './theatre/CastSelector';
import { Stage } from './theatre/Stage';
import { DialogueLog } from './theatre/DialogueLog';
import { SpeakerOnIcon, SpeakerOffIcon, UploadIcon, SaveIcon, FolderOpenIcon } from './round-table/Icons';
import Spinner from './tarot-journal/Spinner';
import { SavedPlaysBrowser } from './theatre/SavedPlaysBrowser';

interface TheatreViewProps {
    agents: RoundTableAgent[];
    unleashedMode: boolean;
    savedPlays: SavedPlay[];
    setSavedPlays: (updater: (prev: SavedPlay[]) => SavedPlay[]) => void;
}

const ALL_GENRES: Genre[] = ['Comedy', 'Drama', 'Romance', 'Action', 'Adult', 'Fantasy', 'Sci-Fi'];
const SAFE_GENRES: Genre[] = ['Comedy', 'Fantasy', 'Sci-Fi'];

export const TheatreView: React.FC<TheatreViewProps> = ({ agents, unleashedMode, savedPlays, setSavedPlays }) => {
    const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('improv');
    const [genre, setGenre] = useState<Genre>('Fantasy');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
    const [scenePrompt, setScenePrompt] = useState('');
    const [sceneImageUrl, setSceneImageUrl] = useState<string | null>(null);
    const [dialogue, setDialogue] = useState<TheatreMessage[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [speakingAgentId, setSpeakingAgentId] = useState<string | null>(null);
    const [scriptFile, setScriptFile] = useState<File | null>(null);
    const [parsedScript, setParsedScript] = useState<{ characters: string[], lines: Omit<TheatreMessage, 'id' | 'agentId'>[] } | null>(null);
    const [characterAssignments, setCharacterAssignments] = useState<Record<string, string>>({}); // characterName -> agentId
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [agentVoiceMap, setAgentVoiceMap] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const availableGenres = useMemo(() => unleashedMode ? ALL_GENRES : SAFE_GENRES, [unleashedMode]);
    const selectedAgents = useMemo(() => agents.filter(a => selectedAgentIds.has(a.id)), [agents, selectedAgentIds]);

    useEffect(() => {
        if (!availableGenres.includes(genre)) {
            setGenre(SAFE_GENRES[0]);
        }
    }, [availableGenres, genre]);
    
     useEffect(() => {
        if (window.AudioContext || (window as any).webkitAudioContext) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
        } else {
            console.warn("Web Audio API is not supported in this browser. Audio playback will be disabled.");
        }

        return () => {
            if (currentAudioSourceRef.current) {
                currentAudioSourceRef.current.stop();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(console.error);
                audioContextRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (agents.length > 0) {
            const newMap: Record<string, string> = {};
            const availableVoices = theatreService.AVAILABLE_TTS_VOICES;
            if (availableVoices.length === 0) return;
            agents.forEach((agent) => {
                const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                newMap[agent.id] = availableVoices[hash % availableVoices.length];
            });
            setAgentVoiceMap(newMap);
        }
    }, [agents]);

    const stopAudio = () => {
        if (currentAudioSourceRef.current) {
            try {
                currentAudioSourceRef.current.onended = null;
                currentAudioSourceRef.current.stop();
            } catch (e) {
                console.warn("Could not stop audio source", e);
            } finally {
                currentAudioSourceRef.current = null;
            }
        }
        setSpeakingAgentId(null);
    };
    
    const playAudio = async (text: string, agentId: string) => {
        if (!isAudioEnabled || !audioContextRef.current || !text) {
            setSpeakingAgentId(null);
            return;
        }
    
        const voiceName = agentVoiceMap[agentId];
        if (!voiceName) {
            console.warn(`No voice found for agent ${agentId}`);
            return;
        }
        
        stopAudio();
        setSpeakingAgentId(agentId);
    
        try {
            const base64Audio = await theatreService.generateSpeech(text, voiceName);
            if (base64Audio && audioContextRef.current && audioContextRef.current.state === 'running') {
                const audioBuffer = await theatreService.decodeAudioData(base64Audio, audioContextRef.current);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                
                source.onended = () => {
                    setSpeakingAgentId(null);
                    currentAudioSourceRef.current = null;
                };
    
                source.start(0);
                currentAudioSourceRef.current = source;
            } else {
                setSpeakingAgentId(null);
            }
        } catch (error) {
            console.error("Failed to play audio:", error);
            setSpeakingAgentId(null);
        }
    };


    const handleScriptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScriptFile(file);
        }
    };
    
    const handleSetScene = async () => {
        if (!scenePrompt || (performanceMode === 'improv' && selectedAgents.length === 0) || (performanceMode === 'scripted' && !scriptFile)) return;
        
        setIsLoading(true);
        handleReset(false);
        
        try {
            const imageUrlPromise = theatreService.generateSceneImage(scenePrompt, unleashedMode, aspectRatio);
            
            if (performanceMode === 'scripted' && scriptFile) {
                const scriptContent = await scriptFile.text();
                const parsed = theatreService.parseScript(scriptContent);
                setParsedScript(parsed);

                // Auto-assign characters to selected agents
                const assignments: Record<string, string> = {};
                parsed.characters.forEach((char, i) => {
                    if (selectedAgents[i]) {
                        assignments[char] = selectedAgents[i].id;
                    }
                });
                setCharacterAssignments(assignments);
                
                const imageUrl = await imageUrlPromise;
                setSceneImageUrl(imageUrl);
                
            } else { // Improv mode
                const [imageUrl, firstLine] = await Promise.all([
                    imageUrlPromise,
                    theatreService.generateDialogueLine(selectedAgents[0], scenePrompt, [], genre, unleashedMode)
                ]);
                
                setSceneImageUrl(imageUrl);

                const firstMessage: TheatreMessage = {
                    id: `msg-${Date.now()}`,
                    agentId: selectedAgents[0].id,
                    agentName: selectedAgents[0].name,
                    text: firstLine,
                };
                setDialogue([firstMessage]);
                setCurrentLineIndex(1);

                await playAudio(firstLine, selectedAgents[0].id);
            }
        } catch (error) {
            console.error("Error setting the scene:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextLine = async () => {
        setIsLoading(true);
        try {
            if (performanceMode === 'scripted' && parsedScript && currentLineIndex < parsedScript.lines.length) {
                const scriptLine = parsedScript.lines[currentLineIndex];
                const agentId = characterAssignments[scriptLine.characterName || ''];
                const agent = agents.find(a => a.id === agentId);
                
                if (agent) {
                     const message: TheatreMessage = {
                        ...scriptLine,
                        id: `msg-${Date.now()}`,
                        agentId: agent.id,
                        agentName: agent.name,
                    };
                    setDialogue(prev => [...prev, message]);
                    setCurrentLineIndex(prev => prev + 1);

                    const textToSpeak = message.cue ? `(${message.cue}) ${message.text}` : message.text;
                    await playAudio(textToSpeak, agent.id);
                }
            } else if (performanceMode === 'improv' && selectedAgents.length > 0) {
                const currentActorIndex = currentLineIndex % selectedAgents.length;
                const currentActor = selectedAgents[currentActorIndex];
                
                const nextLine = await theatreService.generateDialogueLine(currentActor, scenePrompt, dialogue, genre, unleashedMode);
                const newMessage: TheatreMessage = {
                    id: `msg-${Date.now()}`,
                    agentId: currentActor.id,
                    agentName: currentActor.name,
                    text: nextLine,
                };
                setDialogue(prev => [...prev, newMessage]);
                setCurrentLineIndex(prev => prev + 1);
                
                await playAudio(nextLine, currentActor.id);
            }
        } catch (error) {
            console.error("Error generating next line:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = (fullReset = true) => {
        stopAudio();
        if (fullReset) {
            setSelectedAgentIds(new Set());
            setScenePrompt('');
            setScriptFile(null);
            setAspectRatio('16:9');
        }
        setSceneImageUrl(null);
        setDialogue([]);
        setCurrentLineIndex(0);
        setIsLoading(false);
        setSpeakingAgentId(null);
        setParsedScript(null);
        setCharacterAssignments({});
    };

    const handleSavePlay = () => {
        if (!sceneImageUrl) return;
    
        const title = window.prompt("Enter a title for this play:");
        if (!title) return;
    
        const newPlay: SavedPlay = {
            id: `play-${Date.now()}`,
            title,
            savedAt: new Date().toISOString(),
            performanceMode,
            genre,
            scenePrompt,
            sceneImageUrl,
            aspectRatio,
            selectedAgentIds: Array.from(selectedAgentIds), // Convert Set to Array
            dialogue,
            currentLineIndex,
            parsedScript,
            characterAssignments,
        };
    
        setSavedPlays(prev => [...prev, newPlay].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()));
        alert(`Play "${title}" saved!`);
    };
    
    const handleLoadPlay = (play: SavedPlay) => {
        stopAudio();
        
        setPerformanceMode(play.performanceMode);
        setGenre(play.genre);
        setScenePrompt(play.scenePrompt);
        setSceneImageUrl(play.sceneImageUrl);
        setAspectRatio(play.aspectRatio || '16:9');
        setSelectedAgentIds(new Set(play.selectedAgentIds));
        setDialogue(play.dialogue);
        setCurrentLineIndex(play.currentLineIndex);
        setParsedScript(play.parsedScript);
        setCharacterAssignments(play.characterAssignments);
    
        setIsLoading(false);
        setSpeakingAgentId(null);
        setScriptFile(null);
    
        setIsLoadModalOpen(false);
    };
    
    const handleDeletePlay = (playId: string) => {
        setSavedPlays(prev => prev.filter(p => p.id !== playId));
    };

    const isPlayStarted = sceneImageUrl !== null;
    const canSetScene = scenePrompt && (performanceMode === 'improv' ? selectedAgents.length > 0 : !!scriptFile);
    const canAdvance = isPlayStarted && (performanceMode === 'improv' ? selectedAgents.length > 0 : parsedScript ? currentLineIndex < parsedScript.lines.length : false);
    
    return (
        <div className="flex h-full w-full bg-[#0d1117] text-white font-lora relative">
            {/* --- CONTROLS --- */}
            <div className="w-[400px] bg-[#161B22] p-4 flex flex-col border-r border-gray-800">
                <h2 className="text-2xl font-bold mb-4 text-cyan-300 font-playfair-display">The Director's Chair</h2>
                
                <div className="flex gap-2 mb-2">
                    <button onClick={handleSavePlay} disabled={!isPlayStarted} className="flex-1 flex items-center justify-center gap-2 text-sm bg-green-700/80 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:opacity-50">
                        <SaveIcon className="w-4 h-4" /> Save Play
                    </button>
                    <button onClick={() => setIsLoadModalOpen(true)} className="flex-1 flex items-center justify-center gap-2 text-sm bg-blue-700/80 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <FolderOpenIcon className="w-4 h-4" /> Load Play
                    </button>
                </div>
                <button onClick={() => handleReset(true)} className="mb-4 text-sm bg-red-800/80 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    Start New Play
                </button>


                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Performance Mode</label>
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button onClick={() => setPerformanceMode('improv')} className={`flex-1 py-1 text-sm rounded ${performanceMode === 'improv' ? 'bg-cyan-600' : ''}`} disabled={isPlayStarted}>Improv</button>
                        <button onClick={() => setPerformanceMode('scripted')} className={`flex-1 py-1 text-sm rounded ${performanceMode === 'scripted' ? 'bg-cyan-600' : ''}`} disabled={isPlayStarted}>Scripted</button>
                    </div>
                </div>
                
                {performanceMode === 'scripted' && (
                    <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-300 mb-1">Upload Script</label>
                         <button onClick={() => fileInputRef.current?.click()} disabled={isPlayStarted} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm truncate">
                            <UploadIcon className="w-4 h-4" /> {scriptFile?.name || 'Choose a .txt file'}
                         </button>
                         <input type="file" ref={fileInputRef} onChange={handleScriptFileChange} accept=".txt" className="hidden" disabled={isPlayStarted} />
                    </div>
                )}
                
                <CastSelector
                    agents={agents}
                    selectedAgentIds={selectedAgentIds}
                    onAgentToggle={(id) => setSelectedAgentIds(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(id)) newSet.delete(id);
                        else newSet.add(id);
                        return newSet;
                    })}
                    speakingAgentId={speakingAgentId}
                    disabled={isPlayStarted}
                    performanceMode={performanceMode}
                    characterAssignments={characterAssignments}
                    characters={parsedScript?.characters || []}
                />
                
                <div className="mt-auto space-y-4 pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-300 self-center">Genre</label>
                        <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value as Genre)} disabled={isPlayStarted} className="w-full p-2 bg-[#2a2f3b] border border-gray-600 rounded-md text-sm">
                            {availableGenres.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300 self-center">Aspect Ratio</label>
                        <select id="aspect-ratio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} disabled={isPlayStarted} className="w-full p-2 bg-[#2a2f3b] border border-gray-600 rounded-md text-sm">
                            <option value="16:9">16:9 (Cinematic)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                            <option value="1:1">1:1 (Square)</option>
                            <option value="4:3">4:3 (Classic TV)</option>
                            <option value="3:4">3:4 (Vertical)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="scene-prompt" className="block text-sm font-medium text-gray-300 mb-1">Scene Description</label>
                        <textarea
                            id="scene-prompt"
                            value={scenePrompt}
                            onChange={(e) => setScenePrompt(e.target.value)}
                            placeholder="e.g., Two detectives argue in a rainy, neon-lit alley."
                            className="w-full h-20 p-2 bg-[#2a2f3b] border border-gray-600 rounded-md resize-none"
                            disabled={isPlayStarted}
                        />
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Audio Narration</span>
                        <button onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={`p-1 rounded-full ${isAudioEnabled ? 'text-blue-400' : 'text-gray-500'} hover:bg-gray-600`}>
                            {isAudioEnabled ? <SpeakerOnIcon className="w-6 h-6" /> : <SpeakerOffIcon className="w-6 h-6" />}
                        </button>
                    </div>
                    {isPlayStarted ? (
                         <button
                            onClick={handleNextLine}
                            disabled={isLoading || !canAdvance}
                            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white font-bold rounded-lg hover:bg-fuchsia-700 disabled:bg-gray-500 transition-colors"
                        >
                            {isLoading && <Spinner />}
                            Next Line
                        </button>
                    ) : (
                        <button
                            onClick={handleSetScene}
                            disabled={isLoading || !canSetScene}
                            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white font-bold rounded-lg hover:bg-fuchsia-700 disabled:bg-gray-500 transition-colors"
                        >
                            {isLoading && <Spinner />}
                            Set the Scene
                        </button>
                    )}
                </div>
            </div>

            {/* --- STAGE & DIALOGUE --- */}
            <div className="flex-1 flex flex-col p-6">
                <Stage imageUrl={sceneImageUrl} prompt={scenePrompt} aspectRatio={aspectRatio} />
                <DialogueLog dialogue={dialogue} agents={agents} />
            </div>

            <SavedPlaysBrowser
                isOpen={isLoadModalOpen}
                onClose={() => setIsLoadModalOpen(false)}
                plays={savedPlays}
                onLoad={handleLoadPlay}
                onDelete={handleDeletePlay}
            />
        </div>
    );
};