import { getCompositionRoot } from "../../../core/composition/createCompositionRoot";
import type { CoachTimelineService } from "../../coach-timeline/services/CoachTimelineService";
import { createAppendRequest } from "../../coach-timeline/builders/createAppendRequest";
import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { TimelineEventTypes } from "../../coach-timeline/models/TimelineEventType";

export interface AppendNotificationTimelineEntryInput {
  readonly athleteId: string;
  readonly eventType:
    | typeof TimelineEventTypes.REMINDER_CREATED
    | typeof TimelineEventTypes.REMINDER_COMPLETED
    | typeof TimelineEventTypes.NOTIFICATION_DISMISSED;
  readonly summary: string;
  readonly explanation: string;
  readonly at: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly timeline?: CoachTimelineService;
}

/** Appends notification/reminder lifecycle events to the Coach Timeline decision journal. */
export function appendNotificationTimelineEntry(
  input: AppendNotificationTimelineEntryInput,
): void {
  const timeline =
    input.timeline ?? getCompositionRoot().resolve("CoachTimelineService");

  const uniqueKey =
    input.metadata?.notificationId ??
    input.metadata?.reminderId ??
    input.at;

  timeline.appendEntry(
    createAppendRequest({
      id: `tl:${input.eventType}:${input.athleteId}:${uniqueKey}`,
      athleteId: input.athleteId,
      category: CoachTimelineEventCategories.SYSTEM_EVENT,
      summary: input.summary,
      explanation: input.explanation,
      reason: input.explanation,
      impact: "Notification center state updated",
      expectedOutcome: "Athlete notification history stays consistent",
      affectedDomain: "system",
      createdAt: input.at,
      metadata: Object.freeze({
        eventType: input.eventType,
        sourceModule: "notification-center",
        ...(input.metadata ?? {}),
      }),
    }),
  );
}
