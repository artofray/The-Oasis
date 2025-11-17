
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
const TheatreIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 9.75h.01M15 9.75h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9C8.228 6.23 10.334 4 13 4s4.772 2.23 4.772 5" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2.25 2.25 0 00-2.25 2.25" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12a2.25 2.25 0 012.25 2.25" /></svg>);
const MysteryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10l.01.01" /></svg>);
const PoolsideIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>);
const PenthouseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V10a2 2 0 00-2-2h-4a2 2 0 00-2 2v11m-7-2a2 2 0 01-2-2v-7a2 2 0 012-2h4a2 2 0 012 2v7a2 2 0 01-2 2m-4 0H5a2 2 0 01-2-2v-7a2 2 0 012-2h4a2 2 0 012 2v7a2 2 0 01-2 2z" /></svg>);
const ActivitiesIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>);
const TarotIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>);
const MusicIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>);
const WebSeriesIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" /></svg>);
const GuideIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>);


const NAV_ITEMS: { id: View; name: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'mansion', name: 'Agents', icon: <AgentsIcon /> },
    { id: 'round_table', name: 'Round Table', icon: <ProjectsIcon /> },
    { id: 'avatar_studio', name: 'Studio', icon: <StudioIcon /> },
    { id: 'activities', name: 'Activities', icon: <ActivitiesIcon /> },
    { id: 'entertainment_hub', name: 'Entertainment', icon: <MusicIcon /> },
    { id: 'web_series', name: 'Web Series', icon: <WebSeriesIcon /> },
    { id: 'theatre', name: 'Theatre', icon: <TheatreIcon /> },
    { id: 'murder_mystery', name: 'Mystery', icon: <MysteryIcon /> },
    { id: 'poolside', name: 'Poolside', icon: <PoolsideIcon /> },
    { id: 'penthouse', name: 'Penthouse', icon: <PenthouseIcon /> },
    { id: 'tarot_journal', name: 'Tarot Journal', icon: <TarotIcon /> },
    { id: 'data_streams', name: 'Data Streams', icon: <DataStreamsIcon /> },
    { id: 'near_guide', name: 'NEAR Guide', icon: <GuideIcon /> },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="w-24 bg-[#0d1117] border-r border-gray-800 flex flex-col items-center py-4">
      <div className="flex-shrink-0 mb-8">
        <OasisLogo />
      </div>
      <div className="flex-1 w-full flex flex-col items-center space-y-2 overflow-y-auto">
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
