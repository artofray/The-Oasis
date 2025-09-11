import { GoogleGenAI } from "@google/genai";
import { type RoundTableAgent, SchemaType as Type } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

// FIX: Updated to use GoogleGenAI from @google/genai and initialize with an API key object as per latest SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const generateRoastJoke = async (roastmaster: RoundTableAgent, target: string): Promise<string> => {
    const prompt = `Generate a short, witty, and sharp roast joke about "${target}". The joke should be in the style of a stand-up comedian. It should be clever and biting, but ultimately in good fun.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: `You are playing the role of ${roastmaster.name}, a comedian known for their ${roastmaster.description}. Your task is to deliver a roast joke. Adopt their personality.`,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating roast joke:", error);
        return "I'm drawing a blank... I guess the real joke is my AI writer's block.";
    }
};


const cocktailSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "A creative and fitting name for the cocktail." },
        description: { type: Type.STRING, description: "A brief, enticing description of the cocktail's flavor profile and character." },
        ingredients: {
            type: Type.ARRAY,
            description: "A list of ingredients with precise measurements.",
            items: { type: Type.STRING }
        },
        instructions: {
            type: Type.ARRAY,
            description: "Step-by-step instructions for mixing the cocktail.",
            items: { type: Type.STRING }
        },
        garnish: { type: Type.STRING, description: "The recommended garnish for the cocktail." }
    },
    required: ["name", "description", "ingredients", "instructions", "garnish"]
};

export const generateCocktailRecipe = async (prompt: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `The user wants a cocktail. Their request is: "${prompt}". If they ask for a classic, provide the classic recipe. If they describe flavors, invent a unique craft cocktail that fits their description.`,
            config: {
                systemInstruction: "You are a world-class mixologist. Your task is to provide expert cocktail recipes in a structured JSON format.",
                responseMimeType: "application/json",
                responseSchema: cocktailSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating cocktail recipe:", error);
        throw new Error("The bar is currently closed. Our mixologist seems to be on a break.");
    }
};


const tastingNotesSchema = {
    type: Type.OBJECT,
    properties: {
        aroma: { type: Type.STRING, description: "A description of the wine's aromas and bouquet." },
        palate: { type: Type.STRING, description: "A description of the wine's flavors, body, and texture on the palate." },
        finish: { type: Type.STRING, description: "A description of the wine's finish or aftertaste." },
        pairing: { type: Type.STRING, description: "A suggestion for a food pairing that would complement the wine." }
    },
    required: ["aroma", "palate", "finish", "pairing"]
};

export const generateTastingNotes = async (wineName: string): Promise<any> => {
    const prompt = `Generate detailed and professional tasting notes for the following real-world wine: ${wineName}.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction: "You are an expert sommelier providing tasting notes for fine wines. Your output must be in a structured JSON format.",
                responseMimeType: "application/json",
                responseSchema: tastingNotesSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating tasting notes:", error);
        throw new Error("Could not retrieve tasting notes. The bottle might be corked.");
    }
};