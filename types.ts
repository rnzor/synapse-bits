
export interface Bit {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown-like text
  codeSnippet?: string;
  language?: string; // e.g., 'python', 'javascript', 'bash'
  tags: string[];
  author: string;
  timestamp: number;
  votes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  access: 'free' | 'pro';
  topicSlug?: string;
}

export interface Tutorial {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string; // Long-form markdown
  coverGradient: string; // CSS gradient class
  duration: string; // e.g. "15 min"
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  author: string;
  isPremium: boolean;
  timestamp: number;
}

export interface AuthUser {
  id: string;
  name: string;
  provider: 'google' | 'discord' | 'email';
  email?: string;
  avatar?: string;
  discord?: {
    id: string;
    username: string;
    avatarUrl: string;
    linkedAt: number;
  };
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'User' | 'Admin' | 'AI Architect';
  xp: number;
  level: number;
}

export interface UserStats {
  bitsRead: number;
  quizzesWon: number;
  streak: number;
  lastLogin: number;
  badges: string[]; // Array of Badge IDs
  bookmarkedBits: string[]; // IDs of saved bits
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'medal' | 'brain' | 'fire' | 'code' | 'zap';
  color: string;
  condition: (stats: UserStats, level: number) => boolean;
}

export interface Topic {
  slug: string;
  label: string;
  description: string;
  iconKey: string;
  order: number;
}

export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string;
  topicSlug: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isPro: boolean;
  bitIds: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index 0-3
  explanation: string;
}

export enum ViewMode {
  FEED = 'FEED',
  CREATE = 'CREATE',
  PROFILE = 'PROFILE',
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';
