
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChatWindow } from './round-table/ChatWindow';
import { MessageInput } from './round-table/MessageInput';
import * as roundTableService from '../../services/roundTableService';
import type { ChatMessage, RoundTableAgent } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface RoundTableViewProps {
    agents: RoundTableAgent[];
    setAgents: (agents: RoundTableAgent[] | ((prev: RoundTableAgent[]) => RoundTableAgent[])) => void;
    messages: ChatMessage[];
    setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
    setSpeakingAgentId: (id: string | null) => void;
    unleashedMode: boolean;
    selectedAgentIds: Set<string>;
}

export const RoundTableView: React.FC<RoundTableViewProps> = ({ agents, setAgents, messages, setMessages, setSpeakingAgentId, unleashedMode, selectedAgentIds }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [webAccess, setWebAccess] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [agentVoiceMap, setAgentVoiceMap] = useState<Record<string, SpeechSynthesisVoice | undefined>>({});
    const isInterrupted = useRef(false);

    const { speak, stop, voices } = useSpeech();

    useEffect(() => {
        if (voices.length > 0 && agents.length > 0) {
            const newMap: Record<string, SpeechSynthesisVoice | undefined> = {};
            const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
            const usableVoices = englishVoices.length > 0 ? englishVoices : voices;

            if (usableVoices.length === 0) return; // No voices to assign

            agents.forEach((agent) => {
                let foundVoice: SpeechSynthesisVoice | undefined;
                if (agent.voice.presetName) {
                    foundVoice = usableVoices.find(v => v.name === agent.voice.presetName);
                }
                if (!foundVoice) {
                    const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    foundVoice = usableVoices[hash % usableVoices.length];
                }
                newMap[agent.id] = foundVoice;
            });
            setAgentVoiceMap(newMap);
        }
    }, [voices, agents]);

    useEffect(() => {
        if (messages.some(m => m.videoGenerationStatus === 'interrupted')) {
            setMessages(prev => prev.map(m => {
                if (m.videoGenerationStatus === 'interrupted') {
                    const { videoGenerationStatus, ...rest } = m;
                    return {
                        ...rest,
                        text: `Video generation for "${m.originalPrompt}" was interrupted. Please try again.`,
                    };
                }
                return m;
            }));
            return;
        }

        const intervals: Record<string, number> = {};
        
        const reassuringMessages = [
            "Crafting your video pixel by pixel...",
            "Rendering final scenes...",
            "Polishing visuals, this might take a while...",
            "Preparing your video for viewing..."
        ];
        let messageIndex = 0;

        messages.forEach(msg => {
            if (msg.videoGenerationOperation && !msg.videoUrl && !intervals[msg.id]) {
                intervals[msg.id] = window.setInterval(async () => {
                    try {
                        const updatedOperation = await roundTableService.checkVideoStatus(msg.videoGenerationOperation);
                        
                        if (updatedOperation.done) {
                            clearInterval(intervals[msg.id]);
                            delete intervals[msg.id];

                            const downloadLink = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                            if (downloadLink && process.env.API_KEY) {
                                const videoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
                                setMessages(prev => prev.map(m => 
                                    m.id === msg.id 
                                    ? { ...m, text: `Your video for "${m.originalPrompt}" is ready!`, videoUrl: videoUrl, videoGenerationOperation: undefined, originalPrompt: undefined } 
                                    : m
                                ));
                            } else {
                                throw new Error("Video generation finished but no URI was found or API_KEY is missing.");
                            }
                        } else {
                            setMessages(prev => prev.map(m => 
                                m.id === msg.id 
                                ? { ...m, text: reassuringMessages[messageIndex++ % reassuringMessages.length] } 
                                : m
                            ));
                        }
                    } catch (error) {
                        console.error("Error polling video status:", error);
                        clearInterval(intervals[msg.id]);
                        delete intervals[msg.id];
                        setMessages(prev => prev.map(m => 
                            m.id === msg.id 
                            ? { ...m, text: "An error occurred while generating the video.", videoGenerationOperation: undefined, originalPrompt: undefined } 
                            : m
                        ));
                    }
                }, 10000);
            }
        });

        return () => {
            Object.values(intervals).forEach(clearInterval);
        };
    }, [messages, setMessages]);

    const handleInterrupt = () => {
        isInterrupted.current = true;
        stop();
        setSpeakingAgentId(null);
    };

    const handleSendMessage = useCallback(async (prompt: string, file?: File) => {
        if (isLoading || (!prompt && !file) || selectedAgentIds.size === 0) return;
        
        isInterrupted.current = false;
        setIsLoading(true);
    
        const processAndSend = async (fileContent?: string) => {
            const userMessage: ChatMessage = {
                id: `user-${Date.now()}`,
                author: 'User',
                text: prompt,
                fileName: file?.name,
                fileType: file?.type,
                fileContent: fileContent,
            };
    
            const conversationHistoryForApi = [...messages, userMessage];
            setMessages(prevMessages => [...prevMessages, userMessage]);
            
            const selectedAgents = agents.filter(agent => selectedAgentIds.has(agent.id));
    
            for (const agent of selectedAgents) {
                if (isInterrupted.current) break;
                
                const agentLoadingMessageId = `loading-${agent.id}-${Date.now()}`;
                
                setMessages(prevMessages => [...prevMessages, {
                    id: agentLoadingMessageId,
                    author: agent.name,
                    text: '...',
                    agent: agent,
                }]);
    
                const response = await roundTableService.generateAgentResponse(
                    agent,
                    conversationHistoryForApi,
                    webAccess,
                    unleashedMode
                );

                if (isInterrupted.current) break;
                
                if (isAudioEnabled) {
                    const agentVoice = agentVoiceMap[agent.id];
                    // Use agent-specific pitch/rate or fallback to hash-based for variety
                    const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const pitch = agent.voice.pitch ?? (1 + (hash % 5) / 20 - 0.1);
                    const rate = agent.voice.rate ?? (1 + (hash % 4) / 20 - 0.05);

                    speak(response.text, {
                        voice: agentVoice,
                        pitch,
                        rate,
                        onStart: () => setSpeakingAgentId(agent.id),
                        onEnd: () => setSpeakingAgentId(null),
                    });
                }
                
                const agentResponseMessage: ChatMessage = {
                    id: `${agent.id}-${Date.now()}`,
                    author: agent.name,
                    text: response.text,
                    sources: response.sources,
                    agent: agent,
                };
    
                conversationHistoryForApi.push(agentResponseMessage);
                
                setMessages(prevMessages => prevMessages.map(msg => 
                    msg.id === agentLoadingMessageId ? agentResponseMessage : msg
                ));
            }

            if (isInterrupted.current) {
                setMessages(prev => [...prev, { id: `sys-${Date.now()}`, author: 'System', text: 'Conversation interrupted.' }]);
            }
            setIsLoading(false);
        };
    
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                processAndSend(event.target?.result as string);
            };
            reader.onerror = () => {
                console.error("Error reading file.");
                setIsLoading(false);
            }
            reader.readAsText(file);
        } else {
            processAndSend();
        }
    
    }, [isLoading, selectedAgentIds, messages, webAccess, agents, isAudioEnabled, speak, agentVoiceMap, setMessages, setSpeakingAgentId, stop, unleashedMode]);


    const handleSendMedia = async (type: 'image' | 'video' | 'audio', prompt: string) => {
        if (isLoading || !prompt) return;
        setIsLoading(true);
        let mediaMessage: ChatMessage;

        switch (type) {
            case 'image':
                mediaMessage = await roundTableService.generateImageResponse(prompt, unleashedMode);
                break;
            case 'video':
                mediaMessage = await roundTableService.generateVideoResponse(prompt);
                break;
            case 'audio':
                mediaMessage = await roundTableService.generateAudioResponse(prompt);
                break;
        }

        setMessages(prev => [...prev, mediaMessage]);
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col h-full w-full bg-[#0d1117] text-white">
            <ErrorBoundary>
                <ChatWindow messages={messages} />
            </ErrorBoundary>
            
            <MessageInput
                onSendMessage={handleSendMessage}
                onSendMedia={handleSendMedia}
                onInterrupt={handleInterrupt}
                isLoading={isLoading}
                webAccess={webAccess}
                onWebAccessToggle={() => setWebAccess(!webAccess)}
                isAudioEnabled={isAudioEnabled}
                onAudioToggle={() => setIsAudioEnabled(!isAudioEnabled)}
                disabled={selectedAgentIds.size === 0}
                messages={messages}
                setMessages={setMessages}
            />
        </div>
    );
};
