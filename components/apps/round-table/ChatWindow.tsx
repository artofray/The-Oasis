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
        // This robustly scrolls the container to the bottom after each message update.
        // Using `setTimeout` with a 0ms delay pushes this execution to the end of the event loop,
        // ensuring the DOM has been updated and the correct scrollHeight is available,
        // which is crucial when messages contain images that load asynchronously.
        const timer = setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 0);

        return () => clearTimeout(timer); // Cleanup the timer on component unmount or before the next run
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
