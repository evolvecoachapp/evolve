import {
  createDecisionEngine,
  type DecisionEngine,
  type DecisionEngineDeps,
} from "../decision/DecisionEngine";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionResult } from "../models/DecisionResult";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import { appendCoachDecision } from "../../coach-timeline/builders/timelineIntegration";

export interface DecisionEngineServiceDeps extends DecisionEngineDeps {
  readonly coachTimeline?: CoachTimelineService | null;
}

/**
 * Decision Engine Service — orchestration facade.
 *
 * UnifiedCoachingContext → CoachingDecision → RecommendationEngineInput
 *
 * No networking. No persistence. No provider SDKs. No AI. No domain calculations.
 */
export class DecisionEngineService {
  private readonly engine: DecisionEngine;
  private readonly coachTimeline: CoachTimelineService | null;

  constructor(deps: DecisionEngineServiceDeps = {}) {
    this.engine = createDecisionEngine(deps);
    this.coachTimeline = deps.coachTimeline ?? null;
  }

  buildDecision(input: DecisionInput): DecisionResult {
    const result = this.engine.buildDecision(input);
    this.journalDecisions(result);
    return result;
  }

  evaluateDecision(input: DecisionInput): DecisionResult {
    return this.engine.evaluateDecision(input);
  }

  resolveDecision(input: DecisionInput): DecisionResult {
    const result = this.engine.resolveDecision(input);
    this.journalDecisions(result);
    return result;
  }

  describeDecision(): DecisionDescriptor {
    return this.engine.describe();
  }

  validateDecision(input: DecisionInput): DecisionResult {
    return this.engine.validateDecision(input);
  }

  private journalDecisions(result: DecisionResult): void {
    if (!result.success || !this.coachTimeline) return;
    for (const decision of result.decisions) {
      const reason =
        decision.reasons[0]?.statement ??
        decision.title ??
        "Decision Engine produced a coaching decision";
      appendCoachDecision({
        timeline: this.coachTimeline,
        athleteId: decision.athleteId || "athlete:unknown",
        decisionId: decision.id,
        recommendationId: decision.recommendationRefs[0]?.id ?? null,
        summary: decision.title || `Coach decision (${decision.category})`,
        explanation: reason,
        impact: `Outcome: ${decision.outcome}`,
        expectedOutcome: `Decision ${decision.outcome}`,
        conversationId: decision.conversationId,
        at: result.createdAt,
      });
    }
  }
}

export function createDecisionEngineService(
  deps: DecisionEngineServiceDeps = {},
): DecisionEngineService {
  return new DecisionEngineService(deps);
}
