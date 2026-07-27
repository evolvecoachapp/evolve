/**
 * Helpers that map domain outcomes → timeline append requests.
 * Event-driven integration without a new event bus.
 */
import { createAppendRequest } from "./createAppendRequest";
import { CoachTimelineEventCategories } from "../models/CoachTimelineEvent";
import type { AppendTimelineEntryRequest } from "../models/AppendTimelineEntryRequest";
import type { CoachTimelineService } from "../services/CoachTimelineService";

export function safeAppend(
  timeline: CoachTimelineService | null | undefined,
  request: AppendTimelineEntryRequest,
): void {
  if (!timeline) return;
  try {
    timeline.appendEntry(request);
  } catch {
    // Duplicate ids or validation failures must not break product flows.
  }
}

export function appendWorkoutCreated(input: {
  readonly timeline: CoachTimelineService | null | undefined;
  readonly athleteId: string;
  readonly planId: string;
  readonly lineageId: string;
  readonly versionNumber: number | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly summary: string;
  readonly explanation: string;
  readonly at: string;
}): void {
  safeAppend(
    input.timeline,
    createAppendRequest({
      id: `tl:workout-created:${input.planId}:${input.at}`,
      athleteId: input.athleteId,
      category: CoachTimelineEventCategories.WORKOUT_CREATED,
      summary: input.summary,
      explanation: input.explanation,
      reason: "Workout plan generated and attached to the coaching conversation",
      impact: "Athlete now has an active workout plan",
      expectedOutcome: "Athlete follows the new workout plan",
      affectedDomain: "workout",
      relatedPlanVersion: input.versionNumber,
      relatedPlanLineageId: input.lineageId,
      conversationId: input.conversationId,
      sessionId: input.sessionId,
      createdAt: input.at,
      metadata: Object.freeze({ planId: input.planId }),
    }),
  );
}

export function appendWorkoutModified(input: {
  readonly timeline: CoachTimelineService | null | undefined;
  readonly athleteId: string;
  readonly planId: string;
  readonly lineageId: string;
  readonly versionNumber: number | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly summary: string;
  readonly explanation: string;
  readonly impact: string;
  readonly expectedOutcome: string;
  readonly at: string;
  readonly searchHints?: string;
}): void {
  safeAppend(
    input.timeline,
    createAppendRequest({
      id: `tl:workout-modified:${input.planId}:${input.at}`,
      athleteId: input.athleteId,
      category: CoachTimelineEventCategories.WORKOUT_MODIFIED,
      summary: input.summary,
      explanation: input.explanation,
      reason: input.explanation,
      impact: input.impact,
      expectedOutcome: input.expectedOutcome,
      affectedDomain: "workout",
      relatedPlanVersion: input.versionNumber,
      relatedPlanLineageId: input.lineageId,
      conversationId: input.conversationId,
      sessionId: input.sessionId,
      createdAt: input.at,
      metadata: Object.freeze({
        planId: input.planId,
        hints: input.searchHints ?? "",
      }),
    }),
  );
}

export function appendPlanRestored(input: {
  readonly timeline: CoachTimelineService | null | undefined;
  readonly athleteId: string;
  readonly planType: "workout" | "nutrition";
  readonly lineageId: string;
  readonly versionNumber: number;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly summary: string;
  readonly explanation: string;
  readonly impact: string;
  readonly at: string;
}): void {
  safeAppend(
    input.timeline,
    createAppendRequest({
      id: `tl:${input.planType}-restored:${input.lineageId}:v${input.versionNumber}:${input.at}`,
      athleteId: input.athleteId,
      category:
        input.planType === "workout"
          ? CoachTimelineEventCategories.WORKOUT_RESTORED
          : CoachTimelineEventCategories.NUTRITION_RESTORED,
      summary: input.summary,
      explanation: input.explanation,
      reason: input.explanation,
      impact: input.impact,
      expectedOutcome: "Athlete continues from the restored plan version",
      affectedDomain: input.planType,
      relatedPlanVersion: input.versionNumber,
      relatedPlanLineageId: input.lineageId,
      conversationId: input.conversationId,
      sessionId: input.sessionId,
      createdAt: input.at,
    }),
  );
}

export function appendNutritionEvent(input: {
  readonly timeline: CoachTimelineService | null | undefined;
  readonly athleteId: string;
  readonly category:
    | typeof CoachTimelineEventCategories.NUTRITION_CREATED
    | typeof CoachTimelineEventCategories.NUTRITION_MODIFIED;
  readonly planId: string;
  readonly summary: string;
  readonly explanation: string;
  readonly conversationId?: string | null;
  readonly at: string;
  readonly searchHints?: string;
}): void {
  safeAppend(
    input.timeline,
    createAppendRequest({
      id: `tl:${input.category.toLowerCase()}:${input.planId}:${input.at}`,
      athleteId: input.athleteId,
      category: input.category,
      summary: input.summary,
      explanation: input.explanation,
      reason: input.explanation,
      impact:
        input.category === CoachTimelineEventCategories.NUTRITION_CREATED
          ? "Athlete has a new nutrition plan"
          : "Athlete nutrition targets were adjusted",
      expectedOutcome: "Athlete follows the nutrition guidance",
      affectedDomain: "nutrition",
      conversationId: input.conversationId ?? null,
      createdAt: input.at,
      metadata: Object.freeze({
        planId: input.planId,
        hints: input.searchHints ?? "",
      }),
    }),
  );
}

export function appendRecoveryAdjustment(input: {
  readonly timeline: CoachTimelineService | null | undefined;
  readonly athleteId: string;
  readonly planId: string;
  readonly summary: string;
  readonly explanation: string;
  readonly conversationId?: string | null;
  readonly at: string;
}): void {
  safeAppend(
    input.timeline,
    createAppendRequest({
      id: `tl:recovery:${input.planId}:${input.at}`,
      athleteId: input.athleteId,
      category: CoachTimelineEventCategories.RECOVERY_ADJUSTMENT,
      summary: input.summary,
      explanation: input.explanation,
      reason: input.explanation,
      impact: "Recovery strategy updated for the athlete",
      expectedOutcome: "Improved readiness and reduced fatigue risk",
      affectedDomain: "recovery",
      conversationId: input.conversationId ?? null,
      createdAt: input.at,
      metadata: Object.freeze({ planId: input.planId }),
    }),
  );
}

export function appendCoachDecision(input: {
  readonly timeline: CoachTimelineService | null | undefined;
  readonly athleteId: string;
  readonly decisionId: string;
  readonly recommendationId?: string | null;
  readonly summary: string;
  readonly explanation: string;
  readonly impact: string;
  readonly expectedOutcome: string;
  readonly conversationId?: string | null;
  readonly at: string;
}): void {
  safeAppend(
    input.timeline,
    createAppendRequest({
      id: `tl:decision:${input.decisionId}:${input.at}`,
      athleteId: input.athleteId,
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: input.summary,
      explanation: input.explanation,
      reason: input.explanation,
      impact: input.impact,
      expectedOutcome: input.expectedOutcome,
      affectedDomain: "decision",
      decisionId: input.decisionId,
      recommendationId: input.recommendationId ?? null,
      conversationId: input.conversationId ?? null,
      createdAt: input.at,
    }),
  );
}

export function appendGoalProgress(input: {
  readonly timeline: CoachTimelineService | null | undefined;
  readonly athleteId: string;
  readonly goalId: string;
  readonly changed: boolean;
  readonly summary: string;
  readonly explanation: string;
  readonly at: string;
}): void {
  safeAppend(
    input.timeline,
    createAppendRequest({
      id: `tl:goal:${input.goalId}:${input.at}`,
      athleteId: input.athleteId,
      category: input.changed
        ? CoachTimelineEventCategories.GOAL_CHANGED
        : CoachTimelineEventCategories.GOAL_PROGRESS,
      summary: input.summary,
      explanation: input.explanation,
      reason: input.explanation,
      impact: input.changed
        ? "Athlete goal state changed"
        : "Athlete goal progress updated",
      expectedOutcome: "Coach continues guiding toward the goal",
      affectedDomain: "goal",
      createdAt: input.at,
      metadata: Object.freeze({ goalId: input.goalId }),
    }),
  );
}

export function appendUserRequest(input: {
  readonly timeline: CoachTimelineService | null | undefined;
  readonly athleteId: string;
  readonly requestId: string;
  readonly message: string;
  readonly intent: string;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly at: string;
}): void {
  safeAppend(
    input.timeline,
    createAppendRequest({
      id: `tl:user-request:${input.requestId}`,
      athleteId: input.athleteId,
      category: CoachTimelineEventCategories.USER_REQUEST,
      summary: `User request (${input.intent})`,
      explanation: input.message,
      reason: `Athlete requested: ${input.intent}`,
      impact: "Coach conversation turn recorded in the decision journal",
      expectedOutcome: "Coach responds using session and timeline context",
      affectedDomain: "conversation",
      conversationId: input.conversationId,
      sessionId: input.sessionId,
      createdAt: input.at,
      metadata: Object.freeze({ intent: input.intent }),
    }),
  );
}
