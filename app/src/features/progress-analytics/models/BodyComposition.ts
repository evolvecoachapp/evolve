export interface BodyComposition {
  readonly bodyFatPercent: number | null;
  readonly leanMassKg: number | null;
  readonly fatMassKg: number | null;
  readonly muscleMassKg: number | null;
  readonly measuredAt: string | null;
  readonly destination: string | null;
}

export function createBodyComposition(input: BodyComposition): BodyComposition {
  return Object.freeze({ ...input });
}
