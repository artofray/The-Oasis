import React, { useState, useEffect } from 'react';
import { useSpeech } from '../../../hooks/useSpeech';
import { SpeakerOnIcon, SpeakerOffIcon } from './Icons';

interface MessageInputProps {
    onSendMessage: (prompt: string) => void;
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
    const { isListening, transcript, startListening, stopListening } = useSpeech();

    useEffect(() => {
        if (transcript) {
            setPrompt(transcript);
        }
    }, [transcript]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onSendMessage(prompt.trim());
            setPrompt('');
        }
    };
    
    const handleMediaClick = (type: 'image' | 'video' | 'audio') => {
        if (prompt.trim()){
            onSendMedia(type, prompt.trim());
            setPrompt('');
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
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter initial topic, or jump into the conversation..."
                        disabled={isLoading || disabled}
                        className="w-full bg-transparent p-3 pr-24 resize-none text-white placeholder-gray-400 focus:outline-none"
                        rows={1}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                        <button type="button" onClick={isListening ? stopListening : startListening} className={`p-2 rounded-full hover:bg-gray-600 ${isListening ? 'text-red-500 animate-pulse' : ''}`} disabled={isLoading || disabled}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path></svg>
                        </button>
                        <button type="submit" className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 ml-2 disabled:bg-gray-600" disabled={isLoading || !prompt.trim() || disabled}>
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
