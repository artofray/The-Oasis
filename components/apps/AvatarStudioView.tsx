import React, { useState, useRef, useEffect } from 'react';
import type { RoundTableAgent } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import * as roundTableService from '../../services/roundTableService';
import Spinner from './tarot-journal/Spinner';
import { UploadIcon, XIcon } from './tarot-journal/Icons';
import { AvatarFineTuneModal } from './avatar-studio/AvatarFineTuneModal';

interface AvatarStudioViewProps {
    agents: RoundTableAgent[];
    setAgents: (updater: (prev: RoundTableAgent[]) => RoundTableAgent[]) => void;
    unleashedMode: boolean;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            active ? 'border-purple-400 text-purple-300' : 'border-transparent text-gray-400 hover:text-white'
        }`}
    >
        {children}
    </button>
);


export const AvatarStudioView: React.FC<AvatarStudioViewProps> = ({ agents, setAgents, unleashedMode }) => {
    const [selectedAgentId, setSelectedAgentId] = useState<string>(agents.find(a => a.id === 'maggie')?.id || agents[0]?.id || '');
    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    
    const [generationMode, setGenerationMode] = useState<'description' | 'image' | 'lookalike' | 'outfit'>('description');

    const [prompt, setPrompt] = useState('');
    const [lookAlikePrompt, setLookAlikePrompt] = useState('');
    const [outfitPrompt, setOutfitPrompt] = useState('');
    const [locationPrompt, setLocationPrompt] = useState('');
    
    const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<{ file: File; dataUrl: string; } | null>(null);
    const [isTuning, setIsTuning] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setPrompt('');
        setLookAlikePrompt('');
        setOutfitPrompt('');
        setLocationPrompt('');
        setUploadedImage(null);
        setNewAvatarUrl(null);
        setError(null);
    }, [selectedAgentId, generationMode]);

    if (!selectedAgent) {
        return <div className="text-center text-red-400">No agent selected or available in the Studio.</div>;
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
    
    const isGenerateDisabled = () => {
        if (isLoading) return true;
        switch (generationMode) {
            case 'description': return !prompt.trim();
            case 'image': return !uploadedImage;
            case 'lookalike': return !lookAlikePrompt.trim();
            case 'outfit': return !outfitPrompt.trim() || !locationPrompt.trim();
            default: return true;
        }
    };

    const handleGenerate = async () => {
        if (isGenerateDisabled()) return;
        setIsLoading(true);
        setError(null);
        setNewAvatarUrl(null);
        try {
            let result: string | null = null;
            switch (generationMode) {
                case 'description':
                    result = await roundTableService.generateAvatar(prompt, unleashedMode);
                    break;
                case 'image':
                    if (uploadedImage) {
                        const base64Image = uploadedImage.dataUrl.split(',')[1];
                        result = await roundTableService.generateAvatarFromImage(base64Image, uploadedImage.file.type, prompt || "Create a new avatar based on this image.", unleashedMode);
                    }
                    break;
                case 'lookalike':
                    result = await roundTableService.generateLookAlikeAvatar(lookAlikePrompt, unleashedMode);
                    break;
                case 'outfit':
                    result = await roundTableService.generateOutfit(selectedAgent, outfitPrompt, locationPrompt, unleashedMode);
                    break;
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
                agent.id === selectedAgent.id ? { ...agent, avatarUrl: newAvatarUrl } : agent
            )
        );
        setNewAvatarUrl(null);
        setUploadedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setPrompt('');
        setLookAlikePrompt('');
        setOutfitPrompt('');
        setLocationPrompt('');
    };
    
    const handleDiscard = () => {
        setNewAvatarUrl(null);
    }
    
    const renderGeneratorContent = () => {
        switch (generationMode) {
            case 'description':
                return (
                    <div>
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">
                            Describe a new look for {selectedAgent.name}...
                        </label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={`e.g., 'A cyberpunk hacker with neon hair'`}
                            className="w-full h-24 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                );
            case 'image':
                 return (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="prompt-image" className="block text-sm font-medium text-gray-300 mb-1">
                                Describe changes or style... (Optional)
                            </label>
                            <textarea
                                id="prompt-image"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., '...in a watercolor style'"
                                className="w-full h-20 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">Image Inspiration</label>
                            {uploadedImage ? (
                                <div className="relative group">
                                    <img src={uploadedImage.dataUrl} alt="Upload preview" className="w-full h-40 object-cover rounded-md" />
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
                    </div>
                 );
            case 'lookalike':
                return (
                    <div>
                        <label htmlFor="lookalike-prompt" className="block text-sm font-medium text-gray-300 mb-1">
                            Generate a look-alike of...
                        </label>
                        <textarea
                            id="lookalike-prompt"
                            value={lookAlikePrompt}
                            onChange={(e) => setLookAlikePrompt(e.target.value)}
                            placeholder="e.g., 'A famous action star from Mission Impossible'"
                            className="w-full h-24 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Generates a parody character with different features to avoid direct replication.</p>
                    </div>
                );
            case 'outfit':
                return (
                    <div className="space-y-4">
                         <div>
                            <label htmlFor="outfit-prompt" className="block text-sm font-medium text-gray-300 mb-1">
                                Describe the Outfit
                            </label>
                            <textarea
                                id="outfit-prompt"
                                value={outfitPrompt}
                                onChange={(e) => setOutfitPrompt(e.target.value)}
                                placeholder="e.g., 'A classy black cocktail dress with silver jewelry'"
                                className="w-full h-20 p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="location-prompt" className="block text-sm font-medium text-gray-300 mb-1">
                                Describe the Location / Scene
                            </label>
                             <input
                                id="location-prompt"
                                type="text"
                                value={locationPrompt}
                                onChange={(e) => setLocationPrompt(e.target.value)}
                                placeholder="e.g., 'A chic rooftop bar'"
                                className="w-full p-3 bg-gray-800 text-gray-200 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="animate-fadeIn">
            <header className="text-center mb-8">
                <h2 className="text-5xl font-bold text-purple-300 font-playfair-display">Avatar Studio</h2>
                <p className="text-gray-400 mt-2 font-lora text-lg">Redefine your agent's appearance. Your imagination is the only limit.</p>
            </header>

            <div className="max-w-md mx-auto mb-8">
                <label htmlFor="agent-selector" className="block text-sm font-medium text-gray-300 mb-1">Select Agent to Edit</label>
                <select
                    id="agent-selector"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                    {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <GlassCard className="p-6">
                    <h3 className="text-2xl font-bold text-cyan-300 mb-2">Generator</h3>
                     <div className="flex border-b border-gray-700 mb-4">
                        <TabButton active={generationMode === 'description'} onClick={() => setGenerationMode('description')}>Description</TabButton>
                        <TabButton active={generationMode === 'image'} onClick={() => setGenerationMode('image')}>Image</TabButton>
                        <TabButton active={generationMode === 'lookalike'} onClick={() => setGenerationMode('lookalike')}>Look-Alike</TabButton>
                        <TabButton active={generationMode === 'outfit'} onClick={() => setGenerationMode('outfit')}>Outfit</TabButton>
                    </div>
                    <div className="space-y-4 min-h-[260px]">
                       {renderGeneratorContent()}
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled()}
                        className="w-full mt-4 flex justify-center items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-500"
                    >
                        {isLoading ? <Spinner /> : "Generate"}
                    </button>
                </GlassCard>

                <GlassCard className="p-6">
                     <h3 className="text-2xl font-bold text-cyan-300 mb-4">Preview</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-300">Current</h4>
                                <button
                                    onClick={() => {
                                        if (selectedAgent.avatarUrl) {
                                            setNewAvatarUrl(selectedAgent.avatarUrl); // Use current avatar as base
                                            setIsTuning(true);
                                        }
                                    }}
                                    disabled={!selectedAgent.avatarUrl}
                                    className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded disabled:bg-gray-600"
                                    title="Fine-tune the current avatar"
                                >
                                    Fine-Tune
                                </button>
                            </div>
                            <img src={selectedAgent.avatarUrl} alt={`Current ${selectedAgent.name} Avatar`} className="w-full aspect-[9/16] object-cover rounded-lg shadow-lg" />
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
                        <div className="mt-4 flex gap-2">
                             <button onClick={handleDiscard} className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                                Discard
                            </button>
                            <button onClick={() => setIsTuning(true)} className="flex-1 px-4 py-2 bg-fuchsia-600 text-white font-semibold rounded-lg hover:bg-fuchsia-700 transition-colors">
                                Fine-Tune
                            </button>
                            <button onClick={handleSetAvatar} className="flex-1 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors">
                                Set Avatar
                            </button>
                        </div>
                     )}
                </GlassCard>
            </div>
            {isTuning && newAvatarUrl && (
                <AvatarFineTuneModal
                    isOpen={isTuning}
                    onClose={() => setIsTuning(false)}
                    baseAvatarUrl={newAvatarUrl}
                    onSave={(finalAvatarUrl) => {
                        setNewAvatarUrl(finalAvatarUrl);
                        setIsTuning(false);
                    }}
                    // FIX: Pass unleashedMode prop to AvatarFineTuneModal.
                    unleashedMode={unleashedMode}
                />
            )}
        </div>
    );
};