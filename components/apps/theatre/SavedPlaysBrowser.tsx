import React from 'react';
import type { SavedPlay } from '../../../types';
import { FolderOpenIcon, TrashIcon, XIcon } from '../round-table/Icons';

interface SavedPlaysBrowserProps {
    isOpen: boolean;
    onClose: () => void;
    plays: SavedPlay[];
    onLoad: (play: SavedPlay) => void;
    onDelete: (playId: string) => void;
}

export const SavedPlaysBrowser: React.FC<SavedPlaysBrowserProps> = ({ isOpen, onClose, plays, onLoad, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex justify-end" onClick={onClose}>
            <div className="w-full max-w-md h-full bg-[#161B22] border-l border-gray-700 shadow-2xl p-4 flex flex-col animate-slideInRight" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-cyan-300 font-playfair-display">Load a Play</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                {plays.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <FolderOpenIcon className="w-16 h-16 mb-4" />
                        <p>No saved plays yet.</p>
                        <p className="text-sm">Use the 'Save Play' button to save your progress.</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
                        {plays.map(play => (
                            <div key={play.id} className="bg-gray-800/50 p-3 rounded-lg flex items-start gap-4">
                                {play.sceneImageUrl && (
                                    <img src={play.sceneImageUrl} alt={play.title} className="w-24 h-16 object-cover rounded flex-shrink-0" />
                                )}
                                <div className="flex-1 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-white truncate">{play.title}</h3>
                                    <p className="text-xs text-gray-400">Saved on {new Date(play.savedAt).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-400">Mode: {play.performanceMode}, Genre: {play.genre}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => onLoad(play)} className="p-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md" title="Load Play">
                                        <FolderOpenIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => { if(window.confirm(`Are you sure you want to delete "${play.title}"?`)) onDelete(play.id) }} className="p-2 bg-red-800 hover:bg-red-700 text-white rounded-md" title="Delete Play">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Simple CSS animation for the slide-in effect */}
            <style>{`
                @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
            `}</style>
        </div>
    );
};