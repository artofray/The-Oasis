import React, { useState, useCallback, useEffect } from 'react';
import { AgentSelector } from './round-table/AgentSelector';
import { ChatWindow } from './round-table/ChatWindow';
import { MessageInput } from './round-table/MessageInput';
import { AgentEditModal } from './round-table/AgentEditModal';
import * as roundTableService from '../../services/roundTableService';
import type { ChatMessage, ChatMode, RoundTableAgent } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';

const NEW_AGENT_TEMPLATE: Omit<RoundTableAgent, 'id'> = {
    name: 'New Agent',
    description: 'A newly created AI with a fresh perspective.',
    avatarColor: 'bg-gray-500',
    colorHex: '#6B7280',
    currentActivity: 'Awaiting instructions.',
    systemInstruction: 'You are a helpful AI assistant.',
    voiceCloned: false,
};
interface RoundTableViewProps {
    agents: RoundTableAgent[];
    setAgents: (agents: RoundTableAgent[] | ((prev: RoundTableAgent[]) => RoundTableAgent[])) => void;
    messages: ChatMessage[];
    setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
}

export const RoundTableView: React.FC<RoundTableViewProps> = ({ agents, setAgents, messages, setMessages }) => {
    const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
    const [mode, setMode] = useState<ChatMode>('round_table');
    const [isLoading, setIsLoading] = useState(false);
    const [webAccess, setWebAccess] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [modalState, setModalState] = useState<{ isOpen: boolean; agent: RoundTableAgent | null }>({ isOpen: false, agent: null });
    const [agentVoiceMap, setAgentVoiceMap] = useState<Record<string, SpeechSynthesisVoice | undefined>>({});

    const { speak, voices } = useSpeech();

    useEffect(() => {
        if (voices.length > 0 && agents.length > 0) {
            const newMap: Record<string, SpeechSynthesisVoice | undefined> = {};
            const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
            const usableVoices = englishVoices.length > 0 ? englishVoices : voices;
            
            agents.forEach((agent, index) => {
                newMap[agent.id] = usableVoices[index % usableVoices.length];
            });
            setAgentVoiceMap(newMap);
        }
    }, [voices, agents]);

    useEffect(() => {
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

    const handleSendMessage = useCallback(async (prompt: string, file?: File) => {
        if (isLoading || (!prompt && !file) || selectedAgentIds.size === 0) return;
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
    
            // This will be the history for API calls, and we'll add to it as agents respond.
            const conversationHistoryForApi = [...messages, userMessage];
            
            // Add user message to UI state.
            setMessages(prevMessages => [...prevMessages, userMessage]);
            
            const selectedAgents = agents.filter(agent => selectedAgentIds.has(agent.id));
    
            for (const agent of selectedAgents) {
                const agentLoadingMessageId = `loading-${agent.id}-${Date.now()}`;
                
                // Add loading message to UI.
                setMessages(prevMessages => [...prevMessages, {
                    id: agentLoadingMessageId,
                    author: agent.name,
                    text: '...',
                    agent: agent,
                }]);
    
                const response = await roundTableService.generateAgentResponse(
                    agent,
                    conversationHistoryForApi, // Pass the up-to-date history
                    webAccess
                );
                
                if (isAudioEnabled) {
                    const agentVoice = agentVoiceMap[agent.id];
                    const speechOptions: { voice?: SpeechSynthesisVoice; pitch?: number; rate?: number } = { voice: agentVoice };
                    
                    if (agent.voiceCloned) {
                        const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        speechOptions.pitch = 1 + (hash % 5) / 10 - 0.2; // Range 0.8 to 1.2
                        speechOptions.rate = 1 + (hash % 3) / 10 - 0.1;  // Range 0.9 to 1.1
                    }
    
                    speak(response.text, speechOptions);
                }
                
                const agentResponseMessage: ChatMessage = {
                    id: `${agent.id}-${Date.now()}`,
                    author: agent.name,
                    text: response.text,
                    sources: response.sources,
                    agent: agent,
                };
    
                // Add the real response to our API history for the next agent in the loop.
                conversationHistoryForApi.push(agentResponseMessage);
                
                // Update UI by replacing the loading message with the real one.
                setMessages(prevMessages => prevMessages.map(msg => 
                    msg.id === agentLoadingMessageId ? agentResponseMessage : msg
                ));
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
    
    }, [isLoading, selectedAgentIds, messages, webAccess, agents, isAudioEnabled, speak, agentVoiceMap, setMessages]);


    const handleSendMedia = async (type: 'image' | 'video' | 'audio', prompt: string) => {
        if (isLoading || !prompt) return;
        setIsLoading(true);
        let mediaMessage: ChatMessage;

        switch (type) {
            case 'image':
                mediaMessage = await roundTableService.generateImageResponse(prompt);
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
                <ChatWindow messages={messages} />
                <MessageInput
                    onSendMessage={handleSendMessage}
                    onSendMedia={handleSendMedia}
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
                />
            )}
        </div>
    );
};