import { GoogleGenAI } from "@google/genai";
import type { CommandResponse, TaskPriority } from '../types';

// FIX: Updated to use GoogleGenAI from @google/genai and initialize with an API key object as per latest SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const commandMap: { keywords: string[], action: CommandResponse['action'], payload?: string }[] = [
    { keywords: ['dashboard', 'home', 'overview'], action: 'switch_view', payload: 'dashboard' },
    { keywords: ['agent', 'employee', 'bot'], action: 'switch_view', payload: 'agents' },
    { keywords: ['workflow', 'task', 'automation'], action: 'switch_view', payload: 'workflows' },
    { keywords: ['teach', 'train', 'learn'], action: 'switch_view', payload: 'teach' },
    { keywords: ['setting', 'config'], action: 'switch_view', payload: 'settings' },
    { keywords: ['round table', 'discussion', 'debate'], action: 'switch_view', payload: 'round_table' },
    { keywords: ['tarot', 'journal', 'reading'], action: 'switch_view', payload: 'tarot_journal' },
];

export const processNaturalLanguageCommand = async (prompt: string): Promise<CommandResponse> => {
    const lowerCasePrompt = prompt.toLowerCase().trim();

    // Simulate thinking delay
    await new Promise(res => setTimeout(res, 500));

    // Specific command matching
    for (const cmd of commandMap) {
        if (cmd.keywords.some(k => lowerCasePrompt.includes(k))) {
            return {
                action: cmd.action,
                payload: cmd.payload,
                message: `Understood. Navigating to ${cmd.payload}.`
            };
        }
    }
    
    // Informational commands
    if (lowerCasePrompt.includes('sentinel') || lowerCasePrompt.includes('security')) {
        return { action: 'info', message: "All agent containers are isolated and secure. Real-time monitoring is active." };
    }
    if (lowerCasePrompt.includes('oasis')) {
        return { action: 'info', message: "The Oasis is a cloud-native, AI-driven operating system designed to automate digital workflows through autonomous 'cloud employees'." };
    }

    // General knowledge query or task assignment with search grounding
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                systemInstruction: "You are an AI assistant for The Oasis. First, determine if the user's request is a task for an AI agent or a general knowledge question. If it's a task, rephrase it clearly and then add a priority on a new line, like this: 'PRIORITY: low|medium|high'. Use keywords like 'immediately', 'urgent', 'asap' to infer high priority, and 'when you can', 'later' for low priority. Default to medium. If it's a question, answer it directly using the provided search tool information if necessary."
            },
        });

        const rawText = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = groundingChunks?.map((chunk: any) => ({
            title: chunk.web.title,
            uri: chunk.web.uri,
        }));
        
        const priorityMatch = rawText.match(/\nPRIORITY: (low|medium|high)/);

        if (priorityMatch && priorityMatch[1]) {
            const priority = priorityMatch[1] as TaskPriority;
            const message = rawText.replace(priorityMatch[0], '').trim();
            return {
                action: 'task_assigned',
                message: message,
                payload: { priority }
            };
        }

        return {
            action: 'general_answer',
            message: response.text,
            sources: sources || [],
        };
    } catch (error) {
        console.error("General query failed:", error);
        return { action: 'error', message: "I'm having trouble connecting to my knowledge base right now. Please try again." };
    }
};