import React, { useState, useRef } from 'react';
import type { RoundTableAgent } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import * as roundTableService from '../../services/roundTableService';
import Spinner from './tarot-journal/Spinner';
import { UploadIcon, XIcon } from './tarot-journal/Icons';

interface AvatarStudioViewProps {
    agents: RoundTableAgent[];
    setAgents: (agents: (prev: RoundTableAgent[]) => RoundTableAgent[]) => void;
}

export const AvatarStudioView: React.FC<AvatarStudioViewProps> = ({ agents, setAgents }) => {
    const maggie = agents.find(a => a.id === 'maggie');
    const [prompt, setPrompt] = useState('');
    const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<{ file: File; dataUrl: string; } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!maggie) {
        return <div className="text-center text-red-400">Maggie's agent data could not be found.</div>;
    }
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage({ file, dataUrl: reader.result as string });
                setNewAvatarUrl(null); // Clear previous generation
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt && !uploadedImage) return;
        setIsLoading(true);
        setError(null);
        setNewAvatarUrl(null);
        try {
            let result: string | null = null;
            if (uploadedImage) {
                const base64Image = uploadedImage.dataUrl.split(',')[1];
                result = await roundTableService.generateAvatarFromImage(base64Image, uploadedImage.file.type, prompt || "Create a new avatar based on this image.");
            } else {
                result = await roundTableService.generateAvatar(prompt);
            }
            if (!result) throw new Error("Image generation failed to return an image.");
            setNewAvatarUrl(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during generation.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetAvatar = () => {
        if (!newAvatarUrl) return;
        setAgents(prev => 
            prev.map(agent => 
                agent.id === 'maggie' ? { ...agent, avatarUrl: newAvatarUrl } : agent
            )
        );
        setNewAvatarUrl(null);
        setUploadedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setPrompt('');
    };
    
    const handleDiscard = () => {
        setNewAvatarUrl(null);
    }

    return (
        <div className="animate-fadeIn">
            <header className="text-center mb-8">
                <h2 className="text-5xl font-bold text-purple-300 font-playfair-display">Avatar Studio</h2>
                <p className="text-gray-400 mt-2 font-lora text-lg">Redefine Maggie's appearance. Your imagination is the only limit.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <GlassCard className="p-6">
                    <h3 className="text-2xl font-bold text-cyan-300 mb-4">Generator</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">
                                {uploadedImage ? "Describe changes or style..." : "Describe a new look for Maggie..."}
                            </label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={uploadedImage ? "e.g., '...in a watercolor style'" : "e.g., 'A cyberpunk hacker with neon hair'"}
                                className="w-full h-24 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Image Inspiration (Optional)</label>
                            {uploadedImage ? (
                                <div className="relative group">
                                    <img src={uploadedImage.dataUrl} alt="Upload preview" className="w-full h-48 object-cover rounded-md" />
                                    <button 
                                        onClick={() => { setUploadedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex flex-col justify-center items-center gap-2 p-4 bg-black/20 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-500 hover:text-white transition-colors"
                                >
                                    <UploadIcon className="w-8 h-8"/>
                                    <span className="text-sm font-semibold">Click to upload an image</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || (!prompt && !uploadedImage)}
                            className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-500"
                        >
                            {isLoading ? <Spinner /> : "Generate"}
                        </button>
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                     <h3 className="text-2xl font-bold text-cyan-300 mb-4">Preview</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <h4 className="font-semibold text-gray-300 mb-2">Current</h4>
                            <img src={maggie.avatarUrl} alt="Current Maggie Avatar" className="w-full aspect-[9/16] object-cover rounded-lg shadow-lg" />
                        </div>
                         <div className="text-center">
                            <h4 className="font-semibold text-gray-300 mb-2">New</h4>
                            <div className="w-full aspect-[9/16] bg-black/20 rounded-lg flex items-center justify-center">
                                {isLoading ? (
                                    <Spinner />
                                ) : newAvatarUrl ? (
                                    <img src={newAvatarUrl} alt="Newly generated avatar" className="w-full h-full object-cover rounded-lg shadow-lg" />
                                ) : (
                                    <p className="text-gray-500 text-sm">Waiting for generation...</p>
                                )}
                            </div>
                        </div>
                     </div>
                     {error && <p className="text-red-400 mt-4 text-sm font-lora text-center">{error}</p>}
                     {newAvatarUrl && (
                        <div className="mt-4 flex gap-4">
                             <button onClick={handleDiscard} className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                                Discard
                            </button>
                            <button onClick={handleSetAvatar} className="flex-1 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                                Set as Avatar
                            </button>
                        </div>
                     )}
                </GlassCard>
            </div>
        </div>
    );
};