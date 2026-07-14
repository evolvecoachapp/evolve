import type { BodyMeasurement } from "../models/BodyMeasurement";
import type { BodyWeightEntry } from "../models/BodyWeightEntry";
import type { PersonalRecordHistory } from "../models/PersonalRecordHistory";
import type { ProgressDashboard } from "../models/ProgressDashboard";
import type { ProgressInsight } from "../models/ProgressInsight";
import type { ProgressPhoto } from "../models/ProgressPhoto";
import type { TrainingVolume } from "../models/TrainingVolume";
import {
  ProgressServiceError,
  type ProgressService,
} from "../services/progressService";

function notConfigured(): never {
  throw new ProgressServiceError(
    "backend provider is not configured. Wire the EVOLVE API before enabling this provider.",
    "backend",
  );
}

/** Placeholder for the EVOLVE backend — implement when API integration is available. */
export const backendProgressService: ProgressService = {
  providerId: "backend",

  async getDashboard(): Promise<ProgressDashboard> {
    return notConfigured();
  },

  async getWeightHistory(): Promise<BodyWeightEntry[]> {
    return notConfigured();
  },

  async getMeasurements(): Promise<BodyMeasurement[]> {
    return notConfigured();
  },

  async getProgressPhotos(): Promise<ProgressPhoto[]> {
    return notConfigured();
  },

  async getPersonalRecords(): Promise<PersonalRecordHistory> {
    return notConfigured();
  },

  async getTrainingVolume(): Promise<TrainingVolume> {
    return notConfigured();
  },

  async getInsights(): Promise<ProgressInsight[]> {
    return notConfigured();
  },
};
