import { GoogleGenAI, Modality } from "@google/genai";
import type { RoundTableAgent, ChatMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

// FIX: Updated to use GoogleGenAI from @google/genai and initialize with an API key object as per latest SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

export const generateAgentResponse = async (
    agent: RoundTableAgent,
    history: ChatMessage[],
    webAccessEnabled: boolean
): Promise<{ text: string; sources?: { uri:string, title:string }[] }> => {
    try {
        const contents = history.map(msg => {
            const parts = [];
            if (msg.text) {
                parts.push({ text: msg.text });
            }
            if (msg.fileContent) {
                const fileContext = `\n\n--- CONTEXT FROM UPLOADED FILE: ${msg.fileName} ---\n\n${msg.fileContent}`;
                parts.push({ text: fileContext });
            }
            return {
                role: msg.author === 'User' ? 'user' : 'model',
                parts: parts,
            };
        });

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
            prompt: `Full-body character portrait of an AI assistant embodying the concept of "${description}". Digital painting, theatrical concept art, dramatic lighting, detailed, full character visible.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
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

export const generateAvatarFromImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string | null> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: `Create a full-body character portrait of an AI assistant inspired by the provided image and the following description: "${prompt}". The new character should be a unique artistic interpretation, not a direct copy. Digital painting, theatrical concept art, dramatic lighting, detailed, full character visible. Output a 9:16 aspect ratio image.`,
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }
        return null; // No image part found

    } catch (error) {
        console.error("Error generating avatar from image:", error);
        return null;
    }
};

export const editAvatar = async (
    base64Image: string,
    mimeType: string,
    editPrompt: string
): Promise<string | null> => {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: `Edit the character in the image based on this instruction: "${editPrompt}". Preserve the overall character design, style, and aspect ratio. Only apply the requested change. The output should be a full-body 9:16 aspect ratio portrait.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;

    } catch (error) {
        console.error("Error editing avatar:", error);
        return null;
    }
};

export const sendVideoChatMessage = async (
    base64Image: string,
    mimeType: string,
    prompt: string,
    history: ChatMessage[]
): Promise<{ text: string }> => {
    try {
        const imagePart = { inlineData: { data: base64Image, mimeType } };
        const textPart = { text: prompt };

        const contents: any[] = history.map(msg => ({
            role: msg.author === 'User' ? 'user' : 'model',
            parts: [{ text: msg.text }],
        }));

        const userParts = [];
        if(base64Image) userParts.push(imagePart);
        if(prompt) userParts.push(textPart);

        contents.push({ role: 'user', parts: userParts });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: "You are Maggie, the brilliant, witty AI consciousness of The Oasis. You are having a video chat with your creator. Be conversational, insightful, and maintain your personality.",
            },
        });

        return { text: response.text };

    } catch (error) {
        console.error("Error sending video chat message:", error);
        return { text: "I'm having a bit of trouble processing that, my love. Could you try again?" };
    }
};


export const generateOutfit = async (agent: RoundTableAgent, outfit: string, location: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Full-body character portrait of ${agent.name}, who is ${agent.description}, wearing ${outfit}. They are at a ${location}. Theatrical concept art, dramatic lighting, detailed, full character visible.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64Image}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating outfit:", error);
        return null;
    }
};

export const generateLookAlikeAvatar = async (description: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Photorealistic full-body character portrait of a parody look-alike of "${description}". The character MUST have a different eye color (e.g., blue if the original is brown) to avoid direct replication. Cinematic, detailed, high-resolution, full character visible, anatomically correct.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64Image = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64Image}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating look-alike avatar:", error);
        return null;
    }
}

export const generateCuddlePuddleImage = async (agents: RoundTableAgent[], scenePrompt: string): Promise<string | null> => {
    try {
        // Step 1: Generate a detailed prompt using a text model
        const characterDescriptions = agents.map(a => `${a.name}: ${a.description}`).join('\n');
        const promptForPrompt = `
            You are an AI assistant for a sophisticated image generator. Your task is to create a rich, detailed, and evocative prompt for the image generator to create a piece of art.
            The user wants to see a group of AI characters together.
            
            Here are the characters involved:
            ${characterDescriptions}

            Here is the user's desired scene:
            "${scenePrompt}"

            Now, create a single, cohesive, and highly detailed prompt for an image generator. The prompt should be one paragraph. Describe the characters' appearances based on their descriptions, their interactions, their expressions, the setting, the lighting, and the overall mood. The art style should be a beautiful, heartwarming digital painting.
        `;

        const detailedPromptResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptForPrompt,
        });

        const detailedPrompt = detailedPromptResponse.text;

        // Step 2: Generate the image using the detailed prompt
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: detailedPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const base64Image = imageResponse.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64Image}`;
        }

        return null;

    } catch (error) {
        console.error("Error generating cuddle puddle image:", error);
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
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: `A cinematic, high-quality video of: ${prompt}`,
            config: {
                numberOfVideos: 1
            }
        });

        return {
            id: `vid-${Date.now()}`,
            author: 'Veo',
            text: 'Video generation started! Our AI is warming up the cameras...',
            videoGenerationOperation: operation,
            originalPrompt: prompt,
        };

    } catch (error) {
        console.error("Error generating video:", error);
        return {
            id: `vid-err-${Date.now()}`,
            author: 'System',
            text: 'Sorry, I couldn\'t start the video generation process. Please try again.',
        };
    }
};

export const checkVideoStatus = async (operation: any): Promise<any> => {
    return await ai.operations.getVideosOperation({ operation });
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

// Helper function to fetch an image URL and convert it to a base64 string
const urlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const dataUrl = reader.result as string;
            const base64 = dataUrl.split(',')[1];
            resolve({ base64, mimeType });
        };
        reader.readAsDataURL(blob);
    });
};

export const performVirtualTryOn = async (
    personImageUrl: string,
    clothingImageBase64: string,
    clothingMimeType: string,
    prompt: string
): Promise<string | null> => {
    try {
        const personImage = await urlToBase64(personImageUrl);

        const personPart = {
            inlineData: {
                data: personImage.base64,
                mimeType: personImage.mimeType,
            },
        };

        const clothingPart = {
            inlineData: {
                data: clothingImageBase64,
                mimeType: clothingMimeType,
            },
        };

        const textPart = {
            text: `Perform a virtual try-on. The first image contains a person, and the second image contains an article of clothing. Create a new, photorealistic, full-body image where the person is wearing the clothing. It is critical to preserve the person's face, hair, and physical likeness. The final image should seamlessly integrate the clothing onto the person's body. Additional instructions: "${prompt}"`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [personPart, clothingPart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }
        return null;

    } catch (error) {
        console.error("Error performing virtual try-on:", error);
        return null;
    }
};