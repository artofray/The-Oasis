import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { RoundTableAgent } from '../../types';
import { KaraokeView } from './poolside/KaraokeView';
import { ComedyNightView } from './poolside/ComedyNightView';
import { BarbieBarView } from './poolside/BarbieBarView';
import { WineCellarView } from './poolside/WineCellarView';
import { KaraokeIcon, ComedyIcon, BarIcon, WineIcon, BackIcon } from './poolside/Icons';

type PoolsideActivity = 'karaoke' | 'comedy' | 'bar' | 'cellar';

interface PoolsideViewProps {
    agents: RoundTableAgent[];
}

const ActivityCard: React.FC<{ title: string, description: string, icon: React.ReactNode, onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <GlassCard onClick={onClick} className="p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-cyan-400/50 hover:scale-105 hover:shadow-cyan-500/20">
        <div className="mb-4 text-cyan-400">{icon}</div>
        <h3 className="text-2xl font-bold font-playfair-display text-white mb-2">{title}</h3>
        <p className="text-gray-400 font-lora">{description}</p>
    </GlassCard>
);

export const PoolsideView: React.FC<PoolsideViewProps> = ({ agents }) => {
    const [currentActivity, setCurrentActivity] = useState<PoolsideActivity | null>(null);

    const renderActivity = () => {
        switch (currentActivity) {
            case 'karaoke':
                return <KaraokeView agents={agents} />;
            case 'comedy':
                return <ComedyNightView agents={agents} />;
            case 'bar':
                const barbie = agents.find(a => a.id === 'barbie');
                return barbie ? <BarbieBarView bartender={barbie} /> : <p>Bartender Barbie is currently unavailable.</p>;
            case 'cellar':
                return <WineCellarView />;
            default:
                return null;
        }
    };

    if (currentActivity) {
        return (
            <div className="h-full flex flex-col animate-fadeIn">
                <button onClick={() => setCurrentActivity(null)} className="flex items-center gap-2 mb-4 text-sm font-bold text-cyan-300 hover:text-cyan-100 transition-colors self-start">
                    <BackIcon className="w-5 h-5" />
                    Back to Poolside
                </button>
                <div className="flex-1">
                    {renderActivity()}
                </div>
            </div>
        );
    }
    
    return (
        <div className="animate-fadeIn">
            <header className="text-center mb-8">
                <h2 className="text-5xl font-bold text-cyan-300 font-playfair-display">Poolside Pavilion</h2>
                <p className="text-gray-400 mt-2 font-lora text-lg">Your escape for entertainment and relaxation. What's the plan?</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActivityCard 
                    title="Karaoke Stage" 
                    description="AI residents sing their hearts out. Grab the mic or enjoy the show."
                    icon={<KaraokeIcon className="w-16 h-16" />}
                    onClick={() => setCurrentActivity('karaoke')}
                />
                <ActivityCard 
                    title="Comedy Club" 
                    description="It's roast night! Watch the AIs deliver some serious burns."
                    icon={<ComedyIcon className="w-16 h-16" />}
                    onClick={() => setCurrentActivity('comedy')}
                />
                <ActivityCard 
                    title="Barbie's Bar" 
                    description="Craft cocktails and conversation with our resident mixologist."
                    icon={<BarIcon className="w-16 h-16" />}
                    onClick={() => setCurrentActivity('bar')}
                />
                 <ActivityCard 
                    title="Wine Cellar" 
                    description="Explore and 'taste' a curated collection of fine wines from around the world."
                    icon={<WineIcon className="w-16 h-16" />}
                    onClick={() => setCurrentActivity('cellar')}
                />
            </div>
        </div>
    );
};