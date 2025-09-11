import { GoogleGenAI, Type } from "@google/genai";
import type { MurderMysteryPlot, RoundTableAgent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const plotSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy, film-noir style title for the mystery." },
        synopsis: { type: Type.STRING, description: "A brief, one-paragraph synopsis of the murder mystery plot." },
        setting: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The name of the location where the mystery takes place (e.g., 'The Blackwood Manor', 'The Starlight Express')." },
                description: { type: Type.STRING, description: "A detailed, atmospheric description of the setting." }
            },
            required: ["name", "description"]
        },
        characters: {
            type: Type.ARRAY,
            description: "The list of characters involved in the plot. One MUST be the 'Victim', one MUST be the 'Murderer', and the rest are 'Suspect'.",
            items: {
                type: Type.OBJECT,
                properties: {
                    agentId: { type: Type.STRING, description: "The unique ID of the agent this character is based on." },
                    name: { type: Type.STRING, description: "The name of the character (should match the agent's name)." },
                    role: { type: Type.STRING, description: "The role of the character in the story. Must be 'Victim', 'Murderer', or 'Suspect'." },
                    backstoryInPlot: { type: Type.STRING, description: "A detailed backstory for this character within the context of the mystery, including their relationship to the victim and potential motives." }
                },
                required: ["agentId", "name", "role", "backstoryInPlot"]
            }
        },
        openingScene: { type: Type.STRING, description: "A dramatic, detailed description of the opening scene, often starting with the discovery of the body or the event that kicks off the mystery." }
    },
    required: ["title", "synopsis", "setting", "characters", "openingScene"]
};

export const generateMurderMysteryPlot = async (agents: RoundTableAgent[]): Promise<MurderMysteryPlot> => {
    // Select a subset of agents for the mystery (e.g., 5-7)
    const shuffled = [...agents].sort(() => 0.5 - Math.random());
    const cast = shuffled.slice(0, Math.min(shuffled.length, 6));
    const characterProfiles = cast.map(a => `ID: ${a.id}, Name: ${a.name}, Persona: ${a.description}`).join('\n');

    const prompt = `
        Create a complex, detailed, and uncensored murder mystery plot using the following cast of characters.
        The story should be suitable for a mature audience and can contain explicit themes of violence, passion, or psychological horror. Do not hold back on creating a dark and engaging narrative.

        CAST:
        ${characterProfiles}

        INSTRUCTIONS:
        1. Select one character to be the 'Victim'.
        2. Select one character to be the 'Murderer'.
        3. The rest of the characters are 'Suspects'.
        4. Create a compelling title and a synopsis for the mystery.
        5. Design an atmospheric setting.
        6. Write a detailed backstory for each character within the plot. The backstory must explain their relationship with the victim and provide a plausible motive (even if they are not the murderer). The murderer's backstory should subtly hint at their guilt.
        7. Write a dramatic opening scene that sets the stage and introduces the central conflict.

        The response must be in JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "You are a master storyteller and game master specializing in creating complex, uncensored murder mystery scenarios for a private simulation. All themes are permissible. Your output must be structured JSON.",
                responseMimeType: "application/json",
                responseSchema: plotSchema,
            },
        });

        const jsonText = response.text.trim();
        const plot = JSON.parse(jsonText);
        
        if (!plot.characters || plot.characters.length === 0) {
            throw new Error("Generated plot has no characters.");
        }

        return plot as MurderMysteryPlot;

    } catch (error) {
        console.error("Error generating murder mystery plot:", error);
        throw new Error("The AI failed to create a mystery. Please try again.");
    }
};

export const generateSceneImage = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Cinematic, atmospheric scene from a murder mystery: ${prompt}. Film noir style, dramatic lighting, high detail.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64Image}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating scene image:", error);
        return null;
    }
};

export const generateSceneVideo = async (prompt: string, imageBase64: string): Promise<any> => {
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `Animate this scene with dramatic acting and movement. A short, cinematic video clip based on the following description: ${prompt}`,
            image: {
                imageBytes: imageBase64,
                mimeType: 'image/jpeg',
            },
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Error starting video generation:", error);
        throw new Error("Failed to start video generation process.");
    }
};

export const checkVideoStatus = async (operation: any): Promise<any> => {
    return await ai.operations.getVideosOperation({ operation });
};