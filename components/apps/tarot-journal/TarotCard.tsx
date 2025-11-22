
import React, { useState, useEffect } from 'react';
import type { TarotCard as TarotCardType } from '../../../types';
import * as tarotService from '../../../services/tarotService';
import Spinner from './Spinner';

interface TarotCardProps {
    card: TarotCardType;
    isRevealed: boolean;
    onReveal: () => void;
    theme: string;
    unleashedMode: boolean;
    index: number;
}

export const TarotCard: React.FC<TarotCardProps> = ({ card, isRevealed, onReveal, theme, unleashedMode, index }) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoadingImage, setIsLoadingImage] = useState(false);

    useEffect(() => {
        // If a theme is set, we generate the image ONLY when revealed to save resources/time
        if (isRevealed && theme && !imageUrl && !card.imageUrl) {
            const generate = async () => {
                setIsLoadingImage(true);
                const url = await tarotService.generateCardImage(card.name, theme, unleashedMode);
                setImageUrl(url);
                setIsLoadingImage(false);
            };
            generate();
        } else if (card.imageUrl) {
            setImageUrl(card.imageUrl);
        }
    }, [isRevealed, theme, card.name, unleashedMode, card.imageUrl]);

    // Placeholder illustration for default deck (no custom generation)
    // We use a simple gradient or text if no theme is selected
    const defaultContent = (
        <div className="h-full w-full bg-[#1a1a2e] border-2 border-[#ffd700] rounded-lg flex flex-col items-center justify-center p-2 text-center">
            <div className="text-xs text-[#ffd700] uppercase tracking-widest mb-2">{card.suit || "Major"}</div>
            <div className="text-lg font-bold text-white font-playfair-display">{card.name}</div>
            {card.isReversed && <div className="text-xs text-red-400 mt-2">(Reversed)</div>}
            <div className="mt-4 text-2xl text-[#ffd700] opacity-50">
                {card.suit === 'Swords' ? '⚔️' : card.suit === 'Cups' ? '🏆' : card.suit === 'Wands' ? '🪄' : card.suit === 'Pentacles' ? '🪙' : '🔮'}
            </div>
        </div>
    );

    return (
        <div 
            className={`relative w-32 h-52 sm:w-40 sm:h-64 perspective-1000 cursor-pointer transition-transform duration-500 hover:scale-105`}
            onClick={!isRevealed ? onReveal : undefined}
            style={{ transitionDelay: `${index * 100}ms` }}
        >
            <div className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d ${isRevealed ? 'rotate-y-180' : ''}`}>
                {/* Card Back */}
                <div className="absolute w-full h-full backface-hidden rounded-lg shadow-2xl">
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#2d1b4e] to-[#000] border-2 border-[#ffd700]/50 flex items-center justify-center overflow-hidden">
                        {/* Geometric pattern for card back */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                        <div className="w-20 h-20 rounded-full border border-[#ffd700]/30 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border border-[#ffd700]/30 rotate-45"></div>
                        </div>
                    </div>
                </div>

                {/* Card Front */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-lg shadow-xl bg-[#0d1117] overflow-hidden">
                    {imageUrl ? (
                        <div className="relative w-full h-full">
                            <img 
                                src={imageUrl} 
                                alt={card.name} 
                                className={`w-full h-full object-cover ${card.isReversed ? 'rotate-180' : ''}`} 
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 backdrop-blur-sm">
                                <p className="text-xs text-[#ffd700] font-bold truncate">{card.name}</p>
                                {card.isReversed && <p className="text-[10px] text-red-400 uppercase">Reversed</p>}
                            </div>
                        </div>
                    ) : isLoadingImage ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#1a1a2e] border-2 border-[#ffd700]">
                            <Spinner />
                            <p className="text-xs text-[#ffd700] mt-2 animate-pulse">Conjuring...</p>
                        </div>
                    ) : (
                        defaultContent
                    )}
                </div>
            </div>
        </div>
    );
};
