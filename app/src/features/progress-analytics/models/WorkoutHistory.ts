export interface WorkoutHistoryEntry {
  readonly id: string;
  readonly title: string;
  readonly completedAt: string;
  readonly durationMinutes: number;
  readonly volumeKg: number;
  readonly exerciseCount: number;
  readonly rpeAverage: number | null;
  readonly destination: string | null;
}

export interface WorkoutHistory {
  readonly entries: readonly WorkoutHistoryEntry[];
  readonly totalCount: number;
  readonly destination: string | null;
}

export function createWorkoutHistoryEntry(input: WorkoutHistoryEntry): WorkoutHistoryEntry {
  return Object.freeze({ ...input });
}

export function createWorkoutHistory(input: WorkoutHistory): WorkoutHistory {
  return Object.freeze({
    entries: Object.freeze(input.entries.map(createWorkoutHistoryEntry)),
    totalCount: input.totalCount,
    destination: input.destination,
  });
}
