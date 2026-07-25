import type { ContextContribution } from "../models/ContextContribution";
import type { ContextConflict } from "../models/ContextConflict";
import { ContextConflictKinds } from "../models/ContextConflict";
import type { ContextPriority } from "../models/ContextPriority";
import type { ContextSlice } from "../models/ContextSlice";
import type { ContextSourceKind } from "../models/ContextSource";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { detectFieldConflicts } from "../utils/MergeHelpers";
import { freezeConflict } from "../utils/FreezeContext";
import { resolveConflicts } from "./ConflictResolver";
import { resolveMerge } from "./MergeResolver";
import { resolvePriorities } from "./PriorityResolver";
import { resolveSources } from "./SourceResolver";
import { resolveVersion } from "./VersionResolver";

function pairConflicts(
  context: UnifiedCoachingContext,
): readonly ContextConflict[] {
  const pairs: Array<[ContextSourceKind, ContextSlice | null, string]> = [
    ["athlete", context.athlete, "athlete"],
    ["session", context.session, "session"],
    ["conversation", context.conversation, "conversation"],
    ["workout", context.workout, "workout"],
    ["nutrition", context.nutrition, "nutrition"],
    ["recovery", context.recovery, "recovery"],
    ["goal", context.goal, "goal"],
    ["supervisor", context.supervisor, "supervisor"],
  ];
  const conflicts: ContextConflict[] = [];
  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const [aKind, aSlice, aPath] = pairs[i]!;
      const [bKind, bSlice] = pairs[j]!;
      const conflict = detectFieldConflicts({
        path: aPath,
        a: aSlice,
        b: bSlice,
        aKind,
        bKind,
      });
      if (conflict) conflicts.push(freezeConflict(conflict));
    }
  }
  // Explicit session/athlete id mismatch as conflict when both present
  if (
    context.athlete?.facts.athleteId &&
    context.session?.facts.athleteId &&
    String(context.athlete.facts.athleteId) !==
      String(context.session.facts.athleteId)
  ) {
    conflicts.push(
      freezeConflict({
        id: "conflict:athleteId",
        kind: ContextConflictKinds.FIELD,
        path: "athleteId",
        sources: Object.freeze(["athlete", "session"] as ContextSourceKind[]),
        values: Object.freeze([
          String(context.athlete.facts.athleteId),
          String(context.session.facts.athleteId),
        ]),
        notes: Object.freeze(["athleteId mismatch between athlete and session"]),
      }),
    );
  }
  return Object.freeze(conflicts);
}

/**
 * Deterministic context resolution orchestrator.
 */
export function resolveContext(input: {
  readonly context: UnifiedCoachingContext;
  readonly contributions: readonly ContextContribution[];
  readonly priorityOverrides?: readonly ContextPriority[];
  readonly at: string;
  readonly mergeId: string;
}): {
  readonly sources: ReturnType<typeof resolveSources>;
  readonly priorities: readonly ContextPriority[];
  readonly conflicts: readonly ContextConflict[];
  readonly resolutions: ReturnType<typeof resolveConflicts>;
  readonly merge: ReturnType<typeof resolveMerge>;
  readonly version: ReturnType<typeof resolveVersion>;
} {
  const priorities = resolvePriorities(input.priorityOverrides);
  const sources = resolveSources({
    contributions: input.contributions,
    at: input.at,
  });
  const conflicts = pairConflicts(input.context);
  const resolutions = resolveConflicts({ conflicts, priorities });
  const merge = resolveMerge({
    id: input.mergeId,
    sourceKinds: Object.freeze(sources.map((s) => s.kind)),
    resolutions,
    at: input.at,
    notes: Object.freeze(["deterministic priority overlay merge"]),
  });
  const version = resolveVersion({
    current: input.context.version,
    contributionVersions: input.contributions.map((c) => c.version),
    bump: true,
  });
  return { sources, priorities, conflicts, resolutions, merge, version };
}
