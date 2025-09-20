import React from 'react';
import type { View } from '../../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);
const PenthouseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 21V11a3 3 0 00-3-3H6a3 3 0 00-3 3v10" />
    </svg>
);
const MansionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);
const WorkflowsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);
const TeachIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const RoundTableIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);
const TarotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25l1.685 5.182h5.45l-4.408 3.196 1.686 5.182L12 12.614l-4.408 3.196 1.686-5.182-4.408-3.196h5.45L12 2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21.25H5a2 2 0 01-2-2V4.75a2 2 0 012-2h14a2 2 0 012 2v14.5a2 2 0 01-2 2z" />
    </svg>
);
const TheatreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v14m-10-7h10m-10 7h10M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
    </svg>
);
const SandboxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);
const MurderMysteryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const PoolsideIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.885 11h8.23a2 2 0 012 2v1a2 2 0 002 2h.191M12 11V9.5m0 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 11V3m0 0l-3 3m3-3l3 3" />
    </svg>
);
const ActivitiesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l.34 2.27.94 6.06-2.28 1.95-6.06.94-2.27.34.34-2.27.94-6.06 2.28-1.95 6.06-.94L12 2.69z" />
        <path d="M2.69 12l2.27.34 6.06.94 1.95-2.28.94-6.06.34-2.27-2.27.34-6.06.94-1.95 2.28-.94 6.06L2.69 12z" />
        <path d="M12 21.31l-.34-2.27-.94-6.06 2.28-1.95 6.06-.94 2.27-.34-.34 2.27-.94 6.06-2.28 1.95-6.06.94L12 21.31z" />
        <path d="M21.31 12l-2.27-.34-6.06-.94-1.95 2.28-.94 6.06-.34 2.27 2.27-.34 6.06-.94 1.95-2.28.94-6.06L21.31 12z" />
    </svg>
);
const AvatarStudioIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
        <path d="M8 11a4 4 0 0 0-4 4v0a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v0a4 4 0 0 0-4-4z"/>
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
    </svg>
);
const EternalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(45 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-45 12 12)" />
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
);
const VoiceVideoChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


const NAV_ITEMS: { id: View; name: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'penthouse', name: 'Penthouse', icon: <PenthouseIcon /> },
    { id: 'avatar_studio', name: 'Avatar Studio', icon: <AvatarStudioIcon /> },
    { id: 'voice_video_chat', name: 'Voice & Video Chat', icon: <VoiceVideoChatIcon /> },
    { id: 'activities', name: 'Activities', icon: <ActivitiesIcon /> },
    { id: 'mansion', name: 'Mansion', icon: <MansionIcon /> },
    { id: 'theatre', name: 'Theatre', icon: <TheatreIcon /> },
    { id: 'sandbox', name: 'Sandbox', icon: <SandboxIcon /> },
    { id: 'murder_mystery', name: 'Murder Mystery', icon: <MurderMysteryIcon /> },
    { id: 'poolside', name: 'Poolside', icon: <PoolsideIcon /> },
    { id: 'workflows', name: 'Workflows', icon: <WorkflowsIcon /> },
    { id: 'teach', name: 'Teach Agent', icon: <TeachIcon /> },
    { id: 'round_table', name: 'AI Round Table', icon: <RoundTableIcon /> },
    { id: 'tarot_journal', name: 'AI Tarot Journal', icon: <TarotIcon /> },
    { id: 'eternal', name: 'Eternal', icon: <EternalIcon /> },
    { id: 'settings', name: 'Settings', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <nav className="w-20 bg-gray-900/50 border-r border-red-400/20 flex flex-col items-center py-6 space-y-6">
      <div className="text-red-400 font-black text-2xl">O</div>
      <div className="flex flex-col space-y-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`p-3 rounded-lg transition-all duration-300 relative group ${
              currentView === item.id 
                ? 'bg-red-500 text-gray-900 shadow-lg shadow-red-500/50' 
                : 'text-gray-400 hover:bg-red-500/20 hover:text-red-300'
            }`}
          >
            {item.icon}
            <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none z-20">
                {item.name}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};