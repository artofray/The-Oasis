

import React from 'react';

export const SentinelStatus: React.FC = () => {
    return (
        <div className="relative flex items-center space-x-2 group cursor-pointer">
             <div className="relative flex items-center justify-center h-8 w-8">
                <div className="absolute h-full w-full bg-cyan-400/50 rounded-full animate-ping"></div>
                <div className="relative h-4 w-4 bg-cyan-400 rounded-full"></div>
            </div>
            <div className="text-sm font-medium">
                <p className="text-cyan-300">System Online</p>
                <p className="text-xs text-gray-400">Agents Idle</p>
            </div>
            <div className="absolute top-full mt-2 right-0 p-3 bg-gray-800 border border-cyan-400/30 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-10">
                Cloud-Native Platform: Active
                <br />
                Secure Containerization: Enabled
            </div>
        </div>
    );
}