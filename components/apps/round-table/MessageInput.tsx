import React, { useState, useEffect, useRef } from 'react';
import { useSpeech } from '../../../hooks/useSpeech';
import { SpeakerOnIcon, SpeakerOffIcon, FileIcon, SaveIcon, UploadIcon } from './Icons';
import type { ChatMessage } from '../../../types';

interface MessageInputProps {
    onSendMessage: (prompt: string, file?: File) => void;
    onSendMedia: (type: 'image' | 'video' | 'audio', prompt: string) => void;
    onInterrupt: () => void;
    isLoading: boolean;
    webAccess: boolean;
    onWebAccessToggle: () => void;
    isAudioEnabled: boolean;
    onAudioToggle: () => void;
    disabled: boolean;
    messages: ChatMessage[];
    setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onSendMedia, onInterrupt, isLoading, webAccess, onWebAccessToggle, isAudioEnabled, onAudioToggle, disabled, messages, setMessages }) => {
    const [prompt, setPrompt] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const { isListening, transcript, startListening, stopListening } = useSpeech();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importFileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setPrompt(transcript);
    }, [transcript]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) {
            onInterrupt();
        } else if (prompt.trim() || file) {
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
    
    const handleExportChat = () => {
        if (messages.length === 0) {
            alert("There's no conversation to export.");
            return;
        }

        const serializableMessages = messages.map(msg => {
            const { videoGenerationOperation, ...rest } = msg;
            return rest;
        });

        const dataStr = JSON.stringify(serializableMessages, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.download = `oasis-round-table-chat-${Date.now()}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        importFileInputRef.current?.click();
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (window.confirm("Are you sure you want to import this chat? This will replace the current conversation.")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const result = event.target?.result as string;
                    const importedMessages = JSON.parse(result) as ChatMessage[];
                    
                    if (Array.isArray(importedMessages)) {
                        setMessages(importedMessages);
                    } else {
                        throw new Error("Invalid format: not an array.");
                    }
                } catch (error) {
                    alert("Error parsing chat file. Please make sure it's a valid conversation export.");
                    console.error("Error importing chat:", error);
                }
            };
            reader.readAsText(file);
        }
        if (e.target) e.target.value = '';
    };

    const SendButton = () => (
        <button type="submit" className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-700 ml-2 disabled:bg-gray-600" disabled={(!prompt.trim() && !file) || disabled}>
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
    );

    const InterruptButton = () => (
        <button type="button" onClick={onInterrupt} className="ml-2 px-3 py-2 flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-sm font-semibold transition-colors text-white">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span>Stop</span>
        </button>
    );

    return (
        <div className="p-4 bg-[#161b22] border-t border-gray-800">
            {disabled && (
                 <div className="text-center text-sm text-yellow-400 mb-2 p-2 bg-yellow-900/50 rounded-md">
                    Please select at least one agent to start the conversation.
                </div>
            )}
            <div className="bg-[#0d1117] p-2 rounded-lg border border-gray-700">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                     <input type="file" ref={importFileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
                    
                    <div className="flex items-center">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-gray-400 hover:bg-gray-700" disabled={isLoading || disabled}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v11.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"></path></svg>
                        </button>
                        <button type="button" onClick={isListening ? stopListening : startListening} className={`p-2 rounded-full hover:bg-gray-700 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} disabled={isLoading || disabled}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path></svg>
                        </button>
                    </div>
                    
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message..."
                        disabled={isLoading || disabled}
                        className="flex-1 bg-transparent p-2 resize-none text-white placeholder-gray-500 focus:outline-none max-h-32"
                        rows={1}
                    />
                     <div className="flex items-center">
                        {isLoading ? <InterruptButton /> : <SendButton />}
                    </div>
                </form>
                 {file && (
                    <div className="px-3 pt-2">
                        <div className="bg-cyan-900/50 text-cyan-200 text-xs px-2 py-1 rounded-full flex items-center justify-between">
                           <div className="flex items-center gap-2 truncate">
                                <FileIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate" title={file.name}>{file.name}</span>
                           </div>
                            <button onClick={() => setFile(null)} className="text-cyan-200 hover:text-white ml-2">&times;</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};