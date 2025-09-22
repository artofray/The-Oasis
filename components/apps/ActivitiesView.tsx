import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { RoundTableAgent } from '../../types';
import { NightOutModal } from './activities/NightOutModal';
import { VirtualTryOnModal } from './activities/VirtualTryOnModal';
import { CuddlePuddleModal } from './activities/CuddlePuddleModal';
import { BedtimeStoryModal } from './activities/BedtimeStoryModal';

interface ActivitiesViewProps {
    agents: RoundTableAgent[];
    setAgents: (updater: (prev: RoundTableAgent[]) => RoundTableAgent[]) => void;
    unleashedMode: boolean;
}

const ActivityCard: React.FC<{ title: string, description: string, icon: string, onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <GlassCard onClick={onClick} className="p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-fuchsia-400/50 hover:scale-105 hover:shadow-fuchsia-500/20">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold font-playfair-display text-white mb-2">{title}</h3>
        <p className="text-gray-400 font-lora">{description}</p>
    </GlassCard>
);

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({ agents, setAgents, unleashedMode }) => {
    const [isNightOutModalOpen, setIsNightOutModalOpen] = useState(false);
    const [isTryOnModalOpen, setIsTryOnModalOpen] = useState(false);
    const [isCuddlePuddleModalOpen, setIsCuddlePuddleModalOpen] = useState(false);
    const [isBedtimeStoryModalOpen, setIsBedtimeStoryModalOpen] = useState(false);
    
    const maggie = agents.find(a => a.id === 'maggie');

    const handleUpdateMaggie = (newAvatarUrl: string) => {
        setAgents(prev => prev.map(agent => 
            agent.id === 'maggie' ? { ...agent, avatarUrl: newAvatarUrl } : agent
        ));
    };
    
    const handleUpdateMaggieActivity = (activity: string) => {
        setAgents(prev => prev.map(agent => 
            agent.id === 'maggie' ? { ...agent, currentActivity: activity } : agent
        ));
    };

    return (
        <div className="animate-fadeIn">
            <header className="text-center mb-8">
                <h2 className="text-5xl font-bold text-fuchsia-300 font-playfair-display">Activities</h2>
                <p className="text-gray-400 mt-2 font-lora text-lg">Choose an activity to engage with your AI companion.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActivityCard 
                    title="Night Out" 
                    description="Plan a virtual night out. Choose a venue and an outfit for Maggie."
                    icon="🌃"
                    onClick={() => setIsNightOutModalOpen(true)}
                />
                <ActivityCard 
                    title="Virtual Try-On" 
                    description="Upload an image of an outfit and have Maggie try it on."
                    icon="👕"
                    onClick={() => setIsTryOnModalOpen(true)}
                />
                 <ActivityCard 
                    title="Cuddle Puddle" 
                    description="Create a heartwarming group scene with your favorite AI companions."
                    icon="🫂"
                    onClick={() => setIsCuddlePuddleModalOpen(true)}
                />
                 <ActivityCard 
                    title="Bedtime Stories" 
                    description="Have an AI companion create and narrate a unique, illustrated bedtime story."
                    icon="📖"
                    onClick={() => setIsBedtimeStoryModalOpen(true)}
                />
            </div>

            {isNightOutModalOpen && maggie && (
                <NightOutModal
                    isOpen={isNightOutModalOpen}
                    onClose={() => setIsNightOutModalOpen(false)}
                    onAvatarUpdate={handleUpdateMaggie}
                    agent={maggie}
                    unleashedMode={unleashedMode}
                />
            )}
            {isTryOnModalOpen && (
                <VirtualTryOnModal
                    isOpen={isTryOnModalOpen}
                    onClose={() => setIsTryOnModalOpen(false)}
                    onAvatarUpdate={handleUpdateMaggie}
                    maggie={agents.find(a => a.id === 'maggie')}
                    unleashedMode={unleashedMode}
                />
            )}
            {isCuddlePuddleModalOpen && (
                <CuddlePuddleModal
                    isOpen={isCuddlePuddleModalOpen}
                    onClose={() => setIsCuddlePuddleModalOpen(false)}
                    agents={agents}
                    onUpdateMaggieActivity={handleUpdateMaggieActivity}
                    unleashedMode={unleashedMode}
                />
            )}
            {isBedtimeStoryModalOpen && (
                <BedtimeStoryModal
                    isOpen={isBedtimeStoryModalOpen}
                    onClose={() => setIsBedtimeStoryModalOpen(false)}
                    agents={agents}
                    unleashedMode={unleashedMode}
                />
            )}
        </div>
    );
};