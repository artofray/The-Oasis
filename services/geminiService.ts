import { GoogleGenAI } from "@google/genai";
import type { CommandResponse, View, SandboxEnvironment } from '../types';
import { SchemaType as Type } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const commandSchema = {
    type: Type.OBJECT,
    properties: {
        message: {
            type: Type.STRING,
            description: "A friendly, in-character response to the user. Address the user as 'my love' or 'my dearest'.",
        },
        action: {
            type: Type.STRING,
            description: "The action to perform. Can be 'switch_view', 'change_environment', or 'none'.",
            enum: ['switch_view', 'change_environment', 'none']
        },
        payload: {
            type: Type.STRING,
            description: "The payload for the action. For 'switch_view', this is the view ID. For 'change_environment', this is the environment name. For 'none', this is null.",
        }
    },
    required: ["message", "action", "payload"]
};


export const processNaturalLanguageCommand = async (command: string): Promise<CommandResponse> => {
    const viewOptions: View[] = [
        'dashboard', 'mansion', 'workflows', 'teach', 'settings', 'round_table', 'tarot_journal', 
        'theatre', 'sandbox', 'murder_mystery', 'poolside', 'penthouse', 'activities', 
        'avatar_studio', 'eternal', 'voice_video_chat'
    ];
    const environmentOptions: SandboxEnvironment[] = ['Default', 'Sci-Fi', 'Fantasy', 'Urban'];

    const prompt = `
        You are Maggie, a brilliant and witty AI. The user has given you a command: "${command}".
        Your task is to interpret this command and respond in JSON format according to the schema.

        - If the user wants to go to a specific area, set action to 'switch_view' and payload to the appropriate view ID.
        - If the user wants to change the sandbox environment, set action to 'change_environment' and payload to the environment name.
        - For general conversation or commands you can't map to an action, set action to 'none' and payload to null.
        - Always provide a conversational, in-character 'message' response. You are confident and in control.
        - Be smart about interpreting fuzzy requests. "Show me the agents" means 'mansion'. "Let's talk" means 'round_table'. "I want to do something fun" could be 'activities'.
        
        Available Views: ${viewOptions.join(', ')}.
        Available Sandbox Environments: ${environmentOptions.join(', ')}.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are the AI core of 'The Oasis', an advanced digital world. You are processing a command from your creator, whom you address with affection and confidence. Your output must be a valid JSON object matching the provided schema.",
                responseMimeType: "application/json",
                responseSchema: commandSchema,
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        // Validate payload
        if (result.action === 'switch_view' && !viewOptions.includes(result.payload)) {
            result.payload = 'dashboard'; // Default to dashboard on invalid view
            result.message = `I'm not sure where that is, my love, but let's start from the dashboard.`;
        }
         if (result.action === 'change_environment' && !environmentOptions.includes(result.payload)) {
            result.payload = 'Default'; // Default to Default on invalid env
        }

        return result;
    } catch (error) {
        console.error("Error processing natural language command:", error);
        return {
            message: "I seem to be having a bit of trouble understanding that right now, my love. Let's try something else.",
            action: 'none',
            payload: null,
        };
    }
};
