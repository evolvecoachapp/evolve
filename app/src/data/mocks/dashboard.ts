export interface DashboardWorkout {
  name: string;
  muscleGroups: string;
  durationMinutes: number;
}

export interface DashboardNutrition {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export interface DashboardRecovery {
  score: number;
  status: string;
  tip: string;
}

export interface DashboardWeeklyProgress {
  workoutsCompleted: number;
  workoutsTarget: number;
  avgCalories: number;
  streakDays: number;
}

export interface DashboardCoachSuggestion {
  message: string;
}

export interface DashboardMock {
  workout: DashboardWorkout;
  nutrition: DashboardNutrition;
  recovery: DashboardRecovery;
  weeklyProgress: DashboardWeeklyProgress;
  coachSuggestion: DashboardCoachSuggestion;
}

export const dashboardMock: DashboardMock = {
  workout: {
    name: "Upper Body Strength",
    muscleGroups: "Chest, Shoulders, Triceps",
    durationMinutes: 45,
  },
  nutrition: {
    calories: { current: 1840, target: 2400 },
    protein: { current: 142, target: 180 },
    carbs: { current: 198, target: 280 },
    fat: { current: 58, target: 75 },
  },
  recovery: {
    score: 82,
    status: "Well Recovered",
    tip: "You're ready for a solid training session today.",
  },
  weeklyProgress: {
    workoutsCompleted: 3,
    workoutsTarget: 4,
    avgCalories: 2150,
    streakDays: 5,
  },
  coachSuggestion: {
    message:
      "Based on your recovery score, consider adding an extra set to your compound lifts today. Your sleep quality has been consistent — keep it up!",
  },
};
