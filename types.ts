import type { GoogleGenAI } from "@google/genai";
// From Tarot service
export enum SchemaType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
}

export interface TarotCard {
    name: string;
    keywords: string[];
    interpretation: string;
}

export interface JournalEntry {
    id: string;
    date: string; // YYYY-MM-DD
    cards: TarotCard[];
    overallInterpretation: string;
    notes: string;
}

// From App.tsx and Sidebar.tsx
export type View =
  | 'dashboard'
  | 'mansion'
  | 'workflows'
  | 'teach'
  | 'settings'
  | 'round_table'
  | 'tarot_journal'
  | 'theatre'
  | 'sandbox'
  | 'murder_mystery'
  | 'poolside'
  | 'penthouse'
  | 'activities'
  | 'avatar_studio'
  | 'eternal'
  | 'voice_video_chat';

// From Round Table and related components
export interface RoundTableAgent {
    id: string;
    name: string;
    description: string;
    avatarColor: string;
    colorHex: string;
    avatarUrl?: string;
    currentActivity: string;
    systemInstruction: string;
    category: 'Inner Circle' | 'Mansion Staff' | 'Consultant' | 'Creative';
    pet?: { name: string; type: string };
    voice: {
        isCloned: boolean;
        sampleUrl?: string;
        presetName?: string;
    };
    body?: {
        torsoScale?: number;
        armScale?: number;
        legScale?: number;
    }
}

export interface ChatMessage {
    id: string;
    author: string;
    text: string;
    agent?: RoundTableAgent;
    imageUrl?: string;
    videoUrl?: string;
    videoGenerationOperation?: any;
    videoGenerationStatus?: 'interrupted';
    originalPrompt?: string;
    sources?: { uri: string, title: string }[];
    fileName?: string;
    fileType?: string;
    fileContent?: string;
}

export type ChatMode = 'round_table' | 'interview' | 'debate';

// From MyAiAssistant.tsx
export type SandboxEnvironment = 'Default' | 'Sci-Fi' | 'Fantasy' | 'Urban';

export interface CommandResponse {
  message: string;
  action?: 'switch_view' | 'change_environment' | 'none';
  payload?: View | SandboxEnvironment | null;
}

// From PenthouseView.tsx
export type PenthouseLayout = string | null;

// From gameService.ts
export interface MurderMysteryCharacter {
    agentId: string;
    name: string;
    role: 'Victim' | 'Murderer' | 'Suspect';
    backstoryInPlot: string;
}

export interface MurderMysteryPlot {
    title: string;
    synopsis: string;
    setting: {
        name: string;
        description: string;
    };
    characters: MurderMysteryCharacter[];
    openingScene: string;
}

// From marketService.ts
export interface StockAnalysis {
    companyName: string;
    ticker: string;
    summary: string;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    keyFactors: string[];
}

// From storytellerService.ts
export interface BedtimeStory {
    title: string;
    story: string;
    coverImageUrl: string;
}

// From SandboxView.tsx
export interface ConversationMessage {
    agentId: string;
    agentName: string;
    text: string;
    timestamp: number;
}

export interface Conversation {
    id: string;
    participants: Set<string>;
    messages: ConversationMessage[];
    lastUpdated: number;
}

// From TheatreView.tsx
export type PerformanceMode = 'improv' | 'scripted';
export type Genre = 'Comedy' | 'Drama' | 'Romance' | 'Action' | 'Adult' | 'Fantasy' | 'Sci-Fi';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export interface TheatreMessage {
    id: string;
    agentId: string;
    agentName: string;
    characterName?: string;
    text: string;
    cue?: string;
}

export interface SavedPlay {
    id: string;
    title: string;
    savedAt: string; // ISO string date
    performanceMode: PerformanceMode;
    genre: Genre;
    scenePrompt: string;
    sceneImageUrl: string | null;
    aspectRatio?: AspectRatio;
    selectedAgentIds: string[]; // Convert Set to Array for serialization
    dialogue: TheatreMessage[];
    currentLineIndex: number;
    // Scripted mode specific
    parsedScript: { characters: string[], lines: Omit<TheatreMessage, 'id' | 'agentId'>[] } | null;
    characterAssignments: Record<string, string>;
}