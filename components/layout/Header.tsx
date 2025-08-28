

import React from 'react';
import { SentinelStatus } from '../features/SentinelStatus';

export const Header: React.FC = () => {
    return (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-cyan-400/20">
            <h1 className="text-xl font-bold text-gray-200 tracking-wider">
                <span className="text-cyan-400">Oasis</span>
            </h1>
            <SentinelStatus />
        </header>
    );
};