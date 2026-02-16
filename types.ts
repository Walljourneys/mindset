export interface GeneratedContent {
  narrative: string;
  hashtags: string[];
  keyTakeaway: string;
  imageUrl?: string;
}

export interface HistoryItem extends GeneratedContent {
  id: string;
  originalQuote: string;
  timestamp: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
