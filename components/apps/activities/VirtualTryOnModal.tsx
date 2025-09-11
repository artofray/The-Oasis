import React, { useState, useRef } from 'react';
import type { RoundTableAgent } from '../../../types';
import * as roundTableService from '../../../services/roundTableService';
import Spinner from '../tarot-journal/Spinner';
import { UploadIcon, XIcon } from '../tarot-journal/Icons';

interface VirtualTryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  maggie?: RoundTableAgent;
}

export const VirtualTryOnModal: React.FC<VirtualTryOnModalProps> = ({ isOpen, onClose, onAvatarUpdate, maggie }) => {
    const [prompt, setPrompt] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clothingImage, setClothingImage] = useState<{ file: File; dataUrl: string; } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setPrompt('');
        setGeneratedImageUrl(null);
        setIsLoading(false);
        setError(null);
        setClothingImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleClose = () => {
        resetState();
        onClose();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setClothingImage({ file, dataUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!maggie?.avatarUrl || !clothingImage) return;
        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);
        try {
            const clothingImageBase64 = clothingImage.dataUrl.split(',')[1];
            const result = await roundTableService.performVirtualTryOn(
                maggie.avatarUrl,
                clothingImageBase64,
                clothingImage.file.type,
                prompt || "A realistic, full-body portrait."
            );
            if (!result) throw new Error("Image generation failed.");
            setGeneratedImageUrl(result);
        } catch(e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetAvatar = () => {
        if (generatedImageUrl) {
            onAvatarUpdate(generatedImageUrl);
            handleClose();
        }
    };

    if (!isOpen || !maggie) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden m-4 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
                 <div className="w-1/3 p-6 flex flex-col items-center justify-center bg-black/20">
                     <h3 className="text-xl font-bold text-cyan-300 mb-4">Current Look</h3>
                     <img src={maggie.avatarUrl} alt="Maggie's current avatar" className="w-full aspect-[9/16] object-cover rounded-lg shadow-lg" />
                 </div>
                 <div className="w-2/3 p-6 flex flex-col">
                    <h2 className="text-3xl font-bold text-fuchsia-300 font-playfair-display mb-4">Virtual Try-On</h2>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">1. Upload Clothing Image</label>
                            {clothingImage ? (
                                <div className="relative group">
                                    <img src={clothingImage.dataUrl} alt="Clothing preview" className="w-full h-40 object-contain rounded-md bg-gray-800 p-2" />
                                    <button 
                                        onClick={() => setClothingImage(null)}
                                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex flex-col justify-center items-center gap-2 p-4 bg-black/20 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg hover:border-fuchsia-500 hover:text-white transition-colors"
                                >
                                    <UploadIcon className="w-8 h-8"/>
                                    <span className="text-sm font-semibold">Click to upload an outfit</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">2. Add Details (Optional)</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'Make the background a city at night', 'Change the shoes to match'"
                                className="w-full h-20 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-fuchsia-500"
                            />
                        </div>
                         <button
                            onClick={handleGenerate}
                            disabled={isLoading || !clothingImage}
                            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-fuchsia-600 text-white font-semibold rounded-lg hover:bg-fuchsia-700 disabled:bg-gray-500"
                        >
                            {isLoading ? <Spinner /> : "Try It On"}
                        </button>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <h3 className="text-xl font-bold text-cyan-300 mb-2">Result</h3>
                        <div className="w-full h-56 bg-black/20 rounded-lg flex items-center justify-center">
                            {isLoading ? <Spinner /> : generatedImageUrl ? (
                                <img src={generatedImageUrl} alt="Generated look for Maggie" className="w-auto h-full object-contain rounded-lg" />
                            ) : error ? (
                               <p className="text-red-400 text-sm px-4 text-center">{error}</p>
                            ) : (
                                <p className="text-gray-500">Result will appear here</p>
                            )}
                        </div>
                        {generatedImageUrl && !isLoading && (
                            <div className="mt-4 flex gap-4">
                                <button onClick={() => setGeneratedImageUrl(null)} className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                                    Discard
                                </button>
                                <button onClick={handleSetAvatar} className="flex-1 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                                    Set as Avatar
                                </button>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};
