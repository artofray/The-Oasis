import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MyAiAssistant } from './components/features/MyAiAssistant';
import { Dashboard } from './components/apps/Dashboard';
import { AgentsView } from './components/apps/AgentsView';
import { WorkflowsView } from './components/apps/WorkflowsView';
import { TeachView } from './components/apps/TeachView';
import { SettingsView } from './components/apps/SettingsView';
import { RoundTableView } from './components/apps/RoundTableView';
import { TarotJournalView } from './components/apps/TarotJournalView';

import { Header } from './components/layout/Header';
import type { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'agents':
        return <AgentsView />;
      case 'workflows':
        return <WorkflowsView />;
      case 'teach':
        return <TeachView />;
      case 'settings':
        return <SettingsView />;
      case 'round_table':
        return <RoundTableView />;
      case 'tarot_journal':
        return <TarotJournalView />;
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
      <MyAiAssistant setCurrentView={setCurrentView} />
    </div>
  );
};

export default App;