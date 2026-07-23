import type { CoachAgentResult } from "../models/CoachAgentResult";
import type { CoachDecision } from "../models/CoachDecision";
import type { CoachExecutionContext } from "../models/CoachExecutionContext";
import type { CoachExecutionEvent } from "../models/CoachExecutionEvent";
import type { CoachExecutionPlan } from "../models/CoachExecutionPlan";
import type { CoachRequest } from "../models/CoachRequest";
import type { CoachSummary } from "../models/CoachSummary";
import type { CoachValidation } from "../models/CoachValidation";
import type { SpecialistAgentOutputs } from "../models/SpecialistAgentInvocation";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import {
  freezeAgentResult,
  freezeSummary,
} from "../utils/FreezeCoachState";

/**
 * Builds immutable coach results / summaries from orchestration artifacts.
 */
export class CoachResultBuilder {
  buildSummary(input: {
    readonly requestId: string;
    readonly intent: CoachSummary["intent"];
    readonly agentsInvoked: CoachSummary["agentsInvoked"];
    readonly decision: CoachDecision;
    readonly success: boolean;
    readonly message: string;
    readonly createdAt: string;
  }): CoachSummary {
    return freezeSummary({
      requestId: input.requestId,
      intent: input.intent,
      agentsInvoked: Object.freeze([...input.agentsInvoked]),
      recommendationCount: input.decision.recommendations.length,
      conflictCount: input.decision.conflicts.length,
      accepted: input.decision.accepted,
      success: input.success,
      message: input.message,
      createdAt: input.createdAt,
    });
  }

  buildResult(input: {
    readonly id: string;
    readonly request: CoachRequest;
    readonly context: CoachExecutionContext;
    readonly plan: CoachExecutionPlan;
    readonly outputs: SpecialistAgentOutputs;
    readonly decision: CoachDecision;
    readonly validation: CoachValidation;
    readonly summary: CoachSummary;
    readonly events: readonly CoachExecutionEvent[];
    readonly success: boolean;
    readonly message: string | null;
    readonly startedAt: string;
    readonly completedAt: string;
  }): CoachAgentResult {
    return freezeAgentResult({
      id: input.id,
      request: input.request,
      context: input.context,
      plan: input.plan,
      outputs: input.outputs,
      decision: input.decision,
      validation: input.validation,
      summary: input.summary,
      events: Object.freeze([...input.events]),
      success: input.success,
      message: input.message,
      metadata: EMPTY_COACH_METADATA,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      frozenAt: input.completedAt,
    });
  }
}

export function buildCoachSummary(
  input: Parameters<CoachResultBuilder["buildSummary"]>[0],
): CoachSummary {
  return new CoachResultBuilder().buildSummary(input);
}
