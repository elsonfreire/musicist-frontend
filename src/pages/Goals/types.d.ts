export interface GoalResponse {
  id: string;
  title: string;
  status: "PENDING" | "COMPLETED" | "REJECTED" | "EXPIRED";
}

export interface GoalsState {
  activeGoals: GoalResponse[];
  completedGoals: GoalResponse[];
  weeklyTarget: number;
  weeklyCompletedCount: number;
}