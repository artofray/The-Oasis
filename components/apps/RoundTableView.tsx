import React, { useState, useCallback } from 'react';
import { AgentSelector } from './round-table/AgentSelector';
import { ChatWindow } from './round-table/ChatWindow';
import { MessageInput } from './round-table/MessageInput';
import { AgentEditModal } from './round-table/AgentEditModal';
import { AGENTS as INITIAL_AGENTS } from './round-table/constants';
import * as roundTableService from '../../services/roundTableService';
import type { ChatMessage, ChatMode, RoundTableAgent } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';

export const RoundTableView: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
    const [mode, setMode] = useState<ChatMode>('round_table');
    const [isLoading, setIsLoading] = useState(false);
    const [webAccess, setWebAccess] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [agents, setAgents] = useState<RoundTableAgent[]>(INITIAL_AGENTS);
    const [editingAgent, setEditingAgent] = useState<RoundTableAgent | null>(null);

    const { speak } = useSpeech();

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
            setEditingAgent(agentToEdit);
        }
    };
    
    const handleSaveAgent = (updatedAgent: RoundTableAgent) => {
        setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
        setEditingAgent(null);
    }

    const handleSendMessage = useCallback(async (prompt: string) => {
        if (isLoading || !prompt || selectedAgentIds.size === 0) return;

        setIsLoading(true);

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            author: 'User',
            text: prompt,
        };

        const currentMessages: ChatMessage[] = [...messages, userMessage];
        setMessages(currentMessages);
        
        const selectedAgents = agents.filter(agent => selectedAgentIds.has(agent.id));

        for (const agent of selectedAgents) {
            const agentLoadingMessage: ChatMessage = {
                id: `loading-${agent.id}-${Date.now()}`,
                author: agent.name,
                text: '...',
                agent: agent,
            };
            setMessages(prev => [...prev, agentLoadingMessage]);

            const response = await roundTableService.generateAgentResponse(
                agent,
                currentMessages,
                prompt,
                webAccess
            );
            
            if (isAudioEnabled) {
                speak(response.text);
            }
            
            const agentResponseMessage: ChatMessage = {
                id: `${agent.id}-${Date.now()}`,
                author: agent.name,
                text: response.text,
                sources: response.sources,
                agent: agent,
            };
            
            setMessages(prev => prev.map(msg => msg.id === agentLoadingMessage.id ? agentResponseMessage : msg));
            currentMessages.push(agentResponseMessage);
        }

        setIsLoading(false);
    }, [isLoading, selectedAgentIds, messages, webAccess, agents, isAudioEnabled, speak]);

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
            {editingAgent && (
                <AgentEditModal 
                    agent={editingAgent}
                    onSave={handleSaveAgent}
                    onClose={() => setEditingAgent(null)}
                />
            )}
        </div>
    );
};
