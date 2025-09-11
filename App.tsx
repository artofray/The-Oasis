// FIX: Moved React import to the top of the file.
import React, { useState, useEffect } from 'react';
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


import { Header } from './components/layout/Header';
import type { View, RoundTableAgent, PenthouseLayout } from './types';
import { AGENTS as INITIAL_AGENTS } from './components/apps/round-table/constants';

const AGENTS_STORAGE_KEY = 'the_oasis_agents';
const PENTHOUSE_LAYOUT_KEY = 'the_oasis_penthouse_layout';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const [agents, setAgents] = useState<RoundTableAgent[]>(() => {
    try {
      const savedAgents = localStorage.getItem(AGENTS_STORAGE_KEY);
      return savedAgents ? JSON.parse(savedAgents) : INITIAL_AGENTS;
    } catch (error) {
      console.error("Failed to load agents from local storage:", error);
      return INITIAL_AGENTS;
    }
  });

  const [penthouseLayout, setPenthouseLayout] = useState<PenthouseLayout>(() => {
    try {
      const savedLayout = localStorage.getItem(PENTHOUSE_LAYOUT_KEY);
      return savedLayout ? JSON.parse(savedLayout) : [];
    } catch (error) {
      console.error("Failed to load penthouse layout from local storage:", error);
      return [];
    }
  });


  useEffect(() => {
    try {
      localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
    } catch (error) {
      console.error("Failed to save agents to local storage:", error);
    }
  }, [agents]);

  useEffect(() => {
    try {
      localStorage.setItem(PENTHOUSE_LAYOUT_KEY, JSON.stringify(penthouseLayout));
    } catch (error) {
      console.error("Failed to save penthouse layout to local storage:", error);
    }
  }, [penthouseLayout]);


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
        return <RoundTableView agents={agents} setAgents={setAgents} />;
      case 'tarot_journal':
        return <TarotJournalView />;
      case 'theatre':
        return <TheatreView agents={agents} />;
      case 'sandbox':
        return <SandboxView agents={agents} setAgents={setAgents} />;
      case 'murder_mystery':
        return <MurderMysteryView agents={agents} />;
      case 'poolside':
        return <PoolsideView agents={agents} />;
      case 'penthouse':
        return <PenthouseView agents={agents} layout={penthouseLayout} setLayout={setPenthouseLayout} />;
      case 'activities':
        return <ActivitiesView agents={agents} setAgents={setAgents} />;
      case 'avatar_studio':
        return <AvatarStudioView agents={agents} setAgents={setAgents} />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-200 font-sans overflow-hidden">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 flex flex-col h-full">
        <Header />
        <div className="flex-1 p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {renderView()}
        </div>
      </main>
      <MyAiAssistant setCurrentView={setCurrentView} agents={agents} />
    </div>
  );
};

export default App;