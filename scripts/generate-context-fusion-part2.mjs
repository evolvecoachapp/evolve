/**
 * Sprint 22.2 — Context Fusion Engine generator part 2
 * (utils, contracts, aggregation, resolution, builders).
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
  "utils/FreezeContext.ts",
  `import type { ContextConfidence } from "../models/ContextConfidence";
import type { ContextConflict } from "../models/ContextConflict";
import type { ContextContribution } from "../models/ContextContribution";
import type { ContextDependency } from "../models/ContextDependency";
import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextDiagnostics } from "../models/ContextDiagnostics";
import type { ContextIntegrity } from "../models/ContextIntegrity";
import type { ContextMerge } from "../models/ContextMerge";
import type { ContextMetadata } from "../models/ContextMetadata";
import type { ContextPackage } from "../models/ContextPackage";
import type { ContextPriority } from "../models/ContextPriority";
import type { ContextRequest } from "../models/ContextRequest";
import type { ContextResolution } from "../models/ContextResolution";
import type { ContextResult } from "../models/ContextResult";
import type { ContextSection } from "../models/ContextSection";
import type { ContextSlice } from "../models/ContextSlice";
import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { ContextSource } from "../models/ContextSource";
import type { ContextStatistics } from "../models/ContextStatistics";
import type { ContextSummary } from "../models/ContextSummary";
import type {
  ContextTimeline,
  ContextTimelineItem,
} from "../models/ContextTimeline";
import type { ContextValidation } from "../models/ContextValidation";
import type { ContextVersion } from "../models/ContextVersion";
import type { ContextView } from "../models/ContextView";
import type { DecisionEngineContext } from "../models/DecisionEngineContext";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function freezeMetadata(metadata: ContextMetadata): ContextMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeVersion(version: ContextVersion): ContextVersion {
  return Object.freeze({ ...version });
}

export function freezeSource(source: ContextSource): ContextSource {
  return Object.freeze({
    ...source,
    version: source.version ? freezeVersion(source.version) : null,
    notes: Object.freeze([...source.notes]),
    metadata: freezeMetadata(source.metadata),
  });
}

export function freezePriority(priority: ContextPriority): ContextPriority {
  return Object.freeze({ ...priority });
}

export function freezeConfidence(
  confidence: ContextConfidence,
): ContextConfidence {
  return Object.freeze({
    ...confidence,
    notes: Object.freeze([...confidence.notes]),
  });
}

export function freezeDependency(
  dependency: ContextDependency,
): ContextDependency {
  return Object.freeze({
    ...dependency,
    notes: Object.freeze([...dependency.notes]),
  });
}

export function freezeSection(section: ContextSection): ContextSection {
  return Object.freeze({
    ...section,
    facts: Object.freeze({ ...section.facts }),
    notes: Object.freeze([...section.notes]),
    metadata: freezeMetadata(section.metadata),
  });
}

export function freezeView(view: ContextView): ContextView {
  return Object.freeze({
    ...view,
    sectionIds: Object.freeze([...view.sectionIds]),
    sections: Object.freeze(view.sections.map(freezeSection)),
    notes: Object.freeze([...view.notes]),
  });
}

export function freezeConflict(conflict: ContextConflict): ContextConflict {
  return Object.freeze({
    ...conflict,
    sources: Object.freeze([...conflict.sources]),
    values: Object.freeze([...conflict.values]),
    notes: Object.freeze([...conflict.notes]),
  });
}

export function freezeResolution(
  resolution: ContextResolution,
): ContextResolution {
  return Object.freeze({ ...resolution });
}

export function freezeMerge(merge: ContextMerge): ContextMerge {
  return Object.freeze({
    ...merge,
    sourceKinds: Object.freeze([...merge.sourceKinds]),
    resolutions: Object.freeze(merge.resolutions.map(freezeResolution)),
    notes: Object.freeze([...merge.notes]),
    metadata: freezeMetadata(merge.metadata),
  });
}

export function freezeIntegrity(
  integrity: ContextIntegrity,
): ContextIntegrity {
  return Object.freeze({
    valid: integrity.valid,
    issues: Object.freeze(
      integrity.issues.map((i) => Object.freeze({ ...i })),
    ),
  });
}

export function freezeTimelineItem(
  item: ContextTimelineItem,
): ContextTimelineItem {
  return Object.freeze({
    ...item,
    notes: Object.freeze([...item.notes]),
  });
}

export function freezeTimeline(timeline: ContextTimeline): ContextTimeline {
  return Object.freeze({
    items: Object.freeze(timeline.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(timeline.metadata),
  });
}

export function freezeStatistics(
  statistics: ContextStatistics,
): ContextStatistics {
  return Object.freeze({ ...statistics });
}

export function freezeDiagnostics(
  diagnostics: ContextDiagnostics,
): ContextDiagnostics {
  return Object.freeze({
    warnings: Object.freeze([...diagnostics.warnings]),
    notes: Object.freeze([...diagnostics.notes]),
    missingSources: Object.freeze([...diagnostics.missingSources]),
  });
}

export function freezeSummary(summary: ContextSummary): ContextSummary {
  return Object.freeze({
    ...summary,
    sourceLabels: Object.freeze([...summary.sourceLabels]),
    statistics: freezeStatistics(summary.statistics),
    confidence: freezeConfidence(summary.confidence),
    notes: Object.freeze([...summary.notes]),
  });
}

export function freezeSlice(slice: ContextSlice): ContextSlice {
  return Object.freeze({
    ...slice,
    facts: Object.freeze({ ...slice.facts }),
    notes: Object.freeze([...slice.notes]),
    metadata: freezeMetadata(slice.metadata),
  });
}

export function freezeContribution(
  contribution: ContextContribution,
): ContextContribution {
  return Object.freeze({
    ...contribution,
    slice: freezeSlice(contribution.slice),
    version: contribution.version ? freezeVersion(contribution.version) : null,
    notes: Object.freeze([...contribution.notes]),
    metadata: freezeMetadata(contribution.metadata),
  });
}

export function freezeRequest(request: ContextRequest): ContextRequest {
  return Object.freeze({
    ...request,
    base: request.base ? freezeContext(request.base) : null,
    contributions: Object.freeze(
      request.contributions.map(freezeContribution),
    ),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeContext(
  context: UnifiedCoachingContext,
): UnifiedCoachingContext {
  return Object.freeze({
    ...context,
    version: freezeVersion(context.version),
    sources: Object.freeze(context.sources.map(freezeSource)),
    sections: Object.freeze(context.sections.map(freezeSection)),
    views: Object.freeze(context.views.map(freezeView)),
    dependencies: Object.freeze(context.dependencies.map(freezeDependency)),
    priorities: Object.freeze(context.priorities.map(freezePriority)),
    conflicts: Object.freeze(context.conflicts.map(freezeConflict)),
    resolutions: Object.freeze(context.resolutions.map(freezeResolution)),
    merge: context.merge ? freezeMerge(context.merge) : null,
    integrity: freezeIntegrity(context.integrity),
    confidence: freezeConfidence(context.confidence),
    timeline: freezeTimeline(context.timeline),
    statistics: freezeStatistics(context.statistics),
    diagnostics: freezeDiagnostics(context.diagnostics),
    summary: context.summary ? freezeSummary(context.summary) : null,
    conversation: context.conversation
      ? freezeSlice(context.conversation)
      : null,
    session: context.session ? freezeSlice(context.session) : null,
    athlete: context.athlete ? freezeSlice(context.athlete) : null,
    workout: context.workout ? freezeSlice(context.workout) : null,
    nutrition: context.nutrition ? freezeSlice(context.nutrition) : null,
    recovery: context.recovery ? freezeSlice(context.recovery) : null,
    goal: context.goal ? freezeSlice(context.goal) : null,
    supervisor: context.supervisor ? freezeSlice(context.supervisor) : null,
    metadata: freezeMetadata(context.metadata),
  });
}

export function freezeSnapshot(snapshot: ContextSnapshot): ContextSnapshot {
  return Object.freeze({
    ...snapshot,
    version: freezeVersion(snapshot.version),
    context: freezeContext(snapshot.context),
    summary: snapshot.summary ? freezeSummary(snapshot.summary) : null,
    metadata: freezeMetadata(snapshot.metadata),
  });
}

export function freezeDecisionEngineContext(
  ctx: DecisionEngineContext,
): DecisionEngineContext {
  return Object.freeze({
    ...ctx,
    version: freezeVersion(ctx.version),
    context: freezeContext(ctx.context),
    summary: ctx.summary ? freezeSummary(ctx.summary) : null,
    focusAreas: Object.freeze([...ctx.focusAreas]),
    metadata: freezeMetadata(ctx.metadata),
  });
}

export function freezePackage(pkg: ContextPackage): ContextPackage {
  return Object.freeze({
    ...pkg,
    context: freezeContext(pkg.context),
    snapshot: pkg.snapshot ? freezeSnapshot(pkg.snapshot) : null,
    summary: pkg.summary ? freezeSummary(pkg.summary) : null,
    decisionEngineContext: pkg.decisionEngineContext
      ? freezeDecisionEngineContext(pkg.decisionEngineContext)
      : null,
    metadata: freezeMetadata(pkg.metadata),
  });
}

export function freezeDescriptor(
  descriptor: ContextDescriptor,
): ContextDescriptor {
  return Object.freeze({
    ...descriptor,
    capabilities: Object.freeze([...descriptor.capabilities]),
    sourceKinds: Object.freeze([...descriptor.sourceKinds]),
    metadata: freezeMetadata(descriptor.metadata),
  });
}

export function freezeValidation(
  validation: ContextValidation,
): ContextValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(
      validation.issues.map((i) => Object.freeze({ ...i })),
    ),
  });
}

export function freezeResult(result: ContextResult): ContextResult {
  return Object.freeze({
    ...result,
    context: result.context ? freezeContext(result.context) : null,
    snapshot: result.snapshot ? freezeSnapshot(result.snapshot) : null,
    summary: result.summary ? freezeSummary(result.summary) : null,
    package: result.package ? freezePackage(result.package) : null,
    decisionEngineContext: result.decisionEngineContext
      ? freezeDecisionEngineContext(result.decisionEngineContext)
      : null,
    descriptor: result.descriptor ? freezeDescriptor(result.descriptor) : null,
    validation: result.validation ? freezeValidation(result.validation) : null,
    error: result.error ? Object.freeze({ ...result.error }) : null,
  });
}
`,
);

write(
  "utils/ContextHelpers.ts",
  `import type { ContextContribution } from "../models/ContextContribution";
import type { ContextSourceKind } from "../models/ContextSource";
import type { ContextSlice } from "../models/ContextSlice";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function mergeUniqueStrings(
  ...lists: readonly (readonly string[])[]
): readonly string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const item of list) {
      if (!seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    }
  }
  return Object.freeze(out);
}

export function mergeFacts(
  ...bags: readonly Readonly<
    Record<string, string | number | boolean | null>
  >[]
): Readonly<Record<string, string | number | boolean | null>> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const bag of bags) {
    for (const [k, v] of Object.entries(bag)) {
      out[k] = v;
    }
  }
  return Object.freeze(out);
}

export function contributionsByKind(
  contributions: readonly ContextContribution[],
  kind: ContextSourceKind,
): readonly ContextContribution[] {
  return Object.freeze(contributions.filter((c) => c.sourceKind === kind));
}

export function sliceForKind(
  context: UnifiedCoachingContext,
  kind: ContextSourceKind,
): ContextSlice | null {
  switch (kind) {
    case "conversation":
      return context.conversation;
    case "session":
      return context.session;
    case "athlete":
      return context.athlete;
    case "workout":
      return context.workout;
    case "nutrition":
      return context.nutrition;
    case "recovery":
      return context.recovery;
    case "goal":
      return context.goal;
    case "supervisor":
      return context.supervisor;
    default:
      return null;
  }
}

export function withSlice(
  context: UnifiedCoachingContext,
  kind: ContextSourceKind,
  slice: ContextSlice | null,
): UnifiedCoachingContext {
  switch (kind) {
    case "conversation":
      return { ...context, conversation: slice };
    case "session":
      return { ...context, session: slice };
    case "athlete":
      return { ...context, athlete: slice };
    case "workout":
      return { ...context, workout: slice };
    case "nutrition":
      return { ...context, nutrition: slice };
    case "recovery":
      return { ...context, recovery: slice };
    case "goal":
      return { ...context, goal: slice };
    case "supervisor":
      return { ...context, supervisor: slice };
    default:
      return context;
  }
}
`,
);

write(
  "utils/MergeHelpers.ts",
  `import type { ContextConflict } from "../models/ContextConflict";
import { ContextConflictKinds } from "../models/ContextConflict";
import type { ContextSlice } from "../models/ContextSlice";
import type { ContextSourceKind } from "../models/ContextSource";

export function detectFieldConflicts(input: {
  readonly path: string;
  readonly a: ContextSlice | null;
  readonly b: ContextSlice | null;
  readonly aKind: ContextSourceKind;
  readonly bKind: ContextSourceKind;
}): ContextConflict | null {
  if (!input.a || !input.b) return null;
  const keys = new Set([
    ...Object.keys(input.a.facts),
    ...Object.keys(input.b.facts),
  ]);
  for (const key of keys) {
    const av = input.a.facts[key];
    const bv = input.b.facts[key];
    if (av === undefined || bv === undefined) continue;
    if (String(av) !== String(bv)) {
      return Object.freeze({
        id: \`conflict:\${input.path}:\${key}\`,
        kind: ContextConflictKinds.FIELD,
        path: \`\${input.path}.\${key}\`,
        sources: Object.freeze([input.aKind, input.bKind]),
        values: Object.freeze([String(av), String(bv)]),
        notes: Object.freeze([\`Field mismatch on \${key}\`]),
      });
    }
  }
  return null;
}

export function overlayFacts(
  base: Readonly<Record<string, string | number | boolean | null>>,
  overlay: Readonly<Record<string, string | number | boolean | null>>,
): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ ...base, ...overlay });
}
`,
);

write(
  "utils/VersionHelpers.ts",
  `import {
  formatContextVersion,
  type ContextVersion,
} from "../models/ContextVersion";

export function isVersionNonNegative(version: ContextVersion): boolean {
  return (
    version.major >= 0 &&
    version.minor >= 0 &&
    version.patch >= 0 &&
    version.revision >= 0
  );
}

export function bumpRevision(
  version: ContextVersion,
  atLabel?: string,
): ContextVersion {
  const next = Object.freeze({
    major: version.major,
    minor: version.minor,
    patch: version.patch,
    revision: version.revision + 1,
    label: atLabel ?? formatContextVersion({
      ...version,
      revision: version.revision + 1,
    }),
  });
  return next;
}

export function compareVersions(
  a: ContextVersion,
  b: ContextVersion,
): number {
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  return a.revision - b.revision;
}
`,
);

write(
  "utils/FormattingHelpers.ts",
  `import { formatContextVersion, type ContextVersion } from "../models/ContextVersion";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function formatContextHeadline(
  context: UnifiedCoachingContext,
): string {
  const sources = context.sources.map((s) => s.kind).join(", ");
  return \`Unified context for \${context.athleteId} [\${sources || "no sources"}]\`;
}

export function formatVersionLabel(version: ContextVersion): string {
  return formatContextVersion(version);
}
`,
);

write(
  "utils/StatisticsHelpers.ts",
  `import type { ContextStatistics } from "../models/ContextStatistics";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";

export function buildStatistics(
  context: Pick<
    UnifiedCoachingContext,
    | "sources"
    | "sections"
    | "dependencies"
    | "conflicts"
    | "resolutions"
    | "timeline"
  >,
): ContextStatistics {
  return Object.freeze({
    sourceCount: context.sources.length,
    sectionCount: context.sections.length,
    dependencyCount: context.dependencies.length,
    conflictCount: context.conflicts.length,
    resolutionCount: context.resolutions.length,
    timelineItemCount: context.timeline.items.length,
  });
}
`,
);

write(
  "utils/index.ts",
  `export * from "./FreezeContext";
export * from "./ContextHelpers";
export * from "./MergeHelpers";
export * from "./VersionHelpers";
export * from "./FormattingHelpers";
export * from "./StatisticsHelpers";
`,
);

// ─── Contracts ───────────────────────────────────────────────────────────────

function mockPort(kind, label, facts) {
  return `import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface ${label}Port {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMock${label}Port(
  contribution?: ContextContribution | null,
): ${label}Port {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: \`contribution:${kind}:\${input.athleteId}\`,
        sourceKind: ContextSourceKinds.${kind.toUpperCase() === "CONVERSATION" ? "CONVERSATION" : kind.toUpperCase()},
        agentId: input.agentId ?? "agent:${kind}",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: \`slice:${kind}:\${input.athleteId}\`,
          sourceKind: ContextSourceKinds.${kind === "conversation" ? "CONVERSATION" : kind.toUpperCase()},
          referenceId: null,
          label: "mock ${kind}",
          facts: Object.freeze(${JSON.stringify(facts)} as Record<string, string | number | boolean | null>),
          notes: Object.freeze(["mock ${kind} contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock ${kind} port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}
`;
}

// Fix the mock generation - ContextSourceKinds keys need proper mapping
write(
  "contracts/ConversationRuntimePort.ts",
  `import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

/**
 * Port for Conversation Runtime context into fusion.
 */
export interface ConversationRuntimePort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockConversationRuntimePort(
  contribution?: ContextContribution | null,
): ConversationRuntimePort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: \`contribution:conversation:\${input.athleteId}\`,
        sourceKind: ContextSourceKinds.CONVERSATION,
        agentId: input.agentId ?? "runtime:conversation",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? "conversation:1",
        slice: Object.freeze({
          id: \`slice:conversation:\${input.athleteId}\`,
          sourceKind: ContextSourceKinds.CONVERSATION,
          referenceId: input.conversationId ?? "conversation:1",
          label: "conversation runtime",
          facts: Object.freeze({
            turnId: "turn:1",
            intent: "coaching",
            lastUserMessageId: "msg:user:1",
          }),
          notes: Object.freeze(["mock conversation contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock conversation port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}
`,
);

write(
  "contracts/CoachingSessionPort.ts",
  `import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface CoachingSessionPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockCoachingSessionPort(
  contribution?: ContextContribution | null,
): CoachingSessionPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      const sessionId = input.sessionId ?? "session:coach:1";
      return freezeContribution({
        id: \`contribution:session:\${input.athleteId}\`,
        sourceKind: ContextSourceKinds.SESSION,
        agentId: input.agentId ?? "runtime:coaching-session",
        athleteId: input.athleteId,
        sessionId,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: \`slice:session:\${input.athleteId}\`,
          sourceKind: ContextSourceKinds.SESSION,
          referenceId: sessionId,
          label: "coaching session",
          facts: Object.freeze({
            status: "active",
            phase: "coaching",
            turnCount: 1,
          }),
          notes: Object.freeze(["mock session contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock coaching session port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}
`,
);

write(
  "contracts/AthleteStatePort.ts",
  `import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface AthleteStatePort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockAthleteStatePort(
  contribution?: ContextContribution | null,
): AthleteStatePort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: \`contribution:athlete:\${input.athleteId}\`,
        sourceKind: ContextSourceKinds.ATHLETE,
        agentId: input.agentId ?? "engine:athlete-state",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: \`slice:athlete:\${input.athleteId}\`,
          sourceKind: ContextSourceKinds.ATHLETE,
          referenceId: \`state:\${input.athleteId}\`,
          label: "athlete state",
          facts: Object.freeze({
            stateId: \`state:\${input.athleteId}\`,
            status: "active",
            readinessLabel: "ready",
          }),
          notes: Object.freeze(["mock athlete state contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: Object.freeze({
          major: 1,
          minor: 0,
          patch: 0,
          revision: 1,
          label: "1.0.0+1",
        }),
        notes: Object.freeze(["mock athlete state port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}
`,
);

for (const [kind, label, facts] of [
  [
    "workout",
    "WorkoutAgent",
    { focus: "strength", programId: "program:1", lastSessionId: "session:workout:1" },
  ],
  [
    "nutrition",
    "NutritionAgent",
    { planId: "nutrition-plan:1", calorieTarget: 2400 },
  ],
  [
    "recovery",
    "RecoveryAgent",
    { status: "adequate", sleepHours: 7.5 },
  ],
  [
    "goal",
    "GoalAgent",
    { primaryGoal: "Increase squat", goalId: "goal:1" },
  ],
]) {
  const kindConst = kind.toUpperCase();
  write(
    `contracts/${label}Port.ts`,
    `import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface ${label}Port {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMock${label}Port(
  contribution?: ContextContribution | null,
): ${label}Port {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: \`contribution:${kind}:\${input.athleteId}\`,
        sourceKind: ContextSourceKinds.${kindConst},
        agentId: input.agentId ?? "agent:${kind}",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: \`slice:${kind}:\${input.athleteId}\`,
          sourceKind: ContextSourceKinds.${kindConst},
          referenceId: null,
          label: "${kind} agent",
          facts: Object.freeze(${JSON.stringify(facts)} as Record<
            string,
            string | number | boolean | null
          >),
          notes: Object.freeze(["mock ${kind} contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock ${kind} agent port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}
`,
  );
}

write(
  "contracts/SupervisorPort.ts",
  `import type { ContextContribution } from "../models/ContextContribution";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContribution } from "../utils/FreezeContext";

export interface SupervisorPort {
  contribute(input: {
    readonly athleteId: string;
    readonly sessionId?: string | null;
    readonly conversationId?: string | null;
    readonly agentId?: string;
    readonly at?: string;
  }): ContextContribution | null;
}

export function createMockSupervisorPort(
  contribution?: ContextContribution | null,
): SupervisorPort {
  return {
    contribute(input) {
      if (contribution === null) return null;
      if (contribution) return freezeContribution(contribution);
      const at = input.at ?? "2026-07-25T12:00:00.000Z";
      return freezeContribution({
        id: \`contribution:supervisor:\${input.athleteId}\`,
        sourceKind: ContextSourceKinds.SUPERVISOR,
        agentId: input.agentId ?? "agent:coach-supervisor",
        athleteId: input.athleteId,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        slice: Object.freeze({
          id: \`slice:supervisor:\${input.athleteId}\`,
          sourceKind: ContextSourceKinds.SUPERVISOR,
          referenceId: "supervisor:context:1",
          label: "coach supervisor",
          facts: Object.freeze({
            focus: "training",
            routingPlanId: "routing:1",
            coordinationStatus: "ready",
          }),
          notes: Object.freeze(["mock supervisor contribution"]),
          metadata: EMPTY_CONTEXT_METADATA,
          contributedAt: at,
        }),
        version: null,
        notes: Object.freeze(["mock supervisor port"]),
        metadata: EMPTY_CONTEXT_METADATA,
        contributedAt: at,
      });
    },
  };
}
`,
);

write(
  "contracts/index.ts",
  `export * from "./ConversationRuntimePort";
export * from "./CoachingSessionPort";
export * from "./AthleteStatePort";
export * from "./WorkoutAgentPort";
export * from "./NutritionAgentPort";
export * from "./RecoveryAgentPort";
export * from "./GoalAgentPort";
export * from "./SupervisorPort";
`,
);

console.log("generate-context-fusion-part2.mjs: utils + contracts written");
