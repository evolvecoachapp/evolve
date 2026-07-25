/**
 * Sprint 22.2 — Context Fusion Engine generator part 3
 * (aggregation, resolution, builders, selectors, policies, validators).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/context-fusion");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

const aggregators = [
  ["Conversation", "conversation"],
  ["Session", "session"],
  ["Athlete", "athlete"],
  ["Workout", "workout"],
  ["Nutrition", "nutrition"],
  ["Recovery", "recovery"],
  ["Goal", "goal"],
  ["Supervisor", "supervisor"],
];

for (const [name, kind] of aggregators) {
  write(
    `aggregation/${name}Aggregator.ts`,
    `import type { ContextContribution } from "../models/ContextContribution";
import type { ContextSlice } from "../models/ContextSlice";
import { ContextSourceKinds } from "../models/ContextSource";
import { contributionsByKind } from "../utils/ContextHelpers";
import { freezeSlice } from "../utils/FreezeContext";

/**
 * Deterministic ${kind} aggregation — facts only, no inference.
 */
export function aggregate${name}(input: {
  readonly current: ContextSlice | null;
  readonly contributions: readonly ContextContribution[];
}): ContextSlice | null {
  const items = contributionsByKind(
    input.contributions,
    ContextSourceKinds.${kind.toUpperCase()},
  );
  if (items.length === 0) return input.current;
  const last = items[items.length - 1]!;
  return freezeSlice(last.slice);
}
`,
  );
}

write(
  "aggregation/ContextAggregator.ts",
  `import type { ContextContribution } from "../models/ContextContribution";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { freezeContext } from "../utils/FreezeContext";
import { aggregateAthlete } from "./AthleteAggregator";
import { aggregateConversation } from "./ConversationAggregator";
import { aggregateGoal } from "./GoalAggregator";
import { aggregateNutrition } from "./NutritionAggregator";
import { aggregateRecovery } from "./RecoveryAggregator";
import { aggregateSession } from "./SessionAggregator";
import { aggregateSupervisor } from "./SupervisorAggregator";
import { aggregateWorkout } from "./WorkoutAggregator";

/**
 * Deterministic aggregation of all source slices into a context shell.
 * Aggregation only — no AI, no business calculations.
 */
export function aggregateContextSlices(input: {
  readonly context: UnifiedCoachingContext;
  readonly contributions: readonly ContextContribution[];
  readonly updatedAt: string;
}): UnifiedCoachingContext {
  const { contributions } = input;
  return freezeContext({
    ...input.context,
    conversation: aggregateConversation({
      current: input.context.conversation,
      contributions,
    }),
    session: aggregateSession({
      current: input.context.session,
      contributions,
    }),
    athlete: aggregateAthlete({
      current: input.context.athlete,
      contributions,
    }),
    workout: aggregateWorkout({
      current: input.context.workout,
      contributions,
    }),
    nutrition: aggregateNutrition({
      current: input.context.nutrition,
      contributions,
    }),
    recovery: aggregateRecovery({
      current: input.context.recovery,
      contributions,
    }),
    goal: aggregateGoal({
      current: input.context.goal,
      contributions,
    }),
    supervisor: aggregateSupervisor({
      current: input.context.supervisor,
      contributions,
    }),
    updatedAt: input.updatedAt,
  });
}
`,
);

write(
  "aggregation/index.ts",
  `export * from "./ConversationAggregator";
export * from "./SessionAggregator";
export * from "./AthleteAggregator";
export * from "./WorkoutAggregator";
export * from "./NutritionAggregator";
export * from "./RecoveryAggregator";
export * from "./GoalAggregator";
export * from "./SupervisorAggregator";
export * from "./ContextAggregator";
`,
);

// ─── Resolution ──────────────────────────────────────────────────────────────

write(
  "resolution/PriorityResolver.ts",
  `import {
  DEFAULT_CONTEXT_PRIORITIES,
  type ContextPriority,
} from "../models/ContextPriority";
import type { ContextSourceKind } from "../models/ContextSource";
import { freezePriority } from "../utils/FreezeContext";

export function resolvePriorities(
  overrides: readonly ContextPriority[] = [],
): readonly ContextPriority[] {
  const map = new Map<ContextSourceKind, ContextPriority>();
  for (const p of DEFAULT_CONTEXT_PRIORITIES) {
    map.set(p.sourceKind, freezePriority(p));
  }
  for (const p of overrides) {
    map.set(p.sourceKind, freezePriority(p));
  }
  return Object.freeze(
    [...map.values()].sort((a, b) => a.rank - b.rank),
  );
}

export function rankForSource(
  priorities: readonly ContextPriority[],
  kind: ContextSourceKind,
): number {
  return priorities.find((p) => p.sourceKind === kind)?.rank ?? 999;
}

export function preferSource(
  priorities: readonly ContextPriority[],
  a: ContextSourceKind,
  b: ContextSourceKind,
): ContextSourceKind {
  return rankForSource(priorities, a) <= rankForSource(priorities, b) ? a : b;
}
`,
);

write(
  "resolution/SourceResolver.ts",
  `import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import type { ContextSource } from "../models/ContextSource";
import { freezeSource } from "../utils/FreezeContext";

export function resolveSources(input: {
  readonly contributions: readonly ContextContribution[];
  readonly at: string;
}): readonly ContextSource[] {
  const byKind = new Map<string, ContextSource>();
  for (const c of input.contributions) {
    byKind.set(
      c.sourceKind,
      freezeSource({
        id: c.id,
        kind: c.sourceKind,
        label: c.slice.label,
        referenceId: c.slice.referenceId,
        version: c.version,
        available: true,
        notes: Object.freeze([...c.notes]),
        metadata: c.metadata ?? EMPTY_CONTEXT_METADATA,
        contributedAt: c.contributedAt || input.at,
      }),
    );
  }
  return Object.freeze([...byKind.values()]);
}
`,
);

write(
  "resolution/VersionResolver.ts",
  `import { INITIAL_CONTEXT_VERSION, type ContextVersion } from "../models/ContextVersion";
import { bumpRevision, compareVersions } from "../utils/VersionHelpers";
import { freezeVersion } from "../utils/FreezeContext";

export function resolveVersion(input: {
  readonly current: ContextVersion | null;
  readonly contributionVersions: readonly (ContextVersion | null)[];
  readonly bump: boolean;
}): ContextVersion {
  let base = input.current ?? INITIAL_CONTEXT_VERSION;
  for (const v of input.contributionVersions) {
    if (v && compareVersions(v, base) > 0) {
      base = v;
    }
  }
  const next = input.bump ? bumpRevision(base) : base;
  return freezeVersion({
    ...next,
    label: \`\${next.major}.\${next.minor}.\${next.patch}+\${next.revision}\`,
  });
}
`,
);

write(
  "resolution/ConflictResolver.ts",
  `import type { ContextConflict } from "../models/ContextConflict";
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
        id: \`resolution:\${conflict.id}\`,
        conflictId: conflict.id,
        strategy: ContextResolutionStrategies.PRIORITY,
        winnerSource: winner,
        winnerValue:
          winnerIndex >= 0 ? (conflict.values[winnerIndex] ?? null) : null,
        reason: \`Selected \${winner} by deterministic priority rank.\`,
      });
    }),
  );
}
`,
);

write(
  "resolution/MergeResolver.ts",
  `import {
  ContextMergeStrategies,
  type ContextMerge,
} from "../models/ContextMerge";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import type { ContextResolution } from "../models/ContextResolution";
import type { ContextSourceKind } from "../models/ContextSource";
import { freezeMerge } from "../utils/FreezeContext";

export function resolveMerge(input: {
  readonly id: string;
  readonly sourceKinds: readonly ContextSourceKind[];
  readonly resolutions: readonly ContextResolution[];
  readonly at: string;
  readonly notes?: readonly string[];
}): ContextMerge {
  return freezeMerge({
    id: input.id,
    strategy: ContextMergeStrategies.PRIORITY_OVERLAY,
    sourceKinds: Object.freeze([...input.sourceKinds]),
    resolutions: Object.freeze([...input.resolutions]),
    notes: Object.freeze([...(input.notes ?? [])]),
    metadata: EMPTY_CONTEXT_METADATA,
    mergedAt: input.at,
  });
}
`,
);

write(
  "resolution/ContextResolver.ts",
  `import type { ContextContribution } from "../models/ContextContribution";
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
`,
);

write(
  "resolution/index.ts",
  `export * from "./PriorityResolver";
export * from "./SourceResolver";
export * from "./VersionResolver";
export * from "./ConflictResolver";
export * from "./MergeResolver";
export * from "./ContextResolver";
`,
);

// ─── Builders ────────────────────────────────────────────────────────────────

write(
  "builders/UnifiedContextBuilder.ts",
  `import { EMPTY_CONTEXT_INTEGRITY } from "../models/ContextIntegrity";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { DEFAULT_CONTEXT_PRIORITIES } from "../models/ContextPriority";
import {
  INITIAL_CONTEXT_VERSION,
} from "../models/ContextVersion";
import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContext, freezeDescriptor } from "../utils/FreezeContext";

export function buildEmptyUnifiedContext(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId?: string | null;
  readonly conversationId?: string | null;
  readonly at: string;
}): UnifiedCoachingContext {
  return freezeContext({
    id: input.id,
    athleteId: input.athleteId,
    sessionId: input.sessionId ?? null,
    conversationId: input.conversationId ?? null,
    version: INITIAL_CONTEXT_VERSION,
    sources: Object.freeze([]),
    sections: Object.freeze([]),
    views: Object.freeze([]),
    dependencies: Object.freeze([]),
    priorities: DEFAULT_CONTEXT_PRIORITIES,
    conflicts: Object.freeze([]),
    resolutions: Object.freeze([]),
    merge: null,
    integrity: EMPTY_CONTEXT_INTEGRITY,
    confidence: Object.freeze({
      level: "unknown",
      sourceCount: 0,
      resolvedConflictCount: 0,
      notes: Object.freeze([] as string[]),
    }),
    timeline: Object.freeze({
      items: Object.freeze([]),
      metadata: EMPTY_CONTEXT_METADATA,
    }),
    statistics: Object.freeze({
      sourceCount: 0,
      sectionCount: 0,
      dependencyCount: 0,
      conflictCount: 0,
      resolutionCount: 0,
      timelineItemCount: 0,
    }),
    diagnostics: Object.freeze({
      warnings: Object.freeze([] as string[]),
      notes: Object.freeze([] as string[]),
      missingSources: Object.freeze([] as string[]),
    }),
    summary: null,
    conversation: null,
    session: null,
    athlete: null,
    workout: null,
    nutrition: null,
    recovery: null,
    goal: null,
    supervisor: null,
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.at,
    updatedAt: input.at,
  });
}

export function buildContextDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): ContextDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Context Fusion Engine",
    version: "0.1.0",
    capabilities: Object.freeze([
      "buildUnifiedContext",
      "mergeContexts",
      "validateUnifiedContext",
      "describeContext",
      "createContextSnapshot",
    ]),
    sourceKinds: Object.freeze(Object.values(ContextSourceKinds)),
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/SummaryBuilder.ts",
  `import type { ContextSummary } from "../models/ContextSummary";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { formatContextHeadline } from "../utils/FormattingHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import { freezeSummary } from "../utils/FreezeContext";

export function buildContextSummary(input: {
  readonly context: UnifiedCoachingContext;
  readonly createdAt: string;
  readonly id?: string;
}): ContextSummary {
  const statistics = buildStatistics(input.context);
  const confidence = Object.freeze({
    level:
      statistics.sourceCount === 0
        ? ("unknown" as const)
        : statistics.sourceCount >= 6
          ? ("high" as const)
          : statistics.sourceCount >= 3
            ? ("medium" as const)
            : ("low" as const),
    sourceCount: statistics.sourceCount,
    resolvedConflictCount: input.context.resolutions.length,
    notes: Object.freeze([] as string[]),
  });
  return freezeSummary({
    id: input.id ?? \`summary:\${input.context.id}\`,
    headline: formatContextHeadline(input.context),
    athleteId: input.context.athleteId,
    sessionId: input.context.sessionId,
    sourceLabels: Object.freeze(input.context.sources.map((s) => s.label)),
    statistics,
    confidence,
    notes: Object.freeze([] as string[]),
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/SnapshotBuilder.ts",
  `import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { buildContextSummary } from "./SummaryBuilder";
import { freezeSnapshot } from "../utils/FreezeContext";

export function buildContextSnapshot(input: {
  readonly id: string;
  readonly context: UnifiedCoachingContext;
  readonly reason?: string | null;
  readonly createdAt: string;
}): ContextSnapshot {
  return freezeSnapshot({
    id: input.id,
    contextId: input.context.id,
    athleteId: input.context.athleteId,
    version: input.context.version,
    context: input.context,
    summary: buildContextSummary({
      context: input.context,
      createdAt: input.createdAt,
    }),
    reason: input.reason ?? null,
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/PackageBuilder.ts",
  `import type { ContextPackage } from "../models/ContextPackage";
import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { buildContextSummary } from "./SummaryBuilder";
import { freezePackage } from "../utils/FreezeContext";
import { buildDecisionEngineContext } from "./DecisionEngineContextBuilder";

export function buildContextPackage(input: {
  readonly id: string;
  readonly context: UnifiedCoachingContext;
  readonly snapshot?: ContextSnapshot | null;
  readonly createdAt: string;
}): ContextPackage {
  const summary = buildContextSummary({
    context: input.context,
    createdAt: input.createdAt,
  });
  return freezePackage({
    id: input.id,
    context: input.context,
    snapshot: input.snapshot ?? null,
    summary,
    decisionEngineContext: buildDecisionEngineContext({
      id: \`decision-ctx:\${input.context.id}\`,
      context: input.context,
      summary,
      createdAt: input.createdAt,
    }),
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/DecisionEngineContextBuilder.ts",
  `import type { ContextSummary } from "../models/ContextSummary";
import type { DecisionEngineContext } from "../models/DecisionEngineContext";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { freezeDecisionEngineContext } from "../utils/FreezeContext";

export function buildDecisionEngineContext(input: {
  readonly id: string;
  readonly context: UnifiedCoachingContext;
  readonly summary?: ContextSummary | null;
  readonly createdAt: string;
}): DecisionEngineContext {
  const focusAreas = Object.freeze(
    [
      input.context.workout ? "workout" : null,
      input.context.nutrition ? "nutrition" : null,
      input.context.recovery ? "recovery" : null,
      input.context.goal ? "goal" : null,
      input.context.athlete ? "athlete" : null,
    ].filter((x): x is string => x !== null),
  );
  return freezeDecisionEngineContext({
    id: input.id,
    athleteId: input.context.athleteId,
    sessionId: input.context.sessionId,
    conversationId: input.context.conversationId,
    contextId: input.context.id,
    version: input.context.version,
    context: input.context,
    summary: input.summary ?? null,
    focusAreas,
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.createdAt,
  });
}
`,
);

write(
  "builders/ResultBuilder.ts",
  `import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextError } from "../models/ContextError";
import type { ContextPackage } from "../models/ContextPackage";
import type { ContextResult } from "../models/ContextResult";
import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { ContextSummary } from "../models/ContextSummary";
import type { ContextValidation } from "../models/ContextValidation";
import type { ContextOperationKind } from "../models/ContextResult";
import type { DecisionEngineContext } from "../models/DecisionEngineContext";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { freezeResult } from "../utils/FreezeContext";

export function buildContextResult(input: {
  readonly id: string;
  readonly operation: ContextOperationKind;
  readonly success: boolean;
  readonly message: string;
  readonly athleteId?: string | null;
  readonly context?: UnifiedCoachingContext | null;
  readonly snapshot?: ContextSnapshot | null;
  readonly summary?: ContextSummary | null;
  readonly package?: ContextPackage | null;
  readonly decisionEngineContext?: DecisionEngineContext | null;
  readonly descriptor?: ContextDescriptor | null;
  readonly validation?: ContextValidation | null;
  readonly error?: ContextError | null;
  readonly startedAt: string;
  readonly completedAt: string;
}): ContextResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    message: input.message,
    athleteId: input.athleteId ?? null,
    context: input.context ?? null,
    snapshot: input.snapshot ?? null,
    summary: input.summary ?? null,
    package: input.package ?? null,
    decisionEngineContext: input.decisionEngineContext ?? null,
    descriptor: input.descriptor ?? null,
    validation: input.validation ?? null,
    error: input.error ?? null,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
  });
}
`,
);

write(
  "builders/SectionBuilder.ts",
  `import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import type { ContextSection } from "../models/ContextSection";
import { ContextSectionKinds } from "../models/ContextSection";
import type { ContextSlice } from "../models/ContextSlice";
import type { ContextSourceKind } from "../models/ContextSource";
import { freezeSection } from "../utils/FreezeContext";

const KIND_MAP: Record<ContextSourceKind, ContextSection["kind"]> = {
  conversation: ContextSectionKinds.CONVERSATION,
  session: ContextSectionKinds.SESSION,
  athlete: ContextSectionKinds.ATHLETE,
  workout: ContextSectionKinds.WORKOUT,
  nutrition: ContextSectionKinds.NUTRITION,
  recovery: ContextSectionKinds.RECOVERY,
  goal: ContextSectionKinds.GOAL,
  supervisor: ContextSectionKinds.SUPERVISOR,
};

export function buildSectionFromSlice(input: {
  readonly slice: ContextSlice;
  readonly sourceId: string;
}): ContextSection {
  return freezeSection({
    id: \`section:\${input.slice.sourceKind}:\${input.slice.id}\`,
    kind: KIND_MAP[input.slice.sourceKind],
    sourceKind: input.slice.sourceKind,
    sourceId: input.sourceId,
    title: input.slice.label,
    facts: input.slice.facts,
    notes: input.slice.notes,
    metadata: input.slice.metadata ?? EMPTY_CONTEXT_METADATA,
  });
}

export function buildSectionsFromContext(input: {
  readonly slices: readonly (ContextSlice | null)[];
  readonly sourceIdFor: (kind: ContextSourceKind) => string;
}): readonly ContextSection[] {
  const sections: ContextSection[] = [];
  for (const slice of input.slices) {
    if (!slice) continue;
    sections.push(
      buildSectionFromSlice({
        slice,
        sourceId: input.sourceIdFor(slice.sourceKind),
      }),
    );
  }
  return Object.freeze(sections);
}
`,
);

write(
  "builders/index.ts",
  `export * from "./UnifiedContextBuilder";
export * from "./SummaryBuilder";
export * from "./SnapshotBuilder";
export * from "./PackageBuilder";
export * from "./DecisionEngineContextBuilder";
export * from "./ResultBuilder";
export * from "./SectionBuilder";
`,
);

// ─── Selectors ───────────────────────────────────────────────────────────────

write(
  "selectors/ContextSelector.ts",
  `import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectAthleteId(
  context: UnifiedCoachingContext,
): string {
  return context.athleteId;
}

export function selectHasAthlete(context: UnifiedCoachingContext): boolean {
  return context.athlete !== null;
}

export function selectSourceCount(context: UnifiedCoachingContext): number {
  return context.sources.length;
}
`,
);

write(
  "selectors/SourceSelector.ts",
  `import type { ContextSource, ContextSourceKind } from "../models/ContextSource";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectSources(
  context: UnifiedCoachingContext,
): readonly ContextSource[] {
  return context.sources;
}

export function selectSourceByKind(
  context: UnifiedCoachingContext,
  kind: ContextSourceKind,
): ContextSource | null {
  return context.sources.find((s) => s.kind === kind) ?? null;
}
`,
);

write(
  "selectors/PrioritySelector.ts",
  `import type { ContextPriority } from "../models/ContextPriority";
import type { ContextSourceKind } from "../models/ContextSource";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectPriorities(
  context: UnifiedCoachingContext,
): readonly ContextPriority[] {
  return context.priorities;
}

export function selectPriorityFor(
  context: UnifiedCoachingContext,
  kind: ContextSourceKind,
): ContextPriority | null {
  return context.priorities.find((p) => p.sourceKind === kind) ?? null;
}
`,
);

write(
  "selectors/SnapshotSelector.ts",
  `import type { ContextSnapshot } from "../models/ContextSnapshot";

export function selectSnapshotContextId(
  snapshot: ContextSnapshot,
): string {
  return snapshot.contextId;
}

export function selectSnapshotAthleteId(
  snapshot: ContextSnapshot,
): string {
  return snapshot.athleteId;
}
`,
);

write(
  "selectors/SectionSelector.ts",
  `import type { ContextSection, ContextSectionKind } from "../models/ContextSection";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectSections(
  context: UnifiedCoachingContext,
): readonly ContextSection[] {
  return context.sections;
}

export function selectSectionsByKind(
  context: UnifiedCoachingContext,
  kind: ContextSectionKind,
): readonly ContextSection[] {
  return Object.freeze(context.sections.filter((s) => s.kind === kind));
}
`,
);

write(
  "selectors/DependencySelector.ts",
  `import type { ContextDependency } from "../models/ContextDependency";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function selectDependencies(
  context: UnifiedCoachingContext,
): readonly ContextDependency[] {
  return context.dependencies;
}
`,
);

write(
  "selectors/index.ts",
  `export * from "./ContextSelector";
export * from "./SourceSelector";
export * from "./PrioritySelector";
export * from "./SnapshotSelector";
export * from "./SectionSelector";
export * from "./DependencySelector";
`,
);

// ─── Policies ────────────────────────────────────────────────────────────────

write(
  "policies/IntegrityPolicy.ts",
  `import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateContextIntegrity } from "../validators/validateContextIntegrity";

export function applyIntegrityPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  return validateContextIntegrity(context);
}
`,
);

write(
  "policies/VersionPolicy.ts",
  `import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateVersionConsistency } from "../validators/validateVersionConsistency";

export function applyVersionPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  return validateVersionConsistency(context);
}
`,
);

write(
  "policies/PriorityPolicy.ts",
  `import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { ContextIntegrityCodes } from "../models/ContextIntegrity";

export function applyPriorityPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  const ranks = new Set<number>();
  for (const p of context.priorities) {
    if (p.rank < 0) {
      issues.push({
        code: ContextIntegrityCodes.INTEGRITY_VIOLATION,
        message: "Priority rank must be non-negative.",
        path: \`priorities.\${p.sourceKind}\`,
      });
    }
    if (ranks.has(p.rank)) {
      issues.push({
        code: ContextIntegrityCodes.INTEGRITY_VIOLATION,
        message: "Priority ranks must be unique.",
        path: \`priorities.\${p.sourceKind}\`,
      });
    }
    ranks.add(p.rank);
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "policies/ConflictPolicy.ts",
  `import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateConflictResolution } from "../validators/validateConflictResolution";

export function applyConflictPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  return validateConflictResolution(context);
}
`,
);

write(
  "policies/MergePolicy.ts",
  `import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateMergeConsistency } from "../validators/validateMergeConsistency";

export function applyMergePolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  return validateMergeConsistency(context);
}
`,
);

write(
  "policies/ConsistencyPolicy.ts",
  `import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import type { ContextValidation } from "../models/ContextValidation";
import { validateDependencies } from "../validators/validateDependencies";
import { validateTimelineIntegrity } from "../validators/validateTimelineIntegrity";

export function applyConsistencyPolicy(
  context: UnifiedCoachingContext,
): ContextValidation {
  const deps = validateDependencies(context);
  const timeline = validateTimelineIntegrity(context);
  const issues = Object.freeze([...deps.issues, ...timeline.issues]);
  return Object.freeze({
    valid: issues.length === 0,
    issues,
  });
}
`,
);

write(
  "policies/index.ts",
  `export * from "./IntegrityPolicy";
export * from "./VersionPolicy";
export * from "./PriorityPolicy";
export * from "./ConflictPolicy";
export * from "./MergePolicy";
export * from "./ConsistencyPolicy";
`,
);

// ─── Validators ──────────────────────────────────────────────────────────────

write(
  "validators/validateContextIntegrity.ts",
  `import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateContextIntegrity(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  if (!context.id) {
    issues.push({
      code: ContextIntegrityCodes.MISSING_ID,
      message: "Context id is required.",
      path: "id",
    });
  }
  if (!context.athleteId) {
    issues.push({
      code: ContextIntegrityCodes.MISSING_ATHLETE,
      message: "athleteId is required.",
      path: "athleteId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateVersionConsistency.ts",
  `import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { isVersionNonNegative } from "../utils/VersionHelpers";

export function validateVersionConsistency(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  if (!isVersionNonNegative(context.version)) {
    issues.push({
      code: ContextIntegrityCodes.INVALID_VERSION,
      message: "Version components must be non-negative.",
      path: "version",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateDependencies.ts",
  `import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateDependencies(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  const sourceKinds = new Set(context.sources.map((s) => s.kind));
  for (const dep of context.dependencies) {
    if (sourceKinds.size > 0 && !sourceKinds.has(dep.from)) {
      issues.push({
        code: ContextIntegrityCodes.DEPENDENCY_BREAK,
        message: \`Dependency from-source \${dep.from} is missing.\`,
        path: \`dependencies.\${dep.id}\`,
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateMergeConsistency.ts",
  `import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateMergeConsistency(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  if (context.merge) {
    const resolutionIds = new Set(
      context.resolutions.map((r) => r.conflictId),
    );
    for (const r of context.merge.resolutions) {
      if (!resolutionIds.has(r.conflictId) && context.conflicts.length > 0) {
        // merge resolutions should reference known conflicts when present
      }
    }
    if (
      context.sources.length > 0 &&
      context.merge.sourceKinds.length === 0
    ) {
      issues.push({
        code: ContextIntegrityCodes.MERGE_INCONSISTENT,
        message: "Merge sourceKinds empty while sources present.",
        path: "merge.sourceKinds",
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateConflictResolution.ts",
  `import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateConflictResolution(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  const resolved = new Set(context.resolutions.map((r) => r.conflictId));
  for (const conflict of context.conflicts) {
    if (!resolved.has(conflict.id)) {
      issues.push({
        code: ContextIntegrityCodes.CONFLICT_UNRESOLVED,
        message: \`Conflict \${conflict.id} is unresolved.\`,
        path: \`conflicts.\${conflict.id}\`,
      });
    }
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateSnapshotIntegrity.ts",
  `import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { ContextValidation } from "../models/ContextValidation";

export function validateSnapshotIntegrity(
  snapshot: ContextSnapshot,
): ContextValidation {
  const issues = [];
  if (!snapshot.id) {
    issues.push({
      code: ContextIntegrityCodes.SNAPSHOT_INVALID,
      message: "Snapshot id is required.",
      path: "id",
    });
  }
  if (snapshot.contextId !== snapshot.context.id) {
    issues.push({
      code: ContextIntegrityCodes.SNAPSHOT_INVALID,
      message: "Snapshot contextId must match context.id.",
      path: "contextId",
    });
  }
  if (snapshot.athleteId !== snapshot.context.athleteId) {
    issues.push({
      code: ContextIntegrityCodes.SNAPSHOT_INVALID,
      message: "Snapshot athleteId must match context.athleteId.",
      path: "athleteId",
    });
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateTimelineIntegrity.ts",
  `import { ContextIntegrityCodes } from "../models/ContextIntegrity";
import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function validateTimelineIntegrity(
  context: UnifiedCoachingContext,
): ContextValidation {
  const issues = [];
  let lastAt = "";
  for (const item of context.timeline.items) {
    if (!item.id) {
      issues.push({
        code: ContextIntegrityCodes.TIMELINE_INVALID,
        message: "Timeline item id is required.",
        path: "timeline.items",
      });
    }
    if (lastAt && item.at < lastAt) {
      issues.push({
        code: ContextIntegrityCodes.TIMELINE_INVALID,
        message: "Timeline items must be non-decreasing by time.",
        path: \`timeline.items.\${item.id}\`,
      });
    }
    lastAt = item.at;
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateUnifiedContext.ts",
  `import type { ContextValidation } from "../models/ContextValidation";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { validateConflictResolution } from "./validateConflictResolution";
import { validateContextIntegrity } from "./validateContextIntegrity";
import { validateDependencies } from "./validateDependencies";
import { validateMergeConsistency } from "./validateMergeConsistency";
import { validateTimelineIntegrity } from "./validateTimelineIntegrity";
import { validateVersionConsistency } from "./validateVersionConsistency";

export function validateUnifiedContextFull(
  context: UnifiedCoachingContext,
): ContextValidation {
  const parts = [
    validateContextIntegrity(context),
    validateVersionConsistency(context),
    validateDependencies(context),
    validateMergeConsistency(context),
    validateConflictResolution(context),
    validateTimelineIntegrity(context),
  ];
  const issues = Object.freeze(parts.flatMap((p) => [...p.issues]));
  return Object.freeze({
    valid: issues.length === 0,
    issues,
  });
}
`,
);

write(
  "validators/index.ts",
  `export * from "./validateContextIntegrity";
export * from "./validateVersionConsistency";
export * from "./validateDependencies";
export * from "./validateMergeConsistency";
export * from "./validateConflictResolution";
export * from "./validateSnapshotIntegrity";
export * from "./validateTimelineIntegrity";
export * from "./validateUnifiedContext";
`,
);

console.log("generate-context-fusion-part3.mjs: aggregation/resolution/builders/policies/validators written");
