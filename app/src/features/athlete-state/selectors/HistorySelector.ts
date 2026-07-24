import type { AthleteHistory } from "../models/AthleteHistory";
import type { AthleteState } from "../models/AthleteState";

export function selectHistory(state: AthleteState): AthleteHistory {
  return state.history;
}

export function selectLatestHistoryEntry(state: AthleteState) {
  return state.history.entries[state.history.entries.length - 1] ?? null;
}
