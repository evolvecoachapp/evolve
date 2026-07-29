export interface PersonalRecord {
  readonly id: string;
  readonly exerciseName: string;
  readonly weightKg: number;
  readonly reps: number;
  readonly estimatedOneRepMaxKg: number;
  readonly achievedAt: string;
}

export function createPersonalRecord(input: PersonalRecord): PersonalRecord {
  return Object.freeze({ ...input });
}
