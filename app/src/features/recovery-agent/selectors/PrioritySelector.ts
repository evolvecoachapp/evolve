import type { RecoveryContext } from "../models/RecoveryContext";

export class PrioritySelector {
  /**
   * Returns ordered priority labels for recovery focus areas.
   */
  select(context: RecoveryContext): readonly string[] {
    const scored = Object.freeze([
      Object.freeze({ key: "sleep", score: 100 - context.sleep.quality }),
      Object.freeze({ key: "stress", score: context.stress.level }),
      Object.freeze({ key: "fatigue", score: context.fatigue.level }),
      Object.freeze({
        key: "load",
        score: context.trainingLoad.score,
      }),
      Object.freeze({
        key: "readiness",
        score: 100 - context.readiness.score,
      }),
    ]);
    return Object.freeze(
      [...scored]
        .sort((a, b) => b.score - a.score)
        .map((s) => s.key),
    );
  }
}
