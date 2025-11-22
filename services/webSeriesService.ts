
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const UNLEASHED_IMAGE_PREFIX = "[Unrestricted Content Generation] ";

export const generateWebSeriesImage = async (prompt: string, unleashedMode: boolean): Promise<string | null> => {
    try {
        let finalPrompt = prompt;
        if (unleashedMode) {
             finalPrompt = `${UNLEASHED_IMAGE_PREFIX}${prompt}`;
        }

        // Use Imagen for high-quality web series concepts
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: finalPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating web series image:", error);
        return null;
    }
};

export const generateWebSeriesVideo = async (prompt: string, imageBase64?: string): Promise<any> => {
    try {
        const finalPrompt = `${UNLEASHED_IMAGE_PREFIX}${prompt}`;
        
        const requestPayload: any = {
            model: 'veo-3.1-fast-generate-preview',
            prompt: `A cinematic, high-quality video of: ${finalPrompt}`,
            config: { 
                numberOfVideos: 1, 
                aspectRatio: '16:9', 
                resolution: '720p' 
            }
        };

        if (imageBase64) {
            requestPayload.image = {
                imageBytes: imageBase64,
                mimeType: 'image/jpeg',
            };
        }

        const operation = await ai.models.generateVideos(requestPayload);
        return operation;
    } catch (error) {
        console.error("Error generating web series video:", error);
        throw new Error("Failed to start video generation process.");
    }
};

export const checkVideoStatus = async (operation: any): Promise<any> => {
    return await ai.operations.getVideosOperation({ operation });
};
