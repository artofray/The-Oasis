import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { processNaturalLanguageCommand } from '../../services/geminiService';
import type { View, CommandResponse, RoundTableAgent } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';
import { useTypedText } from '../../hooks/useTypedText';
import { MyAiAvatar } from './MyAiAvatar';
import { Companions } from './Companions';

interface MyAiAssistantProps {
  setCurrentView: (view: View) => void;
  agents: RoundTableAgent[];
  speakingAgentId: string | null;
  setSpeakingAgentId: (id: string | null) => void;
}

export const MyAiAssistant: React.FC<MyAiAssistantProps> = ({ setCurrentView, agents: allAgents, speakingAgentId, setSpeakingAgentId }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const maggie = allAgents.find(agent => agent.id === 'maggie');
    const avatarUrl = maggie?.avatarUrl || 'https://i.imgur.com/sB11x9E.jpeg';
    
    const [aiMessage, setAiMessage] = useState(maggie ? "My love... ready to orchestrate some chaos?" : "Assistant online.");
    const { isListening, transcript, startListening, stopListening, isSpeaking, speak } = useSpeech();
    const { displayText: typedAiMessage } = useTypedText(aiMessage, 25);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const previousIsListening = useRef(false);
    
    const processCommand = useCallback(async (commandText: string) => {
        if (!commandText || isLoading) return;

        setIsLoading(true);
        const response: CommandResponse = await processNaturalLanguageCommand(commandText);
        
        setAiMessage(response.message);
        speak(response.message, {
            onStart: () => setSpeakingAgentId('maggie'),
            onEnd: () => setSpeakingAgentId(null),
        });
        
        if (response.action === 'switch_view' && response.payload) {
            setCurrentView(response.payload as View);
        }
        
        setPrompt('');
        setIsLoading(false);

    }, [isLoading, setCurrentView, speak, setSpeakingAgentId]);

    useEffect(() => {
        setPrompt(transcript);
    }, [transcript]);

    useEffect(() => {
        if (previousIsListening.current && !isListening && transcript.trim()) {
            processCommand(transcript.trim());
        }
        previousIsListening.current = isListening;
    }, [isListening, transcript, processCommand]);


    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        processCommand(prompt);
    };

    return (
        <aside className="w-[380px] h-full bg-gray-900/50 border-l border-red-400/20 p-4 flex flex-col space-y-4">
            <GlassCard className="p-4 flex flex-col items-center text-center">
                <MyAiAvatar avatarUrl={avatarUrl} isSpeaking={isSpeaking} />
                <h2 className="text-xl font-bold mt-3 text-red-400">Maggie</h2>
                <p className="text-sm text-gray-300 min-h-[60px] mt-2">{typedAiMessage}</p>
            </GlassCard>

            <Companions agents={allAgents} speakingAgentId={speakingAgentId} />
            
            <form onSubmit={handleFormSubmit} className="relative mt-auto">
                <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="w-full bg-gray-800 border border-red-500/50 rounded-lg py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
                 <button type="button" onClick={isListening ? stopListening : startListening} className={`absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-md ${isListening ? 'text-red-500 animate-pulse' : 'text-red-400'} hover:bg-red-500/20`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                </button>
                <button type="submit" disabled={isLoading || !prompt} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-amber-400 hover:bg-amber-500/20 disabled:text-gray-600">
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    )}
                </button>
            </form>
        </aside>
    );
};