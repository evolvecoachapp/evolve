import type { SpecialistContribution } from "../models/SpecialistContribution";
import { SpecialistSources } from "../models/SpecialistContribution";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import { freezeContribution } from "../utils/FreezeAthleteState";

export interface RecoveryAgentPort {
  contribute(input: {
    readonly athleteId: string;
    readonly agentId?: string;
    readonly at?: string;
  }): SpecialistContribution | null;
}

export function createMockRecoveryAgentPort(
  contribution?: SpecialistContribution | null,
): RecoveryAgentPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      return freezeContribution({
        id: `contribution:recovery:${input.athleteId}`,
        source: SpecialistSources.RECOVERY,
        agentId: input.agentId ?? "agent:recovery",
        athleteId: input.athleteId,
        training: null,
        recovery: Object.freeze({
          status: "adequate",
          lastRecoverySessionId: "recovery:1",
          lastAssessedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          modalities: Object.freeze(["sleep", "mobility"]),
          notes: Object.freeze(["mock recovery contribution"]),
          sourceAgentIds: Object.freeze([
            input.agentId ?? "agent:recovery",
          ]),
        }),
        nutrition: null,
        performance: null,
        readiness: Object.freeze({
          label: "ready",
          reportedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          notes: Object.freeze([] as string[]),
        }),
        fatigue: Object.freeze({
          label: "low",
          reportedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          notes: Object.freeze([] as string[]),
        }),
        sleep: Object.freeze({
          lastNightHours: 7.5,
          qualityLabel: "good",
          reportedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          notes: Object.freeze([] as string[]),
        }),
        stress: Object.freeze({
          label: "moderate",
          reportedAt: input.at ?? "2026-07-25T12:00:00.000Z",
          notes: Object.freeze([] as string[]),
        }),
        goals: null,
        preferences: null,
        constraints: null,
        progress: null,
        coaching: null,
        notes: Object.freeze(["mock recovery agent"]),
        metadata: EMPTY_ATHLETE_METADATA,
        contributedAt: input.at ?? "2026-07-25T12:00:00.000Z",
      });
    },
  };
}
