import type { CoachSummary } from "../models/CoachSummary";
import {
  coachIntelligenceRepository,
  type CoachIntelligenceRepository,
} from "../repository";

export function getCoachSummary(
  repository: CoachIntelligenceRepository = coachIntelligenceRepository,
  referenceDate?: Date,
): Promise<CoachSummary> {
  return repository.getCoachSummary(referenceDate);
}
