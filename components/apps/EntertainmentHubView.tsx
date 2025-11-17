import React from 'react';
import { MusicMachine } from './entertainment/MusicMachine';
import type { RoundTableAgent } from '../../types';

interface EntertainmentHubViewProps {
    agents: RoundTableAgent[];
    unleashedMode: boolean;
}

export const EntertainmentHubView: React.FC<EntertainmentHubViewProps> = ({ agents, unleashedMode }) => {
    // For now, we only have one module. In the future, we could have state to switch between them.
    // const [activeModule, setActiveModule] = useState('music_machine');

    return (
        <div className="h-full w-full animate-fadeIn">
            <header className="text-center mb-8">
                <h2 className="text-5xl font-bold text-fuchsia-300 font-playfair-display">Entertainment Hub</h2>
                <p className="text-gray-400 mt-2 font-lora text-lg">Your portal to creative AI-powered experiences.</p>
            </header>
            
            {/* We can add a module selector here later */}
            
            <MusicMachine agents={agents} unleashedMode={unleashedMode} />
        </div>
    );
};
