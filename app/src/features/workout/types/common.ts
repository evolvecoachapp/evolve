/** Shared enumerations for the workout feature domain. */

export type ProgramGoal = "powerlifting" | "powerbuilding" | "bodybuilding" | "general";

export type ExerciseType = "compound" | "isolation" | "machine" | "bodyweight";

export type MovementPattern = "squat" | "hinge" | "push" | "pull" | "carry" | "rotation";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "elite";

export type TrainingStyle =
  | "powerbuilding"
  | "powerlifting"
  | "bodybuilding"
  | "conjugate"
  | "general_fitness";

export type PerceivedDifficulty =
  | "very_easy"
  | "easy"
  | "moderate"
  | "hard"
  | "very_hard"
  | "maximal";

export type MuscleGroup =
  | "quads"
  | "hamstrings"
  | "glutes"
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "core"
  | "calves";

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "smith_machine"
  | "kettlebell";

export type SessionStatus = "scheduled" | "in_progress" | "completed" | "skipped";

export type IntensityModel = "percentage" | "rpe" | "rir" | "hybrid";
