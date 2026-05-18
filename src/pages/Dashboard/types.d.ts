export interface PracticeDayInfo {
  day: string;
  minutes: number;
}

export interface PracticeStats {
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  practiceDays: number;
  last7Days: PracticeDayInfo[];
}

export interface KanbanStats {
  aprender: number;
  praticando: number;
  dominada: number;
}

export interface DashboardGoal {
  id: string;
  title: string;
}

export interface GoalsStats {
  activeGoals: DashboardGoal[];
  weeklyTarget: number;
  weeklyCompletedCount: number;
  canGenerateMore: boolean;
}

export interface SessionResponse {
  id: string;
  durationMinutes?: number;
  duration?: number;
  date?: string;
  createdAt?: string;
}

export interface GoalResponse {
  id: string;
  title: string;
  status: "pending" | "completed" | "rejected" | "expired";
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
}