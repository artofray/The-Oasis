import React, { useState, useEffect } from 'react';
import * as poolsideService from '../../../services/poolsideService';
import { useSpeech } from '../../../hooks/useSpeech';
import { GlassCard } from '../../ui/GlassCard';
import { WineIcon } from './Icons';

const WINE_LIST = [
    "Château Margaux 2015",
    "Screaming Eagle Cabernet Sauvignon 2018",
    "Domaine de la Romanée-Conti Grand Cru 2016",
    "Penfolds Grange 2017",
    "Cloudy Bay Sauvignon Blanc 2022",
    "Santa Margherita Pinot Grigio",
    "Veuve Clicquot Brut Yellow Label Champagne",
    "Opus One 2018"
];

interface TastingNotes {
    aroma: string;
    palate: string;
    finish: string;
    pairing: string;
}

export const WineCellarView: React.FC = () => {
    const [selectedWine, setSelectedWine] = useState<string | null>(null);
    const [notes, setNotes] = useState<TastingNotes | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { speak, stop, voices } = useSpeech();
    const [sommelierVoice, setSommelierVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (voices.length > 0) {
            const idealVoice = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.name.includes('David'));
            setSommelierVoice(idealVoice || voices.find(v => v.lang.startsWith('en')) || null);
        }
    }, [voices]);
    
    useEffect(() => {
        return () => stop();
    }, [stop]);

    const handleSelectWine = async (wineName: string) => {
        setSelectedWine(wineName);
        setIsLoading(true);
        setError(null);
        setNotes(null);
        try {
            const tastingNotes = await poolsideService.generateTastingNotes(wineName);
            setNotes(tastingNotes);
            const speechText = `An excellent choice. The ${wineName}. On the nose: ${tastingNotes.aroma}. The palate reveals ${tastingNotes.palate}. It has ${tastingNotes.finish}. I would recommend pairing it with ${tastingNotes.pairing}.`;
            if (sommelierVoice) {
                speak(speechText, { voice: sommelierVoice });
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full gap-6">
            <div className="w-1/3 flex flex-col">
                <GlassCard className="p-4 flex-1">
                    <h3 className="text-2xl font-bold text-purple-300 mb-4 font-playfair-display">The Cellar</h3>
                    <div className="space-y-2 overflow-y-auto pr-2">
                        {WINE_LIST.map(wine => (
                            <button key={wine} onClick={() => handleSelectWine(wine)} className={`w-full text-left p-3 rounded-lg transition-colors font-lora ${selectedWine === wine ? 'bg-purple-600/50' : 'hover:bg-gray-700'}`}>
                                {wine}
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>
            <div className="w-2/3 flex flex-col">
                <GlassCard className="flex-1 p-6 flex flex-col items-center justify-center bg-black/50">
                    {isLoading ? (
                        <div className="text-center">
                             <svg className="animate-spin h-10 w-10 text-purple-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-lg text-gray-300">Retrieving notes for {selectedWine}...</p>
                        </div>
                    ) : error ? (
                        <p className="text-red-400 text-center">{error}</p>
                    ) : notes ? (
                        <div className="w-full animate-fadeIn space-y-4">
                            <h3 className="text-3xl font-bold text-purple-300 font-playfair-display">{selectedWine}</h3>
                            <div className="p-4 bg-gray-900/50 rounded-lg">
                                <h4 className="font-semibold text-lg text-cyan-300">Aroma</h4>
                                <p className="text-gray-300 font-lora">{notes.aroma}</p>
                            </div>
                             <div className="p-4 bg-gray-900/50 rounded-lg">
                                <h4 className="font-semibold text-lg text-cyan-300">Palate</h4>
                                <p className="text-gray-300 font-lora">{notes.palate}</p>
                            </div>
                             <div className="p-4 bg-gray-900/50 rounded-lg">
                                <h4 className="font-semibold text-lg text-cyan-300">Finish</h4>
                                <p className="text-gray-300 font-lora">{notes.finish}</p>
                            </div>
                             <div className="p-4 bg-gray-900/50 rounded-lg">
                                <h4 className="font-semibold text-lg text-cyan-300">Pairing</h4>
                                <p className="text-gray-300 font-lora">{notes.pairing}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <WineIcon className="w-24 h-24 mx-auto mb-4 text-purple-400/50" />
                            <p className="text-xl">Welcome to the cellar.</p>
                            <p>Please select a wine from the list to see its tasting notes.</p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};
