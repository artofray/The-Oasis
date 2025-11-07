import React, { useState } from 'react';
import { SentinelStatus } from '../features/SentinelStatus';

interface HeaderProps {
    unleashedMode: boolean;
    setUnleashedMode: (mode: boolean) => void;
    saveState: () => Promise<boolean>;
}

const UnleashedIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.01 2.01c5.52 0 9.99 4.47 9.99 9.99s-4.47 9.99-9.99 9.99-9.99-4.47-9.99-9.99 4.47-9.99 9.99-9.99zm0 17.98c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8zm-.01-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
        <path d="M12.01 2.01c5.52 0 9.99 4.47 9.99 9.99s-4.47 9.99-9.99 9.99-9.99-4.47-9.99-9.99 4.47-9.99 9.99-9.99zm0 17.98c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8zm-.01-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" opacity=".2"/>
        <path d="M12.01 2.01c5.52 0 9.99 4.47 9.99 9.99s-4.47 9.99-9.99 9.99-9.99-4.47-9.99-9.99 4.47-9.99 9.99-9.99zm0 17.98c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8zm-.01-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" opacity=".2" transform="rotate(45 12 12)"/>
    </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M12 11v6m0 0l-2-2m2 2l2-2" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const Header: React.FC<HeaderProps> = ({ unleashedMode, setUnleashedMode, saveState }) => {
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const handleSave = async () => {
        setSaveStatus('saving');
        const success = await saveState();
        if (success) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 2500);
        }
    };
    
    const getSaveButtonContent = () => {
        switch (saveStatus) {
            case 'saving':
                return <><svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>;
            case 'saved':
                return <><CheckIcon className="h-5 w-5 mr-2 animate-popIn" />Saved!</>;
            case 'error':
                return <><ErrorIcon className="h-5 w-5 mr-2" />Save Failed</>;
            case 'idle':
            default:
                return <><SaveIcon className="h-5 w-5 mr-2" />Save State</>;
        }
    };

    return (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-red-400/20">
            <h1 className="text-xl font-bold text-gray-200 tracking-wider">
                <span className="text-red-400">Maggie's Oasis</span>
            </h1>
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <button 
                        onClick={handleSave}
                        disabled={saveStatus !== 'idle'}
                        className={`flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 w-32 ${
                            saveStatus === 'saved' 
                                ? 'bg-green-600 text-white' 
                            : saveStatus === 'error'
                                ? 'bg-red-600 text-white'
                                : 'bg-cyan-600/80 hover:bg-cyan-600 text-white disabled:bg-gray-500'
                        }`}
                    >
                        {getSaveButtonContent()}
                    </button>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20">
                        Saves the current state to this browser.
                    </div>
                </div>
                 <label htmlFor="unleashed-toggle" className="flex items-center cursor-pointer group">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            id="unleashed-toggle" 
                            className="sr-only" 
                            checked={unleashedMode} 
                            onChange={(e) => setUnleashedMode(e.target.checked)}
                        />
                        <div className={`block w-12 h-6 rounded-full transition-colors ${unleashedMode ? 'bg-fuchsia-600' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${unleashedMode ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className={`ml-3 font-semibold transition-all ${unleashedMode ? 'text-fuchsia-400' : 'text-gray-400'}`}>
                        Unleashed Mode
                    </div>
                    {unleashedMode && (
                         <div className="absolute -top-1 -right-1">
                            <UnleashedIcon className="w-6 h-6 text-fuchsia-400 animate-spin" style={{ animationDuration: '3s' }}/>
                        </div>
                    )}
                </label>
                <SentinelStatus />
            </div>
        </header>
    );
};