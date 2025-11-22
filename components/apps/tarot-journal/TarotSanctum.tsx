
import React, { useState, useEffect } from 'react';
import type { TarotCard as TarotCardType, TarotSpreadType, SpreadPosition, TarotDeck } from '../../../types';
import * as tarotService from '../../../services/tarotService';
import { TarotCard } from './TarotCard';
import { GlassCard } from '../../ui/GlassCard';
import { useSpeech } from '../../../hooks/useSpeech';
import Spinner from './Spinner';

interface TarotSanctumProps {
    onClose: () => void;
    onSaveToJournal: (cards: TarotCardType[], interpretation: string) => void;
    unleashedMode: boolean;
    customDecks: TarotDeck[];
    onUpdateDeck: (deck: TarotDeck) => void;
}

const SPREADS: Record<TarotSpreadType, SpreadPosition[]> = {
    'One Card': [
        { id: 0, name: 'Insight', description: 'Daily guidance or simple answer.', x: 0, y: 0 }
    ],
    'Three Card': [
        { id: 0, name: 'Past', description: 'Influences from the past.', x: -1.5, y: 0 },
        { id: 1, name: 'Present', description: 'Current situation.', x: 0, y: 0 },
        { id: 2, name: 'Future', description: 'Likely outcome.', x: 1.5, y: 0 }
    ],
    'Celtic Cross': [
        { id: 0, name: 'The Heart', description: 'The core of the matter.', x: 0, y: 0 },
        { id: 1, name: 'The Crossing', description: 'What challenges you.', x: 0, y: 0 }, // Usually displayed rotated or on top
        { id: 2, name: 'The Root', description: 'Unconscious influences.', x: 0, y: 2.4 },
        { id: 3, name: 'The Past', description: 'Recent events.', x: -2.4, y: 0 },
        { id: 4, name: 'The Crown', description: 'Goals and aspirations.', x: 0, y: -2.4 },
        { id: 5, name: 'The Future', description: 'Near future.', x: 2.4, y: 0 },
        { id: 6, name: 'Self', description: 'Your attitude.', x: 4.5, y: 1.8 },
        { id: 7, name: 'Environment', description: 'External influences.', x: 4.5, y: 0.6 },
        { id: 8, name: 'Hopes & Fears', description: 'Psychological state.', x: 4.5, y: -0.6 },
        { id: 9, name: 'Outcome', description: 'Final result.', x: 4.5, y: -1.8 }
    ]
};

export const TarotSanctum: React.FC<TarotSanctumProps> = ({ onClose, onSaveToJournal, unleashedMode, customDecks, onUpdateDeck }) => {
    const [step, setStep] = useState<'setup' | 'reading'>('setup');
    const [spreadType, setSpreadType] = useState<TarotSpreadType>('Three Card');
    const [selectedDeckId, setSelectedDeckId] = useState<string>(''); // '' means standard
    const [tempTheme, setTempTheme] = useState(''); // For one-off generation without saving deck
    const [question, setQuestion] = useState('');
    const [cards, setCards] = useState<TarotCardType[]>([]);
    const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
    const [interpretation, setInterpretation] = useState('');
    const [isInterpreting, setIsInterpreting] = useState(false);
    
    const { speak, stop, voices } = useSpeech();
    const [maggieVoice, setMaggieVoice] = useState<SpeechSynthesisVoice | null>(null);

    const selectedDeck = customDecks.find(d => d.id === selectedDeckId);

    useEffect(() => {
        if (voices.length > 0) {
            const idealVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'));
            setMaggieVoice(idealVoice || voices[0]);
        }
    }, [voices]);

    useEffect(() => {
        return () => stop();
    }, [stop]);

    const handleDeal = () => {
        const positions = SPREADS[spreadType];
        const drawn = tarotService.drawCards(positions.length);
        
        // Pre-populate image URLs if using a custom deck that already has them
        if (selectedDeck) {
            drawn.forEach(card => {
                if (selectedDeck.cards[card.name]) {
                    card.imageUrl = selectedDeck.cards[card.name];
                }
            });
        }

        setCards(drawn);
        setStep('reading');
        setRevealedIndices(new Set());
        setInterpretation('');
    };

    const handleReveal = async (index: number) => {
        setRevealedIndices(prev => new Set(prev).add(index));
        
        const card = cards[index];
        
        // Lazy generation logic: If custom deck selected, and no image, generate and save.
        if (selectedDeck && !card.imageUrl) {
            const imageUrl = await tarotService.generateCardImage(card.name, selectedDeck.theme, unleashedMode);
            if (imageUrl) {
                // Update local card state
                setCards(prev => {
                    const newCards = [...prev];
                    newCards[index] = { ...newCards[index], imageUrl };
                    return newCards;
                });
                // Update the deck persistently
                onUpdateDeck({
                    ...selectedDeck,
                    cards: {
                        ...selectedDeck.cards,
                        [card.name]: imageUrl
                    }
                });
            }
        } else if (!selectedDeck && tempTheme && !card.imageUrl) {
             // One-off theme logic
             const imageUrl = await tarotService.generateCardImage(card.name, tempTheme, unleashedMode);
             if (imageUrl) {
                 setCards(prev => {
                    const newCards = [...prev];
                    newCards[index] = { ...newCards[index], imageUrl };
                    return newCards;
                });
             }
        }
    };

    const allRevealed = cards.length > 0 && revealedIndices.size === cards.length;

    useEffect(() => {
        if (allRevealed && !interpretation && !isInterpreting) {
            const interpret = async () => {
                setIsInterpreting(true);
                const result = await tarotService.interpretDigitalSpread(cards, spreadType, question, unleashedMode);
                setInterpretation(result);
                setIsInterpreting(false);
                if (maggieVoice) {
                    speak(result, { voice: maggieVoice, rate: 0.9 });
                }
            };
            interpret();
        }
    }, [allRevealed, interpretation, isInterpreting, cards, spreadType, question, unleashedMode, maggieVoice, speak]);

    const handleSave = () => {
        onSaveToJournal(cards, interpretation);
        onClose();
    };

    const getCardPositionStyle = (index: number, total: number) => {
        const positions = SPREADS[spreadType];
        const pos = positions[index];
        if (!pos) return {};
        const scale = 100; 
        const centerX = 50; 
        const centerY = 50;
        
        let zIndex = index;
        // Ensure the crossing card (1) is visually distinct
        if (spreadType === 'Celtic Cross') {
            if (index === 0) zIndex = 10;
            if (index === 1) zIndex = 20;
        }

        return {
            left: `calc(${centerX}% + ${pos.x * scale}px)`,
            top: `calc(${centerY}% + ${pos.y * scale * 1.2}px)`,
            transform: 'translate(-50%, -50%)',
            zIndex: zIndex
        };
    };

    return (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2d1b4e,_#000000)] flex flex-col z-50 overflow-hidden animate-fadeIn">
            <div className="p-4 flex justify-between items-center bg-black/30 backdrop-blur-sm border-b border-[#ffd700]/20 z-50">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-playfair-display text-[#ffd700] font-bold">Tarot Sanctum</h2>
                    {step === 'reading' && (
                        <div className="text-sm text-gray-400 border-l border-gray-600 pl-4 hidden sm:block">
                            <span className="text-purple-300">{spreadType}</span> • {question || "General Guidance"}
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="text-[#ffd700] hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 flex relative">
                <div className="w-80 hidden md:flex flex-col p-6 border-r border-[#ffd700]/10 bg-black/20 backdrop-blur-sm z-40">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-[#ffd700] p-1 shadow-[0_0_20px_#ffd70050] mb-4">
                            <img src="https://i.imgur.com/kQ1Y2wG.png" alt="Maggie" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <h3 className="text-xl font-bold text-[#ffd700] mb-1">Maggie</h3>
                        <p className="text-xs text-purple-300 uppercase tracking-widest mb-6">High Priestess</p>
                        
                        <div className="w-full bg-black/40 rounded-lg p-4 border border-purple-500/30 min-h-[200px]">
                            {step === 'setup' ? (
                                <p className="text-gray-300 italic font-lora">
                                    "Welcome to the Sanctum, seeker. How may the cards guide you today? Choose a spread and focus your intent."
                                </p>
                            ) : (
                                <div className="font-lora text-sm text-gray-200 max-h-[400px] overflow-y-auto custom-scrollbar space-y-2">
                                    {!allRevealed ? (
                                        <p className="animate-pulse text-purple-300">"Turn the cards when you are ready to receive their truth..."</p>
                                    ) : isInterpreting ? (
                                        <div className="flex items-center gap-2 text-[#ffd700]">
                                            <Spinner /> 
                                            <span>Consulting the ether...</span>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{interpretation}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        {step === 'reading' && allRevealed && !isInterpreting && (
                            <button onClick={handleSave} className="w-full mt-4 py-2 bg-[#ffd700]/20 hover:bg-[#ffd700]/40 border border-[#ffd700] text-[#ffd700] rounded-lg transition-all font-bold">
                                Save to Journal
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden flex items-center justify-center perspective-1000">
                    {step === 'setup' ? (
                        <GlassCard className="max-w-lg w-full p-8 bg-black/50 border-[#ffd700]/30 animate-fadeInUp">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[#ffd700] mb-2 font-playfair-display text-lg">Select Spread</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.keys(SPREADS).map(s => (
                                            <button 
                                                key={s} 
                                                onClick={() => setSpreadType(s as TarotSpreadType)}
                                                className={`py-3 px-2 rounded border transition-all text-sm font-bold ${spreadType === s ? 'bg-[#ffd700] text-black border-[#ffd700]' : 'bg-transparent text-gray-400 border-gray-600 hover:border-[#ffd700]'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[#ffd700] mb-2 font-playfair-display text-lg">Your Question</label>
                                    <input 
                                        type="text" 
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        placeholder="What do I need to know right now?"
                                        className="w-full bg-black/50 border border-purple-500/50 rounded p-3 text-white focus:ring-2 focus:ring-[#ffd700] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[#ffd700] mb-2 font-playfair-display text-lg">Select Deck</label>
                                    <select
                                        value={selectedDeckId}
                                        onChange={(e) => setSelectedDeckId(e.target.value)}
                                        className="w-full bg-black/50 border border-purple-500/50 rounded p-3 text-white focus:ring-2 focus:ring-[#ffd700] outline-none"
                                    >
                                        <option value="">Standard Rider-Waite</option>
                                        <option value="temp">-- One-time Custom Theme --</option>
                                        {customDecks.map(deck => (
                                            <option key={deck.id} value={deck.id}>{deck.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {selectedDeckId === 'temp' && (
                                    <div>
                                        <label className="block text-[#ffd700] mb-2 font-playfair-display text-lg">Temporary Theme</label>
                                        <input 
                                            type="text" 
                                            value={tempTheme}
                                            onChange={(e) => setTempTheme(e.target.value)}
                                            placeholder="e.g. 'Steampunk', 'Watercolor Animals'"
                                            className="w-full bg-black/50 border border-purple-500/50 rounded p-3 text-white focus:ring-2 focus:ring-[#ffd700] outline-none"
                                        />
                                    </div>
                                )}

                                <button 
                                    onClick={handleDeal}
                                    className="w-full py-4 bg-gradient-to-r from-purple-900 to-black border border-[#ffd700] text-[#ffd700] font-bold text-xl tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_#ffd70030]"
                                >
                                    DEAL CARDS
                                </button>
                            </div>
                        </GlassCard>
                    ) : (
                        <div className="w-full h-full relative overflow-auto flex items-center justify-center">
                            {!allRevealed && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-gray-300 text-sm pointer-events-none z-50 whitespace-nowrap">
                                    Click cards to reveal your fate
                                </div>
                            )}
                            
                            {/* Scaled container to fit large spreads */}
                            <div className="absolute inset-0 flex items-center justify-center transform scale-[0.55] sm:scale-[0.65] md:scale-[0.75] lg:scale-90 xl:scale-100 transition-transform origin-center">
                                {cards.map((card, index) => {
                                    const pos = SPREADS[spreadType][index];
                                    const isCrossing = spreadType === 'Celtic Cross' && index === 1;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className="absolute transition-all duration-1000"
                                            style={{ 
                                                ...getCardPositionStyle(index, cards.length),
                                                transform: isCrossing ? 'translate(-50%, -50%) rotate(90deg)' : 'translate(-50%, -50%)'
                                            }}
                                        >
                                            {revealedIndices.has(index) && (
                                                <div 
                                                    className={`absolute -top-10 w-40 text-center text-xs text-[#ffd700] font-bold bg-black/70 px-2 py-1 rounded opacity-0 animate-fadeIn ${isCrossing ? '-rotate-90 origin-bottom-left translate-y-12 -translate-x-10' : 'left-1/2 -translate-x-1/2'}`}
                                                    style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
                                                >
                                                    {pos.name}
                                                </div>
                                            )}
                                            
                                            <TarotCard 
                                                card={card}
                                                isRevealed={revealedIndices.has(index)}
                                                onReveal={() => handleReveal(index)}
                                                theme={selectedDeckId === 'temp' ? tempTheme : ''}
                                                unleashedMode={unleashedMode}
                                                index={index}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
                                <button onClick={() => setStep('setup')} className="text-gray-500 hover:text-white underline">
                                    End Reading
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
