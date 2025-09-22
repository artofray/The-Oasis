export type View = 'dashboard' | 'mansion' | 'workflows' | 'teach' | 'settings' | 'round_table' | 'tarot_journal' | 'theatre' | 'sandbox' | 'murder_mystery' | 'poolside' | 'penthouse' | 'activities' | 'avatar_studio' | 'eternal' | 'voice_video_chat';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  description: string;
  priority: TaskPriority;
}

export interface Agent {
  id: number;
  name:string;
  expertise: string;
  task: Task;
  status: 'working' | 'idle' | 'complete';
  points: number;
}

export type CommandAction = 'switch_view' | 'info' | 'error' | 'general_answer' | 'task_assigned';

export interface CommandResponse {
    action: CommandAction;
    payload?: any;
    message: string;
    sources?: { title: string; uri: string }[];
}


// AI Round Table App Types
export interface RoundTableAgent {
    id: string;
    name: string;
    description: string;
    systemInstruction: string;
    avatarColor: string;
    colorHex: string;
    avatarUrl?: string;
    currentActivity: string;
    category: 'Inner Circle' | 'Mansion Staff' | 'Consultant' | 'Creative';
    pet?: {
        name: string;
        type: string;
    };
    voice: {
        presetName?: string; // Name of the SpeechSynthesisVoice to use
        sampleUrl?: string;  // URL of the uploaded/recorded audio sample
        isCloned: boolean;   // True if the voice has been "cloned"
    };
    body?: {
        torsoScale?: number;
        armScale?: number;
        legScale?: number;
    };
}

export interface ChatMessage {
    id: string;
    author: string; // 'User' or Agent's name
    text: string;
    imageUrl?: string;
    videoUrl?: string;
    sources?: { uri: string; title: string }[];
    agent?: RoundTableAgent;
    videoGenerationOperation?: any;
    videoGenerationStatus?: 'interrupted';
    originalPrompt?: string;
    fileName?: string;
    fileType?: string;
    fileContent?: string;
}

export type ChatMode = 'round_table' | 'direct';


// AI Tarot Journal Types
export interface TarotCard {
  name: string;
  keywords: string[];
  interpretation: string;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string format: YYYY-MM-DD
  cards: TarotCard[];
  notes: string;
  overallInterpretation: string;
}

// Murder Mystery Game Mode Types
export interface MurderMysteryCharacter {
  agentId: string;
  name: string;
  role: 'Victim' | 'Murderer' | 'Suspect';
  backstoryInPlot: string;
}

export interface MurderMysteryPlot {
  setting: {
    name: string;
    description: string;
  };
  title: string;
  synopsis: string;
  characters: MurderMysteryCharacter[];
  openingScene: string;
}

// Penthouse Types
export interface PenthouseFurniture {
    id: string;
    type: 'sofa' | 'table' | 'chair' | 'plant';
    position: { x: number; y: number; z: number };
    rotation: number;
}

export type PenthouseLayout = PenthouseFurniture[];

// Market Analysis Types
export interface StockAnalysis {
    companyName: string;
    ticker: string;
    summary: string;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    keyFactors: string[];
}

// Bedtime Story Types
export interface BedtimeStory {
  title: string;
  story: string;
  coverImageUrl: string;
}

// FIX: Manually define the Type enum as it is not exported from the package version in use.
export enum SchemaType {
  TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  INTEGER = 'INTEGER',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  NULL = 'NULL',
}