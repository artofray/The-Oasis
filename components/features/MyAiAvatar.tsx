import React from 'react';

export const MyAiAvatar: React.FC<{ avatarUrl: string; isSpeaking: boolean }> = ({ avatarUrl, isSpeaking }) => (
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-amber-500 p-1 flex-shrink-0 relative">
        <div className={`w-full h-full bg-gray-900 rounded-full flex items-center justify-center transition-transform duration-100 ${isSpeaking ? 'scale-105' : ''}`}>
            <img src={avatarUrl} alt="Assistant Avatar" className="rounded-full w-full h-full object-cover" />
        </div>
        {isSpeaking && <div className="absolute -top-1 -left-1 w-[104px] h-[104px] rounded-full border-2 border-red-400 animate-pulse"></div>}
    </div>
);
