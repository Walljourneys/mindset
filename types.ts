export interface VideoScriptPart {
  part: string;   // Hook, Value, atau CTA
  visual: string; // Instruksi apa yang harus tampil di layar
  audio: string;  // Teks yang harus dibicarakan (Voice Over)
}

export interface GeneratedContent {
  narrative: string;
  hashtags: string[];
  keyTakeaway: string;
  visualDescription: string; // Tambahkan ini
  videoScript: any[];
  imageUrl?: string;
}

export interface HistoryItem extends GeneratedContent {
  id: string;
  originalQuote: string;
  timestamp: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';