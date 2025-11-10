import React from 'react';

interface SentinelStatusProps {
    agentCount: number;
}

export const SentinelStatus: React.FC<SentinelStatusProps> = ({ agentCount }) => {
    return (
        <div className="relative flex items-center space-x-3 group cursor-pointer">
             <div className="relative flex items-center justify-center h-5 w-5">
                <div className="absolute h-full w-full bg-cyan-400/50 rounded-full animate-ping"></div>
                <div className="relative h-2.5 w-2.5 bg-cyan-400 rounded-full"></div>
            </div>
            <div className="text-sm font-medium text-right">
                <p className="text-cyan-300">Systems Online</p>
                <p className="text-xs text-gray-400">{agentCount} Agents Active</p>
            </div>
        </div>
    );
}