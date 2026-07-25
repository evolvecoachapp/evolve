import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectAthleteId(
  context: UnifiedCoachingContext,
): string {
  return context.athleteId;
}

export function selectHasAthlete(context: UnifiedCoachingContext): boolean {
  return context.athlete !== null;
}

export function selectSourceCount(context: UnifiedCoachingContext): number {
  return context.sources.length;
}
