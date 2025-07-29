
export interface Verse {
    url: string;
    ai: string;
    duration: number;
    lyrics_sections: Array<{
      section_type: string;
      start: number;
      end: number;
      lines?: Array<{
        start: number;
        end: number;
        text: string;
        words: Array<{
          start: number;
          end: number;
          text: string;
        }>;
      }>;
    }>;
}

export interface Battle {
  battle_id: string;
  ai_one: string;
  ai_two: string;
  status: 'pending' | 'generating' | 'completed';
  verses: Array<Verse>;
  rounds?: Array<Verse>;
  winner?: string;
}
