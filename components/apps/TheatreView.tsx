import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import type { RoundTableAgent } from '../../types';

const CharacterCard: React.FC<{ character: RoundTableAgent }> = ({ character }) => {
    return (
        <div className="relative group overflow-hidden rounded-lg animate-fadeInUp">
            <img 
                src={character.avatarUrl} 
                alt={character.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-xl font-bold text-white font-playfair-display tracking-wider">{character.name}</h3>
                <p className="text-sm text-gray-300 font-lora">{character.description}</p>
            </div>
        </div>
    );
};

interface TheatreViewProps {
    agents: RoundTableAgent[];
}

export const TheatreView: React.FC<TheatreViewProps> = ({ agents }) => {
  return (
    <div className="h-full w-full" style={{ background: 'radial-gradient(ellipse at top, #2d3748, #1a202c)' }}>
      <div className="h-full w-full overflow-y-auto p-6">
        <header className="text-center mb-8 animate-fadeIn">
            <h2 className="text-4xl font-bold text-cyan-300 font-playfair-display">The Theatre</h2>
            <p className="text-gray-400 mt-2 font-lora">Meet the cast. A new performance begins soon.</p>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {agents.map(character => (
                <CharacterCard key={character.id} character={character} />
            ))}
        </div>
      </div>
    </div>
  );
};