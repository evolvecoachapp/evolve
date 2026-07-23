import type { MemoryContext } from "../models/MemoryContext";
import type { MemoryDecision } from "../models/MemoryDecision";
import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryEvent } from "../models/MemoryEvent";
import type { MemoryIdentifier } from "../models/MemoryIdentifier";
import type { MemoryMetadata } from "../models/MemoryMetadata";
import type { MemoryProfile } from "../models/MemoryProfile";
import type { MemoryQuery } from "../models/MemoryQuery";
import type { MemoryResult } from "../models/MemoryResult";
import type { MemorySnapshot } from "../models/MemorySnapshot";
import type { MemorySummary } from "../models/MemorySummary";
import type { MemoryTimeline } from "../models/MemoryTimeline";
import type { MemoryUpdate } from "../models/MemoryUpdate";
import type {
  MemoryValidation,
  MemoryValidationIssue,
} from "../models/MemoryValidation";

export function freezeMetadata(metadata: MemoryMetadata): MemoryMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeIdentifier(
  identifier: MemoryIdentifier,
): MemoryIdentifier {
  return Object.freeze({ ...identifier });
}

export function freezeValidationIssue(
  issue: MemoryValidationIssue,
): MemoryValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: MemoryValidation,
): MemoryValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeEntry(entry: MemoryEntry): MemoryEntry {
  return Object.freeze({
    ...entry,
    identifier: freezeIdentifier(entry.identifier),
    metadata: freezeMetadata(entry.metadata),
  });
}

export function freezeEvent(event: MemoryEvent): MemoryEvent {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
  });
}

export function freezeQuery(query: MemoryQuery): MemoryQuery {
  return Object.freeze({ ...query });
}

export function freezeUpdate(update: MemoryUpdate): MemoryUpdate {
  return Object.freeze({
    ...update,
    metadata: update.metadata ? freezeMetadata(update.metadata) : null,
  });
}

export function freezeProfile(profile: MemoryProfile): MemoryProfile {
  return Object.freeze({
    ...profile,
    entries: Object.freeze(profile.entries.map(freezeEntry)),
    metadata: freezeMetadata(profile.metadata),
  });
}

export function freezeContext(context: MemoryContext): MemoryContext {
  return Object.freeze({
    ...context,
    entries: Object.freeze(context.entries.map(freezeEntry)),
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeDecision(decision: MemoryDecision): MemoryDecision {
  return Object.freeze({
    ...decision,
    entries: Object.freeze(decision.entries.map(freezeEntry)),
    metadata: freezeMetadata(decision.metadata),
  });
}

export function freezeSnapshot(snapshot: MemorySnapshot): MemorySnapshot {
  return Object.freeze({
    ...snapshot,
    entries: Object.freeze(snapshot.entries.map(freezeEntry)),
    profile: freezeProfile(snapshot.profile),
    context: freezeContext(snapshot.context),
    decision: freezeDecision(snapshot.decision),
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeTimeline(timeline: MemoryTimeline): MemoryTimeline {
  return Object.freeze({
    ...timeline,
    events: Object.freeze(timeline.events.map(freezeEvent)),
    metadata: freezeMetadata(timeline.metadata),
  });
}

export function freezeSummary(summary: MemorySummary): MemorySummary {
  return Object.freeze({
    ...summary,
    categories: Object.freeze([...summary.categories]),
  });
}

export function freezeResult(result: MemoryResult): MemoryResult {
  return Object.freeze({
    ...result,
    entries: Object.freeze(result.entries.map(freezeEntry)),
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    timeline: result.timeline ? freezeTimeline(result.timeline) : null,
    validation: freezeValidation(result.validation),
    events: Object.freeze(result.events.map(freezeEvent)),
    metadata: freezeMetadata(result.metadata),
  });
}

export const FreezeMemoryState = Object.freeze({
  freezeEntry,
  freezeEvent,
  freezeQuery,
  freezeUpdate,
  freezeProfile,
  freezeContext,
  freezeDecision,
  freezeSnapshot,
  freezeTimeline,
  freezeSummary,
  freezeResult,
  freezeValidation,
  freezeMetadata,
});
