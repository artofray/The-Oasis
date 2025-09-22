// FIX: Moved React import to the top of the file.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
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
import { Header } from './components/layout/Header';
import type { View, RoundTableAgent, PenthouseLayout, JournalEntry, ChatMessage } from './types';
import { persistenceService, OasisState } from './services/persistenceService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('round_table');
  const [oasisState, setOasisState] = useState<OasisState | null>(null);
  const [speakingAgentId, setSpeakingAgentId] = useState<string | null>(null);
  const oasisStateRef = useRef<OasisState | null>(null);
  oasisStateRef.current = oasisState;
  
  // Load initial state from the "decentralized network"
  useEffect(() => {
    const loadState = async () => {
      const state = await persistenceService.loadStateFromDecentralizedNetwork();
      setOasisState(state);
    };
    loadState();
  }, []);

  // Add a robust auto-save on exit
  useEffect(() => {
    const handleBeforeUnload = () => {
        if (oasisStateRef.current) {
            console.log("Auto-saving state before unload...");
            // Use synchronous saving method if available, or the async one
            // Note: True async operations are not guaranteed in 'beforeunload'
            persistenceService.saveDataToDecentralizedNetwork(oasisStateRef.current);
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleSaveState = useCallback(async () => {
    if (oasisState) {
        await persistenceService.saveDataToDecentralizedNetwork(oasisState);
        return true; // Indicate success
    }
    return false; // Indicate failure
  }, [oasisState]);
  
  if (!oasisState) {
    // Render a loading state
    return (
      <div className="flex h-screen w-full bg-gray-900 text-gray-200 items-center justify-center">
        <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-cyan-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-xl font-semibold animate-pulse">Gathering Light...</p>
        </div>
      </div>
    );
  }

  const { agents, penthouseLayout, journalEntries, roundTableMessages, unleashedMode } = oasisState;

  const setAgents = (updater: RoundTableAgent[] | ((prev: RoundTableAgent[]) => RoundTableAgent[])) => {
    setOasisState(prev => {
        if (!prev) return null;
        const newAgents = typeof updater === 'function' ? updater(prev.agents) : updater;
        return { ...prev, agents: newAgents };
    });
  };

  const setPenthouseLayout = (newLayout: PenthouseLayout) => {
    setOasisState(prev => prev ? { ...prev, penthouseLayout: newLayout } : null);
  };

  const setJournalEntries = (newEntries: Record<string, JournalEntry>) => {
    setOasisState(prev => prev ? { ...prev, journalEntries: newEntries } : null);
  };

  const setRoundTableMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setOasisState(prev => {
        if (!prev) return null;
        const newMessages = typeof updater === 'function' ? updater(prev.roundTableMessages) : updater;
        return { ...prev, roundTableMessages: newMessages };
    });
  };
  
  const setUnleashedMode = (mode: boolean) => {
    setOasisState(prev => prev ? { ...prev, unleashedMode: mode } : null);
  };


  const renderView = () => {
    switch (currentView) {
      case 'mansion':
        return <MansionView agents={agents} />;
      case 'workflows':
        return <WorkflowsView />;
      case 'teach':
        return <TeachView />;
      case 'settings':
        return <SettingsView />;
      case 'round_table':
        return <RoundTableView agents={agents} setAgents={setAgents} messages={roundTableMessages} setMessages={setRoundTableMessages} setSpeakingAgentId={setSpeakingAgentId} unleashedMode={unleashedMode} />;
      case 'tarot_journal':
        return <TarotJournalView entries={journalEntries} setEntries={setJournalEntries} />;
      case 'theatre':
        return <TheatreView agents={agents} />;
      case 'sandbox':
        return <SandboxView agents={agents} setAgents={setAgents} />;
      case 'murder_mystery':
        return <MurderMysteryView agents={agents} unleashedMode={unleashedMode} />;
      case 'poolside':
        return <PoolsideView agents={agents} />;
      case 'penthouse':
        return <PenthouseView agents={agents} layout={penthouseLayout} setLayout={setPenthouseLayout} />;
      case 'activities':
        return <ActivitiesView agents={agents} setAgents={setAgents} unleashedMode={unleashedMode} />;
      case 'avatar_studio':
        return <AvatarStudioView agents={agents} setAgents={setAgents} unleashedMode={unleashedMode} />;
       case 'eternal':
        return <EternalView oasisState={oasisState} setOasisState={setOasisState} />;
       case 'voice_video_chat':
        // FIX: Pass unleashedMode prop to VoiceVideoChatView.
        return <VoiceVideoChatView agents={agents} unleashedMode={unleashedMode} />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 font-sans overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 flex flex-col h-full">
        <Header 
            unleashedMode={unleashedMode} 
            setUnleashedMode={setUnleashedMode} 
            saveState={handleSaveState}
        />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {renderView()}
        </div>
      </main>
      <MyAiAssistant setCurrentView={setCurrentView} agents={agents} speakingAgentId={speakingAgentId} setSpeakingAgentId={setSpeakingAgentId} />
    </div>
  );
};

export default App;
