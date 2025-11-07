import React from 'react';
import type { AspectRatio } from '../../../types';

interface StageProps {
    imageUrl: string | null;
    prompt: string;
    aspectRatio: AspectRatio;
}

const TheatreCurtainIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
    </svg>
);

const aspectRatioClasses: Record<AspectRatio, string> = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '3:4': 'aspect-[3/4]',
};

export const Stage: React.FC<StageProps> = ({ imageUrl, prompt, aspectRatio }) => {
    return (
        <div className={`w-full ${aspectRatioClasses[aspectRatio]} bg-black rounded-lg flex items-center justify-center relative overflow-hidden shadow-2xl shadow-black`}>
            {imageUrl ? (
                <img src={imageUrl} alt={prompt} className="w-full h-full object-contain animate-fadeIn" />
            ) : (
                <div className="text-center text-gray-500">
                    <TheatreCurtainIcon />
                    <p className="mt-4 text-lg font-semibold">The Stage is Set</p>
                    <p className="text-sm">Awaiting scene description...</p>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        </div>
    );
};