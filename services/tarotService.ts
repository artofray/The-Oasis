import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { TarotCard } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const tarotCardSchema = {
    type: Type.OBJECT,
    properties: {
        cards: {
            type: Type.ARRAY,
            description: "An array of tarot cards identified in the image(s).",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The name of the tarot card (e.g., 'The Fool', 'Knight of Wands').",
                    },
                    keywords: {
                        type: Type.ARRAY,
                        description: "A list of 3-5 keywords associated with the card.",
                        items: {
                            type: Type.STRING,
                        }
                    },
                    interpretation: {
                        type: Type.STRING,
                        description: "A brief, one or two-sentence interpretation of the card's meaning in the context of a reading."
                    }
                },
                required: ["name", "keywords", "interpretation"]
            }
        },
        overallInterpretation: {
            type: Type.STRING,
            description: "A holistic interpretation of all the cards together, providing a narrative or overarching theme for the reading. This should be a cohesive paragraph of 3-5 sentences."
        }
    },
    required: ["cards", "overallInterpretation"]
};

export const analyzeTarotReading = async (images: File[]): Promise<{ cards: TarotCard[]; overallInterpretation: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
 
  if (images.length === 0) {
    return { cards: [], overallInterpretation: "" };
  }

  const imageParts = await Promise.all(images.map(fileToGenerativePart));

  const prompt = `
    Analyze the tarot cards in the provided image(s).
    Identify each card and provide its name, a few keywords, and a brief interpretation.
    Then, synthesize an overall interpretation of the reading based on all the cards present.
    Focus on a positive and insightful tone.
    If the image does not contain tarot cards, state that clearly and do not attempt to generate a reading.
    The response must be in JSON format.
    `;

  const contents = {
      parts: [
        ...imageParts,
        { text: prompt },
      ],
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: tarotCardSchema,
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("API returned an empty response.");
    }

    const result = JSON.parse(jsonText);

    if (!result || !Array.isArray(result.cards) || typeof result.overallInterpretation !== 'string') {
        throw new Error("Invalid JSON structure received from API.");
    }
   
    return {
      cards: result.cards,
      overallInterpretation: result.overallInterpretation,
    };
  } catch (error) {
    console.error("Error analyzing tarot reading:", error);
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("The AI response was not in the expected format. Please try again.");
    }
    throw new Error("Failed to get tarot reading from AI. Please check your connection and API key.");
  }
};