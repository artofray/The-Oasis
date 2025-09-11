import React from 'react';
import type { RoundTableAgent } from '../../../types';

interface AgentAvatarProps {
    agent: RoundTableAgent;
    size?: 'sm' | 'md' | 'lg';
}

export const AgentAvatar: React.FC<AgentAvatarProps> = ({ agent, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-32 h-32 text-4xl',
    };

    if (agent.avatarUrl) {
        return (
            <img 
                src={agent.avatarUrl} 
                alt={`${agent.name}'s avatar`}
                className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`} 
            />
        )
    }
    
    return (
        <div className={`${sizeClasses[size]} rounded-full ${agent.avatarColor} flex items-center justify-center font-bold text-white flex-shrink-0`}>
            {agent.name.charAt(0)}
        </div>
    );
}