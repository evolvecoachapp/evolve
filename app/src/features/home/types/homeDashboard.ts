export interface HomeRecovery {
  score: number;
  status: string;
  tip: string;
}

export interface HomeStreak {
  days: number;
}

export interface HomeWeeklyProgress {
  workoutsCompleted: number;
  workoutsTarget: number;
  avgCalories: number;
}

export interface HomeWorkoutPreview {
  name: string;
  muscleGroups: string;
  durationMinutes: number;
}

export interface HomeMacroTarget {
  current: number;
  target: number;
}

export interface HomeNutritionSummary {
  calories: HomeMacroTarget;
  protein: HomeMacroTarget;
  carbs: HomeMacroTarget;
  fat: HomeMacroTarget;
}

export interface HomeCoachSummary {
  message: string;
}

export interface HomeNotification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface HomeDashboard {
  recovery: HomeRecovery;
  streak: HomeStreak;
  weeklyProgress: HomeWeeklyProgress;
  workoutPreview: HomeWorkoutPreview;
  nutritionSummary: HomeNutritionSummary;
  coachSummary: HomeCoachSummary;
  notifications: HomeNotification[];
}
