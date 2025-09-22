import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AgentSelector } from './round-table/AgentSelector';
import { ChatWindow } from './round-table/ChatWindow';
import { MessageInput } from './round-table/MessageInput';
import { AgentEditModal } from './round-table/AgentEditModal';
import * as roundTableService from '../../services/roundTableService';
import type { ChatMessage, ChatMode, RoundTableAgent } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';
import { NEW_AGENT_TEMPLATE } from './round-table/constants';
import { ErrorBoundary } from '../ui/ErrorBoundary';

interface RoundTableViewProps {
    agents: RoundTableAgent[];
    setAgents: (agents: RoundTableAgent[] | ((prev: RoundTableAgent[]) => RoundTableAgent[])) => void;
    messages: ChatMessage[];
    setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
    setSpeakingAgentId: (id: string | null) => void;
    unleashedMode: boolean;
}

export const RoundTableView: React.FC<RoundTableViewProps> = ({ agents, setAgents, messages, setMessages, setSpeakingAgentId, unleashedMode }) => {
    const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
    const [mode, setMode] = useState<ChatMode>('round_table');
    const [isLoading, setIsLoading] = useState(false);
    const [webAccess, setWebAccess] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [modalState, setModalState] = useState<{ isOpen: boolean; agent: RoundTableAgent | null }>({ isOpen: false, agent: null });
    const [agentVoiceMap, setAgentVoiceMap] = useState<Record<string, SpeechSynthesisVoice | undefined>>({});
    const isInterrupted = useRef(false);

    const { speak, stop, voices } = useSpeech();

    useEffect(() => {
        if (voices.length > 0 && agents.length > 0) {
            const newMap: Record<string, SpeechSynthesisVoice | undefined> = {};
            const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
            const usableVoices = englishVoices.length > 0 ? englishVoices : voices;
            
            agents.forEach((agent, index) => {
                let foundVoice: SpeechSynthesisVoice | undefined;
                // 1. Try to find by preset name
                if (agent.voice.presetName) {
                    foundVoice = usableVoices.find(v => v.name === agent.voice.presetName);
                }
                // 2. If no preset or not found, fall back to hash
                if (!foundVoice) {
                    foundVoice = usableVoices[index % usableVoices.length];
                }
                newMap[agent.id] = foundVoice;
            });
            setAgentVoiceMap(newMap);
        }
    }, [voices, agents]);

    useEffect(() => {
        // On component mount or when messages change, check for any interrupted video generations from a previous session.
        if (messages.some(m => m.videoGenerationStatus === 'interrupted')) {
            setMessages(prev => prev.map(m => {
                if (m.videoGenerationStatus === 'interrupted') {
                    const { videoGenerationStatus, ...rest } = m;
                    return {
                        ...rest,
                        text: `Video generation for "${m.originalPrompt}" was interrupted by a page reload. Please try again.`,
                    };
                }
                return m;
            }));
            // Return early to avoid starting polling logic on outdated message data in this render cycle
            return;
        }

        const intervals: Record<string, number> = {};
        
        const reassuringMessages = [
            "Our digital artisans are crafting your video pixel by pixel...",
            "Just a moment, rendering the final scenes...",
            "Polishing the visuals, this might take a little while...",
            "Almost there! Preparing your video for viewing..."
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
                            // Update with a reassuring message
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
    
    const handleEditAgent = (agentId: string) => {
        const agentToEdit = agents.find(a => a.id === agentId);
        if(agentToEdit) {
            setModalState({ isOpen: true, agent: agentToEdit });
        }
    };
    
    const handleCreateAgent = () => {
        const newAgent: RoundTableAgent = { ...NEW_AGENT_TEMPLATE, id: `agent-${Date.now()}` };
        setModalState({ isOpen: true, agent: newAgent });
    };

    const handleSaveAgent = (updatedAgent: RoundTableAgent) => {
        const agentExists = agents.some(a => a.id === updatedAgent.id);
        if (agentExists) {
            setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
        } else {
            setAgents(prev => [...prev, updatedAgent]);
        }
        setModalState({ isOpen: false, agent: null });
    }

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
                    const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const pitch = 1 + (hash % 5) / 20 - 0.1; // ~0.9 to 1.1
                    const rate = 1 + (hash % 4) / 20 - 0.05;  // ~0.95 to 1.1

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
        <div className="flex h-full w-full bg-[#0d1117] rounded-lg text-white">
            <AgentSelector
                agents={agents}
                selectedAgentIds={selectedAgentIds}
                onAgentToggle={handleAgentToggle}
                onEditAgent={handleEditAgent}
                onCreateAgent={handleCreateAgent}
            />
            <div className="flex flex-col flex-1">
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
                />
            </div>
            {modalState.isOpen && modalState.agent && (
                <AgentEditModal 
                    agent={modalState.agent}
                    onSave={handleSaveAgent}
                    onClose={() => setModalState({ isOpen: false, agent: null })}
                    voices={voices}
                    // FIX: Pass unleashedMode prop to AgentEditModal.
                    unleashedMode={unleashedMode}
                />
            )}
        </div>
    );
};
