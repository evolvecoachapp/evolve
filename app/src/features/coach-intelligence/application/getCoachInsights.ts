import type { CoachInsight } from "../models/CoachInsight";
import {
  coachIntelligenceRepository,
  type CoachIntelligenceRepository,
} from "../repository";

export function getCoachInsights(
  repository: CoachIntelligenceRepository = coachIntelligenceRepository,
  referenceDate?: Date,
): Promise<readonly CoachInsight[]> {
  return repository.getInsights(referenceDate);
}
