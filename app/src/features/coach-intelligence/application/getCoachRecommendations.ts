import type { CoachRecommendation } from "../models/CoachRecommendation";
import {
  coachIntelligenceRepository,
  type CoachIntelligenceRepository,
} from "../repository";

export function getCoachRecommendations(
  repository: CoachIntelligenceRepository = coachIntelligenceRepository,
  referenceDate?: Date,
): Promise<readonly CoachRecommendation[]> {
  return repository.getRecommendations(referenceDate);
}
