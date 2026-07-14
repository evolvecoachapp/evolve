import type { BodyMeasurement } from "../models/BodyMeasurement";
import type { BodyWeightEntry } from "../models/BodyWeightEntry";
import type { PersonalRecordHistory } from "../models/PersonalRecordHistory";
import type { ProgressDashboard } from "../models/ProgressDashboard";
import type { ProgressInsight } from "../models/ProgressInsight";
import type { ProgressPhoto } from "../models/ProgressPhoto";
import type { TrainingVolume } from "../models/TrainingVolume";

export type ProgressProviderId = "mock" | "backend" | "local";

/** Contract for Progress backends — UI and hooks depend on this interface only. */
export interface ProgressService {
  readonly providerId: ProgressProviderId;

  getDashboard(): Promise<ProgressDashboard>;
  getWeightHistory(): Promise<BodyWeightEntry[]>;
  getMeasurements(): Promise<BodyMeasurement[]>;
  getProgressPhotos(): Promise<ProgressPhoto[]>;
  getPersonalRecords(): Promise<PersonalRecordHistory>;
  getTrainingVolume(): Promise<TrainingVolume>;
  getInsights(): Promise<ProgressInsight[]>;
}

export class ProgressServiceError extends Error {
  constructor(
    message: string,
    readonly providerId?: ProgressProviderId,
  ) {
    super(message);
    this.name = "ProgressServiceError";
  }
}
