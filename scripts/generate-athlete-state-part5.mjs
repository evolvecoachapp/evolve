/**
 * Sprint 22.1 — Athlete State Engine generator part 5 (tests + fixtures).
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
  "testSupport/fixtures.ts",
  `import { createMockCoachingSessionPort } from "../contracts/CoachingSessionPort";
import { createMockGoalAgentPort } from "../contracts/GoalAgentPort";
import { createMockNutritionAgentPort } from "../contracts/NutritionAgentPort";
import { createMockRecoveryAgentPort } from "../contracts/RecoveryAgentPort";
import { createMockWorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import { EMPTY_ATHLETE_METADATA } from "../models/AthleteMetadata";
import {
  AthleteStateRequestKinds,
  type AthleteStateRequest,
} from "../models/AthleteStateRequest";
import {
  createAthleteStateService,
  type AthleteStateService,
} from "../services/AthleteStateService";
import { freezeRequest } from "../utils/FreezeAthleteState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createStateRequest(
  overrides: Partial<AthleteStateRequest> = {},
): AthleteStateRequest {
  return freezeRequest({
    id: overrides.id ?? "request:athlete-state:test",
    kind: overrides.kind ?? AthleteStateRequestKinds.BUILD,
    athleteId: overrides.athleteId ?? "athlete:1",
    stateId: overrides.stateId ?? "state:athlete:1",
    contributions: Object.freeze([...(overrides.contributions ?? [])]),
    sessionId: overrides.sessionId ?? "session:coach:1",
    reason: overrides.reason ?? "test build",
    metadata: overrides.metadata ?? EMPTY_ATHLETE_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestAthleteStateService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): AthleteStateService {
  const withMocks = overrides.withMocks ?? true;
  return createAthleteStateService({
    workoutPort: withMocks ? createMockWorkoutAgentPort() : undefined,
    nutritionPort: withMocks ? createMockNutritionAgentPort() : undefined,
    recoveryPort: withMocks ? createMockRecoveryAgentPort() : undefined,
    goalPort: withMocks ? createMockGoalAgentPort() : undefined,
    sessionPort: withMocks ? createMockCoachingSessionPort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
`,
);

write(
  "__tests__/state.test.ts",
  `import { AthleteStatusKinds } from "../models/AthleteStatus";
import { AthleteStateRequestKinds } from "../models/AthleteStateRequest";
import {
  createStateRequest,
  createTestAthleteStateService,
} from "../testSupport/fixtures";

describe("athlete-state state engine", () => {
  it("builds immutable athlete state and stores it in manager", () => {
    const service = createTestAthleteStateService();
    const result = service.buildAthleteState(
      createStateRequest({ kind: AthleteStateRequestKinds.BUILD }),
    );
    expect(result.success).toBe(true);
    expect(result.state).not.toBeNull();
    expect(result.state!.athleteId).toBe("athlete:1");
    expect(Object.isFrozen(result.state)).toBe(true);
    expect(result.state!.status.kind).toBe(AthleteStatusKinds.ACTIVE);
    expect(result.state!.training.focus).toBe("strength");
    expect(result.state!.version.revision).toBeGreaterThanOrEqual(1);
  });

  it("rejects duplicate build for same athlete", () => {
    const service = createTestAthleteStateService();
    const req = createStateRequest();
    expect(service.buildAthleteState(req).success).toBe(true);
    const second = service.buildAthleteState(req);
    expect(second.success).toBe(false);
  });
});
`,
);

write(
  "__tests__/aggregation.test.ts",
  `import { aggregateTraining } from "../aggregation/TrainingAggregator";
import { aggregateGoals } from "../aggregation/GoalAggregator";
import { createMockWorkoutAgentPort } from "../contracts/WorkoutAgentPort";
import { createMockGoalAgentPort } from "../contracts/GoalAgentPort";
import { buildEmptyAthleteState } from "../builders/AthleteStateBuilder";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state aggregation", () => {
  it("aggregates training contribution without calculations", () => {
    const empty = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const contribution = createMockWorkoutAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const training = aggregateTraining({
      current: empty.training,
      contributions: [contribution],
    });
    expect(training.focus).toBe("strength");
    expect(training.sourceAgentIds).toContain("agent:workout");
  });

  it("merges goals by id", () => {
    const empty = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const contribution = createMockGoalAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const goals = aggregateGoals({
      current: empty.goals,
      contributions: [contribution],
    });
    expect(goals.items).toHaveLength(1);
    expect(goals.primaryGoalId).toBe("goal:1");
  });
});
`,
);

write(
  "__tests__/evolution.test.ts",
  `import { buildEmptyAthleteState } from "../builders/AthleteStateBuilder";
  import { createMockRecoveryAgentPort } from "../contracts/RecoveryAgentPort";
  import { createStateEvolutionEngine } from "../evolution/StateEvolutionEngine";
  import { StateChangeKinds } from "../models/StateChange";
  import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state evolution", () => {
  it("bumps revision and appends timeline/history", () => {
    const engine = createStateEvolutionEngine();
    const empty = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const contribution = createMockRecoveryAgentPort().contribute({
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    })!;
    const evolved = engine.evolve({
      state: empty,
      contributions: [contribution],
      kind: StateChangeKinds.UPDATE,
      at: FIXED_TIMESTAMP,
    });
    expect(evolved.version.revision).toBe(1);
    expect(evolved.history.entries).toHaveLength(1);
    expect(evolved.timeline.items).toHaveLength(1);
    expect(evolved.recovery.status).toBe("adequate");
    expect(evolved.summary).not.toBeNull();
  });
});
`,
);

write(
  "__tests__/builders.test.ts",
  `import { buildEmptyAthleteState, buildAthleteStateDescriptor } from "../builders/AthleteStateBuilder";
import { buildAthleteSnapshot } from "../builders/SnapshotBuilder";
import { buildStateSummary } from "../builders/SummaryBuilder";
import { appendTimelineChange, buildEmptyTimeline } from "../builders/TimelineBuilder";
import { trackStateChange } from "../evolution/ChangeTracker";
import { INITIAL_STATE_VERSION } from "../models/StateVersion";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state builders", () => {
  it("builds empty state, summary, snapshot, timeline", () => {
    const state = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(state.version).toEqual(INITIAL_STATE_VERSION);
    expect(Object.isFrozen(state)).toBe(true);

    const summary = buildStateSummary({ state, createdAt: FIXED_TIMESTAMP });
    expect(summary.headline).toContain("athlete:1");

    const snapshot = buildAthleteSnapshot({
      id: "snapshot:1",
      state,
      summary,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(snapshot.athleteId).toBe("athlete:1");

    const change = trackStateChange({
      id: "change:1",
      athleteId: "athlete:1",
      fromVersion: null,
      toVersion: state.version,
      paths: ["profile"],
      summary: "build",
      source: "build",
      changedAt: FIXED_TIMESTAMP,
    });
    const timeline = appendTimelineChange({
      timeline: buildEmptyTimeline("athlete:1"),
      change,
      itemId: "timeline:1",
    });
    expect(timeline.items).toHaveLength(1);

    const descriptor = buildAthleteStateDescriptor({
      id: "runtime:athlete-state",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.name).toBe("Athlete State Engine");
    expect(descriptor.capabilities.length).toBe(5);
  });
});
`,
);

write(
  "__tests__/validators.test.ts",
  `import { buildEmptyAthleteState } from "../builders/AthleteStateBuilder";
import { validateAthleteStateFull } from "../validators/validateAthleteState";
import { validateGoals } from "../validators/validateGoals";
import { validateMeasurements } from "../validators/validateMeasurements";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state validators", () => {
  it("accepts a well-formed empty state", () => {
    const state = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(validateAthleteStateFull(state).valid).toBe(true);
  });

  it("rejects negative measurements", () => {
    const result = validateMeasurements({
      heightCm: -1,
      weightKg: 80,
      waistCm: null,
      chestCm: null,
      hipsCm: null,
      recordedAt: null,
    });
    expect(result.valid).toBe(false);
  });

  it("rejects primaryGoalId without matching item", () => {
    const result = validateGoals({
      primaryGoalId: "missing",
      items: Object.freeze([
        Object.freeze({
          id: "goal:1",
          kind: "strength",
          title: "Squat",
          status: "active",
          targetDate: null,
          notes: Object.freeze([] as string[]),
        }),
      ]),
      sourceAgentIds: Object.freeze([] as string[]),
    });
    expect(result.valid).toBe(false);
  });
});
`,
);

write(
  "__tests__/policies.test.ts",
  `import { buildEmptyAthleteState } from "../builders/AthleteStateBuilder";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyIntegrityPolicy } from "../policies/IntegrityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import { applyTransitionPolicy } from "../policies/TransitionPolicy";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("athlete-state policies", () => {
  it("passes integrity and consistency for empty state", () => {
    const state = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    expect(applyIntegrityPolicy(state).valid).toBe(true);
    expect(applyConsistencyPolicy(state).valid).toBe(true);
    expect(applySafetyPolicy(state).valid).toBe(true);
  });

  it("rejects contribution athlete mismatch", () => {
    const state = buildEmptyAthleteState({
      id: "state:1",
      athleteId: "athlete:1",
      at: FIXED_TIMESTAMP,
    });
    const result = applyTransitionPolicy({
      current: state,
      contributions: [
        Object.freeze({
          id: "c:1",
          source: "workout",
          agentId: "agent:workout",
          athleteId: "athlete:other",
          training: null,
          recovery: null,
          nutrition: null,
          performance: null,
          readiness: null,
          fatigue: null,
          sleep: null,
          stress: null,
          goals: null,
          preferences: null,
          constraints: null,
          progress: null,
          coaching: null,
          notes: Object.freeze([] as string[]),
          metadata: Object.freeze({
            tags: Object.freeze([] as string[]),
            attributes: Object.freeze({} as Record<string, string>),
          }),
          contributedAt: FIXED_TIMESTAMP,
        }),
      ],
    });
    expect(result.valid).toBe(false);
  });
});
`,
);

write(
  "__tests__/application.test.ts",
  `import {
  buildAthleteState,
  createSnapshot,
  describeAthleteState,
  updateAthleteState,
  validateAthleteState,
} from "../application";
import { AthleteStateOperationKinds } from "../models/AthleteStateResult";
import { AthleteStateRequestKinds } from "../models/AthleteStateRequest";
import {
  createStateRequest,
  createTestAthleteStateService,
} from "../testSupport/fixtures";

describe("athlete-state application", () => {
  it("exposes public API build → update → snapshot → describe → validate", () => {
    const service = createTestAthleteStateService();

    const built = buildAthleteState({
      service,
      request: createStateRequest({ kind: AthleteStateRequestKinds.BUILD }),
    });
    expect(built.success).toBe(true);
    expect(built.operation).toBe(AthleteStateOperationKinds.BUILD);
    expect(built.supervisorContext).not.toBeNull();

    const updated = updateAthleteState({
      service,
      request: createStateRequest({
        id: "request:update",
        kind: AthleteStateRequestKinds.UPDATE,
        reason: "refresh from specialists",
      }),
    });
    expect(updated.success).toBe(true);
    expect(updated.operation).toBe(AthleteStateOperationKinds.UPDATE);
    expect(updated.state!.version.revision).toBeGreaterThan(
      built.state!.version.revision,
    );

    const snap = createSnapshot({
      service,
      request: createStateRequest({
        id: "request:snapshot",
        kind: AthleteStateRequestKinds.SNAPSHOT,
      }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();
    expect(Object.isFrozen(snap.snapshot)).toBe(true);

    const caps = describeAthleteState({ service });
    expect(caps.name).toBe("Athlete State Engine");
    expect(caps.capabilities.length).toBeGreaterThan(0);

    const validated = validateAthleteState({
      service,
      request: createStateRequest({
        id: "request:validate",
        kind: AthleteStateRequestKinds.VALIDATE,
      }),
    });
    expect(validated.operation).toBe(AthleteStateOperationKinds.VALIDATE);
    expect(validated.success).toBe(true);
  });
});
`,
);

write(
  "__tests__/integration.test.ts",
  `import {
  buildAthleteState,
  createSnapshot,
  updateAthleteState,
} from "../application";
import { selectPrimaryGoal } from "../selectors/GoalSelector";
import { selectTraining } from "../selectors/StateSelector";
import { selectLatestTimelineItem } from "../selectors/TimelineSelector";
import {
  createStateRequest,
  createTestAthleteStateService,
} from "../testSupport/fixtures";

describe("athlete-state integration", () => {
  it("aggregates mock specialist agents into supervisor context", () => {
    const service = createTestAthleteStateService({ withMocks: true });
    const built = buildAthleteState({
      service,
      request: createStateRequest(),
    });
    expect(built.success).toBe(true);
    expect(selectTraining(built.state!).focus).toBe("strength");
    expect(built.state!.nutrition.planId).toBe("nutrition-plan:1");
    expect(built.state!.recovery.status).toBe("adequate");
    expect(selectPrimaryGoal(built.state!)?.title).toBe("Increase squat");
    expect(built.state!.coaching.activeSessionId).toBe("session:coach:1");
    expect(built.supervisorContext!.focusAreas).toContain("training");

    const updated = updateAthleteState({
      service,
      request: createStateRequest({
        id: "request:int:update",
        kind: "update",
      }),
    });
    expect(updated.success).toBe(true);
    expect(selectLatestTimelineItem(updated.state!)).not.toBeNull();

    const snap = createSnapshot({
      service,
      request: createStateRequest({
        id: "request:int:snap",
        kind: "snapshot",
      }),
    });
    expect(snap.snapshot!.state.athleteId).toBe("athlete:1");
    expect(snap.supervisorContext!.snapshot).not.toBeNull();
  });
});
`,
);

write(
  "__tests__/regression.test.ts",
  `import { buildAthleteState, updateAthleteState } from "../application";
import {
  createStateRequest,
  createTestAthleteStateService,
} from "../testSupport/fixtures";

describe("athlete-state regression", () => {
  it("does not mutate prior state on update", () => {
    const service = createTestAthleteStateService();
    const built = buildAthleteState({
      service,
      request: createStateRequest(),
    });
    const priorVersion = built.state!.version.revision;
    const priorFrozen = Object.isFrozen(built.state);

    const updated = updateAthleteState({
      service,
      request: createStateRequest({
        id: "request:reg:update",
        kind: "update",
      }),
    });

    expect(priorFrozen).toBe(true);
    expect(built.state!.version.revision).toBe(priorVersion);
    expect(updated.state!.version.revision).toBeGreaterThan(priorVersion);
    expect(Object.isFrozen(updated.state)).toBe(true);
  });

  it("exposes only public application surface from package root expectations", () => {
    const service = createTestAthleteStateService({ withMocks: false });
    const built = buildAthleteState({
      service,
      request: createStateRequest(),
    });
    expect(built.success).toBe(true);
    expect(built.state!.training.focus).toBeNull();
  });
});
`,
);

console.log("Part 5 (tests) written");
