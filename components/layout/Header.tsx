import React from 'react';
import { SentinelStatus } from '../features/SentinelStatus';

interface HeaderProps {
    unleashedMode: boolean;
    setUnleashedMode: (mode: boolean) => void;
    onSaveState: () => void;
    isSaving: boolean;
    saveStatus: 'idle' | 'success' | 'error';
    agentCount: number;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const SaveButton: React.FC<{ onClick: () => void; isSaving: boolean; status: 'idle' | 'success' | 'error' }> = ({ onClick, isSaving, status }) => {
    let content;
    let colorClasses = "bg-gray-700 hover:bg-gray-600";

    if (isSaving) {
        content = <><svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</>;
        colorClasses = "bg-cyan-700";
    } else if (status === 'success') {
        content = <><CheckIcon className="h-4 w-4 mr-2" />Saved</>;
        colorClasses = "bg-green-600";
    } else if (status === 'error') {
        content = <>Save Failed</>;
        colorClasses = "bg-red-600";
    } else {
        content = <>Save State</>;
    }

    return (
        <button 
            onClick={onClick} 
            disabled={isSaving}
            className={`px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors duration-300 flex items-center ${colorClasses}`}
        >
            {content}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ unleashedMode, setUnleashedMode, onSaveState, isSaving, saveStatus, agentCount }) => {
    
    return (
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-4 md:px-6 border-b border-gray-800 bg-[#161b22]">
            <div className="flex items-center gap-2">
                <SaveButton onClick={onSaveState} isSaving={isSaving} status={saveStatus} />
                 <button className="px-3 py-1.5 text-xs font-semibold text-white rounded-md bg-gray-700 hover:bg-gray-600">U</button>
                 <button className="px-3 py-1.5 text-xs font-semibold text-white rounded-md bg-gray-700 hover:bg-gray-600">B</button>
            </div>
            <div className="flex items-center gap-6">
                 <label htmlFor="unleashed-toggle" className="flex items-center cursor-pointer group">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            id="unleashed-toggle" 
                            className="sr-only" 
                            checked={unleashedMode} 
                            onChange={(e) => setUnleashedMode(e.target.checked)}
                        />
                        <div className={`block w-10 h-5 rounded-full transition-colors ${unleashedMode ? 'bg-fuchsia-600' : 'bg-gray-600'}`}></div>
                        <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${unleashedMode ? 'transform translate-x-5' : ''}`}></div>
                    </div>
                    <div className={`ml-3 text-sm font-semibold transition-all ${unleashedMode ? 'text-fuchsia-400' : 'text-gray-400'}`}>
                        Unleashed Mode
                    </div>
                </label>
                <SentinelStatus agentCount={agentCount} />
            </div>
        </header>
    );
};