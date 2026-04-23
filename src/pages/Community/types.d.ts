export interface UserResponse {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  level: string | null;
  instrument: string;
  city: string | null;
  state: string | null;
  favoriteGenre: string | null;
  interests: string[];
}

export interface RecommendationResponse {
  user: UserResponse;
  matchScore: number;
}

export interface FriendshipResponse {
  id: number; 
  requester: UserResponse;
  receiver: UserResponse;
  status: string;
}