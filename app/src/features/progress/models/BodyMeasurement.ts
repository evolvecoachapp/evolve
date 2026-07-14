export type BodyMeasurementType =
  | "chest"
  | "waist"
  | "hips"
  | "bicep"
  | "thigh"
  | "neck"
  | "shoulders";

/** Circumference or body measurement log entry. */
export interface BodyMeasurement {
  id: string;
  type: BodyMeasurementType;
  valueCm: number;
  date: string;
}
