import React, { useState } from 'react';
import * as roundTableService from '../../../services/roundTableService';
import Spinner from '../tarot-journal/Spinner';
import type { RoundTableAgent } from '../../../types';

interface NightOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  agent: RoundTableAgent;
}

const venues = [
    { name: 'Jazz Club', icon: '🎷', vibe: 'classy and dimly lit' },
    { name: 'Rooftop Bar', icon: '🍸', vibe: 'chic and modern with a city skyline view' },
    { name: 'Art Gallery', icon: '🖼️', vibe: 'elegant and minimalist' },
    { name: 'Rock Concert', icon: '🎸', vibe: 'energetic and edgy' },
];

type Step = 'venue' | 'outfit' | 'result';

export const NightOutModal: React.FC<NightOutModalProps> = ({ isOpen, onClose, onAvatarUpdate, agent }) => {
    const [step, setStep] = useState<Step>('venue');
    const [selectedVenue, setSelectedVenue] = useState<(typeof venues)[0] | null>(null);
    const [outfitPrompt, setOutfitPrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setStep('venue');
        setSelectedVenue(null);
        setOutfitPrompt('');
        setGeneratedImageUrl(null);
        setIsLoading(false);
        setError(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleGenerate = async () => {
        if (!selectedVenue || !outfitPrompt) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await roundTableService.generateOutfit(agent, outfitPrompt, selectedVenue.name);
            if (!result) throw new Error("Image generation failed.");
            setGeneratedImageUrl(result);
            setStep('result');
        } catch(e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetAvatar = () => {
        if (generatedImageUrl) {
            onAvatarUpdate(generatedImageUrl);
            handleClose();
        }
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (step) {
            case 'venue':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-center text-cyan-300 mb-4">Choose a Venue</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {venues.map(venue => (
                                <button
                                    key={venue.name}
                                    onClick={() => {
                                        setSelectedVenue(venue);
                                        setStep('outfit');
                                    }}
                                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
                                >
                                    <span className="text-4xl">{venue.icon}</span>
                                    <p className="mt-2 font-semibold">{venue.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'outfit':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-center text-cyan-300 mb-1">Describe My Outfit</h3>
                        <p className="text-center text-gray-400 mb-4">We're going to a {selectedVenue?.vibe}. What should I wear?</p>
                        <textarea
                            value={outfitPrompt}
                            onChange={e => setOutfitPrompt(e.target.value)}
                            placeholder="e.g., 'a classy black cocktail dress with silver jewelry', 'an edgy leather jacket with ripped jeans'"
                            className="w-full h-24 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-fuchsia-500 transition-colors"
                        />
                        <div className="mt-4 flex justify-between">
                            <button onClick={() => setStep('venue')} className="px-4 py-2 bg-gray-600 rounded-lg">Back</button>
                            <button onClick={handleGenerate} disabled={isLoading || !outfitPrompt} className="px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-lg disabled:bg-gray-500 flex items-center gap-2">
                                {isLoading ? <Spinner /> : "Generate Look"}
                            </button>
                        </div>
                         {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
                    </div>
                );
            case 'result':
                return (
                    <div>
                        <h3 className="text-2xl font-bold text-center text-cyan-300 mb-4">How's this?</h3>
                        {generatedImageUrl && (
                             <img src={generatedImageUrl} alt="Generated outfit for Maggie" className="w-full max-w-sm mx-auto aspect-[9/16] object-cover rounded-lg shadow-lg" />
                        )}
                        <div className="mt-4 flex justify-between">
                             <button onClick={() => setStep('outfit')} className="px-4 py-2 bg-gray-600 rounded-lg">Try Again</button>
                             <button onClick={handleSetAvatar} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg">Perfect! Let's Go.</button>
                        </div>
                    </div>
                );
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
                {renderContent()}
            </div>
        </div>
    );
};