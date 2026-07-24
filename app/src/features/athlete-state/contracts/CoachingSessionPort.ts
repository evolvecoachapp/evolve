import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

/**
 * Port for Coaching Session Runtime contributions.
 */
export interface CoachingSessionPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly intent?: string | null;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockCoachingSessionPort(
  contribution?: SpecialistContribution | null,
): CoachingSessionPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const sessionId = input.sessionId ?? "session:coach:1";
      return freezeContribution({
        id: `contribution:session:${input.athleteId}`,
        source: SpecialistSources.SESSION,
        agentId: "runtime:coaching-session",
        athleteId: input.athleteId,
        training: null,
        recovery: null,
        nutrition: null,
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: Object.freeze({
          activeSessionId: sessionId,
          lastSessionId: sessionId,
          lastIntent: input.intent ?? "general coaching",
          focusAreas: Object.freeze(["training", "recovery"]),
          notes: Object.freeze(["mock coaching session"]),
          sourceSessionIds: Object.freeze([sessionId]),
        }),
        notes: Object.freeze(["mock coaching session runtime"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
