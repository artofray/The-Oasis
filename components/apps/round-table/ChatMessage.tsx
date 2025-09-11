import React from 'react';
import type { ChatMessage as Message } from '../../../types';
import { AgentAvatar } from './AgentAvatar';

interface ChatMessageProps {
    message: Message;
}

const UserAvatar: React.FC = () => (
    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold text-white flex-shrink-0">
        U
    </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.author === 'User';
    const isGeneratingVideo = !!message.videoGenerationOperation;

    return (
        <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
            {!isUser && message.agent && <AgentAvatar agent={message.agent} />}
            <div className={`max-w-xl p-4 rounded-lg ${isUser ? 'bg-blue-600' : 'bg-[#2a2f3b]'}`}>
                {!isUser && <p className="font-bold text-sm mb-1">{message.author}</p>}
                
                {message.text === '...' && !isGeneratingVideo ? (
                     <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {isGeneratingVideo && <svg className="animate-spin h-5 w-5 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        <p className="text-white whitespace-pre-wrap">{message.text}</p>
                    </div>
                )}

                {message.imageUrl && (
                    <img src={message.imageUrl} alt="Generated content" className="mt-2 rounded-lg max-w-sm" />
                )}
                {message.videoUrl && (
                    <video src={message.videoUrl} controls className="mt-2 rounded-lg max-w-sm" />
                )}
                {message.sources && message.sources.length > 0 && (
                     <div className="mt-3 border-t border-gray-600 pt-2">
                        <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
                        <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, index) => (
                                <a
                                    key={index}
                                    href={source.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-gray-700 hover:bg-gray-600 text-blue-300 px-2 py-1 rounded-md truncate"
                                    title={source.title}
                                >
                                    {new URL(source.uri).hostname}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {isUser && <UserAvatar />}
        </div>
    );
};