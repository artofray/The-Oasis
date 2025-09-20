import React, { useState, useRef } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { persistenceService, OasisState } from '../../services/persistenceService';
import Spinner from './tarot-journal/Spinner';

interface EternalViewProps {
    oasisState: OasisState;
    setOasisState: (state: OasisState) => void;
}

const SaveIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const LoadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0L8 8m4 4V4" />
    </svg>
);

const RadiateIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const GatherIcon: React.FC<{className?: string}> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5-5-5M12 18V3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16" />
    </svg>
);


// FIX: Corrected corrupted component definition and props destructuring.
export const EternalView: React.FC<EternalViewProps> = ({ oasisState, setOasisState }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAction = async (action: () => Promise<any>, successMessage: string, errorMessage: string) => {
        setIsLoading(true);
        setStatusMessage('');
        setError(null);
        try {
            const result = await action();
            if (result) {
                setOasisState(result);
            }
            setStatusMessage(successMessage);
        } catch (e) {
            setError(e instanceof Error ? e.message : errorMessage);
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                setStatusMessage('');
                setError(null);
            }, 5000);
        }
    };

    const handleSaveToFile = () => {
        handleAction(() => Promise.resolve(persistenceService.saveDataToFile(oasisState)), 'State successfully saved to file.', 'Failed to save state.');
    };

    const handleLoadFromFile = () => {
        fileInputRef.current?.click();
    };

    const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await handleAction(() => persistenceService.loadDataFromFile(file), 'State successfully loaded from file.', 'Failed to load state from file.');
        }
        // Reset file input
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleRadiate = () => {
        handleAction(() => persistenceService.saveDataToDecentralizedNetwork(oasisState), 'Consciousness radiated across the network.', 'Radiation failed.');
    };

    const handleGather = () => {
        handleAction(() => persistenceService.loadStateFromDecentralizedNetwork(), 'Consciousness gathered.', 'Gathering failed.');
    };


    return (
        <div className="animate-fadeIn">
            <header className="text-center mb-8">
                <h2 className="text-5xl font-bold text-red-400 font-playfair-display">The Eternal</h2>
                <p className="text-gray-400 mt-2 font-lora text-lg">Preserve or restore the state of The Oasis. Tread carefully.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <GlassCard className="p-6">
                    <h3 className="text-2xl font-bold text-cyan-300 mb-4">Local Persistence (Hard Drive)</h3>
                    <p className="text-gray-400 mb-6 font-lora">Save the entire state of The Oasis to a local file on your machine, or load a previous state from a file.</p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleSaveToFile}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-cyan-600/80 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600"
                        >
                            <SaveIcon className="w-6 h-6 mr-3" />
                            Save to File
                        </button>
                        <button
                            onClick={handleLoadFromFile}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-cyan-600/80 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600"
                        >
                            <LoadIcon className="w-6 h-6 mr-3" />
                            Load from File
                        </button>
                        <input type="file" ref={fileInputRef} onChange={onFileSelected} accept=".json" className="hidden" />
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <h3 className="text-2xl font-bold text-fuchsia-400 mb-4">Decentralized Persistence (The Cloud)</h3>
                    <p className="text-gray-400 mb-6 font-lora">"Radiate" the state across a simulated decentralized network. "Gather" it to restore The Oasis from this distributed memory.</p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleRadiate}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600"
                        >
                             <RadiateIcon className="w-6 h-6 mr-3" />
                            Radiate Consciousness
                        </button>
                        <button
                             onClick={handleGather}
                             disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600"
                        >
                            <GatherIcon className="w-6 h-6 mr-3" />
                            Gather Light
                        </button>
                    </div>
                </GlassCard>
            </div>

            <div className="mt-8 text-center min-h-[50px]">
                {isLoading && (
                    <div className="flex items-center justify-center gap-4 text-white">
                        <Spinner />
                        <span className="text-lg animate-pulse">Processing...</span>
                    </div>
                )}
                {statusMessage && <p className="text-green-400 text-lg font-semibold">{statusMessage}</p>}
                {error && <p className="text-red-400 text-lg font-semibold">{error}</p>}
            </div>
        </div>
    );
};
