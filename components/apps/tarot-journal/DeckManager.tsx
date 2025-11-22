
import React, { useState, useMemo } from 'react';
import type { TarotDeck } from '../../../types';
import { GlassCard } from '../../ui/GlassCard';
import { PlusIcon, TrashIcon, XIcon, EditIcon, CameraIcon } from './Icons';
import { getFullDeck, generateCardImage } from '../../../services/tarotService';
import Spinner from './Spinner';

interface DeckManagerProps {
    isOpen: boolean;
    onClose: () => void;
    customDecks: TarotDeck[];
    setCustomDecks: (updater: (prev: TarotDeck[]) => TarotDeck[]) => void;
    unleashedMode: boolean;
}

export const DeckManager: React.FC<DeckManagerProps> = ({ isOpen, onClose, customDecks, setCustomDecks, unleashedMode }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
    
    // Form State
    const [deckName, setDeckName] = useState('');
    const [deckTheme, setDeckTheme] = useState('');
    
    // Generator State
    const [selectedCardToGen, setSelectedCardToGen] = useState(getFullDeck()[0].name);
    const [isGenerating, setIsGenerating] = useState(false);

    const fullDeckList = useMemo(() => getFullDeck(), []);
    const activeDeck = customDecks.find(d => d.id === editingDeckId);

    const handleCreateDeck = () => {
        if (!deckName.trim()) return;

        const newDeck: TarotDeck = {
            id: `deck-${Date.now()}`,
            name: deckName,
            theme: deckTheme || 'Mystical, detailed, high fantasy',
            cards: {}
        };

        setCustomDecks(prev => [...prev, newDeck]);
        setDeckName('');
        setDeckTheme('');
        setIsCreating(false);
    };

    const handleDeleteDeck = (deckId: string) => {
        if (window.confirm("Are you sure you want to delete this deck? All generated card images will be lost.")) {
            setCustomDecks(prev => prev.filter(d => d.id !== deckId));
            if (editingDeckId === deckId) setEditingDeckId(null);
        }
    };

    const startEditing = (deck: TarotDeck) => {
        setEditingDeckId(deck.id);
        setDeckName(deck.name);
        setDeckTheme(deck.theme);
    };

    const saveChanges = () => {
        if (activeDeck) {
            setCustomDecks(prev => prev.map(d => d.id === activeDeck.id ? { ...d, name: deckName, theme: deckTheme } : d));
            alert('Deck updated successfully.');
        }
    };

    const handleGenerateCard = async () => {
        if (!activeDeck || !selectedCardToGen) return;
        setIsGenerating(true);
        try {
            const imageUrl = await generateCardImage(selectedCardToGen, deckTheme || activeDeck.theme, unleashedMode);
            if (imageUrl) {
                setCustomDecks(prev => prev.map(d => d.id === activeDeck.id ? {
                    ...d,
                    cards: { ...d.cards, [selectedCardToGen]: imageUrl }
                } : d));
            }
        } catch (error) {
            console.error("Failed to generate card:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    // --- VIEW: DECK EDITOR ---
    if (editingDeckId && activeDeck) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col relative border border-gray-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-6 border-b border-gray-700">
                        <h2 className="text-2xl font-bold text-purple-300 font-playfair-display">Edit Deck: {activeDeck.name}</h2>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingDeckId(null)} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Back to List</button>
                            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                                <XIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Sidebar: Settings & Generator */}
                        <div className="w-full md:w-1/3 p-6 border-r border-gray-700 bg-black/20 overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Deck Name</label>
                                    <input 
                                        type="text" 
                                        value={deckName}
                                        onChange={(e) => setDeckName(e.target.value)}
                                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Art Style / Theme</label>
                                    <textarea 
                                        value={deckTheme}
                                        onChange={(e) => setDeckTheme(e.target.value)}
                                        className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    />
                                </div>
                                <button onClick={saveChanges} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold">Save Details</button>

                                <hr className="border-gray-700" />

                                <div>
                                    <label className="block text-sm font-medium text-purple-300 mb-2">Conjure Card</label>
                                    <select 
                                        value={selectedCardToGen}
                                        onChange={(e) => setSelectedCardToGen(e.target.value)}
                                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white mb-3"
                                    >
                                        {fullDeckList.map(card => (
                                            <option key={card.name} value={card.name}>{card.name} {activeDeck.cards[card.name] ? '✓' : ''}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={handleGenerateCard}
                                        disabled={isGenerating}
                                        className="w-full py-3 bg-gradient-to-r from-purple-900 to-black border border-[#ffd700] text-[#ffd700] rounded-lg font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        {isGenerating ? <Spinner /> : <><CameraIcon className="w-5 h-5" /> Generate Image</>}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Main: Card Grid */}
                        <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-black/40">
                            <h3 className="text-xl font-bold text-white mb-4">Collection ({Object.keys(activeDeck.cards).length} / 78)</h3>
                            {Object.keys(activeDeck.cards).length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                                    <p>No cards generated yet.</p>
                                    <p className="text-sm">Use the 'Conjure Card' tool or perform readings to build your deck.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {Object.entries(activeDeck.cards).map(([cardName, imageUrl]) => (
                                        <div key={cardName} className="relative group aspect-[9/16] rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                                            <img src={imageUrl} alt={cardName} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent opacity-100 flex flex-col justify-end p-2">
                                                <p className="text-xs font-bold text-[#ffd700] truncate">{cardName}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: LIST OF DECKS ---
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative border border-gray-700 animate-scaleIn" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <XIcon className="h-6 w-6" />
                </button>

                <h2 className="text-2xl font-bold text-purple-300 mb-6 font-playfair-display">Tarot Deck Manager</h2>

                {!isCreating ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                            {/* Default Deck Card */}
                            <GlassCard className="p-4 border-purple-500/20 bg-gray-800/50 opacity-75">
                                <h3 className="font-bold text-white text-lg">Standard Rider-Waite</h3>
                                <p className="text-sm text-gray-400 mb-2">Classic symbolism.</p>
                                <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">System Default</span>
                            </GlassCard>

                            {/* Custom Decks */}
                            {customDecks.map(deck => (
                                <GlassCard key={deck.id} className="p-4 border-purple-500/20 relative group hover:border-purple-500/50 transition-colors">
                                    <h3 className="font-bold text-white text-lg truncate">{deck.name}</h3>
                                    <p className="text-sm text-gray-400 mb-2 line-clamp-2 h-10">{deck.theme}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-purple-300">{Object.keys(deck.cards).length} cards generated</span>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => startEditing(deck)}
                                                className="p-2 bg-blue-900/50 hover:bg-blue-700 text-blue-200 rounded-full transition-colors"
                                                title="Edit / View Deck"
                                            >
                                                <EditIcon className="h-4 w-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteDeck(deck.id)}
                                                className="p-2 bg-red-900/50 hover:bg-red-700 text-red-200 rounded-full transition-colors"
                                                title="Delete Deck"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="w-full py-3 mt-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-300 transition-colors flex items-center justify-center gap-2"
                        >
                            <PlusIcon className="h-6 w-6" />
                            Create New Deck
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Deck Name</label>
                            <input 
                                type="text" 
                                value={deckName}
                                onChange={(e) => setDeckName(e.target.value)}
                                placeholder="e.g. Cyberpunk Oracle"
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Art Style / Theme Prompt</label>
                            <textarea 
                                value={deckTheme}
                                onChange={(e) => setDeckTheme(e.target.value)}
                                placeholder="Describe the visual style for the cards (e.g., 'Neon noir, rainy city streets, high tech low life, digital painting')."
                                className="w-full h-32 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Cards will be generated using this theme.</p>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button 
                                onClick={() => setIsCreating(false)}
                                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCreateDeck}
                                disabled={!deckName.trim()}
                                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Deck
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
