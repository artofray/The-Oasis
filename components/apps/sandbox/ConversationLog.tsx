
import React from 'react';
import { GlassCard } from '../../ui/GlassCard';
import type { Conversation, RoundTableAgent } from '../../../types';

interface ConversationLogProps {
    conversations: Record<string, Conversation>;
    agents: RoundTableAgent[];
}

export const ConversationLog: React.FC<ConversationLogProps> = ({ conversations, agents }) => {
    const activeConversations: Conversation[] = Object.values(conversations);

    if (activeConversations.length === 0) {
        return null;
    }
    
    const getAgentColor = (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        return agent ? agent.colorHex : '#FFFFFF';
    };

    return (
        <div className="absolute bottom-24 left-4 w-full max-w-md animate-fadeInUp">
            <GlassCard className="p-4 bg-gray-900/70">
                <h3 className="text-lg font-bold text-cyan-300 mb-2">Live Conversations</h3>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                    {activeConversations.map(convo => (
                        <div key={convo.id} className="text-sm">
                            {convo.messages.map((msg, index) => (
                                <p key={index}>
                                    <span 
                                        className="font-semibold" 
                                        style={{ color: getAgentColor(msg.agentId) }}
                                    >
                                        {msg.agentName}:
                                    </span>
                                    <span className="text-gray-200 ml-2">{msg.text}</span>
                                </p>
                            ))}
                        </div>
                    ))}
                </div>
            </GlassCard>
        </div>
    );
};
