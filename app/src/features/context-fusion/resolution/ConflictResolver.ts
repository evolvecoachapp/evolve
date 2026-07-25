import type { ContextConflict } from "../models/ContextConflict";
import type { ContextPriority } from "../models/ContextPriority";
import {
  ContextResolutionStrategies,
  type ContextResolution,
} from "../models/ContextResolution";
import { preferSource } from "./PriorityResolver";
import { freezeResolution } from "../utils/FreezeContext";

/**
 * Deterministic conflict resolution by priority — no AI, no ranking inference.
 */
export function resolveConflicts(input: {
  readonly conflicts: readonly ContextConflict[];
  readonly priorities: readonly ContextPriority[];
}): readonly ContextResolution[] {
  return Object.freeze(
    input.conflicts.map((conflict) => {
      const [a, b] = conflict.sources;
      const winner =
        a && b
          ? preferSource(input.priorities, a, b)
          : (a ?? b ?? "athlete");
      const winnerIndex = conflict.sources.indexOf(winner);
      return freezeResolution({
        id: `resolution:${conflict.id}`,
        conflictId: conflict.id,
        strategy: ContextResolutionStrategies.PRIORITY,
        winnerSource: winner,
        winnerValue:
          winnerIndex >= 0 ? (conflict.values[winnerIndex] ?? null) : null,
        reason: `Selected ${winner} by deterministic priority rank.`,
      });
    }),
  );
}
