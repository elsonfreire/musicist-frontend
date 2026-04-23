import type { LevelType, InstrumentType } from "@/types";

export interface IEditUserFormData {
  username: string;
  instrument: string;
  bio: string;
  level: LevelType;
}