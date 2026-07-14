import {
  mockMeasurementsData,
  mockPersonalRecordsData,
  mockProgressDashboardData,
  mockProgressInsightsData,
  mockProgressPhotosData,
  mockTrainingVolumeData,
  mockWeightHistoryData,
} from "../mocks";
import type { BodyMeasurement } from "../models/BodyMeasurement";
import type { BodyWeightEntry } from "../models/BodyWeightEntry";
import type { PersonalRecordHistory } from "../models/PersonalRecordHistory";
import type { ProgressDashboard } from "../models/ProgressDashboard";
import type { ProgressInsight } from "../models/ProgressInsight";
import type { ProgressPhoto } from "../models/ProgressPhoto";
import type { TrainingVolume } from "../models/TrainingVolume";
import type { ProgressService } from "../services/progressService";
import {
  cloneMeasurements,
  clonePersonalRecordHistory,
  cloneProgressDashboard,
  cloneProgressInsights,
  cloneProgressPhotos,
  cloneTrainingVolume,
  cloneWeightHistory,
} from "../utils/progressAdapters";

let dashboardState = cloneProgressDashboard(mockProgressDashboardData);

/** Default provider — returns seeded local progress data. */
export const mockProgressService: ProgressService = {
  providerId: "mock",

  async getDashboard(): Promise<ProgressDashboard> {
    return cloneProgressDashboard(dashboardState);
  },

  async getWeightHistory(): Promise<BodyWeightEntry[]> {
    return cloneWeightHistory(mockWeightHistoryData);
  },

  async getMeasurements(): Promise<BodyMeasurement[]> {
    return cloneMeasurements(mockMeasurementsData);
  },

  async getProgressPhotos(): Promise<ProgressPhoto[]> {
    return cloneProgressPhotos(mockProgressPhotosData);
  },

  async getPersonalRecords(): Promise<PersonalRecordHistory> {
    return clonePersonalRecordHistory(mockPersonalRecordsData);
  },

  async getTrainingVolume(): Promise<TrainingVolume> {
    return cloneTrainingVolume(mockTrainingVolumeData);
  },

  async getInsights(): Promise<ProgressInsight[]> {
    return cloneProgressInsights(mockProgressInsightsData);
  },
};
