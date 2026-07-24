import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

/**
 * Port for Workout Agent contributions into Athlete State.
 * Consumes agent contracts structurally — no networking / SDKs.
 */
export interface WorkoutAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly agentId?: string;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockWorkoutAgentPort(
  contribution?: SpecialistContribution | null,
): WorkoutAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      return freezeContribution({
        id: `contribution:workout:${input.athleteId}`,
        source: SpecialistSources.WORKOUT,
        agentId: input.agentId ?? "agent:workout",
        athleteId: input.athleteId,
        training: Object.freeze({
          phase: "build",
          focus: "strength",
          sessionsPerWeek: 4,
          lastSessionId: "session:workout:1",
          lastSessionAt: input.at ?? "2026-07-25T12:00:00.000Z",
          programId: "program:1",
          notes: Object.freeze(["mock workout contribution"]),
          sourceAgentIds: Object.freeze([
            input.agentId ?? "agent:workout",
          ]),
        }),
        recovery: null,
        nutrition: null,
        performance: Object.freeze({
          lastSnapshotId: "perf:1",
          trendLabel: "stable",
          highlights: Object.freeze(["completed last session"]),
          notes: Object.freeze([] as string[]),
          sourceAgentIds: Object.freeze([
            input.agentId ?? "agent:workout",
          ]),
        }),
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["mock workout agent"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
