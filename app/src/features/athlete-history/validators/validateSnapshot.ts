import type { AthleteHistory } from "../models/AthleteHistory";
import type { HistorySnapshot } from "../models/HistorySnapshot";

/**
 * Validate HistorySnapshot consistency against its source AthleteHistory.
 */
export function validateSnapshotConsistency(
  history: AthleteHistory,
  snapshot: HistorySnapshot,
): readonly string[] {
  const issues: string[] = [];

  if (snapshot.historyId !== history.id) {
    issues.push("snapshot_history_id_mismatch");
  }
  if (snapshot.athleteId !== history.athleteId) {
    issues.push("snapshot_athlete_id_mismatch");
  }
  if (snapshot.entryCount !== history.entryCount) {
    issues.push("snapshot_entry_count_mismatch");
  }
  if (snapshot.entries.length !== history.entries.length) {
    issues.push("snapshot_entries_length_mismatch");
  }

  const historyIds = history.entries.map((e) => e.id).join("|");
  const snapshotIds = snapshot.entries.map((e) => e.id).join("|");
  if (historyIds !== snapshotIds) {
    issues.push("snapshot_entry_ids_mismatch");
  }

  if (snapshot.summary.historyId !== history.id) {
    issues.push("snapshot_summary_history_id_mismatch");
  }
  if (snapshot.summary.entryCount !== history.entryCount) {
    issues.push("snapshot_summary_entry_count_mismatch");
  }
  if (snapshot.statistics.totalEntries !== history.entryCount) {
    issues.push("snapshot_statistics_total_mismatch");
  }

  return Object.freeze(issues);
}
