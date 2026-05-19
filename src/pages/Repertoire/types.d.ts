export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Status = "TO_LEARN" | "LEARNING" | "LEARNED";

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: Difficulty;
  status: Status;
}