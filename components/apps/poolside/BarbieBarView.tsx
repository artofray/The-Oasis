import React, { useState, useEffect } from 'react';
import type { RoundTableAgent } from '../../../types';
import * as poolsideService from '../../../services/poolsideService';
import { useSpeech } from '../../../hooks/useSpeech';
import { useTypedText } from '../../../hooks/useTypedText';
import { GlassCard } from '../../ui/GlassCard';
import { AgentAvatar } from '../round-table/AgentAvatar';
import { BarIcon } from './Icons';

interface BarbieBarViewProps {
    bartender: RoundTableAgent;
}

interface Cocktail {
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    garnish: string;
}

export const BarbieBarView: React.FC<BarbieBarViewProps> = ({ bartender }) => {
    const [prompt, setPrompt] = useState('');
    const [cocktail, setCocktail] = useState<Cocktail | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { speak, stop, voices } = useSpeech();
    
    const welcomeMessage = `Hi, welcome to the bar! I'm ${bartender.name}. What can I get for you? You can ask for a classic, or describe some flavors you like.`;
    const { displayText: typedWelcome } = useTypedText(cocktail ? '' : welcomeMessage, 40);
    const [bartenderVoice, setBartenderVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (voices.length > 0) {
            const idealVoice = voices.find(v => v.name.includes('Google US English') && v.name.includes('Female')) || voices.find(v => v.lang === 'en-US' && v.name.includes('Female'));
            setBartenderVoice(idealVoice || voices.find(v => v.lang.startsWith('en')) || null);
        }
    }, [voices]);
    
    useEffect(() => {
        // Stop any speech on component unmount
        return () => stop();
    }, [stop]);

    const handleGenerateCocktail = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError(null);
        setCocktail(null);
        try {
            const recipe = await poolsideService.generateCocktailRecipe(prompt);
            setCocktail(recipe);
            const speechText = `Of course! Here is the recipe for a "${recipe.name}". ${recipe.description}. Enjoy!`;
            if (bartenderVoice) {
                speak(speechText, { voice: bartenderVoice });
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 flex flex-col items-center">
                <GlassCard className="p-4 w-full text-center">
                    <div className="mx-auto mb-4">
                        <AgentAvatar agent={bartender} size="lg" />
                    </div>
                    <h2 className="text-2xl font-bold text-pink-300">{bartender.name}</h2>
                    <p className="text-sm text-gray-400">{bartender.description}</p>
                </GlassCard>
            </div>
            <div className="w-2/3 flex flex-col">
                <GlassCard className="flex-1 p-6 flex flex-col bg-black/50">
                    <div className="flex-1 overflow-y-auto pr-2">
                        {cocktail ? (
                            <div className="animate-fadeIn">
                                <h3 className="text-3xl font-bold text-pink-400 font-playfair-display">{cocktail.name}</h3>
                                <p className="text-gray-300 italic mb-4">{cocktail.description}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-lg text-cyan-300 mb-2">Ingredients</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1 font-lora">
                                            {cocktail.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-cyan-300 mb-2">Instructions</h4>
                                        <ol className="list-decimal list-inside text-gray-300 space-y-1 font-lora">
                                            {cocktail.instructions.map((step, i) => <li key={i}>{step}</li>)}
                                        </ol>
                                        <p className="mt-4"><span className="font-semibold text-cyan-300">Garnish:</span> {cocktail.garnish}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center flex flex-col items-center justify-center h-full">
                                <BarIcon className="w-20 h-20 text-pink-400/50 mb-4" />
                                <p className="text-lg text-gray-300 max-w-sm">{typedWelcome}</p>
                                {error && <p className="text-red-400 mt-4">{error}</p>}
                            </div>
                        )}
                    </div>
                    <div className="mt-auto pt-4 border-t border-pink-400/20">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleGenerateCocktail()}
                                placeholder="e.g., 'a classic old fashioned' or 'something fruity and refreshing'"
                                className="flex-1 bg-gray-800 border border-pink-500/50 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                disabled={isLoading}
                            />
                            <button onClick={handleGenerateCocktail} disabled={isLoading || !prompt} className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {isLoading ? 'Mixing...' : 'Order'}
                            </button>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
