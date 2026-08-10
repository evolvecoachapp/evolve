import type { AppendTimelineEntryRequest } from "../models/AppendTimelineEntryRequest";
import type { CoachTimeline } from "../models/CoachTimeline";
import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import type { CoachTimelineEvent } from "../models/CoachTimelineEvent";
import { CoachTimelineEventCategories } from "../models/CoachTimelineEvent";

const EVENT_LABELS: Readonly<Record<string, string>> = Object.freeze({
  [CoachTimelineEventCategories.WORKOUT_CREATED]: "Workout created",
  [CoachTimelineEventCategories.WORKOUT_MODIFIED]: "Workout modified",
  [CoachTimelineEventCategories.WORKOUT_RESTORED]: "Workout restored",
  [CoachTimelineEventCategories.NUTRITION_CREATED]: "Nutrition created",
  [CoachTimelineEventCategories.NUTRITION_MODIFIED]: "Nutrition modified",
  [CoachTimelineEventCategories.NUTRITION_RESTORED]: "Nutrition restored",
  [CoachTimelineEventCategories.GOAL_CHANGED]: "Goal changed",
  [CoachTimelineEventCategories.GOAL_PROGRESS]: "Goal progress",
  [CoachTimelineEventCategories.RECOVERY_ADJUSTMENT]: "Recovery adjustment",
  [CoachTimelineEventCategories.FATIGUE_DETECTED]: "Fatigue detected",
  [CoachTimelineEventCategories.INJURY_REPORTED]: "Injury reported",
  [CoachTimelineEventCategories.PROGRAM_PHASE_CHANGED]: "Program phase changed",
  [CoachTimelineEventCategories.COACH_DECISION]: "Coach decision",
  [CoachTimelineEventCategories.USER_REQUEST]: "User request",
  [CoachTimelineEventCategories.SYSTEM_EVENT]: "System event",
  [CoachTimelineEventCategories.UNKNOWN]: "Unknown event",
});

function eventLabel(category: string): string {
  return EVENT_LABELS[category] ?? EVENT_LABELS[CoachTimelineEventCategories.UNKNOWN]!;
}

/**
 * In-memory append-only Coach Timeline store.
 * Never mutates or deletes published entries.
 */
export class CoachTimelineStore {
  private readonly timelines = new Map<string, CoachTimeline>();

  getTimeline(athleteId: string): CoachTimeline | null {
    return this.timelines.get(athleteId) ?? null;
  }

  restoreTimeline(timeline: CoachTimeline): void {
    this.timelines.set(timeline.athleteId, timeline);
  }

  listAthleteIds(): readonly string[] {
    return Object.freeze([...this.timelines.keys()]);
  }

  append(request: AppendTimelineEntryRequest): CoachTimelineEntry {
    const existing = this.timelines.get(request.athleteId);
    if (existing?.entries.some((entry) => entry.id === request.id)) {
      throw new Error(`Timeline entry ${request.id} already exists`);
    }

    const confidence =
      typeof request.confidence === "number" &&
      Number.isFinite(request.confidence)
        ? Math.max(0, Math.min(1, request.confidence))
        : 1;

    const event: CoachTimelineEvent = Object.freeze({
      category: request.category,
      label: eventLabel(request.category),
    });

    const entry: CoachTimelineEntry = Object.freeze({
      id: request.id,
      athleteId: request.athleteId,
      timestamp: request.createdAt,
      event,
      summary: request.summary,
      explanation: request.explanation,
      decisionReason: Object.freeze({
        decisionId: request.decisionReason.decisionId,
        recommendationId: request.decisionReason.recommendationId,
        reason: request.decisionReason.reason,
        impact: request.decisionReason.impact,
        expectedOutcome: request.decisionReason.expectedOutcome,
        evidenceKeys: Object.freeze([
          ...request.decisionReason.evidenceKeys,
        ]),
      }),
      affectedDomain: request.affectedDomain,
      relatedPlanVersion: request.relatedPlanVersion ?? null,
      relatedPlanLineageId: request.relatedPlanLineageId ?? null,
      conversationId: request.conversationId ?? null,
      sessionId: request.sessionId ?? null,
      confidence,
      metadata: Object.freeze({ ...(request.metadata ?? {}) }),
    });

    const next: CoachTimeline = Object.freeze({
      athleteId: request.athleteId,
      entries: Object.freeze([...(existing?.entries ?? []), entry]),
      entryCount: (existing?.entryCount ?? 0) + 1,
      createdAt: existing?.createdAt ?? request.createdAt,
      updatedAt: request.createdAt,
    });

    this.timelines.set(request.athleteId, next);
    return entry;
  }
}

export function createCoachTimelineStore(): CoachTimelineStore {
  return new CoachTimelineStore();
}
