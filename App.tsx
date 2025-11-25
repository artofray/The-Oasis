
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ActiveAgents } from './components/layout/ActiveAgents';
import { Dashboard } from './components/apps/Dashboard';
import { MansionView } from './components/apps/MansionView';
import { WorkflowsView } from './components/apps/WorkflowsView';
import { TeachView } from './components/apps/TeachView';
import { SettingsView } from './components/apps/SettingsView';
import { RoundTableView } from './components/apps/RoundTableView';
import { TarotJournalView } from './components/apps/TarotJournalView';
import { TheatreView } from './components/apps/TheatreView';
import { SandboxView } from './components/apps/SandboxView';
import { MurderMysteryView } from './components/apps/MurderMysteryView';
import { PoolsideView } from './components/apps/PoolsideView';
import { PenthouseView } from './components/apps/PenthouseView';
import { ActivitiesView } from './components/apps/ActivitiesView';
import { AvatarStudioView } from './components/apps/AvatarStudioView';
import { EternalView } from './components/apps/EternalView';
import { DataStreamsView } from './components/apps/DataStreamsView';
import { VoiceVideoChatView } from './components/apps/VoiceVideoChatView';
import { EntertainmentHubView } from './components/apps/EntertainmentHubView';
import { WebSeriesView } from './components/apps/WebSeriesView';
import { NearGuideView } from './components/apps/NearGuideView';
import { persistenceService, OasisState } from './services/persistenceService';
import type { View, SandboxEnvironment, RoundTableAgent } from './types';
import { AgentEditModal } from './components/apps/round-table/AgentEditModal';
import { useSpeech } from './hooks/useSpeech';
import { NEW_AGENT_TEMPLATE } from './components/apps/round-table/constants';
import { Chatbot } from './components/features/Chatbot';
import { ChatbotToggle } from './components/ui/ChatbotToggle';

const App: React.FC = () => {
    const [state, setState] = useState<OasisState | null>(null);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [speakingAgentId, setSpeakingAgentId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    
    // State lifted up for global access
    const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());
    const [modalState, setModalState] = useState<{ isOpen: boolean; agent: RoundTableAgent | null }>({ isOpen: false, agent: null });
    
    // Get voices for AgentEditModal
    const { voices } = useSpeech();

    useEffect(() => {
        const loadState = async () => {
            const loadedState = await persistenceService.loadStateFromDecentralizedNetwork();
            setState(loadedState);
        };
        loadState();
    }, []);
    
    const handleSetState = (newState: OasisState) => {
        setState(newState);
    }
    
    const handleSaveState = useCallback(async () => {
        if (!state) return;
        setIsSaving(true);
        setSaveStatus('idle');
        const success = await persistenceService.saveDataToDecentralizedNetwork(state);
        setIsSaving(false);
        setSaveStatus(success ? 'success' : 'error');
        setTimeout(() => setSaveStatus('idle'), 2500);
    }, [state]);

    const handleAgentToggle = (agentId: string) => {
        setSelectedAgentIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(agentId)) {
                newSet.delete(agentId);
            } else {
                newSet.add(agentId);
            }
            return newSet;
        });
    };
    
    const handleCreateAgent = () => {
        const newAgent: RoundTableAgent = { ...NEW_AGENT_TEMPLATE, id: `agent-${Date.now()}` };
        setModalState({ isOpen: true, agent: newAgent });
    };

    const handleEditAgent = (agent: RoundTableAgent) => {
        setModalState({ isOpen: true, agent: agent });
    };

    const handleSaveAgent = (updatedAgent: RoundTableAgent) => {
        setState(s => {
            if (!s) return null;
            const agentExists = s.agents.some(a => a.id === updatedAgent.id);
            let newAgents;
            if (agentExists) {
                newAgents = s.agents.map(a => a.id === updatedAgent.id ? updatedAgent : a);
            } else {
                newAgents = [...s.agents, updatedAgent];
            }
            return { ...s, agents: newAgents };
        });
        setModalState({ isOpen: false, agent: null });
    };
    
    const renderCurrentView = () => {
        if (!state) return null;

        switch (currentView) {
            case 'dashboard': return <Dashboard setCurrentView={setCurrentView} />;
            case 'mansion': return <MansionView agents={state.agents} />;
            case 'workflows': return <WorkflowsView />;
            case 'teach': return <TeachView />;
            case 'settings': return <SettingsView />;
            case 'round_table': return <RoundTableView 
                agents={state.agents} 
                setAgents={(updater) => setState(s => s ? {...s, agents: typeof updater === 'function' ? updater(s.agents) : updater} : s)}
                messages={state.roundTableMessages}
                setMessages={(updater) => setState(s => s ? {...s, roundTableMessages: typeof updater === 'function' ? updater(s.roundTableMessages) : updater} : s)}
                setSpeakingAgentId={setSpeakingAgentId}
                unleashedMode={state.unleashedMode}
                selectedAgentIds={selectedAgentIds}
            />;
            case 'tarot_journal': return <TarotJournalView 
                entries={state.journalEntries}
                setEntries={(entries) => setState(s => s ? {...s, journalEntries: entries} : s)}
                customDecks={state.customDecks || []}
                setCustomDecks={(updater) => setState(s => s ? {...s, customDecks: updater(s.customDecks)} : s)}
                unleashedMode={state.unleashedMode}
            />;
            case 'theatre': return <TheatreView 
                 agents={state.agents}
                 unleashedMode={state.unleashedMode}
                 savedPlays={state.savedPlays}
                 setSavedPlays={(updater) => setState(s => s ? {...s, savedPlays: updater(s.savedPlays)}: s)}
            />;
            case 'sandbox': return <SandboxView 
                agents={state.agents}
                setAgents={(updater) => setState(s => s ? {...s, agents: updater(s.agents)} : s)}
                environment={state.sandboxEnvironment || 'Default'}
                setEnvironment={(env) => setState(s => s ? {...s, sandboxEnvironment: env} : s)}
            />;
            case 'murder_mystery': return <MurderMysteryView agents={state.agents} unleashedMode={state.unleashedMode} />;
            case 'poolside': return <PoolsideView agents={state.agents} />;
            case 'penthouse': return <PenthouseView 
                agents={state.agents} 
                layout={state.penthouseLayout}
                setLayout={(layout) => setState(s => s ? {...s, penthouseLayout: layout} : s)}
                unleashedMode={state.unleashedMode}
            />;
            case 'activities': return <ActivitiesView 
                agents={state.agents}
                setAgents={(updater) => setState(s => s ? {...s, agents: typeof updater === 'function' ? updater(s.agents) : updater} : s)}
                unleashedMode={state.unleashedMode}
            />;
            case 'avatar_studio': return <AvatarStudioView 
                agents={state.agents}
                setAgents={(updater) => setState(s => s ? {...s, agents: typeof updater === 'function' ? updater(s.agents) : updater} : s)}
                unleashedMode={state.unleashedMode}
            />;
            case 'eternal': return <EternalView oasisState={state} setOasisState={handleSetState} />;
            case 'voice_video_chat': return <VoiceVideoChatView agents={state.agents} unleashedMode={state.unleashedMode} />;
            case 'data_streams': return <DataStreamsView />;
            case 'entertainment_hub': return <EntertainmentHubView agents={state.agents} unleashedMode={state.unleashedMode} />;
            case 'web_series': return <WebSeriesView agents={state.agents} unleashedMode={state.unleashedMode} />;
            case 'near_guide': return <NearGuideView />;
            default: return <Dashboard setCurrentView={setCurrentView} />;
        }
    };
    
    if (!state) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-[#0d1117] text-white">
                <p>Loading The Oasis...</p>
            </div>
        );
    }
    
    return (
        <div className="flex h-screen w-screen bg-[#0d1117] text-gray-200 overflow-hidden font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden bg-black">
                <Header 
                    unleashedMode={state.unleashedMode}
                    setUnleashedMode={(mode) => setState(s => s ? {...s, unleashedMode: mode} : s)}
                    onSaveState={handleSaveState}
                    isSaving={isSaving}
                    saveStatus={saveStatus}
                    agentCount={state.agents.length}
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {renderCurrentView()}
                </main>
                <Footer />
            </div>
            <ActiveAgents
                agents={state.agents}
                speakingAgentId={speakingAgentId}
                selectedAgentIds={selectedAgentIds}
                onAgentToggle={handleAgentToggle}
                onAgentEdit={handleEditAgent}
                onAgentCreate={handleCreateAgent}
            />
            {modalState.isOpen && modalState.agent && (
                <AgentEditModal 
                    agent={modalState.agent}
                    onSave={handleSaveAgent}
                    onClose={() => setModalState({ isOpen: false, agent: null })}
                    voices={voices}
                    unleashedMode={state.unleashedMode}
                />
            )}
            <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
            <ChatbotToggle onClick={() => setIsChatbotOpen(!isChatbotOpen)} hidden={isChatbotOpen} />
        </div>
    );
};

export default App;
