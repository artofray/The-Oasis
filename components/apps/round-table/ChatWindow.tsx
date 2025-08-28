import React, { useEffect, useRef } from 'react';
import type { ChatMessage as Message } from '../../../types';
import { ChatMessage } from './ChatMessage';
import { Welcome } from './Welcome';

interface ChatWindowProps {
    messages: Message[];
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
                <Welcome />
            ) : (
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                </div>
            )}
        </div>
    );
};
