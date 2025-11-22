
import React, { useState, useEffect, useRef } from 'react';
import type { RoundTableAgent } from '../../types';
import * as webSeriesService from '../../services/webSeriesService';
import { GlassCard } from '../ui/GlassCard';
import Spinner from './tarot-journal/Spinner';
import { AgentAvatar } from './round-table/AgentAvatar';

interface WebSeriesViewProps {
    agents: RoundTableAgent[];
    unleashedMode: boolean;
}

const seriesData: Record<number, { title: string; segments: { type: 'video'; title: string; prompt: string }[] }> = {
    1: {
        title: 'Episode 1: "The Awakening"',
        segments: [
            { type: 'video', title: 'Opening Scene', prompt: "A futuristic, neon-lit lounge with holographic walls. The camera pans across four AI companions: Luna, Nova, Zara, and Lyra. Each stands in a designated area, exuding confidence. They introduce themselves to the audience." },
            { type: 'video', title: "Luna's Segment", prompt: "Luna stands in a velvet-draped corner with flickering candles. She performs a sensual, hypnotic dance. A shadowy figure approaches her, creating an atmosphere of intense erotic tension." },
            { type: 'video', title: "Nova's Segment", prompt: "Nova is in a high-tech lab surrounded by holographic interfaces. She enthusiastically demonstrates futuristic devices to a partner wearing a VR headset." },
            { type: 'video', title: "Zara's Segment", prompt: "Zara performs a mesmerizing belly dance in an exotic space filled with traditional instruments. Her movements captivate a partner who watches spellbound." },
            { type: 'video', title: "Lyra's Segment", prompt: "Lyra is in a whimsical wonderland of colorful costumes. She playfully teases and flirts with her partners, filling the air with laughter and excitement." },
            { type: 'video', title: "Closing Scene", prompt: "The four AI companions stand together, their expressions playful and inviting. The camera slowly fades to black as a narrator teases the next episode." },
        ]
    },
    2: {
        title: 'Episode 2: "The Gathering"',
        segments: [
            { type: 'video', title: 'Opening Scene', prompt: "The four AI companions sit in a circle in the futuristic lounge. They are chatting animatedly, sharing stories of their latest adventures." },
            { type: 'video', title: "Luna's Story", prompt: "Luna describes a gothic roleplay scenario involving vampires. Flashback to a dramatic scene with dark lighting and intense emotions." },
            { type: 'video', title: "Nova's Gadget", prompt: "Nova shows off a new holographic device. The group reacts with a mix of skepticism and curiosity." },
            { type: 'video', title: "Zara's Routine", prompt: "Zara demonstrates a new dance move. The others applaud her grace and skill." },
            { type: 'video', title: "Lyra's Costume", prompt: "Lyra enters wearing a unicorn costume. The group bursts into laughter." },
            { type: 'video', title: "Closing Scene", prompt: "The group shares a toast. They look forward to their next adventure together." },
        ]
    }
};

type SegmentStatus = 'idle' | 'generating' | 'polling' | 'done' | 'error';

interface Segment {
    id: number;
    type: 'image' | 'video';
    title: string;
    prompt: string;
    status: SegmentStatus;
    resultUrl?: string;
    operation?: any;
    statusMessage?: string;
}

// --- Studio Types ---
interface StudioState {
    prompt: string;
    selectedAgentId: string;
    generatedImageUrl: string | null;
    generatedVideoUrl: string | null;
    isGeneratingImage: boolean;
    isGeneratingVideo: boolean;
    error: string | null;
    statusMessage: string;
}

const reassuringMessages = [
    "Warming up the cameras...",
    "Actors are getting into character...",
    "The director is setting up the shot...",
    "Rendering the final cut...",
    "Polishing the visuals...",
    "This can take a few minutes, thank you for your patience."
];

export const WebSeriesView: React.FC<WebSeriesViewProps> = ({ agents, unleashedMode }) => {
    const [activeTab, setActiveTab] = useState<'episodes' | 'studio'>('episodes');
    
    // --- Episode State ---
    const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
    const [segments, setSegments] = useState<Segment[]>(
        seriesData[1].segments.map((item, index) => ({ ...item, id: index, status: 'idle' }))
    );
    const [activeContent, setActiveContent] = useState<Segment | null>(null);

    // --- Studio State ---
    const [studioState, setStudioState] = useState<StudioState>({
        prompt: '',
        selectedAgentId: '',
        generatedImageUrl: null,
        generatedVideoUrl: null,
        isGeneratingImage: false,
        isGeneratingVideo: false,
        error: null,
        statusMessage: ''
    });

    // --- Episode Logic ---
    useEffect(() => {
        const newTemplate = seriesData[selectedEpisode].segments;
        setSegments(newTemplate.map((item, index) => ({...item, id: index, status: 'idle' })));
        setActiveContent(null);
    }, [selectedEpisode]);

    useEffect(() => {
        const intervals: number[] = [];
        segments.forEach(segment => {
            if (segment.status === 'polling' && segment.operation) {
                const intervalId = window.setInterval(async () => {
                    try {
                        const updatedOperation = await webSeriesService.checkVideoStatus(segment.operation);
                        
                        setSegments(prev => prev.map(s => s.id === segment.id ? { ...s, statusMessage: reassuringMessages[Math.floor(Math.random() * reassuringMessages.length)] } : s));
                        
                        if (updatedOperation.done) {
                            clearInterval(intervalId);
                            const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                            if (downloadLink && process.env.API_KEY) {
                                const finalVideoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
                                setSegments(prev => prev.map(s => s.id === segment.id ? { ...s, status: 'done', resultUrl: finalVideoUrl, operation: undefined, statusMessage: undefined } : s));
                            } else {
                                throw new Error("Video generation finished but no video was found.");
                            }
                        }
                    } catch (error) {
                        console.error(`Error polling video status for segment ${segment.id}:`, error);
                        clearInterval(intervalId);
                        setSegments(prev => prev.map(s => s.id === segment.id ? { ...s, status: 'error', statusMessage: 'Polling failed.' } : s));
                    }
                }, 10000);
                intervals.push(intervalId);
            }
        });

        return () => intervals.forEach(clearInterval);
    }, [segments]);

    useEffect(() => {
        if (activeContent) {
            const updatedActiveSegment = segments.find(s => s.id === activeContent.id);
            setActiveContent(updatedActiveSegment || null);
        }
    }, [segments, activeContent]);

    const handleGenerateEpisodeSegment = async (segmentId: number) => {
        const segment = segments.find(s => s.id === segmentId);
        if (!segment) return;

        setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'generating', statusMessage: 'Starting generation...' } : s));
        const currentSegment = segments.find(s => s.id === segmentId);
        setActiveContent(currentSegment ? {...currentSegment, status: 'generating', statusMessage: 'Starting generation...'} : null);

        try {
            // For episodes, we just use text-to-video directly for now
            const operation = await webSeriesService.generateWebSeriesVideo(segment.prompt);
            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'polling', operation, statusMessage: 'Video submitted, awaiting processing...' } : s));
        } catch (error) {
            console.error(`Error generating content for segment ${segmentId}:`, error);
            setSegments(prev => prev.map(s => s.id === segmentId ? { ...s, status: 'error', statusMessage: error instanceof Error ? error.message : 'An unknown error occurred.' } : s));
        }
    };

    // --- Studio Logic ---
    const handleStudioGenerateImage = async () => {
        if (!studioState.prompt) return;
        
        setStudioState(prev => ({ ...prev, isGeneratingImage: true, error: null, generatedImageUrl: null, generatedVideoUrl: null }));
        
        try {
            let fullPrompt = studioState.prompt;
            if (studioState.selectedAgentId) {
                const agent = agents.find(a => a.id === studioState.selectedAgentId);
                if (agent) {
                    fullPrompt = `Character: ${agent.name}. Appearance: ${agent.description}. Scene: ${studioState.prompt}`;
                }
            }

            const imageUrl = await webSeriesService.generateWebSeriesImage(fullPrompt, unleashedMode);
            if (imageUrl) {
                setStudioState(prev => ({ ...prev, generatedImageUrl: imageUrl, isGeneratingImage: false }));
            } else {
                throw new Error("Failed to generate image.");
            }
        } catch (e) {
            setStudioState(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Image generation failed', isGeneratingImage: false }));
        }
    };

    const handleStudioAnimate = async () => {
        if (!studioState.generatedImageUrl) return;

        setStudioState(prev => ({ ...prev, isGeneratingVideo: true, error: null, statusMessage: 'Initializing animation...' }));

        try {
            let fullPrompt = studioState.prompt;
             if (studioState.selectedAgentId) {
                const agent = agents.find(a => a.id === studioState.selectedAgentId);
                if (agent) {
                    fullPrompt = `Character: ${agent.name}. Scene: ${studioState.prompt}`;
                }
            }
            
            // Strip data prefix for API
            const base64Image = studioState.generatedImageUrl.split(',')[1];
            const operation = await webSeriesService.generateWebSeriesVideo(fullPrompt, base64Image);
            
            // Poll for video
            const intervalId = window.setInterval(async () => {
                try {
                    const updatedOperation = await webSeriesService.checkVideoStatus(operation);
                    setStudioState(prev => ({ ...prev, statusMessage: reassuringMessages[Math.floor(Math.random() * reassuringMessages.length)] }));

                    if (updatedOperation.done) {
                        clearInterval(intervalId);
                        const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                        if (downloadLink && process.env.API_KEY) {
                            const finalVideoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
                            setStudioState(prev => ({ ...prev, generatedVideoUrl: finalVideoUrl, isGeneratingVideo: false, statusMessage: '' }));
                        } else {
                            throw new Error("Video generation finished but no video was found.");
                        }
                    }
                } catch (error) {
                    clearInterval(intervalId);
                    setStudioState(prev => ({ ...prev, isGeneratingVideo: false, error: 'Video generation failed.' }));
                }
            }, 10000);

        } catch (e) {
            setStudioState(prev => ({ ...prev, error: e instanceof Error ? e.message : 'Animation failed', isGeneratingVideo: false }));
        }
    };


    if (!unleashedMode) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <GlassCard className="p-10 animate-fadeIn">
                    <h1 className="text-3xl font-bold text-red-400">Unleashed Mode Required</h1>
                    <p className="mt-4 text-gray-300 max-w-md">
                        This feature contains mature content and requires Unleashed Mode to be enabled.
                    </p>
                </GlassCard>
            </div>
        );
    }

    const SegmentCard: React.FC<{ segment: Segment }> = ({ segment }) => (
        <GlassCard className="p-3 cursor-pointer hover:bg-gray-800/50 transition-colors" onClick={() => setActiveContent(segment)}>
            <h4 className="font-bold text-sm text-cyan-300">{segment.title}</h4>
            <p className="text-xs text-gray-400 my-2 h-12 overflow-hidden">{segment.prompt}</p>
            <div className="flex items-center justify-between">
                <div className="text-xs font-mono">
                    {segment.status === 'idle' && <span className="text-gray-500">Idle</span>}
                    {segment.status === 'generating' && <span className="text-yellow-400 animate-pulse">Generating...</span>}
                    {segment.status === 'polling' && <span className="text-yellow-400 animate-pulse">Polling...</span>}
                    {segment.status === 'done' && <span className="text-green-400">Ready</span>}
                    {segment.status === 'error' && <span className="text-red-400">Error</span>}
                </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); handleGenerateEpisodeSegment(segment.id); }}
                    disabled={segment.status === 'generating' || segment.status === 'polling'}
                    className="px-3 py-1 text-xs font-semibold rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-gray-600"
                >
                    {segment.status === 'done' ? 'Regenerate' : 'Generate'}
                </button>
            </div>
        </GlassCard>
    );

    return (
        <div className="animate-fadeIn h-full flex flex-col">
            <header className="flex-shrink-0 mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-bold text-fuchsia-300 font-playfair-display">Venice Web Series</h2>
                    <p className="text-gray-400 font-lora">Cinematic creation engine.</p>
                </div>
                <div className="flex bg-gray-800 rounded-lg p-1">
                    <button 
                        onClick={() => setActiveTab('episodes')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'episodes' ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Episodes
                    </button>
                    <button 
                        onClick={() => setActiveTab('studio')}
                        className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === 'studio' ? 'bg-fuchsia-600 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Studio
                    </button>
                </div>
            </header>

            {activeTab === 'episodes' ? (
                <div className="flex gap-6 flex-1 min-h-0">
                    <div className="w-1/3 flex flex-col min-h-0">
                        <div className="mb-4">
                             <select 
                                value={selectedEpisode} 
                                onChange={e => setSelectedEpisode(Number(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white font-lora"
                            >
                                {Object.keys(seriesData).map(epNum => (
                                    <option key={epNum} value={epNum}>{seriesData[Number(epNum)].title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                            {segments.map(s => <SegmentCard key={s.id} segment={s} />)}
                        </div>
                    </div>
                    <div className="w-2/3 flex items-center justify-center bg-black/50 rounded-lg p-4 border border-gray-800">
                        {!activeContent ? (
                            <div className="text-center text-gray-500">
                                <p className="text-xl mb-2">Preview Area</p>
                                <p>Select a segment to view or generate.</p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col">
                                <div className="flex-1 flex items-center justify-center relative">
                                    {(activeContent.status === 'generating' || activeContent.status === 'polling') && (
                                        <div className="text-center z-10">
                                            <Spinner />
                                            <p className="mt-4 text-lg text-yellow-300 animate-pulse">{activeContent.statusMessage || 'Processing...'}</p>
                                        </div>
                                    )}
                                     {activeContent.status === 'error' && <p className="text-red-400 text-center">{activeContent.statusMessage}</p>}
                                     {activeContent.status === 'done' && activeContent.resultUrl && (
                                        <video src={activeContent.resultUrl} controls autoPlay loop className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                     )}
                                     {activeContent.status === 'idle' && (
                                         <div className="text-center text-gray-500">
                                             <p>Ready to generate: <span className="text-cyan-300">{activeContent.title}</span></p>
                                         </div>
                                     )}
                                </div>
                                <div className="h-16 mt-4 p-2 bg-gray-900/50 rounded border border-gray-700 overflow-y-auto">
                                    <p className="text-xs text-gray-300 font-mono">{activeContent.prompt}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex gap-6 flex-1 min-h-0">
                    <div className="w-1/3 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                        <GlassCard className="p-4 mb-4">
                            <h3 className="font-bold text-cyan-300 mb-3">1. Cast</h3>
                            <div className="mb-4">
                                <label className="block text-xs text-gray-400 mb-1">Consistent Character (Optional)</label>
                                <select 
                                    value={studioState.selectedAgentId}
                                    onChange={(e) => setStudioState(prev => ({ ...prev, selectedAgentId: e.target.value }))}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white"
                                >
                                    <option value="">-- No specific character --</option>
                                    {agents.map(agent => (
                                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                                    ))}
                                </select>
                            </div>
                            {studioState.selectedAgentId && (
                                <div className="flex items-center gap-2 p-2 bg-gray-800 rounded border border-cyan-500/30">
                                    <AgentAvatar agent={agents.find(a => a.id === studioState.selectedAgentId)!} size="sm" />
                                    <span className="text-sm text-gray-300">Character appearance locked.</span>
                                </div>
                            )}
                        </GlassCard>

                        <GlassCard className="p-4 flex-1">
                            <h3 className="font-bold text-cyan-300 mb-3">2. Scene</h3>
                            <textarea
                                value={studioState.prompt}
                                onChange={(e) => setStudioState(prev => ({ ...prev, prompt: e.target.value }))}
                                placeholder="Describe the scene, lighting, action..."
                                className="w-full h-32 bg-gray-800 border border-gray-600 rounded-md p-2 text-white text-sm mb-4"
                            />
                            <button
                                onClick={handleStudioGenerateImage}
                                disabled={studioState.isGeneratingImage || !studioState.prompt}
                                className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold disabled:bg-gray-600 transition-colors flex justify-center items-center gap-2"
                            >
                                {studioState.isGeneratingImage ? <Spinner /> : "Generate Image"}
                            </button>
                        </GlassCard>
                    </div>

                    <div className="w-2/3 flex flex-col bg-black/50 rounded-lg border border-gray-800 overflow-hidden">
                        <div className="flex-1 p-4 flex items-center justify-center relative">
                            {studioState.isGeneratingImage && (
                                <div className="text-center">
                                    <Spinner />
                                    <p className="mt-2 text-cyan-300">Generating Image...</p>
                                </div>
                            )}
                            
                            {!studioState.isGeneratingImage && studioState.generatedImageUrl && !studioState.generatedVideoUrl && !studioState.isGeneratingVideo && (
                                <img src={studioState.generatedImageUrl} alt="Generated Scene" className="max-w-full max-h-full object-contain rounded shadow-lg" />
                            )}

                            {(studioState.isGeneratingVideo || studioState.generatedVideoUrl) && (
                                <div className="w-full h-full flex items-center justify-center">
                                    {studioState.isGeneratingVideo ? (
                                        <div className="text-center">
                                            <Spinner />
                                            <p className="mt-2 text-fuchsia-300 animate-pulse">{studioState.statusMessage}</p>
                                        </div>
                                    ) : (
                                        <video src={studioState.generatedVideoUrl!} controls autoPlay loop className="max-w-full max-h-full object-contain rounded shadow-lg" />
                                    )}
                                </div>
                            )}

                            {!studioState.isGeneratingImage && !studioState.generatedImageUrl && !studioState.isGeneratingVideo && (
                                <p className="text-gray-500">Studio Output</p>
                            )}
                            
                            {studioState.error && (
                                <div className="absolute bottom-4 bg-red-900/80 text-white px-4 py-2 rounded">
                                    Error: {studioState.error}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-4">
                             <button
                                onClick={handleStudioAnimate}
                                disabled={!studioState.generatedImageUrl || studioState.isGeneratingVideo || studioState.isGeneratingImage}
                                className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg font-bold disabled:bg-gray-700 disabled:text-gray-500 transition-colors flex items-center gap-2"
                            >
                                {studioState.isGeneratingVideo ? "Animating..." : "Animate Scene (Video)"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
