/** Immutable today's workout summary for Home. */
export interface WorkoutSummaryCard {
  readonly present: boolean;
  readonly name: string;
  readonly muscleGroups: string;
  readonly durationMinutes: number;
  readonly statusLabel: string;
  readonly destination: string;
}
