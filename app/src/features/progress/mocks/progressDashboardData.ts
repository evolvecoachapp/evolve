import type { ProgressDashboard } from "../models/ProgressDashboard";

/** Seeded dashboard snapshot — mirrors the legacy progress mock stats. */
export const mockProgressDashboardData: ProgressDashboard = {
  stats: [
    {
      label: "Weight",
      value: "78.5",
      unit: "kg",
      trend: "-0.3 kg this week",
      icon: "scale-outline",
    },
    {
      label: "Strength",
      value: "+12%",
      trend: "vs. 4 weeks ago",
      icon: "barbell-outline",
    },
    {
      label: "Workout Streak",
      value: "5",
      unit: "days",
      icon: "flame-outline",
    },
    {
      label: "Adherence",
      value: "87",
      unit: "%",
      trend: "+3% this week",
      icon: "checkmark-circle-outline",
    },
  ],
  status: {
    level: "on_track",
    label: "On track",
    summary: "Weight and strength are moving in the right direction.",
  },
  goal: {
    id: "goal-1",
    type: "weight_loss",
    title: "Reach 75 kg",
    targetValue: 75,
    currentValue: 78.5,
    unit: "kg",
    deadline: "2026-09-01",
    progressPercent: 72,
  },
  weekly: {
    weekStart: "2026-07-07",
    workoutsCompleted: 4,
    workoutsTarget: 4,
    adherencePercent: 87,
    avgCalories: 2150,
    weightChangeKg: -0.3,
  },
  monthly: {
    month: "2026-07",
    workoutsCompleted: 14,
    avgAdherencePercent: 85,
    weightChangeKg: -1.7,
    strengthChangePercent: 12,
  },
  bodyComposition: {
    bodyFatPercent: 18.2,
    leanMassKg: 64.2,
    bmi: 24.1,
    recordedAt: "2026-07-14",
  },
  strength: {
    overallChangePercent: 12,
    periodWeeks: 4,
    exercises: [
      {
        exerciseId: "ex-bench-press",
        exerciseName: "Bench Press",
        startWeightKg: 75,
        currentWeightKg: 85,
        changePercent: 13,
      },
      {
        exerciseId: "ex-squat",
        exerciseName: "Back Squat",
        startWeightKg: 95,
        currentWeightKg: 110,
        changePercent: 16,
      },
      {
        exerciseId: "ex-deadlift",
        exerciseName: "Deadlift",
        startWeightKg: 115,
        currentWeightKg: 130,
        changePercent: 13,
      },
    ],
  },
  milestones: [
    {
      id: "milestone-1",
      title: "5-day streak",
      description: "Completed workouts five days in a row.",
      achievedAt: "2026-07-14",
      category: "consistency",
    },
    {
      id: "milestone-2",
      title: "Bench press PR",
      description: "Hit a new 85 kg × 5 bench press.",
      achievedAt: "2026-07-08",
      category: "strength",
    },
  ],
};
