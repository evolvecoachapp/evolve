import { aggregateContextSlices } from "../aggregation/ContextAggregator";
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
      id: `result:describe:${++this.sequence}`,
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
      id: `result:validate:${++this.sequence}`,
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
      id: frozen.contextId ?? `context:${frozen.athleteId}`,
      athleteId: frozen.athleteId,
      sessionId: frozen.sessionId,
      conversationId: frozen.conversationId,
      at: startedAt,
    });

    const fused = this.fuse({
      base: empty,
      contributions,
      at: startedAt,
      mergeId: `merge:build:${++this.sequence}`,
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
      id: `decision-ctx:${fused.id}`,
      context: fused,
      summary,
      createdAt: startedAt,
    });
    const pkg = buildContextPackage({
      id: `package:${fused.id}`,
      context: fused,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildContextResult({
      id: `result:build:${this.sequence}`,
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
      mergeId: `merge:merge:${++this.sequence}`,
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
      id: `decision-ctx:${fused.id}`,
      context: fused,
      summary,
      createdAt: startedAt,
    });
    const pkg = buildContextPackage({
      id: `package:${fused.id}`,
      context: fused,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildContextResult({
      id: `result:merge:${this.sequence}`,
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
      id: `snapshot:${context.id}:${++this.sequence}`,
      context,
      reason: frozen.reason,
      createdAt: startedAt,
    });
    const summary = snap.summary;
    const decisionEngineContext = buildDecisionEngineContext({
      id: `decision-ctx:${context.id}:snap`,
      context,
      summary,
      createdAt: startedAt,
    });
    const pkg = buildContextPackage({
      id: `package:${context.id}:snap`,
      context,
      snapshot: snap,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildContextResult({
      id: `result:snapshot:${this.sequence}`,
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
        resolved.sources.find((s) => s.kind === kind)?.id ?? `source:${kind}`,
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
        id: `timeline:fused:${this.sequence}`,
        kind: ContextTimelineEventKinds.FUSED,
        sourceKind: null,
        label: "context fused",
        at: input.at,
        notes: Object.freeze([
          `sources=${resolved.sources.length}`,
          `conflicts=${resolved.conflicts.length}`,
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
          const match = /Dependency from-source (\w+) is missing/.exec(
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
      id: `result:fail:${++this.sequence}`,
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
