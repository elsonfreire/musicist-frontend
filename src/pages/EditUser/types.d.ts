export interface IEditUserFormData {
  username: string;
  instrument: string;
  bio: string;
  level: number;
}

export interface IUser {
  email: string;
  username: string;
  instrument: string | null;
  bio: string | null;
  level: number | null;
}
