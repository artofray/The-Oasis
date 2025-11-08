import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MyAiAssistant } from './components/features/MyAiAssistant';
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
import { VoiceVideoChatView } from './components/apps/VoiceVideoChatView';
import { persistenceService, OasisState } from './services/persistenceService';
import type { View, SandboxEnvironment } from './types';

const App: React.FC = () => {
    const [state, setState] = useState<OasisState | null>(null);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [speakingAgentId, setSpeakingAgentId] = useState<string | null>(null);

    useEffect(() => {
        const loadState = async () => {
            const loadedState = await persistenceService.loadStateFromDecentralizedNetwork();
            setState(loadedState);
        };
        loadState();
    }, []);
    
    const saveState = useCallback(async (): Promise<boolean> => {
        if(state){
            return await persistenceService.saveDataToDecentralizedNetwork(state);
        }
        return false;
    }, [state]);

    const handleSetState = (newState: OasisState) => {
        setState(newState);
    }
    
    const renderCurrentView = () => {
        if (!state) return null;

        switch (currentView) {
            case 'dashboard': return <Dashboard />;
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
            />;
            case 'tarot_journal': return <TarotJournalView 
                entries={state.journalEntries}
                setEntries={(entries) => setState(s => s ? {...s, journalEntries: entries} : s)}
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
            default: return <Dashboard />;
        }
    };
    
    if (!state) {
        return (
            <div className="flex items-center justify-center h-screen w-screen bg-gray-900 text-white">
                <p>Loading The Oasis...</p>
            </div>
        );
    }
    
    const setSandboxEnvironment = (env: SandboxEnvironment) => {
        setState(s => s ? { ...s, sandboxEnvironment: env } : s);
    }
    
    return (
        <div className="flex h-screen w-screen bg-gray-900 text-gray-200 overflow-hidden font-sans">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    unleashedMode={state.unleashedMode}
                    setUnleashedMode={(mode) => setState(s => s ? {...s, unleashedMode: mode} : s)}
                    saveState={saveState}
                />
                <main className="flex-1 overflow-y-auto p-6 bg-black/20">
                    {renderCurrentView()}
                </main>
            </div>
            <MyAiAssistant 
                setCurrentView={setCurrentView}
                agents={state.agents}
                speakingAgentId={speakingAgentId}
                setSpeakingAgentId={setSpeakingAgentId}
                setSandboxEnvironment={setSandboxEnvironment}
            />
        </div>
    );
};

export default App;