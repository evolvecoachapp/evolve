import type { FatigueScore } from "../models/FatigueScore";
import type { RecoveryWindow } from "../models/RecoveryWindow";
import { addHoursIso, hoursToMs } from "../utils/formatting";
import { clamp } from "../utils/normalizeValues";

/**
 * Pure recovery-window calculator from fatigue score.
 * One responsibility: fatigue → descriptive time window.
 *
 * durationHours = 12 + floor(score / 10) * 6  → 12h … 72h
 * Not a recommendation — observational duration metric only.
 */
export class RecoveryWindowCalculator {
  calculate(input: {
    readonly fatigue: FatigueScore;
    readonly analyzedAt: string;
  }): RecoveryWindow {
    const bands = Math.floor(clamp(input.fatigue.score, 0, 100) / 10);
    const durationHours = 12 + bands * 6;
    const startAt = input.analyzedAt;
    const endAt = addHoursIso(startAt, durationHours);

    return Object.freeze({
      startAt,
      endAt,
      durationHours,
      durationMs: hoursToMs(durationHours),
    });
  }
}

export function createRecoveryWindowCalculator(): RecoveryWindowCalculator {
  return new RecoveryWindowCalculator();
}
