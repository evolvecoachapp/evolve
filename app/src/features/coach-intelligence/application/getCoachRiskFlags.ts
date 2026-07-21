import type { RiskFlag } from "../models/RiskFlag";
import {
  coachIntelligenceRepository,
  type CoachIntelligenceRepository,
} from "../repository";

export function getCoachRiskFlags(
  repository: CoachIntelligenceRepository = coachIntelligenceRepository,
  referenceDate?: Date,
): Promise<readonly RiskFlag[]> {
  return repository.getRiskFlags(referenceDate);
}
