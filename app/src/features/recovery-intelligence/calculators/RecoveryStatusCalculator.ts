import type { FatigueScore } from "../models/FatigueScore";
import type {
  RecoveryStatus,
  RecoveryStatusLevel,
} from "../models/RecoveryStatus";
import { RecoveryStatusLevels } from "../models/RecoveryStatus";
import { formatStatusLabel } from "../utils/formatting";

/**
 * Pure recovery-status calculator from fatigue score bands.
 * One responsibility: fatigue → status classification.
 *
 * 0–24 fresh · 25–49 moderate · 50–74 elevated · 75–100 high
 */
export class RecoveryStatusCalculator {
  calculate(fatigue: FatigueScore | null): RecoveryStatus {
    if (fatigue === null || !Number.isFinite(fatigue.score)) {
      return Object.freeze({
        level: RecoveryStatusLevels.INSUFFICIENT_DATA,
        score: null,
        label: formatStatusLabel(RecoveryStatusLevels.INSUFFICIENT_DATA),
      });
    }

    const score = fatigue.score;
    let level: RecoveryStatusLevel = RecoveryStatusLevels.FRESH;
    if (score >= 75) {
      level = RecoveryStatusLevels.HIGH;
    } else if (score >= 50) {
      level = RecoveryStatusLevels.ELEVATED;
    } else if (score >= 25) {
      level = RecoveryStatusLevels.MODERATE;
    }

    return Object.freeze({
      level,
      score,
      label: formatStatusLabel(level),
    });
  }
}

export function createRecoveryStatusCalculator(): RecoveryStatusCalculator {
  return new RecoveryStatusCalculator();
}
