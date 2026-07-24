import { EMPTY_SESSION_METADATA } from "../models/SessionMetadata";
import type { SessionEvent } from "../models/SessionEvent";
import type { SessionTimeline } from "../models/SessionTimeline";
import { toTimelineItems } from "../utils/TimelineHelpers";
import { freezeTimeline } from "../utils/FreezeSessionState";

export function buildSessionTimeline(input: {
  readonly id: string;
  readonly sessionId: string;
  readonly events: readonly SessionEvent[];
  readonly createdAt: string;
}): SessionTimeline {
  return freezeTimeline({
    id: input.id,
    sessionId: input.sessionId,
    items: toTimelineItems(input.events),
    metadata: EMPTY_SESSION_METADATA,
    createdAt: input.createdAt,
  });
}
