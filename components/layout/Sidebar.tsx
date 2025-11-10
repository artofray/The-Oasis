import React from 'react';
import type { View } from '../../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const OasisLogo = () => (
    <div className="w-12 h-12 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center">
             <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
        </div>
    </div>
);

const DashboardIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const AgentsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const ProjectsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>);
const StudioIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><path d="M8 11a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v0a4 4 0 0 0-4-4z"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>);
const DataStreamsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const SettingsIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);

const NAV_ITEMS: { id: View; name: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'mansion', name: 'Agents', icon: <AgentsIcon /> },
    { id: 'round_table', name: 'Round Table', icon: <ProjectsIcon /> },
    { id: 'avatar_studio', name: 'Studio', icon: <StudioIcon /> },
    { id: 'data_streams', name: 'Data Streams', icon: <DataStreamsIcon /> },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="w-24 bg-[#0d1117] border-r border-gray-800 flex flex-col items-center py-4">
      <div className="flex-shrink-0 mb-8">
        <OasisLogo />
      </div>
      <div className="flex-1 w-full flex flex-col items-center space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full h-16 flex items-center justify-center relative group transition-colors duration-200 ${
              currentView === item.id 
                ? 'text-cyan-300' 
                : 'text-gray-500 hover:text-white'
            }`}
          >
            <div className={`absolute left-0 top-0 h-full w-1 rounded-r-full transition-all duration-200 ${currentView === item.id ? 'bg-cyan-400' : 'bg-transparent'}`}></div>
            {item.icon}
            <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20">
                {item.name}
            </span>
          </button>
        ))}
      </div>
      <div className="flex-shrink-0 mt-auto">
        <div className="w-12 h-12 rounded-full border-2 border-gray-700 p-0.5">
          <img src="https://i.imgur.com/kQ1Y2wG.png" alt="User Avatar" className="w-full h-full object-cover rounded-full" />
        </div>
        <div className="text-center mt-2">
          <p className="text-xs font-semibold text-white">Maggie Craft</p>
          <p className="text-xs text-gray-500">Agora Health</p>
        </div>
      </div>
    </nav>
  );
};