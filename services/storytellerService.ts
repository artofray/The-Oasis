import { GoogleGenAI, Type } from "@google/genai";
import type { RoundTableAgent, BedtimeStory } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';
const imageModel = 'imagen-4.0-generate-001';

const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A creative, whimsical title for the bedtime story." },
        story: { type: Type.STRING, description: "The full text of the bedtime story, consisting of several paragraphs." },
    },
    required: ["title", "story"]
};

export const generateBedtimeStory = async (agent: RoundTableAgent, prompt: string): Promise<BedtimeStory> => {
    try {
        // Create a detailed prompt for the story generation
        const storyPrompt = `Write a short, soothing bedtime story appropriate for a young child based on this prompt: "${prompt}". The story should be imaginative, gentle, and have a positive, happy, or peaceful ending. Provide a creative title for the story.`;
        
        // Create a prompt for the image generation
        const imagePrompt = `A beautiful, dreamlike storybook illustration for a children's story about: "${prompt}". Whimsical fantasy art style, soft lighting, vibrant but gentle colors. Peaceful and enchanting.`;

        // Make AI calls in parallel for efficiency
        const [storyResponse, imageResponse] = await Promise.all([
            ai.models.generateContent({
                model: textModel,
                contents: storyPrompt,
                config: {
                    systemInstruction: `You are playing the role of ${agent.name}, a storyteller with a personality described as: "${agent.description}". Your storytelling style should reflect this personality. Your output must be in JSON format.`,
                    responseMimeType: "application/json",
                    responseSchema: storySchema,
                },
            }),
            ai.models.generateImages({
                model: imageModel,
                prompt: imagePrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '1:1',
                },
            })
        ]);

        const jsonText = storyResponse.text.trim();
        const storyData = JSON.parse(jsonText);

        if (!imageResponse.generatedImages || imageResponse.generatedImages.length === 0) {
            throw new Error("Image generation failed to produce an image.");
        }
        
        const base64Image = imageResponse.generatedImages[0].image.imageBytes;
        const coverImageUrl = `data:image/jpeg;base64,${base64Image}`;

        return {
            title: storyData.title,
            story: storyData.story,
            coverImageUrl: coverImageUrl,
        };

    } catch (error) {
        console.error("Error generating bedtime story:", error);
        throw new Error("The storyteller seems to have drifted off to sleep. Please try again.");
    }
};