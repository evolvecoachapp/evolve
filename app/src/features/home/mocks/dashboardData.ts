import type { HomeDashboard } from "../types/homeDashboard";

/** Seed dashboard loaded by MockHomeService — not referenced by UI. */
export const mockHomeDashboardData: HomeDashboard = {
  workoutPreview: {
    name: "Upper Body Strength",
    muscleGroups: "Chest, Shoulders, Triceps",
    durationMinutes: 45,
  },
  nutritionSummary: {
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
  streak: {
    days: 5,
  },
  weeklyProgress: {
    workoutsCompleted: 3,
    workoutsTarget: 4,
    avgCalories: 2150,
  },
  coachSummary: {
    message:
      "Based on your recovery score, consider adding an extra set to your compound lifts today. Your sleep quality has been consistent — keep it up!",
  },
  notifications: [],
};
