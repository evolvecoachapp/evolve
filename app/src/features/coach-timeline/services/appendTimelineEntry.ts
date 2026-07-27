import type { AppendTimelineEntryRequest } from "../models/AppendTimelineEntryRequest";
import type { CoachTimelineEntry } from "../models/CoachTimelineEntry";
import type { CoachTimelineStore } from "../store/CoachTimelineStore";
import { validateTimelineEntryRequest } from "./validateTimeline";

/**
 * Append a single immutable timeline entry. One responsibility only.
 */
export function appendTimelineEntry(input: {
  readonly store: CoachTimelineStore;
  readonly request: AppendTimelineEntryRequest;
}): CoachTimelineEntry {
  const validation = validateTimelineEntryRequest(input.request);
  if (!validation.valid) {
    throw new Error(validation.errors.join("; ") || "Invalid timeline entry");
  }
  return input.store.append(input.request);
}
