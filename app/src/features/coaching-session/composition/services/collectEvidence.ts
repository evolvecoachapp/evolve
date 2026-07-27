import type { CoachTimelineEntry } from "../../../coach-timeline/models/CoachTimelineEntry";
import type { CoachInsight } from "../../../proactive-insights/models/CoachInsight";
import type { PlanHistory } from "../../../plan-history/models/PlanHistory";
import type { WorkoutPlan } from "../../../workout-generation-pipeline/models/WorkoutPlan";
import type { WorkoutModificationResult } from "../../../workout-generation-pipeline/models/WorkoutModificationResult";
import type { PlanRestoreResult } from "../../../plan-restore/models/PlanRestoreResult";
import type { CoachConversationIntent } from "../../../coach-conversation/models/CoachConversationIntent";
import type {
  CoachingSessionEvidence,
  CoachingSessionEvidenceItem,
  CoachingSessionEvidenceSource,
} from "../models/CoachingSessionEvidence";

export interface CollectEvidenceInput {
  readonly athleteId: string;
  readonly userRequest: string;
  readonly conversationIntent: CoachConversationIntent;
  readonly timelineEntries?: readonly CoachTimelineEntry[];
  readonly insights?: readonly CoachInsight[];
  readonly planHistory?: PlanHistory | null;
  readonly workoutPlan?: WorkoutPlan | null;
  readonly modification?: WorkoutModificationResult | null;
  readonly restore?: PlanRestoreResult | null;
  readonly recommendationTitles?: readonly string[];
  readonly recoveryNotes?: readonly string[];
  readonly goalSignals?: readonly string[];
}

function freezeItem(item: CoachingSessionEvidenceItem): CoachingSessionEvidenceItem {
  return Object.freeze({ ...item });
}

/**
 * Collect evidence citations from existing domain outputs only.
 * Never invents evidence.
 */
export function collectEvidence(
  input: CollectEvidenceInput,
): CoachingSessionEvidence {
  const items: CoachingSessionEvidenceItem[] = [];
  const sources = new Set<CoachingSessionEvidenceSource>();
  const timelineEntryIds: string[] = [];
  const planVersionNumbers: number[] = [];
  const decisionIds = new Set<string>();
  const recommendationIds = new Set<string>();
  const explanationIds = new Set<string>();
  const insightIds: string[] = [];
  const keys = new Set<string>();

  sources.add("conversation_context");
  keys.add(`intent:${input.conversationIntent}`);
  items.push(
    freezeItem({
      id: `ev:conversation:${input.athleteId}`,
      source: "conversation_context",
      key: `intent:${input.conversationIntent}`,
      summary: `User request intent=${input.conversationIntent}`,
      referenceId: null,
    }),
  );

  for (const entry of input.timelineEntries ?? []) {
    sources.add("coach_timeline");
    timelineEntryIds.push(entry.id);
    keys.add(entry.event.category);
    for (const key of entry.decisionReason.evidenceKeys) {
      keys.add(key);
    }
    if (entry.decisionReason.decisionId) {
      sources.add("decision_engine");
      decisionIds.add(entry.decisionReason.decisionId);
    }
    if (entry.decisionReason.recommendationId) {
      sources.add("recommendation_engine");
      recommendationIds.add(entry.decisionReason.recommendationId);
    }
    if (entry.relatedPlanVersion != null) {
      sources.add("plan_history");
      planVersionNumbers.push(entry.relatedPlanVersion);
    }
    const domain = entry.affectedDomain;
    if (domain === "recovery") sources.add("recovery_state");
    if (domain === "goal") sources.add("goal_progress");
    if (domain === "nutrition") sources.add("nutrition_plan");
    if (domain === "workout") sources.add("workout_plan");

    items.push(
      freezeItem({
        id: `ev:timeline:${entry.id}`,
        source: "coach_timeline",
        key: entry.event.category,
        summary: entry.summary,
        referenceId: entry.id,
      }),
    );
  }

  for (const insight of input.insights ?? []) {
    sources.add("proactive_insights");
    insightIds.push(insight.id);
    keys.add(insight.type);
    for (const key of insight.evidence.keys) {
      keys.add(key);
    }
    for (const tid of insight.relatedTimelineEntryIds) {
      if (!timelineEntryIds.includes(tid)) timelineEntryIds.push(tid);
    }
    if (insight.affectedDomain === "recovery") sources.add("recovery_state");
    if (insight.affectedDomain === "goal") sources.add("goal_progress");
    if (insight.affectedDomain === "nutrition") sources.add("nutrition_plan");
    if (insight.affectedDomain === "workout") sources.add("workout_plan");
    if (insight.affectedDomain === "decision") sources.add("decision_engine");

    items.push(
      freezeItem({
        id: `ev:insight:${insight.id}`,
        source: "proactive_insights",
        key: insight.type,
        summary: insight.title,
        referenceId: insight.id,
      }),
    );
  }

  if (input.planHistory) {
    sources.add("plan_history");
    keys.add(`plan-history:${input.planHistory.lineageId}`);
    for (const version of input.planHistory.versions) {
      planVersionNumbers.push(version.versionNumber);
    }
    items.push(
      freezeItem({
        id: `ev:plan-history:${input.planHistory.lineageId}`,
        source: "plan_history",
        key: input.planHistory.lineageId,
        summary: `Plan history current v${input.planHistory.currentVersionNumber}`,
        referenceId: input.planHistory.lineageId,
      }),
    );
    if (input.planHistory.planType === "nutrition") {
      sources.add("nutrition_plan");
    } else {
      sources.add("workout_plan");
    }
  }

  if (input.workoutPlan) {
    sources.add("workout_plan");
    keys.add(`workout-plan:${input.workoutPlan.id}`);
    items.push(
      freezeItem({
        id: `ev:workout-plan:${input.workoutPlan.id}`,
        source: "workout_plan",
        key: input.workoutPlan.id,
        summary: input.workoutPlan.summary.title,
        referenceId: input.workoutPlan.id,
      }),
    );
  }

  if (input.modification?.success) {
    sources.add("workout_plan");
    keys.add("workout_modification");
    items.push(
      freezeItem({
        id: `ev:modification:${input.modification.id}`,
        source: "workout_plan",
        key: "workout_modification",
        summary: input.modification.message || "Workout plan modified",
        referenceId: input.modification.id,
      }),
    );
  }

  if (input.restore?.success) {
    sources.add("plan_history");
    keys.add("plan_restore");
    items.push(
      freezeItem({
        id: `ev:restore:${input.restore.id}`,
        source: "plan_history",
        key: "plan_restore",
        summary: input.restore.message || "Plan restored",
        referenceId: input.restore.id,
      }),
    );
  }

  for (const title of input.recommendationTitles ?? []) {
    sources.add("recommendation_engine");
    keys.add(`recommendation:${title}`);
    items.push(
      freezeItem({
        id: `ev:recommendation-title:${items.length}`,
        source: "recommendation_engine",
        key: "recommendation_title",
        summary: title,
        referenceId: null,
      }),
    );
  }

  for (const note of input.recoveryNotes ?? []) {
    sources.add("recovery_state");
    keys.add(`recovery:${note}`);
    items.push(
      freezeItem({
        id: `ev:recovery:${items.length}`,
        source: "recovery_state",
        key: "recovery_note",
        summary: note,
        referenceId: null,
      }),
    );
  }

  for (const signal of input.goalSignals ?? []) {
    sources.add("goal_progress");
    keys.add(`goal:${signal}`);
    items.push(
      freezeItem({
        id: `ev:goal:${items.length}`,
        source: "goal_progress",
        key: "goal_signal",
        summary: signal,
        referenceId: null,
      }),
    );
  }

  // Explainability refs appear only when timeline decision reasons cite them via keys.
  for (const entry of input.timelineEntries ?? []) {
    const explanationKey = entry.metadata["explanationId"];
    if (explanationKey) {
      sources.add("explainability_engine");
      explanationIds.add(explanationKey);
    }
  }

  const uniqueVersions = Object.freeze([...new Set(planVersionNumbers)]);
  const sourceList = Object.freeze([...sources]);
  const summary =
    items.length === 0
      ? "No domain evidence available for this coaching turn."
      : `Collected ${items.length} evidence item(s) from ${sourceList.length} source(s).`;

  return Object.freeze({
    items: Object.freeze(items.map(freezeItem)),
    sources: sourceList,
    timelineEntryIds: Object.freeze([...timelineEntryIds]),
    planVersionNumbers: uniqueVersions,
    decisionIds: Object.freeze([...decisionIds]),
    recommendationIds: Object.freeze([...recommendationIds]),
    explanationIds: Object.freeze([...explanationIds]),
    insightIds: Object.freeze([...insightIds]),
    keys: Object.freeze([...keys]),
    summary,
  });
}
