import type { AthleteState } from "../models/AthleteState";
import type { AthleteStatistics } from "../models/AthleteStatistics";
import { collectSourceAgentIds } from "./StateHelpers";

/**
 * Structural counts only — no domain calculations.
 */
export function buildStatistics(state: AthleteState): AthleteStatistics {
  return Object.freeze({
    updateCount: state.history.entries.length,
    snapshotCount: state.statistics.snapshotCount,
    historyEntryCount: state.history.entries.length,
    timelineItemCount: state.timeline.items.length,
    goalCount: state.goals.items.length,
    sourceAgentCount: collectSourceAgentIds(state).length,
  });
}
