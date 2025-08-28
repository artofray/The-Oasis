export type View = 'dashboard' | 'agents' | 'workflows' | 'teach' | 'settings' | 'round_table' | 'tarot_journal';

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
    avatarUrl?: string;
}

export interface ChatMessage {
    id: string;
    author: string; // 'User' or Agent's name
    text: string;
    imageUrl?: string;
    videoUrl?: string;
    sources?: { uri: string; title: string }[];
    agent?: RoundTableAgent;
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