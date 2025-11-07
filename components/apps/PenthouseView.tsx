import React, { useState } from 'react';
import type { RoundTableAgent, PenthouseLayout } from '../../types';
import * as roundTableService from '../../services/roundTableService';
import Spinner from './tarot-journal/Spinner';

interface PenthouseViewProps {
    agents: RoundTableAgent[];
    layout: PenthouseLayout;
    setLayout: (layout: PenthouseLayout) => void;
    unleashedMode: boolean;
}

interface SetVibeModalProps {
    onClose: () => void;
    setLayout: (layout: PenthouseLayout) => void;
    unleashedMode: boolean;
}

const SetVibeModal: React.FC<SetVibeModalProps> = ({ onClose, setLayout, unleashedMode }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        try {
            const newImageUrl = await roundTableService.generatePenthouseImage(prompt, unleashedMode);
            if (newImageUrl) {
                setLayout(newImageUrl);
                onClose();
            } else {
                throw new Error('Failed to generate a new vibe. The AI might be busy.');
            }
        } catch (e) {
             setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative border border-gray-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-fuchsia-300 mb-4 font-playfair-display">Set a New Vibe</h3>
                <p className="text-gray-400 mb-4 font-lora">Describe the atmosphere you want for the penthouse.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="e.g., 'A cozy, rainy night with a fireplace', 'A vibrant party with city lights', 'A serene morning with sunrise and yoga mats'"
                    className="w-full h-28 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-fuchsia-500"
                />
                {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg font-semibold">Cancel</button>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !prompt}
                        className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-lg disabled:bg-gray-500 flex items-center gap-2"
                    >
                        {isLoading ? <Spinner /> : "Generate"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PenthouseView: React.FC<PenthouseViewProps> = ({ agents, layout, setLayout, unleashedMode }) => {
    const [isVibeModalOpen, setIsVibeModalOpen] = useState(false);
    const maggie = agents.find(a => a.id === 'maggie');

    // Default image if layout is null or invalid
    const backgroundUrl = layout || 'https://images.unsplash.com/photo-1598802826847-16b7724a856f?q=80&w=2832&auto=format&fit=crop';

    return (
        <div 
            className="h-full w-full rounded-lg bg-cover bg-center relative flex items-end justify-center p-8 text-white animate-fadeIn"
            style={{ backgroundImage: `url(${backgroundUrl})` }}
        >
            <div className="absolute inset-0 bg-black/30 rounded-lg pointer-events-none"></div>
            
            {/* Agent Avatars */}
            {maggie && maggie.avatarUrl && (
                <div className="absolute bottom-10 left-10 z-10 w-40 h-96 group animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <img src={maggie.avatarUrl} alt="Maggie" className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {maggie.name}
                    </div>
                </div>
            )}
            
            {/* UI */}
            <div className="absolute top-4 left-4 z-10">
                 <h2 className="text-4xl font-bold font-playfair-display text-white drop-shadow-lg">The Penthouse</h2>
            </div>
            
            <div className="absolute top-4 right-4 z-10">
                <button
                    onClick={() => setIsVibeModalOpen(true)}
                    className="px-4 py-2 rounded-lg font-bold text-white bg-black/40 backdrop-blur-md hover:bg-fuchsia-600 transition-colors"
                >
                    Set Vibe
                </button>
            </div>
            
            {isVibeModalOpen && (
                <SetVibeModal
                    onClose={() => setIsVibeModalOpen(false)}
                    setLayout={setLayout}
                    unleashedMode={unleashedMode}
                />
            )}
        </div>
    );
};
