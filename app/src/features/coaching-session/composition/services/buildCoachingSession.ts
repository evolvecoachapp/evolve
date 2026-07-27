import type { CoachConversationIntent } from "../../../coach-conversation/models/CoachConversationIntent";
import type { CoachTimelineEntry } from "../../../coach-timeline/models/CoachTimelineEntry";
import type { CoachInsight } from "../../../proactive-insights/models/CoachInsight";
import type { PlanHistory } from "../../../plan-history/models/PlanHistory";
import type { PlanRestoreResult } from "../../../plan-restore/models/PlanRestoreResult";
import type { WorkoutModificationResult } from "../../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { WorkoutPlan } from "../../../workout-generation-pipeline/models/WorkoutPlan";
import type { CoachingSession } from "../models/CoachingSession";
import type { CoachingSessionResult } from "../models/CoachingSessionResult";
import { buildSessionSummary } from "./buildSessionSummary";
import { calculateSessionConfidence } from "./calculateSessionConfidence";
import { collectDecisionContext } from "./collectDecisionContext";
import { collectEvidence } from "./collectEvidence";
import { collectExplanationContext } from "./collectExplanationContext";
import { collectInsightContext } from "./collectInsightContext";
import { collectRecommendationContext } from "./collectRecommendationContext";
import { collectTimelineContext } from "./collectTimelineContext";
import { validateCoachingSession } from "./validateCoachingSession";

export interface BuildCoachingSessionInput {
  readonly athleteId: string;
  readonly conversationId: string;
  readonly sessionId: string | null;
  readonly lifecycleSessionId?: string | null;
  readonly userRequest: string;
  readonly conversationIntent: CoachConversationIntent;
  readonly requestId: string;
  readonly timelineEntries?: readonly CoachTimelineEntry[];
  readonly insights?: readonly CoachInsight[];
  readonly planHistory?: PlanHistory | null;
  readonly workoutPlan?: WorkoutPlan | null;
  readonly modification?: WorkoutModificationResult | null;
  readonly restore?: PlanRestoreResult | null;
  readonly recommendationTitles?: readonly string[];
  readonly recoveryNotes?: readonly string[];
  readonly goalSignals?: readonly string[];
  readonly generatedAt: string;
}

function deriveExpectedOutcome(input: BuildCoachingSessionInput): string {
  for (const insight of input.insights ?? []) {
    if (insight.expectedOutcome) return insight.expectedOutcome;
  }
  for (const entry of input.timelineEntries ?? []) {
    if (entry.decisionReason.expectedOutcome) {
      return entry.decisionReason.expectedOutcome;
    }
  }
  if (input.modification?.success) {
    return "Continue with the adapted workout plan.";
  }
  if (input.restore?.success) {
    return "Continue with the restored plan version.";
  }
  if (input.workoutPlan) {
    return "Follow the active workout plan guidance.";
  }
  return "Continue coaching with available evidence only.";
}

function deriveRelatedDomains(input: {
  readonly entries: readonly CoachTimelineEntry[];
  readonly insights: readonly CoachInsight[];
  readonly workoutPlan: WorkoutPlan | null | undefined;
  readonly planHistory: PlanHistory | null | undefined;
}): readonly string[] {
  const domains = new Set<string>();
  domains.add("conversation");
  for (const entry of input.entries) {
    domains.add(entry.affectedDomain);
  }
  for (const insight of input.insights) {
    domains.add(insight.affectedDomain);
  }
  if (input.workoutPlan) domains.add("workout");
  if (input.planHistory?.planType === "nutrition") domains.add("nutrition");
  if (input.planHistory?.planType === "workout") domains.add("workout");
  return Object.freeze([...domains]);
}

/**
 * Compose an immutable Explainable Coaching Session from existing domain outputs.
 * No new reasoning engines. No duplicated business logic.
 */
export function buildCoachingSession(
  input: BuildCoachingSessionInput,
): CoachingSessionResult {
  const entries = input.timelineEntries ?? Object.freeze([]);
  const insights = input.insights ?? Object.freeze([]);

  const evidence = collectEvidence({
    athleteId: input.athleteId,
    userRequest: input.userRequest,
    conversationIntent: input.conversationIntent,
    timelineEntries: entries,
    insights,
    planHistory: input.planHistory ?? null,
    workoutPlan: input.workoutPlan ?? null,
    modification: input.modification ?? null,
    restore: input.restore ?? null,
    recommendationTitles: input.recommendationTitles ?? Object.freeze([]),
    recoveryNotes: input.recoveryNotes ?? Object.freeze([]),
    goalSignals: input.goalSignals ?? Object.freeze([]),
  });

  const timelineReferences = collectTimelineContext({ entries, evidence });
  const decisionSummary = collectDecisionContext({ entries, evidence });
  const recommendationSummary = collectRecommendationContext({
    entries,
    evidence,
    recommendationTitles: input.recommendationTitles,
  });
  const insightSummary = collectInsightContext({ insights, evidence });
  const reasoningSummary = collectExplanationContext({ entries, evidence });
  const confidence = calculateSessionConfidence(evidence);
  const expectedOutcome = deriveExpectedOutcome(input);
  const relatedDomains = deriveRelatedDomains({
    entries,
    insights,
    workoutPlan: input.workoutPlan,
    planHistory: input.planHistory,
  });

  const sessionId = `coach-session:${input.requestId}:${input.generatedAt}`;
  const context = Object.freeze({
    id: `coach-session-ctx:${input.requestId}`,
    athleteId: input.athleteId,
    conversationId: input.conversationId,
    sessionId: input.sessionId,
    userRequest: input.userRequest,
    conversationIntent: input.conversationIntent,
    lifecycleSessionId: input.lifecycleSessionId ?? input.sessionId,
    workoutPlanId: input.workoutPlan?.id ?? null,
    planLineageId: input.planHistory?.lineageId ?? null,
    relatedDomains,
    createdAt: input.generatedAt,
  });

  const summary = buildSessionSummary({
    sessionId,
    intent: input.conversationIntent,
    evidence,
    decision: decisionSummary,
    recommendation: recommendationSummary,
    insight: insightSummary,
    explanation: reasoningSummary,
    confidence,
    expectedOutcome,
    generatedAt: input.generatedAt,
  });

  const session: CoachingSession = Object.freeze({
    id: sessionId,
    timestamp: input.generatedAt,
    userRequest: input.userRequest,
    conversationIntent: input.conversationIntent,
    evidenceUsed: evidence,
    timelineReferences,
    decisionSummary,
    recommendationSummary,
    insightSummary,
    reasoningSummary,
    expectedOutcome,
    confidence,
    relatedDomains,
    context,
    summary,
    metadata: Object.freeze({
      requestId: input.requestId,
      athleteId: input.athleteId,
      conversationId: input.conversationId,
    }),
  });

  const validation = validateCoachingSession(session);
  if (!validation.valid) {
    return Object.freeze({
      id: `coach-session-result:${input.requestId}:invalid`,
      success: false,
      session: null,
      summary: null,
      evidence,
      confidence,
      validation,
      message: `Coaching session validation failed: ${validation.errors.join("; ")}`,
      generatedAt: input.generatedAt,
    });
  }

  return Object.freeze({
    id: `coach-session-result:${input.requestId}`,
    success: true,
    session,
    summary,
    evidence,
    confidence,
    validation,
    message: "Explainable coaching session composed from existing evidence.",
    generatedAt: input.generatedAt,
  });
}
