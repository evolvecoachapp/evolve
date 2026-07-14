import type { WorkoutExercise } from "./WorkoutExercise";

/** Schedule slot labels resolved by the provider for preview UI. */
export interface WorkoutScheduleLabels {
  weekLabel: string;
  dayLabel: string;
}

/** A prescribed training session returned by workout providers. */
export interface Workout {
  id: string;
  title: string;
  subtitle: string;
  estimatedDuration: number;
  exercises: WorkoutExercise[];
  warmup: WorkoutExercise[];
  cooldown: WorkoutExercise[];
  notes: string | null;
  coachRecommendations: string[];
  scheduleLabels: WorkoutScheduleLabels;
}
