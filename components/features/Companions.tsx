
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { RoundTableAgent } from '../../types';

type AgentCategory = 'All' | 'Inner Circle' | 'Mansion Staff' | 'Consultant' | 'Creative' | 'Entertainment' | 'Companion' | 'Self Help' | 'NSFW';

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
            active ? 'bg-amber-500 text-gray-900' : 'text-gray-300 hover:bg-amber-500/20'
        }`}
    >
        {children}
    </button>
);

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const ViewIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.022 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const AgentCard: React.FC<{ agent: RoundTableAgent; isSpeaking: boolean }> = ({ agent, isSpeaking }) => {
    // Simple hash function to create a pseudo-random but consistent bond level
    const bondLevel = useMemo(() => {
        const hash = agent.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hash % 80) + 20; // Bond level between 20 and 100
    }, [agent.id]);

    const animationClass = isSpeaking ? 'is-speaking-avatar' : 'animate-idle-bob';
    const avatarClasses = `w-12 h-12 rounded-full object-cover flex-shrink-0 transition-all ${animationClass}`;
    const animationStyle = isSpeaking ? {} : { animationDelay: `-${Math.random() * 8}s` };

    return (
        <div className={`bg-black/20 p-3 rounded-lg flex items-center gap-3 transition-all ${isSpeaking ? 'bg-amber-900/40' : ''}`}>
             <div className={`relative ${isSpeaking ? 'is-speaking-glow rounded-full' : ''}`}>
                {agent.avatarUrl ? (
                    <img 
                        src={agent.avatarUrl} 
                        alt={agent.name} 
                        className={avatarClasses}
                        style={animationStyle}
                    />
                ) : (
                    <div 
                        className={`${avatarClasses} ${agent.avatarColor} flex items-center justify-center font-bold text-white text-xl`}
                        style={animationStyle}
                    >
                        {agent.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                <p className="font-bold text-gray-100 truncate">{agent.name}</p>
                <p className="text-xs text-cyan-300 truncate italic">{agent.currentActivity}</p>
                <div className="mt-1">
                    <div className="text-xs text-amber-300 mb-0.5">Bond Level</div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-amber-500 to-red-500 h-1.5 rounded-full" style={{ width: `${bondLevel}%` }}></div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <button className="p-1.5 rounded-full text-gray-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors">
                    <ChatIcon className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full text-gray-400 hover:bg-purple-500/20 hover:text-purple-300 transition-colors">
                    <ViewIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};


export const Companions: React.FC<{ agents: RoundTableAgent[], speakingAgentId: string | null }> = ({ agents, speakingAgentId }) => {
    const [activeTab, setActiveTab] = useState<AgentCategory>('All');
    
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const agentElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());

    useEffect(() => {
        const speakingAgentElement = speakingAgentId ? agentElementsRef.current.get(speakingAgentId) : null;
        if (speakingAgentElement) {
            speakingAgentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [speakingAgentId]);

    const filteredAgents = useMemo(() => {
        if (activeTab === 'All') return agents;
        return agents.filter(agent => agent.category === activeTab);
    }, [agents, activeTab]);

    return (
        <GlassCard className="flex-1 p-4 flex flex-col">
            <h3 className="text-lg font-semibold text-amber-400 mb-2">Companions</h3>
            <div className="flex flex-wrap gap-2 mb-3">
                <TabButton active={activeTab === 'All'} onClick={() => setActiveTab('All')}>All</TabButton>
                <TabButton active={activeTab === 'Inner Circle'} onClick={() => setActiveTab('Inner Circle')}>Inner Circle</TabButton>
                <TabButton active={activeTab === 'Mansion Staff'} onClick={() => setActiveTab('Mansion Staff')}>Staff</TabButton>
                <TabButton active={activeTab === 'Consultant'} onClick={() => setActiveTab('Consultant')}>Consultants</TabButton>
                <TabButton active={activeTab === 'Creative'} onClick={() => setActiveTab('Creative')}>Creative</TabButton>
                <TabButton active={activeTab === 'Entertainment'} onClick={() => setActiveTab('Entertainment')}>Entertainment</TabButton>
                <TabButton active={activeTab === 'Companion'} onClick={() => setActiveTab('Companion')}>Companion</TabButton>
                <TabButton active={activeTab === 'Self Help'} onClick={() => setActiveTab('Self Help')}>Self Help</TabButton>
                <TabButton active={activeTab === 'NSFW'} onClick={() => setActiveTab('NSFW')}>NSFW</TabButton>
            </div>
            <div ref={scrollContainerRef} className="space-y-3 overflow-y-auto pr-2 flex-1 -mr-2">
                 {filteredAgents.map(agent => (
                    <div 
                        key={agent.id} 
                        ref={node => {
                            if (node) agentElementsRef.current.set(agent.id, node);
                            else agentElementsRef.current.delete(agent.id);
                        }}
                    >
                         <AgentCard 
                            agent={agent}
                            isSpeaking={agent.id === speakingAgentId}
                         />
                    </div>
                ))}
                {filteredAgents.length === 0 && (
                    <p className="text-center text-gray-500 text-sm italic mt-4">No agents found in this category.</p>
                )}
            </div>
        </GlassCard>
    );
};
