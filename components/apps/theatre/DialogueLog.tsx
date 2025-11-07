import React, { useEffect, useRef } from 'react';
import type { TheatreMessage, RoundTableAgent } from '../../../types';

interface DialogueLogProps {
    dialogue: TheatreMessage[];
    agents: RoundTableAgent[];
}

export const DialogueLog: React.FC<DialogueLogProps> = ({ dialogue, agents }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [dialogue]);

    const getAgentColor = (agentId: string) => {
        const agent = agents.find(a => a.id === agentId);
        return agent ? agent.colorHex : '#FFFFFF';
    };
    
    return (
        <div className="mt-4 flex-1 flex flex-col bg-black/30 rounded-lg p-4">
            <h3 className="text-xl font-bold text-gray-300 mb-2 font-playfair-display">Script</h3>
            <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-3">
                {dialogue.length === 0 ? (
                    <p className="text-gray-500 italic">The stage is quiet...</p>
                ) : (
                    dialogue.map(msg => (
                        <div key={msg.id}>
                            <p className="font-bold" style={{ color: getAgentColor(msg.agentId) }}>
                                {msg.characterName ? `${msg.characterName} (${msg.agentName})` : msg.agentName}
                            </p>
                            <p className="text-gray-200 pl-4 whitespace-pre-wrap">
                                {msg.cue && <span className="text-gray-400 italic">({msg.cue}) </span>}
                                {msg.text}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};