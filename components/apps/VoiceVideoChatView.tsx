import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { useSpeech } from '../../hooks/useSpeech';
import * as roundTableService from '../../services/roundTableService';
import type { RoundTableAgent, ChatMessage } from '../../types';
import { AgentAvatar } from './round-table/AgentAvatar';
import Spinner from './tarot-journal/Spinner';


interface VoiceVideoChatViewProps {
    agents: RoundTableAgent[];
    // FIX: Add unleashedMode to props.
    unleashedMode: boolean;
}

export const VoiceVideoChatView: React.FC<VoiceVideoChatViewProps> = ({ agents, unleashedMode }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const { speak, stop, isSpeaking, voices } = useSpeech();
    const maggie = agents.find(a => a.id === 'maggie');
    const [maggieVoice, setMaggieVoice] = useState<SpeechSynthesisVoice | null>(null);
    
    useEffect(() => {
        if (voices.length > 0) {
            const idealVoice = voices.find(v => v.name.includes('Google US English') && v.name.includes('Female')) || voices.find(v => v.lang === 'en-US' && v.name.includes('Female'));
            setMaggieVoice(idealVoice || voices.find(v => v.lang.startsWith('en')) || null);
        }
    }, [voices]);
    
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please ensure permissions are granted.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };
    
    useEffect(() => {
        // Automatically stop camera on component unmount
        return () => stopCamera();
    }, []);

    const takeSnapshot = (): {base64: string, mimeType: string} | null => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                return { base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
            }
        }
        return null;
    };

    const handleSendMessage = useCallback(async () => {
        if (!prompt.trim() || !maggie) return;
        
        setIsLoading(true);
        const snapshot = takeSnapshot();

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            author: 'User',
            text: prompt,
            imageUrl: snapshot ? `data:${snapshot.mimeType};base64,${snapshot.base64}` : undefined
        };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setPrompt('');

        const response = await roundTableService.sendVideoChatMessage(
            maggie,
            snapshot?.base64 || '',
            snapshot?.mimeType || '',
            prompt,
            currentMessages,
            // FIX: Added missing unleashedMode argument.
            unleashedMode
        );
        
        const maggieMessage: ChatMessage = {
            id: `maggie-${Date.now()}`,
            author: 'Maggie',
            text: response.text,
            agent: maggie
        };
        
        setMessages(prev => [...prev, maggieMessage]);
        
        if (maggieVoice) {
            speak(response.text, { voice: maggieVoice });
        }
        
        setIsLoading(false);

    }, [prompt, stream, messages, maggie, maggieVoice, speak, unleashedMode]);

    if (!maggie) {
        return (
             <div className="h-full w-full flex items-center justify-center">
                <GlassCard className="p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-400">Connection Error</h2>
                    <p className="text-gray-300">Maggie is unavailable for a call at this moment.</p>
                </GlassCard>
            </div>
        )
    }

    return (
        <div className="h-full w-full flex gap-6 animate-fadeIn">
            <div className="w-2/3 h-full flex flex-col">
                <GlassCard className="flex-1 relative bg-black overflow-hidden flex items-center justify-center p-8">
                    <div className={`w-64 h-64 rounded-full bg-gradient-to-br from-red-500 to-amber-500 p-2 transition-all duration-300 ${isSpeaking ? 'scale-105' : ''}`}>
                         <div className="w-full h-full bg-gray-900 rounded-full">
                            <img src={maggie.avatarUrl} alt="Maggie" className="rounded-full w-full h-full object-cover"/>
                        </div>
                    </div>
                    {isSpeaking && <div className="absolute inset-0 border-4 border-red-400/50 rounded-2xl animate-pulse pointer-events-none"></div>}
                     <div className="absolute bottom-6 text-center bg-black/30 backdrop-blur-sm px-6 py-2 rounded-xl">
                        <h2 className="text-3xl font-bold">{maggie.name}</h2>
                        <p className="text-red-300">{isSpeaking ? 'Speaking...' : 'Listening...'}</p>
                    </div>
                </GlassCard>
            </div>
            <div className="w-1/3 h-full flex flex-col">
                 <GlassCard className="flex-1 flex flex-col p-4">
                    {stream ? (
                        <div className="relative mb-4">
                            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg object-cover" />
                            <canvas ref={canvasRef} className="hidden" />
                            <button onClick={stopCamera} className="absolute top-2 right-2 px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-lg transition-colors text-xs">
                                End Call
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-600 rounded-lg mb-4">
                             <h2 className="text-xl font-bold text-cyan-300">Start Video Chat</h2>
                            <p className="text-gray-400 mb-4 text-sm">Let's talk face to face, my love.</p>
                            <button onClick={startCamera} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors">
                                Start My Camera
                            </button>
                        </div>
                    )}

                    <div ref={scrollRef} className={`flex-1 space-y-4 overflow-y-auto pr-2 ${!stream ? 'hidden' : ''}`}>
                       {messages.map(msg => (
                           <div key={msg.id} className={`flex items-start gap-3 ${msg.author === 'User' ? 'justify-end' : ''}`}>
                               {msg.author !== 'User' && msg.agent && <AgentAvatar agent={msg.agent} size="sm" />}
                               <div className={`max-w-xs p-3 rounded-lg ${msg.author === 'User' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                    <p className="text-white text-sm whitespace-pre-wrap">{msg.text}</p>
                                    {msg.imageUrl && msg.author === 'User' && (
                                        <div className="mt-2 bg-blue-700/50 p-1 rounded-md">
                                            <img src={msg.imageUrl} alt="User snapshot" className="rounded-md w-24 h-auto" />
                                            <p className="text-xs text-blue-200 text-center font-semibold mt-1">User snapshot</p>
                                        </div>
                                    )}
                               </div>
                           </div>
                       ))}
                       {isLoading && (
                            <div className="flex items-start gap-3">
                                {maggie && <AgentAvatar agent={maggie} size="sm" />}
                                <div className="max-w-xs p-3 rounded-lg bg-gray-700">
                                     <div className="flex items-center justify-center space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                       )}
                    </div>
                    <div className={`mt-4 pt-4 border-t border-fuchsia-400/20 ${!stream ? 'hidden' : ''}`}>
                        <div className="flex gap-2">
                             <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-800 border border-fuchsia-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                                disabled={isLoading || !stream}
                            />
                            <button onClick={handleSendMessage} disabled={isLoading || !prompt.trim()} className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600">
                                {isLoading ? <Spinner /> : 'Send'}
                            </button>
                        </div>
                    </div>
                 </GlassCard>
            </div>
        </div>
    );
};