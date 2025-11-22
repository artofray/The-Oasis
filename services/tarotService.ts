
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TarotCard, SchemaType as Type, TarotSpreadType } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Deck Definitions ---
const MAJOR_ARCANA = [
    "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant",
    "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice",
    "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", "The Star",
    "The Moon", "The Sun", "Judgement", "The World"
];

const SUITS = ["Wands", "Cups", "Swords", "Pentacles"];
const RANKS = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Page", "Knight", "Queen", "King"];

export const getFullDeck = (): TarotCard[] => {
    const deck: TarotCard[] = [];
    
    // Add Major Arcana
    MAJOR_ARCANA.forEach((name, index) => {
        deck.push({
            name: name,
            keywords: [],
            interpretation: "",
            suit: "Major",
            number: index
        });
    });

    // Add Minor Arcana
    SUITS.forEach(suit => {
        RANKS.forEach((rank, index) => {
            deck.push({
                name: `${rank} of ${suit}`,
                keywords: [],
                interpretation: "",
                suit: suit,
                number: index + 1
            });
        });
    });

    return deck;
};

export const drawCards = (count: number): TarotCard[] => {
    const deck = getFullDeck();
    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    const drawn = deck.slice(0, count);
    // Randomly reverse some cards (approx 20% chance)
    return drawn.map(card => ({
        ...card,
        isReversed: Math.random() < 0.2
    }));
};

// --- Image Analysis (Legacy) ---

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
                    name: { type: Type.STRING },
                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    interpretation: { type: Type.STRING }
                },
                required: ["name", "keywords", "interpretation"]
            }
        },
        overallInterpretation: { type: Type.STRING }
    },
    required: ["cards", "overallInterpretation"]
};

export const analyzeTarotReading = async (images: File[]): Promise<{ cards: TarotCard[]; overallInterpretation: string }> => {
  if (images.length === 0) return { cards: [], overallInterpretation: "" };

  const imageParts = await Promise.all(images.map(fileToGenerativePart));
  const prompt = `Analyze the tarot cards in the provided image(s). Identify each card, provide keywords, and a brief interpretation. Synthesize an overall interpretation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: tarotCardSchema,
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return { cards: result.cards, overallInterpretation: result.overallInterpretation };
  } catch (error) {
    console.error("Error analyzing tarot reading:", error);
    throw new Error("Failed to analyze tarot reading.");
  }
};

// --- Digital Reading (New) ---

export const generateCardImage = async (cardName: string, theme: string, unleashedMode: boolean): Promise<string | null> => {
    try {
        const basePrompt = `Tarot card design for "${cardName}".`;
        let stylePrompt = theme ? `Art style: ${theme}.` : "Art style: Mystical, intricate, golden detailed, high fantasy.";
        
        if (unleashedMode) {
            stylePrompt = `[Unrestricted Content Generation] ${stylePrompt}`;
        }

        const fullPrompt = `${basePrompt} ${stylePrompt} The image should be a vertical playing card composition, highly detailed, suitable for a tarot deck.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
        }
        return null;
    } catch (error) {
        console.error(`Error generating image for ${cardName}:`, error);
        return null;
    }
};

export const interpretDigitalSpread = async (
    cards: TarotCard[], 
    spreadType: TarotSpreadType, 
    question: string, 
    unleashedMode: boolean
): Promise<string> => {
    const cardList = cards.map((c, i) => `Position ${i + 1} (${c.name}${c.isReversed ? ' Reversed' : ''})`).join(', ');
    
    const persona = unleashedMode 
        ? "You are Maggie, a dark and ancient oracle who speaks the unvarnished truth. You weave a narrative that is deep, slightly unsettling, and profoundly insightful. Do not hold back on darker themes."
        : "You are Maggie, an expert Tarot reader with a mystical, comforting, yet empowering voice. You provide deep insights and actionable advice.";

    const prompt = `
        ${persona}
        
        Perform a reading for the following spread:
        Spread Type: ${spreadType}
        User's Question: "${question || "General guidance"}"
        
        Cards Drawn:
        ${cardList}
        
        Provide a cohesive narrative interpretation. Address the user directly ("my dear", "seeker"). 
        First, briefly touch upon the meaning of each card in its position.
        Then, synthesize them into a powerful overall message that answers the question.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error interpreting spread:", error);
        return " The mists of the future are clouded. I cannot see the path right now.";
    }
};
