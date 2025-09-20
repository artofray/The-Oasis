import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { processNaturalLanguageCommand } from '../../services/geminiService';
import type { View, Agent, CommandResponse, TaskPriority, Task, RoundTableAgent } from '../../types';
import { useSpeech } from '../../hooks/useSpeech';
import { useTypedText } from '../../hooks/useTypedText';

interface MyAiAssistantProps {
  setCurrentView: (view: View) => void;
  agents: RoundTableAgent[];
}

const initialAgents: Agent[] = [
    { id: 1, name: 'InvoiceProcessor', expertise: 'Finance & Accounting', task: { description: 'Idle', priority: 'low' }, status: 'idle', points: 120 },
    { id: 2, name: 'SupportBot', expertise: 'Customer Support', task: { description: 'Idle', priority: 'low' }, status: 'idle', points: 95 },
    { id: 3, name: 'MarketScanner', expertise: 'Marketing Analytics', task: { description: 'Idle', priority: 'low' }, status: 'idle', points: 150 },
    { id: 4, name: 'DevOpsWatcher', expertise: 'IT & System Monitoring', task: { description: 'Idle', priority: 'low' }, status: 'idle', points: 80 },
];

const MyAiAvatar: React.FC<{ avatarUrl: string; isSpeaking: boolean }> = ({ avatarUrl, isSpeaking }) => (
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-amber-500 p-1 flex-shrink-0 relative">
        <div className={`w-full h-full bg-gray-900 rounded-full flex items-center justify-center transition-transform duration-100 ${isSpeaking ? 'scale-105' : ''}`}>
            <img src={avatarUrl} alt="Assistant Avatar" className="rounded-full w-full h-full object-cover" />
        </div>
        {isSpeaking && <div className="absolute -top-1 -left-1 w-[104px] h-[104px] rounded-full border-2 border-red-400 animate-pulse"></div>}
    </div>
);

const StatusIndicator: React.FC<{ status: 'idle' | 'working' | 'complete' }> = ({ status }) => {
    const statusStyles = {
        idle: {
            dot: 'bg-gray-500',
            text: 'text-gray-400',
            label: 'Idle',
            pulse: false,
        },
        working: {
            dot: 'bg-fuchsia-500',
            text: 'text-fuchsia-400',
            label: 'Working',
            pulse: true,
        },
        complete: {
            dot: 'bg-green-500',
            text: 'text-green-400',
            label: 'Complete',
            pulse: false,
        },
    };

    const currentStatus = statusStyles[status];

    return (
        <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-2 h-2 rounded-full ${currentStatus.dot} ${currentStatus.pulse ? 'animate-pulse' : ''}`}></div>
            <span className={`text-xs font-semibold ${currentStatus.text}`}>
                {currentStatus.label}
            </span>
        </div>
    );
};


export const MyAiAssistant: React.FC<MyAiAssistantProps> = ({ setCurrentView, agents: allAgents }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cloudAgents, setCloudAgents] = useState<Agent[]>(initialAgents);
    
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
        speak(response.message);
        
        if (response.action === 'switch_view' && response.payload) {
            setCurrentView(response.payload as View);
        } else if (response.action === 'task_assigned') {
            
            // FIX: Refactored the state update logic to remove side-effects from the setState updater and fix type inference.
            // The `isLoading` flag ensures that `cloudAgents` is stable during this async operation.
            const idleAgentIndex = cloudAgents.findIndex(a => a.status === 'idle');
            const agentToAssignIndex = idleAgentIndex !== -1 ? idleAgentIndex : 0;

            // 1. Set agent to 'working'
            setCloudAgents(prevAgents => prevAgents.map((agent, index) => {
                if (index === agentToAssignIndex) {
                    return { ...agent, status: 'working', task: { description: response.message, priority: response.payload.priority as TaskPriority } };
                }
                return agent;
            }));

            const workDuration = Math.random() * 4000 + 3000; // 3-7 seconds
            const completeDuration = 2000; // 2 seconds

            // Set agent to 'complete' after work is done
            setTimeout(() => {
                setCloudAgents(currentAgents => currentAgents.map((agent, index) => {
                    if (index === agentToAssignIndex) {
                        const newPoints = agent.points + Math.floor(Math.random() * 10) + 5; // Reward points
                        return { ...agent, status: 'complete', points: newPoints, task: { ...agent.task, description: 'Task Complete!' } };
                    }
                    return agent;
                }));
            }, workDuration);

            // Set agent back to 'idle' after showing 'complete'
            setTimeout(() => {
                setCloudAgents(currentAgents => currentAgents.map((agent, index) => {
                    if (index === agentToAssignIndex) {
                        return { ...agent, status: 'idle', task: { description: 'Idle', priority: 'low' } };
                    }
                    return agent;
                }));
                inputRef.current?.focus();
            }, workDuration + completeDuration);
        }
        
        setPrompt('');
        setIsLoading(false);

    }, [isLoading, setCurrentView, speak, cloudAgents]);

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

            <GlassCard className="flex-1 p-4 flex flex-col">
                 <h3 className="text-lg font-semibold text-amber-400 mb-2">Cloud Employees</h3>
                 <div className="space-y-3 overflow-y-auto pr-2">
                     {cloudAgents.map(agent => {
                         const taskDescriptionStyle = {
                            idle: 'text-gray-400',
                            working: 'text-fuchsia-400 animate-pulse',
                            complete: 'text-green-400',
                         }[agent.status];

                         return (
                             <div key={agent.id} className="text-sm bg-black/20 p-2 rounded-lg">
                                 <div className="flex justify-between items-center mb-1">
                                     <span className="font-bold">{agent.name}</span>
                                     <span className="text-cyan-400">{agent.points} pts</span>
                                 </div>
                                 <div className="flex justify-between items-center gap-2">
                                    <p className={`text-xs truncate ${taskDescriptionStyle}`}>
                                        {agent.task.description}
                                    </p>
                                    <StatusIndicator status={agent.status} />
                                </div>
                             </div>
                         )
                    })}
                 </div>
            </GlassCard>
            
            <form onSubmit={handleFormSubmit} className="relative mt-auto">
                <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Instruct your agents..."
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