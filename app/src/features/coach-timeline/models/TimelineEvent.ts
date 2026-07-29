import type { TimelineAction } from "./TimelineAction";
import { createTimelineAction } from "./TimelineAction";
import type { TimelineAttachment } from "./TimelineAttachment";
import { createTimelineAttachment } from "./TimelineAttachment";
import type { TimelineBadge } from "./TimelineBadge";
import { createTimelineBadge } from "./TimelineBadge";
import type { TimelineCategory } from "./TimelineCategory";
import type { TimelineEventType } from "./TimelineEventType";
import type { TimelineGroupKind } from "./TimelineGroup";
import type { TimelineMetadata } from "./TimelineMetadata";
import { createTimelineMetadata } from "./TimelineMetadata";
import type { TimelinePriority } from "./TimelinePriority";

export interface TimelineEvent {
  readonly id: string;
  readonly type: TimelineEventType;
  readonly category: TimelineCategory;
  readonly priority: TimelinePriority;
  readonly title: string;
  readonly summary: string;
  readonly occurredAt: string;
  readonly group: TimelineGroupKind;
  readonly badges: readonly TimelineBadge[];
  readonly actions: readonly TimelineAction[];
  readonly attachments: readonly TimelineAttachment[];
  readonly metadata: TimelineMetadata;
  readonly destination: string | null;
}

export function createTimelineEvent(input: TimelineEvent): TimelineEvent {
  return Object.freeze({
    ...input,
    badges: Object.freeze(input.badges.map(createTimelineBadge)),
    actions: Object.freeze(input.actions.map(createTimelineAction)),
    attachments: Object.freeze(input.attachments.map(createTimelineAttachment)),
    metadata: createTimelineMetadata(input.metadata),
  });
}
