import React, { useState, useEffect, useRef } from 'react';
import { useSpeech } from '../../../hooks/useSpeech';
import { SpeakerOnIcon, SpeakerOffIcon, FileIcon } from './Icons';

interface MessageInputProps {
    onSendMessage: (prompt: string, file?: File) => void;
    onSendMedia: (type: 'image' | 'video' | 'audio', prompt: string) => void;
    isLoading: boolean;
    webAccess: boolean;
    onWebAccessToggle: () => void;
    isAudioEnabled: boolean;
    onAudioToggle: () => void;
    disabled: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onSendMedia, isLoading, webAccess, onWebAccessToggle, isAudioEnabled, onAudioToggle, disabled }) => {
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const { isListening, transcript, startListening, stopListening } = useSpeech();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPrompt(transcript);
    }, [transcript]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() || file) {
            onSendMessage(prompt.trim(), file ?? undefined);
            setPrompt('');
            setFile(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleMediaClick = (type: 'image' | 'video' | 'audio') => {
        if (prompt.trim()){
            onSendMedia(type, prompt.trim());
            setPrompt('');
            setFile(null);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="p-4 bg-[#171a21] border-t border-gray-700">
            {disabled && (
                 <div className="text-center text-sm text-yellow-400 mb-2 p-2 bg-yellow-900/50 rounded-md">
                    Please select at least one agent to start the conversation.
                </div>
            )}
            <div className="bg-[#2a2f3b] p-2 rounded-lg">
                <div className="flex items-center gap-2 mb-2 px-2">
                    <button onClick={() => handleMediaClick('image')} disabled={isLoading || !prompt.trim()} className="text-xs hover:bg-gray-600 p-1 rounded disabled:opacity-50">Image</button>
                    <button onClick={() => handleMediaClick('video')} disabled={isLoading || !prompt.trim()} className="text-xs hover:bg-gray-600 p-1 rounded disabled:opacity-50">Video</button>
                    <button onClick={() => handleMediaClick('audio')} disabled={isLoading || !prompt.trim()} className="text-xs hover:bg-gray-600 p-1 rounded disabled:opacity-50">Audio</button>
                    <div className="flex items-center ml-auto gap-4">
                        <div className="flex items-center">
                            <span className="text-xs mr-2 text-gray-400">Audio</span>
                            <button onClick={onAudioToggle} className={`p-1 rounded-full ${isAudioEnabled ? 'text-blue-400' : 'text-gray-500'} hover:bg-gray-600`}>
                                {isAudioEnabled ? <SpeakerOnIcon className="w-5 h-5" /> : <SpeakerOffIcon className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex items-center">
                            <span className="text-xs mr-2 text-gray-400">Web Access</span>
                            <button onClick={onWebAccessToggle} className={`w-10 h-5 rounded-full flex items-center transition-colors ${webAccess ? 'bg-blue-600' : 'bg-gray-600'}`}>
                               <span className={`inline-block w-4 h-4 bg-white rounded-full transform transition-transform ${webAccess ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
                {file && (
                    <div className="px-3 pb-2">
                        <div className="bg-blue-900/50 text-blue-200 text-xs px-2 py-1 rounded-full flex items-center justify-between">
                           <div className="flex items-center gap-2 truncate">
                                <FileIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate" title={file.name}>{file.name}</span>
                           </div>
                            <button onClick={() => setFile(null)} className="text-blue-200 hover:text-white ml-2">&times;</button>
                        </div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="relative">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter initial topic, or jump into the conversation..."
                        disabled={isLoading || disabled}
                        className="w-full bg-transparent p-3 pr-32 resize-none text-white placeholder-gray-400 focus:outline-none"
                        rows={1}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-600" disabled={isLoading || disabled}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v11.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"></path></svg>
                        </button>
                        <button type="button" onClick={isListening ? stopListening : startListening} className={`p-2 rounded-full hover:bg-gray-600 ${isListening ? 'text-red-500 animate-pulse' : ''}`} disabled={isLoading || disabled}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path></svg>
                        </button>
                        <button type="submit" className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 ml-2 disabled:bg-gray-600" disabled={isLoading || (!prompt.trim() && !file) || disabled}>
                            {isLoading ? (
                                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};