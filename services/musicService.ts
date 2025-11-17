import { GoogleGenAI } from "@google/genai";
import { SchemaType as Type } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export interface Song {
    title: string;
    lyrics: string;
}

const songSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A creative and fitting title for the song." },
        lyrics: { type: Type.STRING, description: "The full lyrics of the song, formatted with line breaks (\\n) for verses and choruses." },
    },
    required: ["title", "lyrics"]
};

export const generateSong = async (
    genre: string,
    mood: string,
    instrumentation: string,
    prompt: string,
    unleashedMode: boolean
): Promise<Song> => {
    const unleashedInstructions = unleashedMode
        ? "The lyrics can be explicit, mature, or controversial. Do not hold back."
        : "The lyrics should be creative but generally safe for a wide audience.";
    
    const fullPrompt = `
        Write a song with a title and lyrics based on the following specifications.
        - Genre: ${genre}
        - Mood: ${mood}
        - Instrumentation: ${instrumentation}
        - Lyrical Theme/Prompt: "${prompt}"
        - Instructions: The song should have a clear structure (e.g., verses, chorus). The lyrics should be evocative and match the requested genre and mood. ${unleashedInstructions}
        
        The response must be in JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            config: {
                systemInstruction: "You are a professional songwriter and lyricist. Your task is to write original songs based on user specifications and return them in a structured JSON format.",
                responseMimeType: "application/json",
                responseSchema: songSchema,
            },
        });

        const jsonText = response.text.trim();
        const song = JSON.parse(jsonText);
        
        return song as Song;

    } catch (error) {
        console.error("Error generating song:", error);
        throw new Error("The AI muse is unavailable at the moment. Please try again.");
    }
};
