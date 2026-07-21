import type { CoachIntelligenceSnapshot } from "../repository/CoachIntelligenceRepository";
import {
  coachIntelligenceRepository,
  type CoachIntelligenceRepository,
} from "../repository";

/** Bundled coach intelligence snapshot for the presentation hook. */
export type CoachInsightsSnapshot = CoachIntelligenceSnapshot;

export interface GetCoachInsightsSnapshotOptions {
  readonly repository?: CoachIntelligenceRepository;
  readonly referenceDate?: Date;
}

/**
 * Loads coach intelligence in a single compute pass for `useCoachInsights`.
 */
export async function getCoachInsightsSnapshot({
  repository = coachIntelligenceRepository,
  referenceDate,
}: GetCoachInsightsSnapshotOptions = {}): Promise<CoachInsightsSnapshot> {
  return repository.getSnapshot(referenceDate);
}
