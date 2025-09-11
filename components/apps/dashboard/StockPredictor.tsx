import React, { useState } from 'react';
import { GlassCard } from '../../ui/GlassCard';
import { getStockAnalysis } from '../../../services/marketService';
import type { StockAnalysis } from '../../../types';

const BullIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17.5V15a2.5 2.5 0 00-5 0v2.5M13 7.5V10a2.5 2.5 0 01-5 0V7.5" />
    </svg>
);
const BearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
);
const NeutralIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const Spinner: React.FC = () => (
    <svg className="animate-spin h-8 w-8 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const StockPredictor: React.FC = () => {
    const [ticker, setTicker] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!ticker.trim()) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await getStockAnalysis(ticker.trim().toUpperCase());
            setAnalysis(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAnalyze();
        }
    }

    const sentimentStyles: { [key: string]: { icon: React.ReactNode; color: string } } = {
        'Bullish': { icon: <BullIcon />, color: 'text-green-400' },
        'Bearish': { icon: <BearIcon />, color: 'text-red-400' },
        'Neutral': { icon: <NeutralIcon />, color: 'text-yellow-400' },
    };

    return (
        <GlassCard className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-amber-300 mb-4">Market Pulse</h2>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter Ticker (e.g., GOOGL)"
                    className="flex-1 bg-gray-800 border border-amber-500/50 rounded-lg py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !ticker}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Analyze
                </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {analysis && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <h3 className="text-xl font-bold text-white">{analysis.companyName} ({analysis.ticker})</h3>
                            <div className={`flex items-center gap-2 font-semibold ${sentimentStyles[analysis.sentiment]?.color || 'text-gray-400'}`}>
                                {sentimentStyles[analysis.sentiment]?.icon}
                                <span>{analysis.sentiment} Sentiment</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-300">{analysis.summary}</p>
                        <div>
                            <h4 className="font-semibold text-amber-300 mb-2">Key Factors to Watch</h4>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                {analysis.keyFactors.map((factor, index) => (
                                    <li key={index}>{factor}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center border-t border-gray-700 pt-2">
                AI-generated analysis for informational purposes only. This is not financial advice.
            </p>
        </GlassCard>
    );
};