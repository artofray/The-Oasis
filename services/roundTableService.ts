import { GoogleGenAI } from "@google/genai";
import type { RoundTableAgent, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const generateAgentResponse = async (
    agent: RoundTableAgent,
    history: ChatMessage[],
    prompt: string,
    webAccessEnabled: boolean
): Promise<{ text: string; sources?: { uri:string, title:string }[] }> => {
    try {
        const contents = history.map(msg => ({
            role: msg.author === 'User' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));
        
        contents.push({ role: 'user', parts: [{ text: prompt }] });

        const config: any = {
            systemInstruction: agent.systemInstruction,
        };

        if (webAccessEnabled) {
            config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
            model,
            contents,
            config,
        });

        const text = response.text;
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = groundingChunks?.map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
        })).filter((source: any, index: number, self: any[]) => 
            index === self.findIndex((s) => s.uri === source.uri)
        ) || [];

        return { text, sources };

    } catch (error) {
        console.error(`Error generating response for ${agent.name}:`, error);
        return { text: `I am unable to respond at the moment. Please try again.` };
    }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
};

export const generateAvatar = async (description: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Digital art portrait of an AI assistant embodying the concept of "${description}". Close-up, minimalist, abstract background, vibrant colors.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64Image}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating avatar:", error);
        return null;
    }
};

export const generateImageResponse = async (prompt: string): Promise<ChatMessage> => {
    const imageBase64 = await generateImage(`Cinematic photo of ${prompt}`);
    if (imageBase64) {
        return {
            id: `img-${Date.now()}`,
            author: 'Imagen',
            text: prompt,
            imageUrl: `data:image/jpeg;base64,${imageBase64}`
        };
    }
    return {
        id: `img-${Date.now()}`,
        author: 'System',
        text: 'Sorry, I was unable to generate an image for that prompt.',
    };
};

export const generateVideoResponse = async (prompt: string): Promise<ChatMessage> => {
    return {
        id: `vid-${Date.now()}`,
        author: 'Veo',
        text: `A video of "${prompt}" would be generated here, but this feature is a placeholder. Please enjoy this sample video instead!`,
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };
};

export const generateAnimationResponse = async (imageUrl: string, prompt: string): Promise<ChatMessage> => {
    return {
        id: `anim-${Date.now()}`,
        author: 'Veo',
        text: `An animation based on your image with the prompt "${prompt}" would be created here. This is a placeholder, so enjoy this sample video!`,
        videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    };
};

export const generateAudioResponse = async (prompt: string): Promise<ChatMessage> => {
    return {
        id: `aud-${Date.now()}`,
        author: 'System',
        text: `An audio clip for "${prompt}" would be generated here. For now, please use your imagination for the sound!`,
    };
};