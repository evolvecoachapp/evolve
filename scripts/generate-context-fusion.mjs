/**
 * Sprint 22.2 — Context Fusion Engine Foundation generator (part 1: models).
 * Run: node scripts/generate-context-fusion.mjs && node scripts/generate-context-fusion-part2.mjs && node scripts/generate-context-fusion-part3.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/context-fusion");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

write(
  "models/ContextMetadata.ts",
  `/**
 * Immutable metadata bag for context-fusion entities.
 */
export interface ContextMetadata {
  readonly tags: readonly string[];
  readonly attributes: Readonly<Record<string, string>>;
}

export const EMPTY_CONTEXT_METADATA: ContextMetadata = Object.freeze({
  tags: Object.freeze([] as string[]),
  attributes: Object.freeze({} as Record<string, string>),
});
`,
);

write(
  "models/ContextVersion.ts",
  `/**
 * Immutable version stamp for fused context.
 */
export interface ContextVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly revision: number;
  readonly label: string;
}

export const INITIAL_CONTEXT_VERSION: ContextVersion = Object.freeze({
  major: 1,
  minor: 0,
  patch: 0,
  revision: 0,
  label: "1.0.0+0",
});

export function formatContextVersion(version: ContextVersion): string {
  return \`\${version.major}.\${version.minor}.\${version.patch}+\${version.revision}\`;
}
`,
);

write(
  "models/ContextSource.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextVersion } from "./ContextVersion";

export const ContextSourceKinds = {
  CONVERSATION: "conversation",
  SESSION: "session",
  ATHLETE: "athlete",
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  SUPERVISOR: "supervisor",
} as const;

export type ContextSourceKind =
  (typeof ContextSourceKinds)[keyof typeof ContextSourceKinds];

/**
 * Immutable description of a single upstream context source.
 */
export interface ContextSource {
  readonly id: string;
  readonly kind: ContextSourceKind;
  readonly label: string;
  readonly referenceId: string | null;
  readonly version: ContextVersion | null;
  readonly available: boolean;
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
  readonly contributedAt: string;
}
`,
);

write(
  "models/ContextPriority.ts",
  `import type { ContextSourceKind } from "./ContextSource";

/**
 * Deterministic priority for a context source (lower rank = higher priority).
 * Representation only — no ranking inference.
 */
export interface ContextPriority {
  readonly sourceKind: ContextSourceKind;
  readonly rank: number;
  readonly label: string;
}

/**
 * Fixed deterministic priority table (athlete truth before specialists, etc.).
 */
export const DEFAULT_CONTEXT_PRIORITIES: readonly ContextPriority[] =
  Object.freeze([
    Object.freeze({
      sourceKind: "athlete" as const,
      rank: 10,
      label: "athlete_state",
    }),
    Object.freeze({
      sourceKind: "session" as const,
      rank: 20,
      label: "coaching_session",
    }),
    Object.freeze({
      sourceKind: "conversation" as const,
      rank: 30,
      label: "conversation",
    }),
    Object.freeze({
      sourceKind: "supervisor" as const,
      rank: 40,
      label: "supervisor",
    }),
    Object.freeze({
      sourceKind: "workout" as const,
      rank: 50,
      label: "workout_agent",
    }),
    Object.freeze({
      sourceKind: "nutrition" as const,
      rank: 60,
      label: "nutrition_agent",
    }),
    Object.freeze({
      sourceKind: "recovery" as const,
      rank: 70,
      label: "recovery_agent",
    }),
    Object.freeze({
      sourceKind: "goal" as const,
      rank: 80,
      label: "goal_agent",
    }),
  ]);
`,
);

write(
  "models/ContextConfidence.ts",
  `/**
 * Immutable confidence representation (facts only — no AI scoring).
 */
export interface ContextConfidence {
  readonly level: "unknown" | "low" | "medium" | "high" | "complete";
  readonly sourceCount: number;
  readonly resolvedConflictCount: number;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/ContextReference.ts",
  `import type { ContextSourceKind } from "./ContextSource";

/**
 * Immutable reference to an upstream entity.
 */
export interface ContextReference {
  readonly id: string;
  readonly kind: ContextSourceKind;
  readonly targetId: string;
  readonly label: string | null;
}
`,
);

write(
  "models/ContextDependency.ts",
  `import type { ContextSourceKind } from "./ContextSource";

export const ContextDependencyKinds = {
  REQUIRES: "requires",
  INFORMS: "informs",
  OVERRIDES: "overrides",
} as const;

export type ContextDependencyKind =
  (typeof ContextDependencyKinds)[keyof typeof ContextDependencyKinds];

/**
 * Immutable dependency edge between context sources/sections.
 */
export interface ContextDependency {
  readonly id: string;
  readonly kind: ContextDependencyKind;
  readonly from: ContextSourceKind;
  readonly to: ContextSourceKind;
  readonly path: string | null;
  readonly notes: readonly string[];
}
`,
);

write(
  "models/ContextSection.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSourceKind } from "./ContextSource";

export const ContextSectionKinds = {
  CONVERSATION: "conversation",
  SESSION: "session",
  ATHLETE: "athlete",
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  SUPERVISOR: "supervisor",
  MERGE: "merge",
  CUSTOM: "custom",
} as const;

export type ContextSectionKind =
  (typeof ContextSectionKinds)[keyof typeof ContextSectionKinds];

/**
 * Immutable fused section carrying opaque facts from a source.
 */
export interface ContextSection {
  readonly id: string;
  readonly kind: ContextSectionKind;
  readonly sourceKind: ContextSourceKind;
  readonly sourceId: string;
  readonly title: string;
  readonly facts: Readonly<Record<string, string | number | boolean | null>>;
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
}
`,
);

write(
  "models/ContextView.ts",
  `import type { ContextSection } from "./ContextSection";

/**
 * Named immutable projection over fused sections.
 */
export interface ContextView {
  readonly id: string;
  readonly name: string;
  readonly sectionIds: readonly string[];
  readonly sections: readonly ContextSection[];
  readonly notes: readonly string[];
}
`,
);

write(
  "models/ContextConflict.ts",
  `import type { ContextSourceKind } from "./ContextSource";

export const ContextConflictKinds = {
  FIELD: "field",
  VERSION: "version",
  DEPENDENCY: "dependency",
  SOURCE: "source",
} as const;

export type ContextConflictKind =
  (typeof ContextConflictKinds)[keyof typeof ContextConflictKinds];

/**
 * Immutable detected conflict between sources (representation only).
 */
export interface ContextConflict {
  readonly id: string;
  readonly kind: ContextConflictKind;
  readonly path: string;
  readonly sources: readonly ContextSourceKind[];
  readonly values: readonly string[];
  readonly notes: readonly string[];
}
`,
);

write(
  "models/ContextResolution.ts",
  `import type { ContextSourceKind } from "./ContextSource";

export const ContextResolutionStrategies = {
  PRIORITY: "priority",
  FIRST: "first",
  LAST: "last",
  KEEP_EXISTING: "keep_existing",
  EXPLICIT: "explicit",
} as const;

export type ContextResolutionStrategy =
  (typeof ContextResolutionStrategies)[keyof typeof ContextResolutionStrategies];

/**
 * Immutable deterministic resolution of a conflict.
 */
export interface ContextResolution {
  readonly id: string;
  readonly conflictId: string;
  readonly strategy: ContextResolutionStrategy;
  readonly winnerSource: ContextSourceKind;
  readonly winnerValue: string | null;
  readonly reason: string;
}
`,
);

write(
  "models/ContextMerge.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextResolution } from "./ContextResolution";
import type { ContextSourceKind } from "./ContextSource";

export const ContextMergeStrategies = {
  PRIORITY_OVERLAY: "priority_overlay",
  UNION: "union",
  REPLACE: "replace",
} as const;

export type ContextMergeStrategy =
  (typeof ContextMergeStrategies)[keyof typeof ContextMergeStrategies];

/**
 * Immutable merge record for a fusion operation.
 */
export interface ContextMerge {
  readonly id: string;
  readonly strategy: ContextMergeStrategy;
  readonly sourceKinds: readonly ContextSourceKind[];
  readonly resolutions: readonly ContextResolution[];
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
  readonly mergedAt: string;
}
`,
);

write(
  "models/ContextIntegrity.ts",
  `export const ContextIntegrityCodes = {
  MISSING_ID: "missing_id",
  MISSING_ATHLETE: "missing_athlete",
  INVALID_VERSION: "invalid_version",
  DEPENDENCY_BREAK: "dependency_break",
  MERGE_INCONSISTENT: "merge_inconsistent",
  CONFLICT_UNRESOLVED: "conflict_unresolved",
  SNAPSHOT_INVALID: "snapshot_invalid",
  TIMELINE_INVALID: "timeline_invalid",
  INTEGRITY_VIOLATION: "integrity_violation",
} as const;

export type ContextIntegrityCode =
  (typeof ContextIntegrityCodes)[keyof typeof ContextIntegrityCodes];

export interface ContextIntegrityIssue {
  readonly code: ContextIntegrityCode | string;
  readonly message: string;
  readonly path: string;
}

/**
 * Immutable integrity report for fused context.
 */
export interface ContextIntegrity {
  readonly valid: boolean;
  readonly issues: readonly ContextIntegrityIssue[];
}

export const EMPTY_CONTEXT_INTEGRITY: ContextIntegrity = Object.freeze({
  valid: true,
  issues: Object.freeze([] as ContextIntegrityIssue[]),
});
`,
);

write(
  "models/ContextTimeline.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSourceKind } from "./ContextSource";

export const ContextTimelineEventKinds = {
  FUSED: "fused",
  MERGED: "merged",
  RESOLVED: "resolved",
  SNAPSHOT: "snapshot",
  VALIDATED: "validated",
} as const;

export type ContextTimelineEventKind =
  (typeof ContextTimelineEventKinds)[keyof typeof ContextTimelineEventKinds];

export interface ContextTimelineItem {
  readonly id: string;
  readonly kind: ContextTimelineEventKind;
  readonly sourceKind: ContextSourceKind | null;
  readonly label: string;
  readonly at: string;
  readonly notes: readonly string[];
}

/**
 * Immutable fusion timeline.
 */
export interface ContextTimeline {
  readonly items: readonly ContextTimelineItem[];
  readonly metadata: ContextMetadata;
}
`,
);

write(
  "models/ContextStatistics.ts",
  `/**
 * Immutable fusion statistics (counts only — no calculations beyond counting).
 */
export interface ContextStatistics {
  readonly sourceCount: number;
  readonly sectionCount: number;
  readonly dependencyCount: number;
  readonly conflictCount: number;
  readonly resolutionCount: number;
  readonly timelineItemCount: number;
}
`,
);

write(
  "models/ContextDiagnostics.ts",
  `/**
 * Immutable diagnostics bag (representation only).
 */
export interface ContextDiagnostics {
  readonly warnings: readonly string[];
  readonly notes: readonly string[];
  readonly missingSources: readonly string[];
}
`,
);

write(
  "models/ContextSummary.ts",
  `import type { ContextConfidence } from "./ContextConfidence";
  import type { ContextStatistics } from "./ContextStatistics";

/**
 * Immutable human-readable fusion summary.
 */
export interface ContextSummary {
  readonly id: string;
  readonly headline: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly sourceLabels: readonly string[];
  readonly statistics: ContextStatistics;
  readonly confidence: ContextConfidence;
  readonly notes: readonly string[];
  readonly createdAt: string;
}
`,
);

write(
  "models/ContextSlice.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSourceKind } from "./ContextSource";

/**
 * Opaque immutable slice from an upstream runtime/agent.
 * Fusion stores facts only — no domain interpretation.
 */
export interface ContextSlice {
  readonly id: string;
  readonly sourceKind: ContextSourceKind;
  readonly referenceId: string | null;
  readonly label: string;
  readonly facts: Readonly<Record<string, string | number | boolean | null>>;
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
  readonly contributedAt: string;
}
`,
);

write(
  "models/ContextContribution.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSlice } from "./ContextSlice";
import type { ContextSourceKind } from "./ContextSource";
import type { ContextVersion } from "./ContextVersion";

/**
 * Immutable contribution payload from an upstream port.
 */
export interface ContextContribution {
  readonly id: string;
  readonly sourceKind: ContextSourceKind;
  readonly agentId: string | null;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly slice: ContextSlice;
  readonly version: ContextVersion | null;
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
  readonly contributedAt: string;
}
`,
);

write(
  "models/ContextRequest.ts",
  `import type { ContextContribution } from "./ContextContribution";
import type { ContextMetadata } from "./ContextMetadata";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

export const ContextRequestKinds = {
  BUILD: "build",
  MERGE: "merge",
  VALIDATE: "validate",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
} as const;

export type ContextRequestKind =
  (typeof ContextRequestKinds)[keyof typeof ContextRequestKinds];

/**
 * Immutable request into the Context Fusion Engine.
 */
export interface ContextRequest {
  readonly id: string;
  readonly kind: ContextRequestKind;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string | null;
  readonly base: UnifiedCoachingContext | null;
  readonly contributions: readonly ContextContribution[];
  readonly reason: string | null;
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ContextSnapshot.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSummary } from "./ContextSummary";
import type { ContextVersion } from "./ContextVersion";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

/**
 * Immutable point-in-time snapshot of fused context.
 */
export interface ContextSnapshot {
  readonly id: string;
  readonly contextId: string;
  readonly athleteId: string;
  readonly version: ContextVersion;
  readonly context: UnifiedCoachingContext;
  readonly summary: ContextSummary | null;
  readonly reason: string | null;
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/DecisionEngineContext.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSummary } from "./ContextSummary";
import type { ContextVersion } from "./ContextVersion";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

/**
 * Immutable handoff package for the Decision Engine.
 * Representation only — no decisions computed here.
 */
export interface DecisionEngineContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly version: ContextVersion;
  readonly context: UnifiedCoachingContext;
  readonly summary: ContextSummary | null;
  readonly focusAreas: readonly string[];
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ContextPackage.ts",
  `import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSnapshot } from "./ContextSnapshot";
import type { ContextSummary } from "./ContextSummary";
import type { DecisionEngineContext } from "./DecisionEngineContext";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

/**
 * Immutable delivery package from fusion.
 */
export interface ContextPackage {
  readonly id: string;
  readonly context: UnifiedCoachingContext;
  readonly snapshot: ContextSnapshot | null;
  readonly summary: ContextSummary | null;
  readonly decisionEngineContext: DecisionEngineContext | null;
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ContextDescriptor.ts",
  `import type { ContextMetadata } from "./ContextMetadata";

/**
 * Immutable capability descriptor for Context Fusion Engine.
 */
export interface ContextDescriptor {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
  readonly sourceKinds: readonly string[];
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}
`,
);

write(
  "models/ContextError.ts",
  `/**
 * Immutable fusion error.
 */
export interface ContextError {
  readonly code: string;
  readonly message: string;
  readonly path: string | null;
}

export function createContextError(input: {
  readonly code: string;
  readonly message: string;
  readonly path?: string | null;
}): ContextError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    path: input.path ?? null,
  });
}
`,
);

write(
  "models/ContextValidation.ts",
  `import type { ContextIntegrityIssue } from "./ContextIntegrity";

/**
 * Immutable validation report (alias shape for validators/policies).
 */
export interface ContextValidation {
  readonly valid: boolean;
  readonly issues: readonly ContextIntegrityIssue[];
}

export const EMPTY_CONTEXT_VALIDATION: ContextValidation = Object.freeze({
  valid: true,
  issues: Object.freeze([] as ContextIntegrityIssue[]),
});
`,
);

write(
  "models/ContextResult.ts",
  `import type { ContextDescriptor } from "./ContextDescriptor";
import type { ContextError } from "./ContextError";
import type { ContextPackage } from "./ContextPackage";
import type { ContextSnapshot } from "./ContextSnapshot";
import type { ContextSummary } from "./ContextSummary";
import type { ContextValidation } from "./ContextValidation";
import type { DecisionEngineContext } from "./DecisionEngineContext";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

export const ContextOperationKinds = {
  BUILD: "build",
  MERGE: "merge",
  VALIDATE: "validate",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
} as const;

export type ContextOperationKind =
  (typeof ContextOperationKinds)[keyof typeof ContextOperationKinds];

/**
 * Immutable result of a fusion operation.
 */
export interface ContextResult {
  readonly id: string;
  readonly operation: ContextOperationKind;
  readonly success: boolean;
  readonly message: string;
  readonly athleteId: string | null;
  readonly context: UnifiedCoachingContext | null;
  readonly snapshot: ContextSnapshot | null;
  readonly summary: ContextSummary | null;
  readonly package: ContextPackage | null;
  readonly decisionEngineContext: DecisionEngineContext | null;
  readonly descriptor: ContextDescriptor | null;
  readonly validation: ContextValidation | null;
  readonly error: ContextError | null;
  readonly startedAt: string;
  readonly completedAt: string;
}
`,
);

write(
  "models/UnifiedCoachingContext.ts",
  `import type { ContextConfidence } from "./ContextConfidence";
import type { ContextConflict } from "./ContextConflict";
import type { ContextDependency } from "./ContextDependency";
import type { ContextDiagnostics } from "./ContextDiagnostics";
import type { ContextIntegrity } from "./ContextIntegrity";
import type { ContextMerge } from "./ContextMerge";
import type { ContextMetadata } from "./ContextMetadata";
import type { ContextPriority } from "./ContextPriority";
import type { ContextResolution } from "./ContextResolution";
import type { ContextSection } from "./ContextSection";
import type { ContextSlice } from "./ContextSlice";
import type { ContextSource } from "./ContextSource";
import type { ContextStatistics } from "./ContextStatistics";
import type { ContextSummary } from "./ContextSummary";
import type { ContextTimeline } from "./ContextTimeline";
import type { ContextVersion } from "./ContextVersion";
import type { ContextView } from "./ContextView";

/**
 * Immutable unified coaching context — single fused truth for Decision Engine.
 * Fusion only: no AI, calculations, persistence, or networking.
 */
export interface UnifiedCoachingContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly version: ContextVersion;
  readonly sources: readonly ContextSource[];
  readonly sections: readonly ContextSection[];
  readonly views: readonly ContextView[];
  readonly dependencies: readonly ContextDependency[];
  readonly priorities: readonly ContextPriority[];
  readonly conflicts: readonly ContextConflict[];
  readonly resolutions: readonly ContextResolution[];
  readonly merge: ContextMerge | null;
  readonly integrity: ContextIntegrity;
  readonly confidence: ContextConfidence;
  readonly timeline: ContextTimeline;
  readonly statistics: ContextStatistics;
  readonly diagnostics: ContextDiagnostics;
  readonly summary: ContextSummary | null;
  readonly conversation: ContextSlice | null;
  readonly session: ContextSlice | null;
  readonly athlete: ContextSlice | null;
  readonly workout: ContextSlice | null;
  readonly nutrition: ContextSlice | null;
  readonly recovery: ContextSlice | null;
  readonly goal: ContextSlice | null;
  readonly supervisor: ContextSlice | null;
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}
`,
);

write(
  "models/index.ts",
  `export * from "./ContextMetadata";
export * from "./ContextVersion";
export * from "./ContextSource";
export * from "./ContextPriority";
export * from "./ContextConfidence";
export * from "./ContextReference";
export * from "./ContextDependency";
export * from "./ContextSection";
export * from "./ContextView";
export * from "./ContextConflict";
export * from "./ContextResolution";
export * from "./ContextMerge";
export * from "./ContextIntegrity";
export * from "./ContextTimeline";
export * from "./ContextStatistics";
export * from "./ContextDiagnostics";
export * from "./ContextSummary";
export * from "./ContextSlice";
export * from "./ContextContribution";
export * from "./ContextRequest";
export * from "./ContextSnapshot";
export * from "./DecisionEngineContext";
export * from "./ContextPackage";
export * from "./ContextDescriptor";
export * from "./ContextError";
export * from "./ContextValidation";
export * from "./ContextResult";
export * from "./UnifiedCoachingContext";
`,
);

console.log("generate-context-fusion.mjs: models written");
