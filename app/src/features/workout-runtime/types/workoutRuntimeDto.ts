/** Provider DTO for one prescribed set — never rendered directly. */
export interface WorkoutSetDto {
  readonly id: string;
  readonly targetReps: number;
  readonly targetRepsMax?: number | null;
  readonly targetRpe?: number | null;
  readonly weight?: number | null;
  readonly repetitions?: number | null;
  readonly rpe?: number | null;
  readonly notes?: string;
  readonly restSeconds: number;
  readonly completed?: boolean;
  readonly skipped?: boolean;
}

/** Provider DTO for one exercise. */
export interface WorkoutExerciseDto {
  readonly id: string;
  readonly name: string;
  readonly muscleGroup: string;
  readonly equipment: string;
  readonly sets: readonly WorkoutSetDto[];
}

/** Provider DTO for today's workout runtime seed. */
export interface WorkoutRuntimeDto {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly muscleGroups: string;
  readonly exercises: readonly WorkoutExerciseDto[];
  readonly sessionNotes?: string;
  readonly startedAt?: string | null;
  readonly empty?: boolean;
}
