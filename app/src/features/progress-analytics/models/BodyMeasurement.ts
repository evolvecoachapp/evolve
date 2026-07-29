export interface BodyMeasurement {
  readonly id: string;
  readonly measuredAt: string;
  readonly site: string;
  readonly valueCm: number;
  readonly changeCm: number | null;
  readonly destination: string | null;
}

export function createBodyMeasurement(input: BodyMeasurement): BodyMeasurement {
  return Object.freeze({ ...input });
}
