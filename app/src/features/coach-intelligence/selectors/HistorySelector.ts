import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { CoachFocus } from "../models/CoachFocus";
import { freezeFocus } from "../utils/freezeContext";

export interface HistorySelection {
  readonly referenced: boolean;
  readonly focus: readonly CoachFocus[];
  readonly missing: boolean;
  readonly entryCount: number;
}

/**
 * Selects history-derived focus items when AthleteHistory is present.
 * One responsibility: history focus selection only.
 */
export class HistorySelector {
  select(athleteHistory?: AthleteHistory): HistorySelection {
    if (!athleteHistory) {
      return Object.freeze({
        referenced: false,
        focus: Object.freeze([] as CoachFocus[]),
        missing: true,
        entryCount: 0,
      });
    }

    const focus = freezeFocus({
      id: `coach-focus:history:${athleteHistory.id}`,
      area: "history",
      statement: `Athlete history contains ${athleteHistory.entryCount} entries.`,
      priority: 55,
      insightIds: Object.freeze([] as string[]),
      reason: Object.freeze({
        code: "history_reference",
        statement: "Derived from AthleteHistory entry count",
        attributes: Object.freeze({
          historyId: athleteHistory.id,
          entryCount: athleteHistory.entryCount,
        }),
      }),
    });

    return Object.freeze({
      referenced: true,
      focus: Object.freeze([focus]),
      missing: false,
      entryCount: athleteHistory.entryCount,
    });
  }
}

export function createHistorySelector(): HistorySelector {
  return new HistorySelector();
}
