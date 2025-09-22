import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { RoundTableAgent } from '../../../types';
import { XIcon, UploadIcon } from '../tarot-journal/Icons';
import * as roundTableService from '../../../services/roundTableService';
import Spinner from '../tarot-journal/Spinner';
import { AGENTS as INITIAL_AGENTS, NEW_AGENT_TEMPLATE } from './constants';

interface AgentEditModalProps {
    agent: RoundTableAgent;
    onSave: (agent: RoundTableAgent) => void;
    onClose: () => void;
    voices: SpeechSynthesisVoice[];
    // FIX: Add unleashedMode to props.
    unleashedMode: boolean;
}

const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-red-500', 'bg-gray-400', 'bg-sky-500',
    'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500'
];

const AvatarPreview: React.FC<{agent: RoundTableAgent}> = ({ agent }) => {
     if (agent.avatarUrl) {
        return <img src={agent.avatarUrl} alt="Avatar Preview" className="w-24 h-40 object-cover rounded-lg mb-4 mx-auto" />;
    }
    return (
        <div className={`w-20 h-20 rounded-full ${agent.avatarColor} flex items-center justify-center text-3xl font-bold text-white mb-4 mx-auto`}>
            {agent.name.charAt(0)}
        </div>
    );
};

export const AgentEditModal: React.FC<AgentEditModalProps> = ({ agent, onSave, onClose, voices, unleashedMode }) => {
    const [formData, setFormData] = useState<RoundTableAgent>(agent);
    const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
    const [isGeneratingFromPhoto, setIsGeneratingFromPhoto] = useState(false);
    const [photoGenerationStatus, setPhotoGenerationStatus] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [isCloning, setIsCloning] = useState(false);
    // FIX: Changed state to store file object along with data URL for image generation from photo.
    const [imagePreview, setImagePreview] = useState<{ file: File; dataUrl: string; } | null>(null);
    const [lookAlikePrompt, setLookAlikePrompt] = useState('');
    const [isGeneratingLookAlike, setIsGeneratingLookAlike] = useState(false);
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const isCreating = !INITIAL_AGENTS.some(a => a.id === agent.id);

    const defaultState = useMemo(() => {
        const originalAgent = INITIAL_AGENTS.find(a => a.id === agent.id);
        if (originalAgent) {
            return originalAgent;
        }
        // For custom agents, the "default" is the template, but with their persisted name.
        return {
            ...NEW_AGENT_TEMPLATE,
            id: agent.id,
            name: agent.name,
            category: agent.category || 'Consultant',
        } as RoundTableAgent;
    }, [agent]);

    const isModified = useMemo(() => {
        if (!defaultState) return false;
        // Simple deep comparison using JSON stringify
        return JSON.stringify(formData) !== JSON.stringify(defaultState);
    }, [formData, defaultState]);


    useEffect(() => {
        setFormData(agent);
    }, [agent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleColorChange = (color: string) => {
        setFormData(prev => ({ ...prev, avatarColor: color, avatarUrl: undefined }));
    }

    const handleGenerateAvatar = async () => {
        setIsGeneratingAvatar(true);
        // FIX: Added missing unleashedMode argument.
        const imageUrl = await roundTableService.generateAvatar(formData.description, unleashedMode);
        if (imageUrl) {
            setFormData(prev => ({...prev, avatarUrl: imageUrl}));
        }
        setIsGeneratingAvatar(false);
    }

    const handleGenerateLookAlike = async () => {
        if (!lookAlikePrompt) return;
        setIsGeneratingLookAlike(true);
        // FIX: Added missing unleashedMode argument.
        const imageUrl = await roundTableService.generateLookAlikeAvatar(lookAlikePrompt, unleashedMode);
        if (imageUrl) {
            setFormData(prev => ({...prev, avatarUrl: imageUrl}));
        }
        setIsGeneratingLookAlike(false);
    }
    
    const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // FIX: Store the file object along with the data URL.
                setImagePreview({ file, dataUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateFromPhoto = async () => {
        // FIX: Guard clause to ensure an image is uploaded.
        if (!imagePreview) return;
        setIsGeneratingFromPhoto(true);
        const statuses = [
            "Analyzing photo...",
            "Generating 3D mesh...",
            "Applying high-resolution textures...",
            "Finalizing character model..."
        ];

        for (const status of statuses) {
            setPhotoGenerationStatus(status);
            await new Promise(res => setTimeout(res, 1500));
        }
        
        // FIX: Corrected function call to use generateAvatarFromImage with the uploaded photo data.
        const base64Image = imagePreview.dataUrl.split(',')[1];
        const imageUrl = await roundTableService.generateAvatarFromImage(base64Image, imagePreview.file.type, formData.description, unleashedMode);

        if (imageUrl) {
            setFormData(prev => ({...prev, avatarUrl: imageUrl}));
        }
        setIsGeneratingFromPhoto(false);
        setPhotoGenerationStatus('');
        setImagePreview(null);
    };

    const handlePresetVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const presetName = e.target.value;
        setFormData(prev => ({
            ...prev,
            voice: {
                isCloned: false,
                sampleUrl: undefined,
                presetName: presetName ? presetName : undefined
            }
        }));
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setFormData(prev => ({
                    ...prev,
                    voice: { isCloned: false, sampleUrl: audioUrl, presetName: undefined }
                }));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingSeconds(0);
            timerRef.current = window.setInterval(() => {
                setRecordingSeconds(prev => {
                    if (prev >= 9) {
                       handleStopRecording();
                       return 10;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please ensure permissions are granted.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
    };
    
    const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                voice: { isCloned: false, sampleUrl: url, presetName: undefined }
            }));
        }
    }
    
    const handleCloneVoice = () => {
        setIsCloning(true);
        setTimeout(() => {
            setFormData(prev => ({ ...prev, voice: { ...prev.voice, isCloned: true } }));
            setIsCloning(false);
        }, 2000); // Simulate cloning process
    }
    
    const handleRemoveVoice = () => {
        setFormData(prev => ({
            ...prev,
            voice: { isCloned: false, sampleUrl: undefined, presetName: undefined }
        }));
    }
    
    const handleReset = () => {
        if (defaultState) {
            setFormData(defaultState);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const isLoading = isGeneratingAvatar || isGeneratingFromPhoto || isCloning || isGeneratingLookAlike;
    const englishVoices = useMemo(() => voices.filter(v => v.lang.startsWith('en-')), [voices]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-[#171a21] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 m-4 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <XIcon className="h-6 w-6" />
                </button>
                
                <h2 className="text-2xl font-bold mb-4 text-white text-center">{isCreating ? "Create New Agent" : "Edit Agent"}</h2>
                
                <AvatarPreview agent={formData} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500 resize-none"/>
                    </div>
                    <div>
                        <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-300 mb-1">System Instructions</label>
                        <textarea name="systemInstruction" id="systemInstruction" value={formData.systemInstruction} onChange={handleChange} rows={5} className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500 resize-none"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
                        <div className="p-3 bg-black/20 rounded-lg space-y-3">
                            <div className="space-y-2">
                                <input 
                                    type="text"
                                    value={lookAlikePrompt}
                                    onChange={(e) => setLookAlikePrompt(e.target.value)}
                                    placeholder="e.g., 'A famous action star from Mission Impossible'"
                                    className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white placeholder-gray-400"
                                />
                                <button type="button" onClick={handleGenerateLookAlike} disabled={isGeneratingLookAlike || !lookAlikePrompt} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-500">
                                   {isGeneratingLookAlike ? <Spinner /> : "Generate Look-Alike"}
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-400">OR</p>
                            {isGeneratingFromPhoto ? (
                                <div className="text-center p-4">
                                    <Spinner />
                                    <p className="text-cyan-300 animate-pulse mt-2">{photoGenerationStatus}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        {imagePreview && <img src={imagePreview.dataUrl} alt="upload preview" className="w-12 h-12 object-cover rounded-md" />}
                                        <button type="button" onClick={() => photoInputRef.current?.click()} className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                                           <UploadIcon className="w-5 h-5"/> {imagePreview ? "Change Photo" : "Upload Photo"}
                                        </button>
                                        <input type="file" ref={photoInputRef} onChange={handlePhotoFileChange} accept="image/*" className="hidden" />
                                    </div>
                                    {imagePreview && (
                                        <button type="button" onClick={handleGenerateFromPhoto} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">
                                            Generate Avatar from Photo
                                        </button>
                                    )}
                                    <p className="text-center text-xs text-gray-400">OR</p>
                                    <button type="button" onClick={handleGenerateAvatar} disabled={isGeneratingAvatar} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-500">
                                       {isGeneratingAvatar ? <Spinner /> : "Generate from Description"}
                                    </button>
                                    <p className="text-center text-xs text-gray-400">OR</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {AVATAR_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => handleColorChange(color)}
                                                className={`w-8 h-8 rounded-full ${color} transition-transform transform hover:scale-110 ${formData.avatarColor === color && !formData.avatarUrl ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Voice Persona</label>
                        <div className="p-3 bg-black/20 rounded-lg space-y-3">
                            {formData.voice.isCloned ? (
                                <div className="flex items-center justify-between bg-green-900/50 p-3 rounded-lg">
                                    <p className="text-green-300 font-semibold text-sm">Custom voice is active.</p>
                                    <button type="button" onClick={handleRemoveVoice} className="text-xs bg-red-600/50 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md transition-colors">
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label htmlFor="preset-voice" className="block text-xs font-medium text-gray-400 mb-1">Preset Voice</label>
                                        <select
                                            id="preset-voice"
                                            value={formData.voice.presetName || ''}
                                            onChange={handlePresetVoiceChange}
                                            className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white text-sm"
                                        >
                                            <option value="">Automatic</option>
                                            {englishVoices.map(voice => (
                                                <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-center text-xs text-gray-400">OR CREATE A CUSTOM VOICE</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                                            Upload Sample
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleAudioFileChange} accept="audio/wav, audio/mpeg" className="hidden" />
                                        
                                        <button type="button" onClick={isRecording ? handleStopRecording : handleStartRecording} className={`text-sm w-full font-bold py-2 px-4 rounded-md transition-colors ${isRecording ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                                            {isRecording ? `Recording... (${10-recordingSeconds}s)` : 'Record Sample'}
                                        </button>
                                    </div>
                                    {formData.voice.sampleUrl && (
                                        <div className="space-y-3 pt-3 border-t border-gray-700">
                                            <audio controls src={formData.voice.sampleUrl} className="w-full h-10" />
                                            <button type="button" onClick={handleCloneVoice} disabled={isCloning} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-500">
                                                {isCloning && <Spinner />}
                                                {isCloning ? 'Cloning Voice...' : 'Clone Voice from Sample'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                         <button
                            type="button"
                            onClick={handleReset}
                            disabled={!isModified || isLoading}
                            className="px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reset Agent
                        </button>
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};