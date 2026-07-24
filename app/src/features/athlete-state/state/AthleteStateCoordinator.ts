import { buildEmptyAthleteState, buildAthleteStateDescriptor } from "../builders/AthleteStateBuilder";
import { buildAthleteStateResult } from "../builders/ResultBuilder";
import { buildAthleteSnapshot } from "../builders/SnapshotBuilder";
import { buildStateSummary } from "../builders/SummaryBuilder";
import { buildCoachSupervisorContext } from "../builders/SupervisorContextBuilder";
import type { CoachingSessionPort } from "../contracts/CoachingSessionPort";
import type { GoalAgentPort } from "../contracts/GoalAgentPort";
import type { NutritionAgentPort } from "../contracts/NutritionAgentPort";
import type { RecoveryAgentPort } from "../contracts/RecoveryAgentPort";
import type { WorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import {
  createStateEvolutionEngine,
  type StateEvolutionEngine,
} from "../evolution/StateEvolutionEngine";
import { createStateError } from "../models/StateError";
import {
  AthleteStateOperationKinds,
  type AthleteStateResult,
} from "../models/AthleteStateResult";
import type { AthleteStateRequest } from "../models/AthleteStateRequest";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { StateChangeKinds } from "../models/StateChange";
import { EMPTY_STATE_VALIDATION } from "../models/StateValidation";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyIntegrityPolicy } from "../policies/IntegrityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { applySnapshotPolicy } from "../policies/SnapshotPolicy";
import { applyTransitionPolicy } from "../policies/TransitionPolicy";
import { applyVersionPolicy } from "../policies/VersionPolicy";
import {
  freezeRequest,
  freezeState,
} from "../utils/FreezeAthleteState";
import { validateAthleteStateFull } from "../validators/validateAthleteState";
import {
  createAthleteStateManager,
  type AthleteStateManager,
} from "./AthleteStateManager";

export interface AthleteStateCoordinatorDeps {
  readonly workoutPort?: WorkoutAgentPort;
  readonly nutritionPort?: NutritionAgentPort;
  readonly recoveryPort?: RecoveryAgentPort;
  readonly goalPort?: GoalAgentPort;
  readonly sessionPort?: CoachingSessionPort;
  readonly clock?: () => string;
  readonly runtimeId?: string;
}

/**
 * Coordinates immutable athlete state orchestration.
 * No business calculations. No AI. No persistence.
 */
export class AthleteStateCoordinator {
  private readonly manager: AthleteStateManager;
  private readonly evolution: StateEvolutionEngine;
  private readonly clock: () => string;
  private readonly runtimeId: string;
  private readonly workoutPort: WorkoutAgentPort | null;
  private readonly nutritionPort: NutritionAgentPort | null;
  private readonly recoveryPort: RecoveryAgentPort | null;
  private readonly goalPort: GoalAgentPort | null;
  private readonly sessionPort: CoachingSessionPort | null;
  private sequence = 0;

  constructor(deps: AthleteStateCoordinatorDeps = {}) {
    this.manager = createAthleteStateManager();
    this.evolution = createStateEvolutionEngine();
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:athlete-state";
    this.workoutPort = deps.workoutPort ?? null;
    this.nutritionPort = deps.nutritionPort ?? null;
    this.recoveryPort = deps.recoveryPort ?? null;
    this.goalPort = deps.goalPort ?? null;
    this.sessionPort = deps.sessionPort ?? null;
  }

  describe(): AthleteStateResult {
    const now = this.clock();
    return buildAthleteStateResult({
      id: `result:describe:${++this.sequence}`,
      operation: AthleteStateOperationKinds.DESCRIBE,
      success: true,
      message: "Athlete State Engine capabilities.",
      descriptor: buildAthleteStateDescriptor({
        id: this.runtimeId,
        createdAt: now,
      }),
      startedAt: now,
      completedAt: now,
    });
  }

  validate(request: AthleteStateRequest): AthleteStateResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    const existing = this.manager.getState(frozen.athleteId);
    const validation = existing
      ? validateAthleteStateFull(existing)
      : Object.freeze({
          valid: Boolean(frozen.athleteId),
          issues: frozen.athleteId
            ? Object.freeze([])
            : Object.freeze([
                {
                  code: "missing_state",
                  message: "athleteId is required.",
                  path: "athleteId",
                },
              ]),
        });
    const completedAt = this.clock();
    return buildAthleteStateResult({
      id: `result:validate:${++this.sequence}`,
      operation: AthleteStateOperationKinds.VALIDATE,
      success: validation.valid,
      message: validation.valid
        ? "Athlete state validation passed."
        : "Athlete state validation failed.",
      athleteId: frozen.athleteId,
      state: existing,
      validation,
      error: validation.valid
        ? null
        : createStateError({
            code: validation.issues[0]!.code,
            message: validation.issues[0]!.message,
            path: validation.issues[0]!.path,
          }),
      startedAt,
      completedAt,
    });
  }

  build(request: AthleteStateRequest): AthleteStateResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    if (!frozen.athleteId) {
      return this.fail({
        operation: AthleteStateOperationKinds.BUILD,
        request: frozen,
        message: "athleteId is required.",
        startedAt,
      });
    }
    if (this.manager.getState(frozen.athleteId)) {
      return this.fail({
        operation: AthleteStateOperationKinds.BUILD,
        request: frozen,
        message: "Athlete state already exists; use update.",
        startedAt,
      });
    }

    const contributions = this.resolveContributions(frozen);
    const transition = applyTransitionPolicy({
      current: null,
      contributions,
    });
    if (!transition.valid) {
      return this.fail({
        operation: AthleteStateOperationKinds.BUILD,
        request: frozen,
        message: "Invalid build transition.",
        validation: transition,
        startedAt,
      });
    }

    const empty = buildEmptyAthleteState({
      id: frozen.stateId ?? `state:${frozen.athleteId}`,
      athleteId: frozen.athleteId,
      at: startedAt,
    });
    const evolved =
      contributions.length > 0
        ? this.evolution.evolve({
            state: empty,
            contributions,
            kind: StateChangeKinds.BUILD,
            at: startedAt,
          })
        : freezeState({
            ...empty,
            summary: buildStateSummary({ state: empty, createdAt: startedAt }),
          });

    const policies = this.runPolicies(evolved);
    if (!policies.valid) {
      return this.fail({
        operation: AthleteStateOperationKinds.BUILD,
        request: frozen,
        message: "Built state failed policy checks.",
        validation: policies,
        state: evolved,
        startedAt,
      });
    }

    this.manager.put(evolved);
    const summary = evolved.summary;
    const supervisorContext = buildCoachSupervisorContext({
      state: evolved,
      summary,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildAthleteStateResult({
      id: `result:build:${++this.sequence}`,
      operation: AthleteStateOperationKinds.BUILD,
      success: true,
      message: "Athlete state built.",
      athleteId: evolved.athleteId,
      state: evolved,
      summary,
      supervisorContext,
      validation: EMPTY_STATE_VALIDATION,
      startedAt,
      completedAt,
    });
  }

  update(request: AthleteStateRequest): AthleteStateResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    const existing = this.manager.getState(frozen.athleteId);
    if (!existing) {
      return this.fail({
        operation: AthleteStateOperationKinds.UPDATE,
        request: frozen,
        message: "Athlete state not found; build first.",
        startedAt,
      });
    }

    const contributions = this.resolveContributions(frozen);
    const transition = applyTransitionPolicy({
      current: existing,
      contributions,
    });
    if (!transition.valid) {
      return this.fail({
        operation: AthleteStateOperationKinds.UPDATE,
        request: frozen,
        message: "Invalid update transition.",
        validation: transition,
        state: existing,
        startedAt,
      });
    }

    const evolved = this.evolution.evolve({
      state: existing,
      contributions,
      kind: StateChangeKinds.UPDATE,
      at: startedAt,
    });
    const policies = this.runPolicies(evolved);
    if (!policies.valid) {
      return this.fail({
        operation: AthleteStateOperationKinds.UPDATE,
        request: frozen,
        message: "Updated state failed policy checks.",
        validation: policies,
        state: evolved,
        startedAt,
      });
    }

    this.manager.put(evolved);
    const summary = evolved.summary;
    const supervisorContext = buildCoachSupervisorContext({
      state: evolved,
      summary,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildAthleteStateResult({
      id: `result:update:${++this.sequence}`,
      operation: AthleteStateOperationKinds.UPDATE,
      success: true,
      message: "Athlete state updated.",
      athleteId: evolved.athleteId,
      state: evolved,
      summary,
      supervisorContext,
      validation: EMPTY_STATE_VALIDATION,
      startedAt,
      completedAt,
    });
  }

  snapshot(request: AthleteStateRequest): AthleteStateResult {
    const startedAt = this.clock();
    const frozen = freezeRequest(request);
    const existing = this.manager.getState(frozen.athleteId);
    if (!existing) {
      return this.fail({
        operation: AthleteStateOperationKinds.SNAPSHOT,
        request: frozen,
        message: "Athlete state not found.",
        startedAt,
      });
    }
    const summary = buildStateSummary({
      state: existing,
      createdAt: startedAt,
    });
    const snapshot = buildAthleteSnapshot({
      id: `snapshot:${frozen.athleteId}:${++this.sequence}`,
      state: existing,
      summary,
      timeline: existing.timeline,
      createdAt: startedAt,
    });
    const snapshotValidation = applySnapshotPolicy(snapshot);
    if (!snapshotValidation.valid) {
      return this.fail({
        operation: AthleteStateOperationKinds.SNAPSHOT,
        request: frozen,
        message: "Snapshot validation failed.",
        validation: snapshotValidation,
        state: existing,
        startedAt,
      });
    }
    const withCount = freezeState({
      ...existing,
      statistics: Object.freeze({
        ...existing.statistics,
        snapshotCount: existing.statistics.snapshotCount + 1,
      }),
      updatedAt: startedAt,
      frozenAt: startedAt,
    });
    this.manager.put(withCount);
    this.manager.addSnapshot(frozen.athleteId, snapshot);
    const supervisorContext = buildCoachSupervisorContext({
      state: withCount,
      snapshot,
      summary,
      createdAt: startedAt,
    });
    const completedAt = this.clock();
    return buildAthleteStateResult({
      id: `result:snapshot:${this.sequence}`,
      operation: AthleteStateOperationKinds.SNAPSHOT,
      success: true,
      message: "Athlete snapshot created.",
      athleteId: withCount.athleteId,
      state: withCount,
      snapshot,
      summary,
      supervisorContext,
      validation: EMPTY_STATE_VALIDATION,
      startedAt,
      completedAt,
    });
  }

  getManager(): AthleteStateManager {
    return this.manager;
  }

  private resolveContributions(
    request: AthleteStateRequest,
  ): readonly SpecialistContribution[] {
    const collected: SpecialistContribution[] = [...request.contributions];
    const at = request.createdAt;
    const athleteId = request.athleteId;
    if (this.workoutPort) {
      const c = this.workoutPort.contribute({ athleteId, at });
      if (c) collected.push(c);
    }
    if (this.nutritionPort) {
      const c = this.nutritionPort.contribute({ athleteId, at });
      if (c) collected.push(c);
    }
    if (this.recoveryPort) {
      const c = this.recoveryPort.contribute({ athleteId, at });
      if (c) collected.push(c);
    }
    if (this.goalPort) {
      const c = this.goalPort.contribute({ athleteId, at });
      if (c) collected.push(c);
    }
    if (this.sessionPort) {
      const c = this.sessionPort.contribute({
        athleteId,
        sessionId: request.sessionId,
        intent: request.reason,
        at,
      });
      if (c) collected.push(c);
    }
    return Object.freeze(collected);
  }

  private runPolicies(state: ReturnType<typeof freezeState>) {
    const issues = [
      ...applyIntegrityPolicy(state).issues,
      ...applyVersionPolicy(state).issues,
      ...applyConsistencyPolicy(state).issues,
      ...applySafetyPolicy(state).issues,
    ];
    return Object.freeze({
      valid: issues.length === 0,
      issues: Object.freeze(issues),
    });
  }

  private fail(input: {
    readonly operation: AthleteStateResult["operation"];
    readonly request: AthleteStateRequest;
    readonly message: string;
    readonly validation?: AthleteStateResult["validation"];
    readonly state?: AthleteStateResult["state"];
    readonly startedAt: string;
  }): AthleteStateResult {
    const validation =
      input.validation ??
      Object.freeze({
        valid: false,
        issues: Object.freeze([
          {
            code: "operation_failed",
            message: input.message,
            path: null,
          },
        ]),
      });
    const completedAt = this.clock();
    return buildAthleteStateResult({
      id: `result:fail:${++this.sequence}`,
      operation: input.operation,
      success: false,
      message: input.message,
      athleteId: input.request.athleteId,
      state: input.state ?? null,
      validation,
      error: createStateError({
        code: validation.issues[0]?.code ?? "operation_failed",
        message: input.message,
        path: validation.issues[0]?.path ?? null,
      }),
      startedAt: input.startedAt,
      completedAt,
    });
  }
}

export function createAthleteStateCoordinator(
  deps: AthleteStateCoordinatorDeps = {},
): AthleteStateCoordinator {
  return new AthleteStateCoordinator(deps);
}
