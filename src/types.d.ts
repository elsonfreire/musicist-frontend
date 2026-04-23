export type InstrumentType =
  | "electric_guitar"
  | "piano"
  | "bass"
  | "drums"
  | "guitar"
  | "violin"
  | "other";

export type LevelType = "beginner" | "intermediate" | "advanced" | "pro";

export interface IUser {
  id: string;
  email: string;
  username: string;
  instrument: string | null;
  bio: string | null;
  level: LevelType;
  createdAt: string;
}
