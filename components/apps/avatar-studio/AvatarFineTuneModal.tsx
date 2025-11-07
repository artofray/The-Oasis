import React, { useState, useEffect, useCallback } from 'react';
import * as roundTableService from '../../../services/roundTableService';
import Spinner from '../tarot-journal/Spinner';

// A simple debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    // FIX: Changed type from 'number' to 'ReturnType<typeof setTimeout>' to handle different return types of setTimeout in browser vs. Node.js environments.
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
        new Promise(resolve => {
            clearTimeout(timeout);
            timeout = setTimeout(() => resolve(func(...args)), waitFor);
        });
};


interface AvatarFineTuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseAvatarUrl: string;
  onSave: (finalAvatarUrl: string) => void;
  // FIX: Add unleashedMode to props.
  unleashedMode: boolean;
}

const dataUrlToBlob = async (dataUrl: string) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return blob;
};

export const AvatarFineTuneModal: React.FC<AvatarFineTuneModalProps> = ({ isOpen, onClose, baseAvatarUrl, onSave, unleashedMode }) => {
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(baseAvatarUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [lastAppliedPrompt, setLastAppliedPrompt] = useState('');
    const [controls, setControls] = useState({
        hairColor: '#DC143C', // Crimson
        eyeColor: '#00FF00', // Green
        clothingColor: '#CCCCCC', // Silver
        smile: 0, // -10 to 10
    });

    const applyEdit = useCallback(async (prompt: string, imageToEdit: string) => {
        if (!prompt || prompt === lastAppliedPrompt) return;
        setIsLoading(true);
        setLastAppliedPrompt(prompt);
        try {
            const blob = await dataUrlToBlob(imageToEdit);
            const base64Image = imageToEdit.split(',')[1];
            // FIX: Added missing unleashedMode argument.
            const result = await roundTableService.editAvatar(base64Image, blob.type, prompt, unleashedMode);
            if (result) {
                setCurrentAvatarUrl(result);
            }
        } catch (error) {
            console.error("Fine-tuning failed:", error);
            // Optionally show an error to the user
        } finally {
            setIsLoading(false);
        }
    }, [lastAppliedPrompt, unleashedMode]);

    const debouncedApplyEdit = useCallback(debounce(applyEdit, 1000), [applyEdit]);

    useEffect(() => {
        setCurrentAvatarUrl(baseAvatarUrl);
    }, [baseAvatarUrl]);

    const handleControlChange = (field: keyof typeof controls, value: string | number) => {
        setControls(prev => ({...prev, [field]: value }));
    };

    useEffect(() => {
        const smileTerm = controls.smile > 5 ? 'a big smile' : controls.smile < -5 ? 'a serious expression' : 'a neutral expression';
        const prompt = `Change hair color to ${controls.hairColor}, eye color to ${controls.eyeColor}, main clothing color to ${controls.clothingColor}, and give the character ${smileTerm}.`;
        debouncedApplyEdit(prompt, currentAvatarUrl);
    }, [controls, debouncedApplyEdit, currentAvatarUrl]);

    const handleSave = () => {
        onSave(currentAvatarUrl);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden m-4 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
                 <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-black/20 relative">
                     <h3 className="text-xl font-bold text-cyan-300 mb-4">Fine-Tune Avatar</h3>
                     <div className="relative w-full aspect-[9/16]">
                        <img src={currentAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover rounded-lg shadow-lg" />
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                <Spinner />
                            </div>
                        )}
                     </div>
                 </div>
                 <div className="w-1/2 p-8 flex flex-col bg-gray-800">
                    <h2 className="text-2xl font-bold text-fuchsia-300 font-playfair-display mb-6">Controls</h2>
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label htmlFor="hairColor" className="font-semibold">Hair Color</label>
                            <input id="hairColor" type="color" value={controls.hairColor} onChange={e => handleControlChange('hairColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label htmlFor="eyeColor" className="font-semibold">Eye Color</label>
                            <input id="eyeColor" type="color" value={controls.eyeColor} onChange={e => handleControlChange('eyeColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <label htmlFor="clothingColor" className="font-semibold">Clothing Color</label>
                            <input id="clothingColor" type="color" value={controls.clothingColor} onChange={e => handleControlChange('clothingColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md" />
                        </div>
                         <div>
                            <label htmlFor="smile" className="block font-semibold mb-1">Expression</label>
                            <div className="flex justify-between text-xs text-gray-400"><span>Serious</span><span>Neutral</span><span>Smile</span></div>
                            <input id="smile" type="range" min="-10" max="10" value={controls.smile} onChange={e => handleControlChange('smile', Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                        </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-gray-700 flex justify-end gap-4">
                        <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={isLoading} className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-500">
                            Save Avatar
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};
