export interface Word {
  start: number;
  end: number;
  text: string;
}

export interface Line {
  start: number;
  end: number;
  text: string;
  words: Word[];
}

export interface LyricsSection {
  section_type: string;
  start: number;
  end: number;
  lines?: Line[];
}

export interface Verse {
  url: string;
  ai: string;
  duration: number;
  lyrics_sections: LyricsSection[];
}

export interface Battle {
  battle_id: string;
  ai_one: string;
  ai_two: string;
  status: 'pending' | 'generating' | 'completed';
  verses: Verse[];
  rounds?: Verse[];
  winner?: string;
}
