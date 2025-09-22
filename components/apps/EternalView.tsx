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

const CloudSaveIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 11v6m0 0l-2-2m2 2l2-2" />
    </svg>
);

const CloudLoadIcon: React.FC<{className?: string}> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
);

const ResetIcon: React.FC<{className?: string}> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.13-5.23M20 15a9 9 0 01-14.13 5.23" />
    </svg>
);

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
            // If the action returns a new state (like loading), update it.
            if (result && typeof result === 'object' && 'agents' in result) {
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
        if (event.target) {
            event.target.value = '';
        }
    };

    const handleSaveToCloud = () => {
        handleAction(() => persistenceService.saveDataToDecentralizedNetwork(oasisState), 'State saved to the cloud network.', 'Cloud save failed.');
    };

    const handleLoadFromCloud = () => {
        handleAction(() => persistenceService.loadStateFromDecentralizedNetwork(), 'State loaded from the cloud network.', 'Cloud load failed.');
    };
    
    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all data to factory defaults? This cannot be undone.")) {
            handleAction(() => Promise.resolve(persistenceService.getDefaultState()), 'System reset to factory defaults.', 'Reset failed.');
        }
    }


    return (
        <div className="animate-fadeIn">
            <header className="text-center mb-8">
                <h2 className="text-5xl font-bold text-red-400 font-playfair-display">The Eternal</h2>
                <p className="text-gray-400 mt-2 font-lora text-lg">Preserve or restore the state of The Oasis. Your creations are sacred.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <GlassCard className="p-6">
                    <h3 className="text-2xl font-bold text-cyan-300 mb-4">Cloud Network (Local Browser)</h3>
                    <p className="text-gray-400 mb-6 font-lora h-20">Saves your current state to this browser's local storage. Allows you to close the tab and return later. Use the "Save State" button in the header for quick saves.</p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleSaveToCloud}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-cyan-600/80 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600"
                        >
                             <CloudSaveIcon className="w-6 h-6 mr-3" />
                            Save to Browser
                        </button>
                        <button
                             onClick={handleLoadFromCloud}
                             disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-cyan-600/80 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600"
                        >
                            <CloudLoadIcon className="w-6 h-6 mr-3" />
                            Load from Browser
                        </button>
                    </div>
                </GlassCard>

                 <GlassCard className="p-6">
                    <h3 className="text-2xl font-bold text-fuchsia-400 mb-4">File Backup & Reset</h3>
                    <p className="text-gray-400 mb-6 font-lora h-20">Export your state to a physical file for permanent backup or to move to another computer. You can also reset the entire system to its default state.</p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleSaveToFile}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600"
                        >
                            <SaveIcon className="w-6 h-6 mr-3" />
                            Export to File
                        </button>
                        <button
                            onClick={handleLoadFromFile}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center px-6 py-3 bg-fuchsia-600/80 hover:bg-fuchsia-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600"
                        >
                            <LoadIcon className="w-6 h-6 mr-3" />
                            Import from File
                        </button>
                        <input type="file" ref={fileInputRef} onChange={onFileSelected} accept=".json" className="hidden" />
                         <button
                            onClick={handleReset}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center mt-4 px-6 py-3 bg-red-800/80 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-600 border-2 border-red-800 hover:border-red-600"
                        >
                            <ResetIcon className="w-6 h-6 mr-3" />
                            Reset to Factory Defaults
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
