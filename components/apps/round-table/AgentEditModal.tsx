import React, { useState, useEffect } from 'react';
import type { RoundTableAgent } from '../../../types';
import { XIcon } from '../tarot-journal/Icons';
import * as roundTableService from '../../../services/roundTableService';
import Spinner from '../tarot-journal/Spinner';

interface AgentEditModalProps {
    agent: RoundTableAgent;
    onSave: (agent: RoundTableAgent) => void;
    onClose: () => void;
}

const AVATAR_COLORS = [
    'bg-indigo-500', 'bg-red-500', 'bg-gray-400', 'bg-sky-500',
    'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500'
];

const AvatarPreview: React.FC<{agent: RoundTableAgent}> = ({ agent }) => {
     if (agent.avatarUrl) {
        return <img src={agent.avatarUrl} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover mb-4 mx-auto" />;
    }
    return (
        <div className={`w-20 h-20 rounded-full ${agent.avatarColor} flex items-center justify-center text-3xl font-bold text-white mb-4 mx-auto`}>
            {agent.name.charAt(0)}
        </div>
    );
};

export const AgentEditModal: React.FC<AgentEditModalProps> = ({ agent, onSave, onClose }) => {
    const [formData, setFormData] = useState<RoundTableAgent>(agent);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setFormData(agent);
    }, [agent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleColorChange = (color: string) => {
        setFormData(prev => ({ ...prev, avatarColor: color, avatarUrl: undefined }));
    }

    const handleGenerateAvatar = async () => {
        setIsGenerating(true);
        const imageUrl = await roundTableService.generateAvatar(formData.description);
        if (imageUrl) {
            setFormData(prev => ({...prev, avatarUrl: imageUrl}));
        }
        setIsGenerating(false);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#171a21] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 m-4 relative border border-gray-700 transform transition-all animate-scaleIn" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <XIcon className="h-6 w-6" />
                </button>
                
                <h2 className="text-2xl font-bold mb-4 text-white text-center">Edit Agent</h2>
                
                <AvatarPreview agent={formData} />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={2} className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500 resize-none"/>
                    </div>
                    <div>
                        <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-300 mb-1">System Instructions</label>
                        <textarea name="systemInstruction" id="systemInstruction" value={formData.systemInstruction} onChange={handleChange} rows={5} className="w-full bg-[#2a2f3b] border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500 resize-none"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Avatar</label>
                         <button type="button" onClick={handleGenerateAvatar} disabled={isGenerating} className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-500">
                           {isGenerating && <Spinner />}
                           Generate Avatar with AI
                        </button>
                        <p className="text-center text-xs text-gray-400 my-2">OR</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {AVATAR_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleColorChange(color)}
                                    className={`w-8 h-8 rounded-full ${color} transition-transform transform hover:scale-110 ${formData.avatarColor === color && !formData.avatarUrl ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors mr-2">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};