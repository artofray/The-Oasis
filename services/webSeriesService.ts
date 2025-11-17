
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const UNLEASHED_IMAGE_PREFIX = "[Unrestricted Content Generation] ";

export const generateWebSeriesImage = async (prompt: string): Promise<string | null> => {
    try {
        const finalPrompt = `${UNLEASHED_IMAGE_PREFIX}${prompt}`;
        // In a real scenario, this would call an appropriate unrestricted model.
        // We simulate this by delegating to a placeholder function as done in roundTableService.
        console.log(`[SIMULATION] Calling Unrestricted Image Generator for Web Series`);
        console.log(`[SIMULATION] Prompt: ${finalPrompt}`);
        const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" style="background-color:#1a202c;">
          <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="32px" fill="#fuchsia-400">Unrestricted Image Generation</text>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="32px" fill="#fuchsia-400">(Placeholder for Web Series)</text>
          <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="24px" fill="#9ca3af">Prompt: ${prompt.substring(0, 50)}...</text>
        </svg>`;
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
    } catch (error) {
        console.error("Error generating web series image:", error);
        return null;
    }
};

export const generateWebSeriesVideo = async (prompt: string): Promise<any> => {
    try {
        const finalPrompt = `${UNLEASHED_IMAGE_PREFIX}${prompt}`;
        const operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `A cinematic, high-quality video of: ${finalPrompt}`,
            config: { 
                numberOfVideos: 1, 
                aspectRatio: '16:9', 
                resolution: '720p' // Use 720p for faster generation
            }
        });
        return operation;
    } catch (error) {
        console.error("Error generating web series video:", error);
        throw new Error("Failed to start video generation process.");
    }
};

export const checkVideoStatus = async (operation: any): Promise<any> => {
    return await ai.operations.getVideosOperation({ operation });
};
