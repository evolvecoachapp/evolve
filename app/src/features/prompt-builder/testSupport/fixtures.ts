import type { CoachInsight } from "../../coach-intelligence/models/CoachInsight";
import type { CoachRecommendation } from "../../coach-intelligence/models/CoachRecommendation";
import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { RiskFlag } from "../../coach-intelligence/models/RiskFlag";
import type { CoachIntelligenceSnapshot } from "../../coach-intelligence/repository";
import { prepareConversation } from "../../conversation-orchestrator/application";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import {
  createFullConversationInputs,
  FIXED_TIMESTAMP as CONVERSATION_FIXED_TIMESTAMP,
} from "../../conversation-orchestrator/testSupport/fixtures";
import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

export const FIXED_TIMESTAMP = CONVERSATION_FIXED_TIMESTAMP;

export { createFullConversationInputs } from "../../conversation-orchestrator/testSupport/fixtures";

/** Legacy coach-backed fixtures */
export function createCoachSummary(
  overrides: Partial<CoachSummary> = {},
): CoachSummary {
  return Object.freeze({
    volumeTrend: Object.freeze({
      metric: "volume" as const,
      direction: "increasing" as const,
      changeRatio: 0.2,
      windowWeeks: 8,
    }),
    frequencyTrend: Object.freeze({
      metric: "frequency" as const,
      direction: "stable" as const,
      changeRatio: 0.02,
      windowWeeks: 8,
    }),
    recovery: Object.freeze({
      level: "moderate" as const,
      daysSinceLastSession: 2,
      fatigueScore: 0.4,
    }),
    progress: Object.freeze({
      level: "improving" as const,
      recentPRCount: 1,
      plateauExerciseCount: 1,
    }),
    consistencyScore: 0.82,
    insightCount: 2,
    riskCount: 1,
    recommendationCount: 1,
    athleteGoal: null,
    trainingExperience: null,
    generatedAt: "2026-07-21T12:00:00.000Z",
    ...overrides,
  });
}

export function createInsights(): readonly CoachInsight[] {
  return Object.freeze([
    Object.freeze({
      id: "insight:recent_pr",
      kind: "recent_pr" as const,
      confidence: 0.9,
      detectedAt: "2026-07-21T12:00:00.000Z",
      payload: Object.freeze({ ageDays: 3 }),
    }),
    Object.freeze({
      id: "insight:exercise_plateau",
      kind: "exercise_plateau" as const,
      confidence: 0.7,
      detectedAt: "2026-07-21T12:00:00.000Z",
      payload: Object.freeze({ exerciseId: "squat", weeksStagnant: 4 }),
    }),
  ]);
}

export function createRiskFlags(): readonly RiskFlag[] {
  return Object.freeze([
    Object.freeze({
      code: "exercise_stagnation" as const,
      severity: "low" as const,
      evidence: Object.freeze({ plateauExerciseCount: 1 }),
    }),
  ]);
}

export function createRecommendations(): readonly CoachRecommendation[] {
  return Object.freeze([
    Object.freeze({
      code: "vary_exercises" as const,
      priority: "medium" as const,
      relatedInsightIds: Object.freeze(["insight:exercise_plateau"]),
    }),
  ]);
}

export function createSnapshot(
  overrides: Partial<CoachIntelligenceSnapshot> = {},
): CoachIntelligenceSnapshot {
  const insights = overrides.insights ?? createInsights();
  const riskFlags = overrides.riskFlags ?? createRiskFlags();
  const recommendations =
    overrides.recommendations ?? createRecommendations();
  const summary =
    overrides.summary ??
    createCoachSummary({
      insightCount: insights.length,
      riskCount: riskFlags.length,
      recommendationCount: recommendations.length,
    });

  return Object.freeze({
    summary,
    insights,
    riskFlags,
    recommendations,
  });
}

/** Sprint 19.1 Prompt Builder fixtures */
export function createFullPromptBuilderInputs(): {
  readonly conversationContext: ConversationContext;
  readonly coachingContext: CoachingContext;
  readonly insightSnapshot: InsightSnapshot;
} {
  const conversationInputs = createFullConversationInputs();
  const conversation = prepareConversation({
    ...conversationInputs,
    preparedAt: FIXED_TIMESTAMP,
    contextId: "conversation:prompt-builder-full",
  });

  return Object.freeze({
    conversationContext: conversation.context,
    coachingContext: conversationInputs.coachingContext,
    insightSnapshot: conversationInputs.insightSnapshot,
  });
}

export function createPromptBlockFixture(
  overrides: Partial<PromptBlock> & { readonly id?: string } = {},
): PromptBlock {
  const type = overrides.type ?? PromptBlockTypes.SYSTEM;
  return new PromptBlockBuilder()
    .withId(overrides.id ?? "prompt-block:fixture:system")
    .withType(type)
    .withSection(overrides.section ?? PromptSections.SYSTEM)
    .withPriority(overrides.priority ?? 50)
    .withOrder(overrides.order ?? 10)
    .withTitle(overrides.title ?? "Fixture block")
    .withStatement(overrides.statement ?? "Fixture block statement.")
    .withRefs(overrides.refs ?? [])
    .withMetadata(
      overrides.metadata ??
        Object.freeze({
          tags: Object.freeze(["fixture"]),
          attributes: Object.freeze({}),
        }),
    )
    .withAttributes(overrides.attributes ?? Object.freeze({}))
    .build();
}
