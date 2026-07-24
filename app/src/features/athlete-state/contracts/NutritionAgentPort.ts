import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

export interface NutritionAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly agentId?: string;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockNutritionAgentPort(
  contribution?: SpecialistContribution | null,
): NutritionAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      return freezeContribution({
        id: `contribution:nutrition:${input.athleteId}`,
        source: SpecialistSources.NUTRITION,
        agentId: input.agentId ?? "agent:nutrition",
        athleteId: input.athleteId,
        training: null,
        recovery: null,
        nutrition: Object.freeze({
          planId: "nutrition-plan:1",
          dietaryPattern: "balanced",
          lastLoggedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          targetsPresent: true,
          notes: Object.freeze(["mock nutrition contribution"]),
          sourceAgentIds: Object.freeze([
            input.agentId ?? "agent:nutrition",
          ]),
        }),
        performance: null,
        readiness: null,
        fatigue: null,
        sleep: null,
        stress: null,
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["mock nutrition agent"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
