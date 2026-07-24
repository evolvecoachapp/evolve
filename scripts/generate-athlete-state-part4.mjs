/**
 * Sprint 22.1 — Athlete State Engine generator part 4
 * (validators, policies, selectors, state, services, application).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/athlete-state");

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
}

write(
  "validators/validateStateIntegrity.ts",
  `import type { AthleteState } from "../models/AthleteState";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateStateIntegrity(
  state: AthleteState,
): StateValidation {
  const issues = [];
  if (!state.id) {
    issues.push({
      code: StateValidationCodes.INTEGRITY_VIOLATION,
      message: "State id is required.",
      path: "id",
    });
  }
  if (!state.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_IDENTITY,
      message: "athleteId is required.",
      path: "athleteId",
    });
  }
  if (state.identity.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.INTEGRITY_VIOLATION,
      message: "identity.athleteId must match athleteId.",
      path: "identity.athleteId",
    });
  }
  if (state.profile.identity.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.INTEGRITY_VIOLATION,
      message: "profile.identity.athleteId must match athleteId.",
      path: "profile.identity.athleteId",
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
  `import type { AthleteState } from "../models/AthleteState";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";
import { isVersionNonNegative } from "../utils/VersionHelpers";

export function validateVersionConsistency(
  state: AthleteState,
): StateValidation {
  const issues = [];
  if (!isVersionNonNegative(state.version)) {
    issues.push({
      code: StateValidationCodes.INVALID_VERSION,
      message: "Version components must be non-negative.",
      path: "version",
    });
  }
  if (state.summary && state.summary.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_VERSION,
      message: "Summary athleteId mismatch.",
      path: "summary.athleteId",
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
  "validators/validateTimelineConsistency.ts",
  `import type { AthleteTimeline } from "../models/AthleteTimeline";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateTimelineConsistency(input: {
  readonly athleteId: string;
  readonly timeline: AthleteTimeline;
}): StateValidation {
  const issues = [];
  if (input.timeline.athleteId !== input.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_TIMELINE,
      message: "Timeline athleteId mismatch.",
      path: "timeline.athleteId",
    });
  }
  let prev = 0;
  for (const item of input.timeline.items) {
    if (item.sequence <= prev) {
      issues.push({
        code: StateValidationCodes.INVALID_TIMELINE,
        message: "Timeline sequence must be strictly increasing.",
        path: \`timeline.items[\${item.id}].sequence\`,
      });
      break;
    }
    prev = item.sequence;
  }
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateSnapshot.ts",
  `import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateSnapshot(snapshot: AthleteSnapshot): StateValidation {
  const issues = [];
  if (!snapshot.id) {
    issues.push({
      code: StateValidationCodes.INVALID_SNAPSHOT,
      message: "Snapshot id is required.",
      path: "id",
    });
  }
  if (snapshot.athleteId !== snapshot.state.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_SNAPSHOT,
      message: "Snapshot athleteId must match state.athleteId.",
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
  "validators/validateMeasurements.ts",
  `import type { BodyMeasurements } from "../models/BodyMeasurements";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateMeasurements(
  measurements: BodyMeasurements,
): StateValidation {
  const issues = [];
  const check = (value: number | null, path: string) => {
    if (value != null && value < 0) {
      issues.push({
        code: StateValidationCodes.INVALID_MEASUREMENTS,
        message: \`\${path} must not be negative.\`,
        path,
      });
    }
  };
  check(measurements.heightCm, "bodyMeasurements.heightCm");
  check(measurements.weightKg, "bodyMeasurements.weightKg");
  check(measurements.waistCm, "bodyMeasurements.waistCm");
  check(measurements.chestCm, "bodyMeasurements.chestCm");
  check(measurements.hipsCm, "bodyMeasurements.hipsCm");
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/validateGoals.ts",
  `import type { AthleteGoals } from "../models/AthleteGoals";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateGoals(goals: AthleteGoals): StateValidation {
  const issues = [];
  const ids = new Set<string>();
  for (const item of goals.items) {
    if (!item.id || !item.title) {
      issues.push({
        code: StateValidationCodes.INVALID_GOALS,
        message: "Goal id and title are required.",
        path: "goals.items",
      });
    }
    if (ids.has(item.id)) {
      issues.push({
        code: StateValidationCodes.INVALID_GOALS,
        message: \`Duplicate goal id: \${item.id}\`,
        path: "goals.items",
      });
    }
    ids.add(item.id);
  }
  if (
    goals.primaryGoalId &&
    goals.items.length > 0 &&
    !ids.has(goals.primaryGoalId)
  ) {
    issues.push({
      code: StateValidationCodes.INVALID_GOALS,
      message: "primaryGoalId must reference an item.",
      path: "goals.primaryGoalId",
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
  "validators/validatePreferences.ts",
  `import type { AthletePreferences } from "../models/AthletePreferences";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validatePreferences(
  preferences: AthletePreferences,
): StateValidation {
  const issues = [];
  if (!Array.isArray(preferences.preferredTrainingTimes)) {
    issues.push({
      code: StateValidationCodes.INVALID_PREFERENCES,
      message: "preferredTrainingTimes must be an array.",
      path: "preferences.preferredTrainingTimes",
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
  "validators/validateHistory.ts",
  `import type { AthleteHistory } from "../models/AthleteHistory";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateHistory(input: {
  readonly athleteId: string;
  readonly history: AthleteHistory;
}): StateValidation {
  const issues = [];
  if (input.history.athleteId !== input.athleteId) {
    issues.push({
      code: StateValidationCodes.INVALID_HISTORY,
      message: "History athleteId mismatch.",
      path: "history.athleteId",
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
  "validators/validateTransitions.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function validateTransitions(input: {
  readonly current: AthleteState | null;
  readonly contributions: readonly SpecialistContribution[];
}): StateValidation {
  const issues = [];
  for (const c of input.contributions) {
    if (input.current && c.athleteId !== input.current.athleteId) {
      issues.push({
        code: StateValidationCodes.INVALID_TRANSITION,
        message: "Contribution athleteId mismatch.",
        path: \`contributions[\${c.id}].athleteId\`,
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
  "validators/validateAthleteState.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { StateValidation } from "../models/StateValidation";
import { validateGoals } from "./validateGoals";
import { validateHistory } from "./validateHistory";
import { validateMeasurements } from "./validateMeasurements";
import { validatePreferences } from "./validatePreferences";
import { validateStateIntegrity } from "./validateStateIntegrity";
import { validateTimelineConsistency } from "./validateTimelineConsistency";
import { validateVersionConsistency } from "./validateVersionConsistency";

export function validateAthleteStateFull(
  state: AthleteState,
): StateValidation {
  const issues = [
    ...validateStateIntegrity(state).issues,
    ...validateVersionConsistency(state).issues,
    ...validateTimelineConsistency({
      athleteId: state.athleteId,
      timeline: state.timeline,
    }).issues,
    ...validateMeasurements(state.bodyMeasurements).issues,
    ...validateGoals(state.goals).issues,
    ...validatePreferences(state.preferences).issues,
    ...validateHistory({
      athleteId: state.athleteId,
      history: state.history,
    }).issues,
  ];
  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
`,
);

write(
  "validators/index.ts",
  `export * from "./validateStateIntegrity";
export * from "./validateVersionConsistency";
export * from "./validateTimelineConsistency";
export * from "./validateSnapshot";
export * from "./validateMeasurements";
export * from "./validateGoals";
export * from "./validatePreferences";
export * from "./validateHistory";
export * from "./validateTransitions";
export * from "./validateAthleteState";
`,
);

// Policies
write(
  "policies/IntegrityPolicy.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { StateValidation } from "../models/StateValidation";
import { validateStateIntegrity } from "../validators/validateStateIntegrity";

export function applyIntegrityPolicy(state: AthleteState): StateValidation {
  return validateStateIntegrity(state);
}
`,
);

write(
  "policies/TransitionPolicy.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import type { StateValidation } from "../models/StateValidation";
import { validateTransitions } from "../validators/validateTransitions";

export function applyTransitionPolicy(input: {
  readonly current: AthleteState | null;
  readonly contributions: readonly SpecialistContribution[];
}): StateValidation {
  return validateTransitions(input);
}
`,
);

write(
  "policies/ConsistencyPolicy.ts",
  `import type { AthleteState } from "../models/AthleteState";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

export function applyConsistencyPolicy(state: AthleteState): StateValidation {
  const issues = [];
  if (state.history.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.CONSISTENCY_VIOLATION,
      message: "History athleteId inconsistency.",
      path: "history.athleteId",
    });
  }
  if (state.timeline.athleteId !== state.athleteId) {
    issues.push({
      code: StateValidationCodes.CONSISTENCY_VIOLATION,
      message: "Timeline athleteId inconsistency.",
      path: "timeline.athleteId",
    });
  }
  if (state.statistics.goalCount !== state.goals.items.length) {
    issues.push({
      code: StateValidationCodes.CONSISTENCY_VIOLATION,
      message: "statistics.goalCount does not match goals.items length.",
      path: "statistics.goalCount",
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
  "policies/VersionPolicy.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { StateValidation } from "../models/StateValidation";
import { validateVersionConsistency } from "../validators/validateVersionConsistency";

export function applyVersionPolicy(state: AthleteState): StateValidation {
  return validateVersionConsistency(state);
}
`,
);

write(
  "policies/SnapshotPolicy.ts",
  `import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { StateValidation } from "../models/StateValidation";
import { validateSnapshot } from "../validators/validateSnapshot";

export function applySnapshotPolicy(
  snapshot: AthleteSnapshot,
): StateValidation {
  return validateSnapshot(snapshot);
}
`,
);

write(
  "policies/SafetyPolicy.ts",
  `import type { AthleteState } from "../models/AthleteState";
import {
  StateValidationCodes,
  type StateValidation,
} from "../models/StateValidation";

/**
 * Deterministic safety checks on represented flags only (no inference).
 */
export function applySafetyPolicy(state: AthleteState): StateValidation {
  const issues = [];
  for (const flag of state.constraints.medicalFlags) {
    if (!flag || flag.trim().length === 0) {
      issues.push({
        code: StateValidationCodes.SAFETY_VIOLATION,
        message: "Empty medical flag is not allowed.",
        path: "constraints.medicalFlags",
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
  "policies/index.ts",
  `export * from "./IntegrityPolicy";
export * from "./TransitionPolicy";
export * from "./ConsistencyPolicy";
export * from "./VersionPolicy";
export * from "./SnapshotPolicy";
export * from "./SafetyPolicy";
`,
);

// Selectors
write(
  "selectors/MetricSelector.ts",
  `import type { AthleteMetrics } from "../models/AthleteMetrics";
import type { AthleteState } from "../models/AthleteState";

export function selectMetrics(state: AthleteState): AthleteMetrics {
  return state.metrics;
}

export function selectWeightKg(state: AthleteState): number | null {
  return state.bodyMeasurements.weightKg;
}
`,
);

write(
  "selectors/StateSelector.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { TrainingState } from "../models/TrainingState";
import type { RecoveryState } from "../models/RecoveryState";
import type { NutritionState } from "../models/NutritionState";

export function selectTraining(state: AthleteState): TrainingState {
  return state.training;
}

export function selectRecovery(state: AthleteState): RecoveryState {
  return state.recovery;
}

export function selectNutrition(state: AthleteState): NutritionState {
  return state.nutrition;
}
`,
);

write(
  "selectors/HistorySelector.ts",
  `import type { AthleteHistory } from "../models/AthleteHistory";
import type { AthleteState } from "../models/AthleteState";

export function selectHistory(state: AthleteState): AthleteHistory {
  return state.history;
}

export function selectLatestHistoryEntry(state: AthleteState) {
  return state.history.entries[state.history.entries.length - 1] ?? null;
}
`,
);

write(
  "selectors/GoalSelector.ts",
  `import type { AthleteGoalItem, AthleteGoals } from "../models/AthleteGoals";
import type { AthleteState } from "../models/AthleteState";

export function selectGoals(state: AthleteState): AthleteGoals {
  return state.goals;
}

export function selectPrimaryGoal(
  state: AthleteState,
): AthleteGoalItem | null {
  const id = state.goals.primaryGoalId;
  if (!id) return null;
  return state.goals.items.find((g) => g.id === id) ?? null;
}
`,
);

write(
  "selectors/SnapshotSelector.ts",
  `import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { StateVersion } from "../models/StateVersion";
import { versionsEqual } from "../utils/VersionHelpers";

export function selectSnapshotByVersion(
  snapshots: readonly AthleteSnapshot[],
  version: StateVersion,
): AthleteSnapshot | null {
  return snapshots.find((s) => versionsEqual(s.version, version)) ?? null;
}

export function selectLatestSnapshot(
  snapshots: readonly AthleteSnapshot[],
): AthleteSnapshot | null {
  return snapshots[snapshots.length - 1] ?? null;
}
`,
);

write(
  "selectors/TimelineSelector.ts",
  `import type { AthleteState } from "../models/AthleteState";
import type { AthleteTimeline, AthleteTimelineItem } from "../models/AthleteTimeline";

export function selectTimeline(state: AthleteState): AthleteTimeline {
  return state.timeline;
}

export function selectLatestTimelineItem(
  state: AthleteState,
): AthleteTimelineItem | null {
  return state.timeline.items[state.timeline.items.length - 1] ?? null;
}
`,
);

write(
  "selectors/index.ts",
  `export * from "./MetricSelector";
export * from "./StateSelector";
export * from "./HistorySelector";
export * from "./GoalSelector";
export * from "./SnapshotSelector";
export * from "./TimelineSelector";
`,
);

// State orchestration
write(
  "state/AthleteStateSession.ts",
  `import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";

/**
 * In-memory session handle for a single athlete's state (no persistence).
 */
export interface AthleteStateSession {
  readonly athleteId: string;
  readonly state: AthleteState;
  readonly snapshots: readonly AthleteSnapshot[];
}

export function createAthleteStateSession(input: {
  readonly state: AthleteState;
  readonly snapshots?: readonly AthleteSnapshot[];
}): AthleteStateSession {
  return Object.freeze({
    athleteId: input.state.athleteId,
    state: input.state,
    snapshots: Object.freeze([...(input.snapshots ?? [])]),
  });
}
`,
);

write(
  "state/AthleteStateManager.ts",
  `import type { AthleteSnapshot } from "../models/AthleteSnapshot";
import type { AthleteState } from "../models/AthleteState";
import {
  createAthleteStateSession,
  type AthleteStateSession,
} from "./AthleteStateSession";

/**
 * In-memory registry of athlete states (no persistence).
 */
export class AthleteStateManager {
  private readonly sessions = new Map<string, AthleteStateSession>();

  get(athleteId: string): AthleteStateSession | null {
    return this.sessions.get(athleteId) ?? null;
  }

  getState(athleteId: string): AthleteState | null {
    return this.get(athleteId)?.state ?? null;
  }

  put(state: AthleteState): AthleteStateSession {
    const existing = this.sessions.get(state.athleteId);
    const session = createAthleteStateSession({
      state,
      snapshots: existing?.snapshots ?? [],
    });
    this.sessions.set(state.athleteId, session);
    return session;
  }

  addSnapshot(
    athleteId: string,
    snapshot: AthleteSnapshot,
  ): AthleteStateSession | null {
    const existing = this.sessions.get(athleteId);
    if (!existing) return null;
    const session = createAthleteStateSession({
      state: existing.state,
      snapshots: [...existing.snapshots, snapshot],
    });
    this.sessions.set(athleteId, session);
    return session;
  }

  listAthleteIds(): readonly string[] {
    return Object.freeze([...this.sessions.keys()]);
  }
}

export function createAthleteStateManager(): AthleteStateManager {
  return new AthleteStateManager();
}
`,
);

write(
  "state/AthleteStateCoordinator.ts",
  `import { buildEmptyAthleteState, buildAthleteStateDescriptor } from "../builders/AthleteStateBuilder";
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
      id: \`result:describe:\${++this.sequence}\`,
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
      id: \`result:validate:\${++this.sequence}\`,
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
      id: frozen.stateId ?? \`state:\${frozen.athleteId}\`,
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
      id: \`result:build:\${++this.sequence}\`,
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
      id: \`result:update:\${++this.sequence}\`,
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
      id: \`snapshot:\${frozen.athleteId}:\${++this.sequence}\`,
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
      id: \`result:snapshot:\${this.sequence}\`,
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
      id: \`result:fail:\${++this.sequence}\`,
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
`,
);

write(
  "state/AthleteStateEngine.ts",
  `import { buildAthleteStateDescriptor } from "../builders/AthleteStateBuilder";
import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type { AthleteStateRequest } from "../models/AthleteStateRequest";
import type { AthleteStateResult } from "../models/AthleteStateResult";
import {
  createAthleteStateCoordinator,
  type AthleteStateCoordinator,
  type AthleteStateCoordinatorDeps,
} from "./AthleteStateCoordinator";

export type AthleteStateEngineDeps = AthleteStateCoordinatorDeps;

/**
 * Athlete State Engine — immutable state orchestration only.
 */
export class AthleteStateEngine {
  private readonly coordinator: AthleteStateCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: AthleteStateEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:athlete-state";
    this.coordinator = createAthleteStateCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): AthleteStateDescriptor {
    return buildAthleteStateDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  buildAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.coordinator.build(request);
  }

  updateAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.coordinator.update(request);
  }

  createSnapshot(request: AthleteStateRequest): AthleteStateResult {
    return this.coordinator.snapshot(request);
  }

  describeAthleteState(): AthleteStateResult {
    return this.coordinator.describe();
  }

  validateAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.coordinator.validate(request);
  }

  getCoordinator(): AthleteStateCoordinator {
    return this.coordinator;
  }
}

export function createAthleteStateEngine(
  deps: AthleteStateEngineDeps = {},
): AthleteStateEngine {
  return new AthleteStateEngine(deps);
}
`,
);

write(
  "state/index.ts",
  `export * from "./AthleteStateSession";
export * from "./AthleteStateManager";
export * from "./AthleteStateCoordinator";
export * from "./AthleteStateEngine";
`,
);

write(
  "services/AthleteStateService.ts",
  `import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type { AthleteStateRequest } from "../models/AthleteStateRequest";
import type { AthleteStateResult } from "../models/AthleteStateResult";
import {
  createAthleteStateEngine,
  type AthleteStateEngine,
  type AthleteStateEngineDeps,
} from "../state/AthleteStateEngine";

export type AthleteStateServiceDeps = AthleteStateEngineDeps;

/**
 * Athlete State Service — state orchestration facade.
 *
 * Specialist Agents → Athlete State Engine → Coach Supervisor Context
 *
 * No networking. No persistence. No provider SDKs. No AI. No calculations.
 */
export class AthleteStateService {
  private readonly engine: AthleteStateEngine;

  constructor(deps: AthleteStateServiceDeps = {}) {
    this.engine = createAthleteStateEngine(deps);
  }

  buildAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.engine.buildAthleteState(request);
  }

  updateAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.engine.updateAthleteState(request);
  }

  createSnapshot(request: AthleteStateRequest): AthleteStateResult {
    return this.engine.createSnapshot(request);
  }

  describeAthleteState(): AthleteStateDescriptor {
    return this.engine.describe();
  }

  validateAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.engine.validateAthleteState(request);
  }
}

export function createAthleteStateService(
  deps: AthleteStateServiceDeps = {},
): AthleteStateService {
  return new AthleteStateService(deps);
}
`,
);

write(
  "services/index.ts",
  `export * from "./AthleteStateService";
`,
);

write(
  "application/index.ts",
  `import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type { AthleteStateRequest } from "../models/AthleteStateRequest";
import type { AthleteStateResult } from "../models/AthleteStateResult";
import {
  createAthleteStateService,
  type AthleteStateService,
  type AthleteStateServiceDeps,
} from "../services/AthleteStateService";

function resolveService(
  service?: AthleteStateService,
  deps?: AthleteStateServiceDeps,
): AthleteStateService {
  return service ?? createAthleteStateService(deps);
}

/**
 * Public API — build immutable athlete state.
 */
export function buildAthleteState(options: {
  readonly request: AthleteStateRequest;
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
}): AthleteStateResult {
  return resolveService(options.service, options.deps).buildAthleteState(
    options.request,
  );
}

/**
 * Public API — update immutable athlete state from contributions.
 */
export function updateAthleteState(options: {
  readonly request: AthleteStateRequest;
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
}): AthleteStateResult {
  return resolveService(options.service, options.deps).updateAthleteState(
    options.request,
  );
}

/**
 * Public API — create an athlete state snapshot.
 */
export function createSnapshot(options: {
  readonly request: AthleteStateRequest;
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
}): AthleteStateResult {
  return resolveService(options.service, options.deps).createSnapshot(
    options.request,
  );
}

/**
 * Public API — describe Athlete State Engine capabilities.
 */
export function describeAthleteState(options: {
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
} = {}): AthleteStateDescriptor {
  return resolveService(options.service, options.deps).describeAthleteState();
}

/**
 * Public API — validate athlete state.
 */
export function validateAthleteState(options: {
  readonly request: AthleteStateRequest;
  readonly service?: AthleteStateService;
  readonly deps?: AthleteStateServiceDeps;
}): AthleteStateResult {
  return resolveService(options.service, options.deps).validateAthleteState(
    options.request,
  );
}

export type { AthleteStateServiceDeps };
`,
);

write(
  "index.ts",
  `/**
 * Athlete State Engine
 *
 * Sprint 22.1 — Athlete State Engine Foundation.
 *
 * Workout Agent
 * Nutrition Agent
 * Recovery Agent
 * Goal Agent
 *   ↓
 * Athlete State Engine
 *   ↓
 * Coach Supervisor
 *   ↓
 * Unified Coach Response
 *
 * Single immutable source of truth for athlete state representation.
 * Owns aggregation + deterministic evolution only.
 *
 * No AI. No calculations. No persistence. No networking. No UI.
 */

export * from "./models";
export {
  buildAthleteState,
  updateAthleteState,
  createSnapshot,
  describeAthleteState,
  validateAthleteState,
} from "./application";
export {
  AthleteStateService,
  createAthleteStateService,
} from "./services";
`,
);

console.log("Part 4 (validators/policies/selectors/state/services/app) written");
