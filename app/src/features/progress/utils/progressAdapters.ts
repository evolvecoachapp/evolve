import type { BodyMeasurement } from "../models/BodyMeasurement";
import type { BodyWeightEntry } from "../models/BodyWeightEntry";
import type { PersonalRecordHistory } from "../models/PersonalRecordHistory";
import type { ProgressDashboard } from "../models/ProgressDashboard";
import type { ProgressInsight } from "../models/ProgressInsight";
import type { ProgressPhoto } from "../models/ProgressPhoto";
import type { TrainingVolume } from "../models/TrainingVolume";

/** Returns a deep clone of progress dashboard data for provider isolation. */
export function cloneProgressDashboard(dashboard: ProgressDashboard): ProgressDashboard {
  return structuredClone(dashboard);
}

/** Returns a deep clone of weight history entries. */
export function cloneWeightHistory(entries: BodyWeightEntry[]): BodyWeightEntry[] {
  return structuredClone(entries);
}

/** Returns a deep clone of body measurements. */
export function cloneMeasurements(measurements: BodyMeasurement[]): BodyMeasurement[] {
  return structuredClone(measurements);
}

/** Returns a deep clone of progress photos. */
export function cloneProgressPhotos(photos: ProgressPhoto[]): ProgressPhoto[] {
  return structuredClone(photos);
}

/** Returns a deep clone of personal record history. */
export function clonePersonalRecordHistory(history: PersonalRecordHistory): PersonalRecordHistory {
  return structuredClone(history);
}

/** Returns a deep clone of training volume data. */
export function cloneTrainingVolume(volume: TrainingVolume): TrainingVolume {
  return structuredClone(volume);
}

/** Returns a deep clone of progress insights. */
export function cloneProgressInsights(insights: ProgressInsight[]): ProgressInsight[] {
  return structuredClone(insights);
}
