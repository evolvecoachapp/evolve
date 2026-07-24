import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

/**
 * Port for future Goal Agent — mocked until Goal Agent lands.
 */
export interface GoalAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly agentId?: string;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockGoalAgentPort(
  contribution?: SpecialistContribution | null,
): GoalAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      return freezeContribution({
        id: `contribution:goal:${input.athleteId}`,
        source: SpecialistSources.GOAL,
        agentId: input.agentId ?? "agent:goal",
        athleteId: input.athleteId,
        training: null,
        recovery: null,
        nutrition: null,
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: Object.freeze({
          primaryGoalId: "goal:1",
          items: Object.freeze([
            Object.freeze({
              id: "goal:1",
              kind: "strength",
              title: "Increase squat",
              status: "active",
              targetDate: null,
              notes: Object.freeze([] as string[]),
            }),
          ]),
          sourceAgentIds: Object.freeze([input.agentId ?? "agent:goal"]),
        }),
        preferences: null,
        constraints: null,
        progress: Object.freeze({
          milestones: Object.freeze(["baseline established"]),
          recentWins: Object.freeze([] as string[]),
          blockers: Object.freeze([] as string[]),
          notes: Object.freeze([] as string[]),
          sourceAgentIds: Object.freeze([input.agentId ?? "agent:goal"]),
        }),
        coaching: null,
        notes: Object.freeze(["mock goal agent"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
