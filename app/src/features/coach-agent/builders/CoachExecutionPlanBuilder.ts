import type { CoachExecutionPlan, CoachExecutionStep } from "../models/CoachExecutionPlan";
import {
  CoachExecutionStepStatuses,
} from "../models/CoachExecutionPlan";
import type { CoachIntent } from "../models/CoachIntent";
import type { SpecialistAgentKind } from "../models/SpecialistAgentKind";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import { freezeExecutionPlan } from "../utils/FreezeCoachState";

/**
 * Builds an immutable CoachExecutionPlan from selected agents.
 */
export class CoachExecutionPlanBuilder {
  build(input: {
    readonly id: string;
    readonly requestId: string;
    readonly intent: CoachIntent;
    readonly agents: readonly SpecialistAgentKind[];
    readonly createdAt: string;
  }): CoachExecutionPlan {
    const steps: CoachExecutionStep[] = input.agents.map((agent, index) =>
      Object.freeze({
        id: `cstep:${input.requestId}:${agent}`,
        agent,
        order: index + 1,
        status: CoachExecutionStepStatuses.READY,
        reason: `Selected for intent ${input.intent}`,
      }),
    );

    return freezeExecutionPlan({
      id: input.id,
      requestId: input.requestId,
      intent: input.intent,
      steps: Object.freeze(steps),
      agentKinds: Object.freeze([...input.agents]),
      metadata: EMPTY_COACH_METADATA,
      createdAt: input.createdAt,
    });
  }
}

export function buildCoachExecutionPlan(
  input: Parameters<CoachExecutionPlanBuilder["build"]>[0],
): CoachExecutionPlan {
  return new CoachExecutionPlanBuilder().build(input);
}
