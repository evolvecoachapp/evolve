import { workoutAnalyticsRepository } from "../../analytics/repository";
import { athleteContextRepository } from "../../athlete-context/repository";
import { workoutRecordsRepository } from "../../records/repository";
import { workoutHistoryRepository } from "../../workout/repository";
import { HistoryBackedCoachIntelligenceRepository } from "./HistoryBackedCoachIntelligenceRepository";
import type { CoachIntelligenceRepository } from "./CoachIntelligenceRepository";

export type {
  CoachIntelligenceRepository,
  CoachIntelligenceSnapshot,
} from "./CoachIntelligenceRepository";
export { HistoryBackedCoachIntelligenceRepository } from "./HistoryBackedCoachIntelligenceRepository";

/** Default coach intelligence repository (analytics + records + history + athlete). */
export const coachIntelligenceRepository: CoachIntelligenceRepository =
  new HistoryBackedCoachIntelligenceRepository(
    workoutAnalyticsRepository,
    workoutRecordsRepository,
    workoutHistoryRepository,
    athleteContextRepository,
  );
