import type { AchievementHistoryEntry } from "../models/AchievementHistoryEntry";
import type { AthleteHistory } from "../models/AthleteHistory";
import type { HistoryEngineResult } from "../models/HistoryEngineResult";
import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistorySnapshot } from "../models/HistorySnapshot";
import type { HistoryStatistics } from "../models/HistoryStatistics";
import type { HistorySummary } from "../models/HistorySummary";
import type { PerformanceHistoryEntry } from "../models/PerformanceHistoryEntry";
import type { WorkoutHistoryEntry } from "../models/WorkoutHistoryEntry";

function freezeEvidence(
  evidence: HistoryEntry["evidence"],
): HistoryEntry["evidence"] {
  return Object.freeze({
    ...evidence,
    attributes: Object.freeze({ ...evidence.attributes }),
  });
}

function freezeMetadata(
  metadata: HistoryEntry["metadata"],
): HistoryEntry["metadata"] {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

function freezeReferences(
  references: HistoryEntry["references"],
): HistoryEntry["references"] {
  return Object.freeze(
    references.map((ref) => Object.freeze({ ...ref })),
  );
}

export function freezeHistoryEntry(entry: HistoryEntry): HistoryEntry {
  return Object.freeze({
    ...entry,
    references: freezeReferences(entry.references),
    evidence: freezeEvidence(entry.evidence),
    context: Object.freeze({ ...entry.context }),
    metadata: freezeMetadata(entry.metadata),
  });
}

export function freezeWorkoutHistoryEntry(
  entry: WorkoutHistoryEntry,
): WorkoutHistoryEntry {
  return freezeHistoryEntry(entry) as WorkoutHistoryEntry;
}

export function freezePerformanceHistoryEntry(
  entry: PerformanceHistoryEntry,
): PerformanceHistoryEntry {
  return freezeHistoryEntry(entry) as PerformanceHistoryEntry;
}

export function freezeAchievementHistoryEntry(
  entry: AchievementHistoryEntry,
): AchievementHistoryEntry {
  return freezeHistoryEntry(entry) as AchievementHistoryEntry;
}

export function freezeStatistics(
  statistics: HistoryStatistics,
): HistoryStatistics {
  return Object.freeze({
    ...statistics,
    byType: Object.freeze({ ...statistics.byType }),
    byCategory: Object.freeze({ ...statistics.byCategory }),
  });
}

export function freezeSummary(summary: HistorySummary): HistorySummary {
  return Object.freeze({
    ...summary,
    categories: Object.freeze([...summary.categories]),
    types: Object.freeze([...summary.types]),
  });
}

export function freezeAthleteHistory(history: AthleteHistory): AthleteHistory {
  return Object.freeze({
    ...history,
    entries: Object.freeze(history.entries.map((e) => freezeHistoryEntry(e))),
    references: freezeReferences(history.references),
    context: Object.freeze({ ...history.context }),
    metadata: freezeMetadata(history.metadata),
  });
}

export function freezeHistorySnapshot(
  snapshot: HistorySnapshot,
): HistorySnapshot {
  return Object.freeze({
    ...snapshot,
    entries: Object.freeze(snapshot.entries.map((e) => freezeHistoryEntry(e))),
    statistics: freezeStatistics(snapshot.statistics),
    summary: freezeSummary(snapshot.summary),
  });
}

export function freezeEngineResult(
  result: HistoryEngineResult,
): HistoryEngineResult {
  return Object.freeze({
    history: freezeAthleteHistory(result.history),
    snapshot: freezeHistorySnapshot(result.snapshot),
    summary: freezeSummary(result.summary),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
