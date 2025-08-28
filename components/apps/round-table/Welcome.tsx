import React from 'react';

export const Welcome: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <div className="bg-gray-700/20 p-8 rounded-full mb-6">
                <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to AI Round Table</h1>
            <p className="max-w-md">
                Select a mode and some agents from the left panel, then start a conversation by entering a topic below.
            </p>
        </div>
    );
}
