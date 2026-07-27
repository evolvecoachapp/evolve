import type { CoachTimelineEntry } from "../../../coach-timeline/models/CoachTimelineEntry";
import type { CoachingSessionEvidence } from "../models/CoachingSessionEvidence";

/**
 * Collect timeline references from existing Coach Timeline entries only.
 */
export function collectTimelineContext(input: {
  readonly entries: readonly CoachTimelineEntry[];
  readonly evidence?: CoachingSessionEvidence | null;
}): readonly string[] {
  const ids = new Set<string>();
  for (const entry of input.entries) {
    ids.add(entry.id);
  }
  for (const id of input.evidence?.timelineEntryIds ?? []) {
    ids.add(id);
  }
  return Object.freeze([...ids]);
}
