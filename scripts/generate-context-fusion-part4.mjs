/**
 * Sprint 22.2 — Context Fusion Engine generator part 4
 * (fusion, services, application, tests, index).
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
  "fusion/ContextFusionSession.ts",
  `import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { freezeContext } from "../utils/FreezeContext";

/**
 * In-memory fusion session holding the latest immutable context.
 */
export class ContextFusionSession {
  private context: UnifiedCoachingContext | null = null;

  getContext(): UnifiedCoachingContext | null {
    return this.context;
  }

  put(context: UnifiedCoachingContext): UnifiedCoachingContext {
    this.context = freezeContext(context);
    return this.context;
  }

  clear(): void {
    this.context = null;
  }
}

export function createContextFusionSession(): ContextFusionSession {
  return new ContextFusionSession();
}
`,
);

write(
  "fusion/ContextFusionCoordinator.ts",
  `import { aggregateContextSlices } from "../aggregation/ContextAggregator";
import { buildContextDescriptor, buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { buildContextPackage } from "../builders/PackageBuilder";
import { buildContextResult } from "../builders/ResultBuilder";
import { buildSectionsFromContext } from "../builders/SectionBuilder";
import { buildContextSnapshot } from "../builders/SnapshotBuilder";
import { buildContextSummary } from "../builders/SummaryBuilder";
import { buildDecisionEngineContext } from "../builders/DecisionEngineContextBuilder";
import type { AthleteStatePort } from "../contracts/AthleteStatePort";
import type { CoachingSessionPort } from "../contracts/CoachingSessionPort";
import type { ConversationRuntimePort } from "../contracts/ConversationRuntimePort";
import type { GoalAgentPort } from "../contracts/GoalAgentPort";
import type { NutritionAgentPort } from "../contracts/NutritionAgentPort";
import type { RecoveryAgentPort } from "../contracts/RecoveryAgentPort";
import type { SupervisorPort } from "../contracts/SupervisorPort";
import type { WorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import type { ContextContribution } from "../models/ContextContribution";
import { ContextDependencyKinds } from "../models/ContextDependency";
import { createContextError } from "../models/ContextError";
import {
  ContextOperationKinds,
  type ContextResult,
} from "../models/ContextResult";
import type { ContextRequest } from "../models/ContextRequest";
import { ContextTimelineEventKinds } from "../models/ContextTimeline";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { applyConflictPolicy } from "../policies/ConflictPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyIntegrityPolicy } from "../policies/IntegrityPolicy";
import { applyMergePolicy } from "../policies/MergePolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applyVersionPolicy } from "../policies/VersionPolicy";
import { resolveContext } from "../resolution/ContextResolver";
import { buildStatistics } from "../utils/StatisticsHelpers";
import {
  freezeContext,
  freezeRequest,
} from "../utils/FreezeContext";
import { validateUnifiedContextFull } from "../validators/validateUnifiedContext";
import {
  createContextFusionSession,
  type ContextFusionSession,
} from "./ContextFusionSession";

export interface ContextFusionCoordinatorDeps {
  readonly conversationPort?: ConversationRuntimePort;
  readonly sessionPort?: CoachingSessionPort;
  readonly athletePort?: AthleteStatePort;
  readonly workoutPort?: WorkoutAgentPort;
  readonly nutritionPort?: NutritionAgentPort;
  readonly recoveryPort?: RecoveryAgentPort;
  readonly goalPort?: GoalAgentPort;
  readonly supervisorPort?: SupervisorPort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

/**
 * Coordinates immutable context fusion.
 * No AI. No calculations. No persistence. No networking.
 */
export class ContextFusionCoordinator {
  private readonly session: ContextFusionSession;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly conversationPort: ConversationRuntimePort | null;
  private readonly sessionPort: CoachingSessionPort | null;
  private readonly athletePort: AthleteStatePort | null;
  private readonly workoutPort: WorkoutAgentPort | null;
  private readonly nutritionPort: NutritionAgentPort | null;
  private readonly recoveryPort: RecoveryAgentPort | null;
  private readonly goalPort: GoalAgentPort | null;
  private readonly supervisorPort: SupervisorPort | null;
  private sequence = 0;

  constructor(deps: ContextFusionCoordinatorDeps = {}) {
    this.session = createContextFusionSession();
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:context-fusion";
    this.conversationPort = deps.conversationPort ?? null;
    this.sessionPort = deps.sessionPort ?? null;
    this.athletePort = deps.athletePort ?? null;
    this.workoutPort = deps.workoutPort ?? null;
    this.nutritionPort = deps.nutritionPort ?? null;
    this.recoveryPort = deps.recoveryPort ?? null;
    this.goalPort = deps.goalPort ?? null;
    this.supervisorPort = deps.supervisorPort ?? null;
  }

  describe(): ContextResult {
    const now = this.clock();
    return buildContextResult({
      id: \`result:describe:\${++this.sequence}\`,
      operation: ContextOperationKinds.DESCRIBE,
      success: true,
      message: "Context Fusion Engine capabilities.",
      descriptor: buildContextDescriptor({
        id: this.runtimeId,
        createdAt: now,
      }),
      startedAt: now,
      completedAt: now,
    });
  }

  validate(request: ContextRequest): ContextResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    const existing =
      frozen.base ??
      this.session.getContext() ??
      null;
    const validation = existing
      ? validateUnifiedContextFull(existing)
      : Object.freeze({
          valid: Boolean(frozen.athleteId),
          issues: frozen.athleteId
            ? Object.freeze([])
            : Object.freeze([
                {
                  code: "missing_context",
                  message: "athleteId is required.",
                  path: "athleteId",
                },
              ]),
        });
    const completedAt = this.clock();
    return buildContextResult({
      id: \`result:validate:\${++this.sequence}\`,
      operation: ContextOperationKinds.VALIDATE,
      success: validation.valid,
      message: validation.valid
        ? "Unified context validation passed."
        : "Unified context validation failed.",
      athleteId: frozen.athleteId,
      context: existing,
      validation,
      error: validation.valid
        ? null
        : createContextError({
            code: validation.issues[0]!.code,
            message: validation.issues[0]!.message,
            path: validation.issues[0]!.path,
          }),
      startedAt,
      completedAt,
    });
  }

  build(request: ContextRequest): ContextResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    if (!frozen.athleteId) {
      return this.fail({
        operation: ContextOperationKinds.BUILD,
        request: frozen,
        message: "athleteId is required.",
        startedAt,
      });
    }

    const contributions = this.resolveContributions(frozen);
    const empty = buildEmptyUnifiedContext({
      id: frozen.contextId ?? \`context:\${frozen.athleteId}\`,
      athleteId: frozen.athleteId,
      sessionId: frozen.sessionId,
      conversationId: frozen.conversationId,
      at: startedAt,
    });

    const fused = this.fuse({
      base: empty,
      contributions,
      at: startedAt,
      mergeId: \`merge:build:\${++this.sequence}\`,
    });

    const policies = this.runPolicies(fused);
    if (!policies.valid) {
      return this.fail({
        operation: ContextOperationKinds.BUILD,
        request: frozen,
        message: "Fused context failed policy checks.",
        validation: policies,
        context: fused,
        startedAt,
      });
    }

    this.session.put(fused);
    const summary = buildContextSummary({
      context: fused,
      createdAt: startedAt,
    });
    const decisionEngineContext = buildDecisionEngineContext({
      id: \`decision-ctx:\${fused.id}\`,
      context: fused,
      summary,
      createdAt: startedAt,
    });
    const pkg = buildContextPackage({
      id: \`package:\${fused.id}\`,
      context: fused,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildContextResult({
      id: \`result:build:\${this.sequence}\`,
      operation: ContextOperationKinds.BUILD,
      success: true,
      message: "Unified coaching context built.",
      athleteId: fused.athleteId,
      context: fused,
      summary,
      package: pkg,
      decisionEngineContext,
      validation: policies,
      startedAt,
      completedAt,
    });
  }

  merge(request: ContextRequest): ContextResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    const base =
      frozen.base ??
      this.session.getContext() ??
      null;
    if (!base) {
      return this.fail({
        operation: ContextOperationKinds.MERGE,
        request: frozen,
        message: "No base context to merge; build first.",
        startedAt,
      });
    }
    const contributions = this.resolveContributions(frozen);
    const fused = this.fuse({
      base,
      contributions,
      at: startedAt,
      mergeId: \`merge:merge:\${++this.sequence}\`,
    });
    const policies = this.runPolicies(fused);
    if (!policies.valid) {
      return this.fail({
        operation: ContextOperationKinds.MERGE,
        request: frozen,
        message: "Merged context failed policy checks.",
        validation: policies,
        context: fused,
        startedAt,
      });
    }
    this.session.put(fused);
    const summary = buildContextSummary({
      context: fused,
      createdAt: startedAt,
    });
    const decisionEngineContext = buildDecisionEngineContext({
      id: \`decision-ctx:\${fused.id}\`,
      context: fused,
      summary,
      createdAt: startedAt,
    });
    const pkg = buildContextPackage({
      id: \`package:\${fused.id}\`,
      context: fused,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildContextResult({
      id: \`result:merge:\${this.sequence}\`,
      operation: ContextOperationKinds.MERGE,
      success: true,
      message: "Contexts merged.",
      athleteId: fused.athleteId,
      context: fused,
      summary,
      package: pkg,
      decisionEngineContext,
      validation: policies,
      startedAt,
      completedAt,
    });
  }

  snapshot(request: ContextRequest): ContextResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    const context =
      frozen.base ??
      this.session.getContext() ??
      null;
    if (!context) {
      return this.fail({
        operation: ContextOperationKinds.SNAPSHOT,
        request: frozen,
        message: "No context available for snapshot.",
        startedAt,
      });
    }
    const snap = buildContextSnapshot({
      id: \`snapshot:\${context.id}:\${++this.sequence}\`,
      context,
      reason: frozen.reason,
      createdAt: startedAt,
    });
    const summary = snap.summary;
    const decisionEngineContext = buildDecisionEngineContext({
      id: \`decision-ctx:\${context.id}:snap\`,
      context,
      summary,
      createdAt: startedAt,
    });
    const pkg = buildContextPackage({
      id: \`package:\${context.id}:snap\`,
      context,
      snapshot: snap,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildContextResult({
      id: \`result:snapshot:\${this.sequence}\`,
      operation: ContextOperationKinds.SNAPSHOT,
      success: true,
      message: "Context snapshot created.",
      athleteId: context.athleteId,
      context,
      snapshot: snap,
      summary,
      package: pkg,
      decisionEngineContext,
      startedAt,
      completedAt,
    });
  }

  getSession(): ContextFusionSession {
    return this.session;
  }

  private fuse(input: {
    readonly base: import("../models/UnifiedCoachingContext").UnifiedCoachingContext;
    readonly contributions: readonly ContextContribution[];
    readonly at: string;
    readonly mergeId: string;
  }) {
    const aggregated = aggregateContextSlices({
      context: input.base,
      contributions: input.contributions,
      updatedAt: input.at,
    });
    const resolved = resolveContext({
      context: aggregated,
      contributions: input.contributions,
      at: input.at,
      mergeId: input.mergeId,
    });
    const sections = buildSectionsFromContext({
      slices: Object.freeze([
        aggregated.conversation,
        aggregated.session,
        aggregated.athlete,
        aggregated.workout,
        aggregated.nutrition,
        aggregated.recovery,
        aggregated.goal,
        aggregated.supervisor,
      ]),
      sourceIdFor: (kind) =>
        resolved.sources.find((s) => s.kind === kind)?.id ?? \`source:\${kind}\`,
    });
    const dependencies = Object.freeze([
      Object.freeze({
        id: "dep:session-requires-athlete",
        kind: ContextDependencyKinds.REQUIRES,
        from: "session" as const,
        to: "athlete" as const,
        path: null,
        notes: Object.freeze(["session depends on athlete identity"]),
      }),
      Object.freeze({
        id: "dep:supervisor-informs-decision",
        kind: ContextDependencyKinds.INFORMS,
        from: "supervisor" as const,
        to: "athlete" as const,
        path: null,
        notes: Object.freeze(["supervisor informs decision handoff"]),
      }),
    ]);
    const timelineItems = Object.freeze([
      ...aggregated.timeline.items,
      Object.freeze({
        id: \`timeline:fused:\${this.sequence}\`,
        kind: ContextTimelineEventKinds.FUSED,
        sourceKind: null,
        label: "context fused",
        at: input.at,
        notes: Object.freeze([
          \`sources=\${resolved.sources.length}\`,
          \`conflicts=\${resolved.conflicts.length}\`,
        ]),
      }),
    ]);
    const draft = freezeContext({
      ...aggregated,
      version: resolved.version,
      sources: resolved.sources,
      sections,
      dependencies,
      priorities: resolved.priorities,
      conflicts: resolved.conflicts,
      resolutions: resolved.resolutions,
      merge: resolved.merge,
      timeline: Object.freeze({
        items: timelineItems,
        metadata: EMPTY_CONTEXT_METADATA,
      }),
      statistics: buildStatistics({
        sources: resolved.sources,
        sections,
        dependencies,
        conflicts: resolved.conflicts,
        resolutions: resolved.resolutions,
        timeline: { items: timelineItems, metadata: EMPTY_CONTEXT_METADATA },
      }),
      confidence: Object.freeze({
        level:
          resolved.sources.length === 0
            ? ("unknown" as const)
            : resolved.sources.length >= 6
              ? ("high" as const)
              : resolved.sources.length >= 3
                ? ("medium" as const)
                : ("low" as const),
        sourceCount: resolved.sources.length,
        resolvedConflictCount: resolved.resolutions.length,
        notes: Object.freeze([] as string[]),
      }),
      diagnostics: Object.freeze({
        warnings: Object.freeze([] as string[]),
        notes: Object.freeze(["deterministic fusion complete"]),
        missingSources: Object.freeze([] as string[]),
      }),
      summary: null,
      updatedAt: input.at,
    });
    const summary = buildContextSummary({
      context: draft,
      createdAt: input.at,
    });
    return freezeContext({ ...draft, summary });
  }

  private resolveContributions(
    request: ContextRequest,
  ): readonly ContextContribution[] {
    const fromRequest = [...request.contributions];
    const portInput = {
      athleteId: request.athleteId,
      sessionId: request.sessionId,
      conversationId: request.conversationId,
      at: request.createdAt,
    };
    const fromPorts = [
      this.conversationPort?.contribute(portInput) ?? null,
      this.sessionPort?.contribute(portInput) ?? null,
      this.athletePort?.contribute(portInput) ?? null,
      this.workoutPort?.contribute(portInput) ?? null,
      this.nutritionPort?.contribute(portInput) ?? null,
      this.recoveryPort?.contribute(portInput) ?? null,
      this.goalPort?.contribute(portInput) ?? null,
      this.supervisorPort?.contribute(portInput) ?? null,
    ].filter((c): c is ContextContribution => c !== null);
    return Object.freeze([...fromRequest, ...fromPorts]);
  }

  private runPolicies(
    context: import("../models/UnifiedCoachingContext").UnifiedCoachingContext,
  ) {
    const parts = [
      applyIntegrityPolicy(context),
      applyVersionPolicy(context),
      applyPriorityPolicy(context),
      applyConflictPolicy(context),
      applyMergePolicy(context),
      applyConsistencyPolicy(context),
    ];
    // Filter dependency breaks for missing optional sources when dep.from not present
    const sourceKinds = new Set(context.sources.map((s) => s.kind));
    const issues = Object.freeze(
      parts
        .flatMap((p) => [...p.issues])
        .filter((issue) => {
          if (issue.code !== "dependency_break") return true;
          // allow deps whose from-source is simply not contributed yet
          const match = /Dependency from-source (\\w+) is missing/.exec(
            issue.message,
          );
          if (match && !sourceKinds.has(match[1] as never)) return false;
          return true;
        }),
    );
    return Object.freeze({
      valid: issues.length === 0,
      issues,
    });
  }

  private fail(input: {
    readonly operation: import("../models/ContextResult").ContextOperationKind;
    readonly request: ContextRequest;
    readonly message: string;
    readonly validation?: import("../models/ContextValidation").ContextValidation;
    readonly context?: import("../models/UnifiedCoachingContext").UnifiedCoachingContext | null;
    readonly startedAt: string;
  }): ContextResult {
    const completedAt = this.clock();
    const issue = input.validation?.issues[0];
    return buildContextResult({
      id: \`result:fail:\${++this.sequence}\`,
      operation: input.operation,
      success: false,
      message: input.message,
      athleteId: input.request.athleteId,
      context: input.context ?? null,
      validation: input.validation ?? null,
      error: createContextError({
        code: issue?.code ?? "fusion_failed",
        message: issue?.message ?? input.message,
        path: issue?.path ?? null,
      }),
      startedAt: input.startedAt,
      completedAt,
    });
  }
}

export function createContextFusionCoordinator(
  deps: ContextFusionCoordinatorDeps = {},
): ContextFusionCoordinator {
  return new ContextFusionCoordinator(deps);
}
`,
);

write(
  "fusion/ContextFusionEngine.ts",
  `import { buildContextDescriptor } from "../builders/UnifiedContextBuilder";
import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextRequest } from "../models/ContextRequest";
import type { ContextResult } from "../models/ContextResult";
import {
  createContextFusionCoordinator,
  type ContextFusionCoordinator,
  type ContextFusionCoordinatorDeps,
} from "./ContextFusionCoordinator";

export type ContextFusionEngineDeps = ContextFusionCoordinatorDeps;

/**
 * Context Fusion Engine — immutable context fusion only.
 */
export class ContextFusionEngine {
  private readonly coordinator: ContextFusionCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: ContextFusionEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:context-fusion";
    this.coordinator = createContextFusionCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): ContextDescriptor {
    return buildContextDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  buildUnifiedContext(request: ContextRequest): ContextResult {
    return this.coordinator.build(request);
  }

  mergeContexts(request: ContextRequest): ContextResult {
    return this.coordinator.merge(request);
  }

  validateUnifiedContext(request: ContextRequest): ContextResult {
    return this.coordinator.validate(request);
  }

  describeContext(): ContextResult {
    return this.coordinator.describe();
  }

  createContextSnapshot(request: ContextRequest): ContextResult {
    return this.coordinator.snapshot(request);
  }

  getCoordinator(): ContextFusionCoordinator {
    return this.coordinator;
  }
}

export function createContextFusionEngine(
  deps: ContextFusionEngineDeps = {},
): ContextFusionEngine {
  return new ContextFusionEngine(deps);
}
`,
);

write(
  "fusion/index.ts",
  `export * from "./ContextFusionSession";
export * from "./ContextFusionCoordinator";
export * from "./ContextFusionEngine";
`,
);

write(
  "services/ContextFusionService.ts",
  `import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextRequest } from "../models/ContextRequest";
import type { ContextResult } from "../models/ContextResult";
import {
  createContextFusionEngine,
  type ContextFusionEngine,
  type ContextFusionEngineDeps,
} from "../fusion/ContextFusionEngine";

export type ContextFusionServiceDeps = ContextFusionEngineDeps;

/**
 * Context Fusion Service — fusion orchestration facade.
 *
 * Upstream runtimes/agents → Context Fusion Engine → Decision Engine Context
 *
 * No networking. No persistence. No provider SDKs. No AI. No calculations.
 */
export class ContextFusionService {
  private readonly engine: ContextFusionEngine;

  constructor(deps: ContextFusionServiceDeps = {}) {
    this.engine = createContextFusionEngine(deps);
  }

  buildUnifiedContext(request: ContextRequest): ContextResult {
    return this.engine.buildUnifiedContext(request);
  }

  mergeContexts(request: ContextRequest): ContextResult {
    return this.engine.mergeContexts(request);
  }

  validateUnifiedContext(request: ContextRequest): ContextResult {
    return this.engine.validateUnifiedContext(request);
  }

  describeContext(): ContextDescriptor {
    return this.engine.describe();
  }

  createContextSnapshot(request: ContextRequest): ContextResult {
    return this.engine.createContextSnapshot(request);
  }
}

export function createContextFusionService(
  deps: ContextFusionServiceDeps = {},
): ContextFusionService {
  return new ContextFusionService(deps);
}
`,
);

write(
  "services/index.ts",
  `export * from "./ContextFusionService";
`,
);

write(
  "application/index.ts",
  `import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { ContextRequest } from "../models/ContextRequest";
import type { ContextResult } from "../models/ContextResult";
import {
  createContextFusionService,
  type ContextFusionService,
  type ContextFusionServiceDeps,
} from "../services/ContextFusionService";

function resolveService(
  service?: ContextFusionService,
  deps?: ContextFusionServiceDeps,
): ContextFusionService {
  return service ?? createContextFusionService(deps);
}

/**
 * Public API — build immutable unified coaching context.
 */
export function buildUnifiedContext(options: {
  readonly request: ContextRequest;
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
}): ContextResult {
  return resolveService(options.service, options.deps).buildUnifiedContext(
    options.request,
  );
}

/**
 * Public API — merge additional contributions into fused context.
 */
export function mergeContexts(options: {
  readonly request: ContextRequest;
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
}): ContextResult {
  return resolveService(options.service, options.deps).mergeContexts(
    options.request,
  );
}

/**
 * Public API — validate unified coaching context.
 */
export function validateUnifiedContext(options: {
  readonly request: ContextRequest;
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
}): ContextResult {
  return resolveService(options.service, options.deps).validateUnifiedContext(
    options.request,
  );
}

/**
 * Public API — describe Context Fusion Engine capabilities.
 */
export function describeContext(options: {
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
} = {}): ContextDescriptor {
  return resolveService(options.service, options.deps).describeContext();
}

/**
 * Public API — create an immutable context snapshot.
 */
export function createContextSnapshot(options: {
  readonly request: ContextRequest;
  readonly service?: ContextFusionService;
  readonly deps?: ContextFusionServiceDeps;
}): ContextResult {
  return resolveService(options.service, options.deps).createContextSnapshot(
    options.request,
  );
}

export type { ContextFusionServiceDeps };
`,
);

write(
  "index.ts",
  `/**
 * Context Fusion Engine
 *
 * Sprint 22.2 — Context Fusion Engine Foundation.
 *
 * Conversation Runtime
 * Coaching Session Runtime
 * Athlete State Engine
 * Workout / Nutrition / Recovery / Goal Agents
 * Coach Supervisor Context
 *   ↓
 * Context Fusion Engine
 *   ↓
 * Unified Coaching Context
 *   ↓
 * Decision Engine
 *
 * Single immutable fused coaching context.
 * Owns aggregation + deterministic conflict resolution only.
 *
 * No AI. No calculations. No persistence. No networking. No UI.
 */

export * from "./models";
export {
  buildUnifiedContext,
  mergeContexts,
  validateUnifiedContext,
  describeContext,
  createContextSnapshot,
} from "./application";
export {
  ContextFusionService,
  createContextFusionService,
} from "./services";
`,
);

write(
  "testSupport/fixtures.ts",
  `import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockCoachingSessionPort } from "../contracts/CoachingSessionPort";
import { createMockConversationRuntimePort } from "../contracts/ConversationRuntimePort";
import { createMockGoalAgentPort } from "../contracts/GoalAgentPort";
import { createMockNutritionAgentPort } from "../contracts/NutritionAgentPort";
import { createMockRecoveryAgentPort } from "../contracts/RecoveryAgentPort";
import { createMockSupervisorPort } from "../contracts/SupervisorPort";
import { createMockWorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import {
  ContextRequestKinds,
  type ContextRequest,
} from "../models/ContextRequest";
import {
  createContextFusionService,
  type ContextFusionService,
} from "../services/ContextFusionService";
import { freezeRequest } from "../utils/FreezeContext";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createContextRequest(
  overrides: Partial<ContextRequest> = {},
): ContextRequest {
  return freezeRequest({
    id: overrides.id ?? "request:context-fusion:test",
    kind: overrides.kind ?? ContextRequestKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:coach:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:athlete:1",
    base: overrides.base ?? null,
    contributions: Object.freeze([...(overrides.contributions ?? [])]),
    reason: overrides.reason ?? "test build",
    metadata: overrides.metadata ?? EMPTY_CONTEXT_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestContextFusionService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): ContextFusionService {
  const withMocks = overrides.withMocks ?? true;
  return createContextFusionService({
    conversationPort: withMocks
      ? createMockConversationRuntimePort()
      : undefined,
    sessionPort: withMocks ? createMockCoachingSessionPort() : undefined,
    athletePort: withMocks ? createMockAthleteStatePort() : undefined,
    workoutPort: withMocks ? createMockWorkoutAgentPort() : undefined,
    nutritionPort: withMocks ? createMockNutritionAgentPort() : undefined,
    recoveryPort: withMocks ? createMockRecoveryAgentPort() : undefined,
    goalPort: withMocks ? createMockGoalAgentPort() : undefined,
    supervisorPort: withMocks ? createMockSupervisorPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
`,
);

// Tests
write(
  "__tests__/fusion.test.ts",
  `import { ContextOperationKinds } from "../models/ContextResult";
import { ContextRequestKinds } from "../models/ContextRequest";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../testSupport/fixtures";

describe("context-fusion fusion", () => {
  it("builds immutable unified context via engine facade", () => {
    const service = createTestContextFusionService();
    const result = service.buildUnifiedContext(
      createContextRequest({ kind: ContextRequestKinds.BUILD }),
    );
    expect(result.success).toBe(true);
    expect(result.operation).toBe(ContextOperationKinds.BUILD);
    expect(result.context).not.toBeNull();
    expect(Object.isFrozen(result.context)).toBe(true);
    expect(result.context!.sources.length).toBeGreaterThanOrEqual(6);
    expect(result.decisionEngineContext).not.toBeNull();
  });

  it("merges into existing session context", () => {
    const service = createTestContextFusionService();
    const built = service.buildUnifiedContext(createContextRequest());
    expect(built.success).toBe(true);
    const merged = service.mergeContexts(
      createContextRequest({
        id: "request:merge",
        kind: ContextRequestKinds.MERGE,
      }),
    );
    expect(merged.success).toBe(true);
    expect(merged.context!.version.revision).toBeGreaterThan(
      built.context!.version.revision,
    );
  });
});
`,
);

write(
  "__tests__/aggregation.test.ts",
  `import { aggregateWorkout } from "../aggregation/WorkoutAggregator";
import { aggregateContextSlices } from "../aggregation/ContextAggregator";
import { buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { createMockWorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("context-fusion aggregation", () => {
  it("aggregates workout slice from contribution", () => {
    const contribution = createMockWorkoutAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const slice = aggregateWorkout({
      current: null,
      contributions: [contribution],
    });
    expect(slice).not.toBeNull();
    expect(slice!.facts.focus).toBe("strength");
  });

  it("aggregates all slices into context shell", () => {
    const contribution = createMockWorkoutAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const empty = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const next = aggregateContextSlices({
      context: empty,
      contributions: [contribution],
      updatedAt: FIXED_TIMESTAMP,
    });
    expect(next.workout!.facts.programId).toBe("program:1");
    expect(next.nutrition).toBeNull();
  });
});
`,
);

write(
  "__tests__/resolution.test.ts",
  `import { resolveConflicts } from "../resolution/ConflictResolver";
import { resolvePriorities, preferSource } from "../resolution/PriorityResolver";
import { ContextConflictKinds } from "../models/ContextConflict";

describe("context-fusion resolution", () => {
  it("prefers athlete over workout by deterministic priority", () => {
    const priorities = resolvePriorities();
    expect(preferSource(priorities, "athlete", "workout")).toBe("athlete");
  });

  it("resolves conflicts by priority strategy", () => {
    const priorities = resolvePriorities();
    const resolutions = resolveConflicts({
      priorities,
      conflicts: [
        Object.freeze({
          id: "conflict:focus",
          kind: ContextConflictKinds.FIELD,
          path: "focus",
          sources: Object.freeze(["athlete", "workout"] as const),
          values: Object.freeze(["ready", "strength"]),
          notes: Object.freeze([] as string[]),
        }),
      ],
    });
    expect(resolutions).toHaveLength(1);
    expect(resolutions[0]!.winnerSource).toBe("athlete");
    expect(resolutions[0]!.strategy).toBe("priority");
  });
});
`,
);

write(
  "__tests__/builders.test.ts",
  `import { buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { buildContextSnapshot } from "../builders/SnapshotBuilder";
import { buildContextSummary } from "../builders/SummaryBuilder";
import { buildContextPackage } from "../builders/PackageBuilder";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("context-fusion builders", () => {
  it("builds empty immutable context, summary, snapshot, package", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(context)).toBe(true);
    const summary = buildContextSummary({
      context,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(summary.athleteId).toBe("athlete:1");
    const snapshot = buildContextSnapshot({
      id: "snapshot:1",
      context,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(snapshot.contextId).toBe("context:1");
    const pkg = buildContextPackage({
      id: "package:1",
      context,
      snapshot,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(pkg.decisionEngineContext).not.toBeNull();
  });
});
`,
);

write(
  "__tests__/validators.test.ts",
  `import { buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { validateUnifiedContextFull } from "../validators/validateUnifiedContext";
import { validateSnapshotIntegrity } from "../validators/validateSnapshotIntegrity";
import { buildContextSnapshot } from "../builders/SnapshotBuilder";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("context-fusion validators", () => {
  it("validates empty context integrity", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const result = validateUnifiedContextFull(context);
    expect(result.valid).toBe(true);
  });

  it("rejects missing athleteId", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "",
      at: FIXED_TIMESTAMP,
    });
    const result = validateUnifiedContextFull(context);
    expect(result.valid).toBe(false);
  });

  it("validates snapshot integrity", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const snapshot = buildContextSnapshot({
      id: "snapshot:1",
      context,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(validateSnapshotIntegrity(snapshot).valid).toBe(true);
  });
});
`,
);

write(
  "__tests__/policies.test.ts",
  `import { buildEmptyUnifiedContext } from "../builders/UnifiedContextBuilder";
import { applyIntegrityPolicy } from "../policies/IntegrityPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applyVersionPolicy } from "../policies/VersionPolicy";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("context-fusion policies", () => {
  it("passes integrity, version, and priority policies on empty context", () => {
    const context = buildEmptyUnifiedContext({
      id: "context:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(applyIntegrityPolicy(context).valid).toBe(true);
    expect(applyVersionPolicy(context).valid).toBe(true);
    expect(applyPriorityPolicy(context).valid).toBe(true);
  });
});
`,
);

write(
  "__tests__/application.test.ts",
  `import {
  buildUnifiedContext,
  createContextSnapshot,
  describeContext,
  mergeContexts,
  validateUnifiedContext,
} from "../application";
import { ContextOperationKinds } from "../models/ContextResult";
import { ContextRequestKinds } from "../models/ContextRequest";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../testSupport/fixtures";

describe("context-fusion application", () => {
  it("exposes public API build → merge → snapshot → describe → validate", () => {
    const service = createTestContextFusionService();

    const built = buildUnifiedContext({
      service,
      request: createContextRequest({ kind: ContextRequestKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(ContextOperationKinds.BUILD);
    expect(built.decisionEngineContext).not.toBeNull();

    const merged = mergeContexts({
      service,
      request: createContextRequest({
        id: "request:merge",
        kind: ContextRequestKinds.MERGE,
        reason: "refresh sources",
      }),
    });
    expect(merged.success).toBe(true);
    expect(merged.operation).toBe(ContextOperationKinds.MERGE);
    expect(merged.context!.version.revision).toBeGreaterThan(
      built.context!.version.revision,
    );

    const snap = createContextSnapshot({
      service,
      request: createContextRequest({
        id: "request:snapshot",
        kind: ContextRequestKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot)).toBe(true);

    const caps = describeContext({ service });
    expect(caps.name).toBe("Context Fusion Engine");
    expect(caps.capabilities.length).toBeGreaterThan(0);

    const validated = validateUnifiedContext({
      service,
      request: createContextRequest({
        id: "request:validate",
        kind: ContextRequestKinds.VALIDATE,
      }),
    });
    expect(validated.operation).toBe(ContextOperationKinds.VALIDATE);
    expect(validated.success).toBe(true);
  });
});
`,
);

write(
  "__tests__/integration.test.ts",
  `import {
  buildUnifiedContext,
  createContextSnapshot,
  mergeContexts,
} from "../application";
import { selectSourceByKind } from "../selectors/SourceSelector";
import { selectSectionsByKind } from "../selectors/SectionSelector";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../testSupport/fixtures";

describe("context-fusion integration", () => {
  it("fuses mock upstream modules into decision engine context", () => {
    const service = createTestContextFusionService({ withMocks: true });
    const built = buildUnifiedContext({
      service,
      request: createContextRequest(),
    });
    expect(built.success).toBe(true);
    expect(built.context!.conversation).not.toBeNull();
    expect(built.context!.session).not.toBeNull();
    expect(built.context!.athlete).not.toBeNull();
    expect(built.context!.workout!.facts.focus).toBe("strength");
    expect(built.context!.nutrition!.facts.planId).toBe("nutrition-plan:1");
    expect(built.context!.recovery!.facts.status).toBe("adequate");
    expect(built.context!.goal!.facts.primaryGoal).toBe("Increase squat");
    expect(built.context!.supervisor!.facts.focus).toBe("training");
    expect(selectSourceByKind(built.context!, "athlete")).not.toBeNull();
    expect(selectSectionsByKind(built.context!, "workout").length).toBe(1);
    expect(built.decisionEngineContext!.focusAreas).toContain("workout");

    const merged = mergeContexts({
      service,
      request: createContextRequest({
        id: "request:int:merge",
        kind: "merge",
      }),
    });
    expect(merged.success).toBe(true);
    expect(merged.context!.timeline.items.length).toBeGreaterThan(0);

    const snap = createContextSnapshot({
      service,
      request: createContextRequest({
        id: "request:int:snap",
        kind: "snapshot",
      }),
    });
    expect(snap.snapshot!.context.athleteId).toBe("athlete:1");
    expect(snap.package!.decisionEngineContext).not.toBeNull();
  });
});
`,
);

write(
  "__tests__/regression.test.ts",
  `import { buildUnifiedContext } from "../application";
import {
  createContextRequest,
  createTestContextFusionService,
} from "../testSupport/fixtures";

describe("context-fusion regression", () => {
  it("does not mutate prior context when merging", () => {
    const service = createTestContextFusionService();
    const built = buildUnifiedContext({
      service,
      request: createContextRequest(),
    });
    const beforeRevision = built.context!.version.revision;
    const beforeSources = built.context!.sources.length;
    const merged = buildUnifiedContext({
      service,
      request: createContextRequest({
        id: "request:reg:build2",
        contextId: "context:athlete:2",
      }),
    });
    expect(built.context!.version.revision).toBe(beforeRevision);
    expect(built.context!.sources.length).toBe(beforeSources);
    expect(merged.success).toBe(true);
    expect(Object.isFrozen(built.context)).toBe(true);
    expect(Object.isFrozen(merged.context)).toBe(true);
  });

  it("exposes only fusion concerns in public descriptor", () => {
    const service = createTestContextFusionService();
    const caps = service.describeContext();
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "buildUnifiedContext",
        "mergeContexts",
        "validateUnifiedContext",
        "describeContext",
        "createContextSnapshot",
      ]),
    );
    expect(caps.capabilities.join(" ")).not.toMatch(/openai|prompt|persist/i);
  });
});
`,
);

console.log("generate-context-fusion-part4.mjs: fusion/services/application/tests written");
