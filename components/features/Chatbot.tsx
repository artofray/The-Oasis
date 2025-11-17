
import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { sendMessageStream, resetChat } from '../../services/chatbotService';
import type { SimpleChatMessage } from '../../types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotMessage: React.FC<{ message: SimpleChatMessage }> = ({ message }) => {
  const isModel = message.role === 'model';
  return (
    <div className={`flex items-start gap-2.5 ${!isModel ? 'justify-end' : ''}`}>
      {isModel && (
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${isModel ? 'bg-gray-700' : 'bg-blue-600'}`}>
        <p className="text-sm text-white whitespace-pre-wrap">{message.text || '...'}</p>
      </div>
    </div>
  );
};

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: SimpleChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await sendMessageStream(input);
      
      let modelResponse = '';
      const modelMessage: SimpleChatMessage = { role: 'model', text: '' };
      setMessages(prev => [...prev, modelMessage]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, text: modelResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: SimpleChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting right now." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    resetChat();
  };

  if (!isOpen) return null;

  return (
    <GlassCard className="fixed bottom-6 right-6 w-[400px] h-[600px] z-50 flex flex-col shadow-2xl animate-fadeInUp">
      {/* Header */}
      <div className="flex-shrink-0 p-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-cyan-300">AI Assistant</h3>
            <button onClick={handleNewChat} title="New Chat" className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {messages.length === 0 && (
            <div className="text-center text-gray-500 h-full flex flex-col justify-center">
                <p>Ask me anything!</p>
            </div>
        )}
        {messages.map((msg, index) => (
          <ChatbotMessage key={index} message={msg} />
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-600">
            {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            )}
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
