export interface HydrationProgress {
  readonly currentMl: number;
  readonly goalMl: number;
  readonly remainingMl: number;
  readonly completionPercent: number;
  readonly destination: string | null;
}

export function createHydrationProgress(input: HydrationProgress): HydrationProgress {
  return Object.freeze({ ...input });
}
