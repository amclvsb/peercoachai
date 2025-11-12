export interface AnalysisData {
  positivity: number;
  empathy: number;
  activeListeningCues: number;
  keyTopics: string[];
  suggestedQuestion: string;
}

export interface TranscriptEntry {
  speaker: 'Coach' | 'Client';
  text: string;
}

// New types for added features

export type Mood = 'Happy' | 'Motivated' | 'Neutral' | 'Stressed' | 'Sad';

export interface MoodEntry {
  sessionId: string;
  timestamp: string;
  timing: 'pre-session' | 'post-session';
  mood: Mood;
}

export interface ActionItem {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
}

export interface SessionSummary {
  id: string;
  date: string;
  preMood?: Mood;
  postMood?: Mood;
  transcript: TranscriptEntry[];
  keyPoints: string;
  insights: string;
  actionItems: ActionItem[];
}

export type ResourceType = 'Article' | 'Video' | 'Link' | 'Document';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  category: string;
}
