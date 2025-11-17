
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

let chat: Chat | null = null;

const getChat = () => {
    if (!chat) {
        chat = ai.chats.create({
            model: model,
            config: {
                systemInstruction: "You are a helpful and friendly AI assistant for The Oasis, a sophisticated AI operating system. Be concise and helpful.",
            }
        });
    }
    return chat;
}

export const sendMessageStream = async (message: string) => {
    const chatSession = getChat();
    try {
        const result = await chatSession.sendMessageStream({ message });
        return result;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        // If there's an error, maybe the chat session is broken. Let's reset it.
        chat = null;
        throw error;
    }
};

export const resetChat = () => {
    chat = null;
}
