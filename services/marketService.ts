import { GoogleGenAI } from "@google/genai";
import { type StockAnalysis, type RoundTableAgent, SchemaType as Type } from '../types';
import { AGENTS } from '../components/apps/round-table/constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

// FIX: Updated to use GoogleGenAI from @google/genai and initialize with an API key object as per latest SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const marcus = AGENTS.find(a => a.id === 'marcus');
if (!marcus) {
    throw new Error("Marcus the Economist agent not found.");
}

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        companyName: { type: Type.STRING, description: "The full name of the company." },
        ticker: { type: Type.STRING, description: "The stock ticker symbol." },
        summary: { type: Type.STRING, description: "A concise, one-paragraph analysis of the stock's current position and recent performance." },
        sentiment: { type: Type.STRING, description: "The overall sentiment. Must be 'Bullish', 'Bearish', or 'Neutral'." },
        keyFactors: {
            type: Type.ARRAY,
            description: "A list of 3-4 key factors or bullet points an investor should watch.",
            items: { type: Type.STRING }
        }
    },
    required: ["companyName", "ticker", "summary", "sentiment", "keyFactors"]
};

export const getStockAnalysis = async (ticker: string): Promise<StockAnalysis> => {
    const prompt = `Provide a detailed market analysis for the stock ticker: ${ticker}. Use the provided search tools to get the latest information. Respond in JSON format according to this schema: ${JSON.stringify(analysisSchema)}`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                // FIX: Removed responseMimeType and responseSchema as they are not allowed with the googleSearch tool.
                // The prompt now instructs the model to return JSON instead.
                systemInstruction: marcus.systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });

        const jsonText = response.text.trim();
        const analysis = JSON.parse(jsonText);
        
        return analysis as StockAnalysis;

    } catch (error) {
        console.error("Error generating stock analysis:", error);
        throw new Error("Marcus is currently unavailable for consultation. The market data feed might be interrupted.");
    }
};