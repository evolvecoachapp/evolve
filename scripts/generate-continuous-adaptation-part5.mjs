/**
 * Sprint 23.1 — Continuous Adaptation Engine generator (part 5: testSupport + tests).
 * Run after part 4: node scripts/generate-continuous-adaptation-part5.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("app/src/features/continuous-adaptation");
let fileCount = 0;

function write(rel, contents) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents.replace(/\r?\n/g, "\n"), "utf8");
  fileCount++;
}

write(
  "testSupport/fixtures.ts",
  `import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockExplainabilityEnginePort } from "../contracts/ExplainabilityEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { AdaptationInputKinds } from "../models/AdaptationInput";
import type { AdaptationInput } from "../models/AdaptationInput";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";
import {
  createContinuousAdaptationEngineService,
  type ContinuousAdaptationEngineService,
} from "../services/ContinuousAdaptationEngineService";
import { freezeInput } from "../utils/FreezeAdaptationState";

export const FIXED_TIMESTAMP = "2026-07-25T12:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createAdaptationInput(
  overrides: Partial<AdaptationInput> = {},
): AdaptationInput {
  return freezeInput({
    id: overrides.id ?? "request:continuous-adaptation:test",
    kind: overrides.kind ?? AdaptationInputKinds.EVALUATE,
    athleteId: overrides.athleteId ?? "athlete:1",
    sessionId: overrides.sessionId ?? "session:1",
    conversationId: overrides.conversationId ?? "conversation:1",
    contextId: overrides.contextId ?? "context:1",
    decisions: overrides.decisions ?? Object.freeze([]),
    recommendations: overrides.recommendations ?? Object.freeze([]),
    explanations: overrides.explanations ?? Object.freeze([]),
    stateKeys: overrides.stateKeys ?? Object.freeze(["state:readiness", "state:load"]),
    performanceKeys:
      overrides.performanceKeys ?? Object.freeze(["performance:progress", "performance:plateau"]),
    recoveryKeys: overrides.recoveryKeys ?? Object.freeze(["recovery:status"]),
    nutritionKeys: overrides.nutritionKeys ?? Object.freeze(["nutrition:adherence"]),
    goalKeys: overrides.goalKeys ?? Object.freeze(["goal:progress"]),
    adherenceKeys: overrides.adherenceKeys ?? Object.freeze(["adherence:weekly"]),
    historyKeys: overrides.historyKeys ?? Object.freeze(["history:prior"]),
    timelineKeys: overrides.timelineKeys ?? Object.freeze(["timeline:recent"]),
    signalFlags:
      overrides.signalFlags ??
      Object.freeze({
        "recovery:flag": true,
        "trend:signal": true,
        "regression:flag": false,
      }),
    priorSnapshot: overrides.priorSnapshot ?? null,
    reason: overrides.reason ?? "test",
    metadata: overrides.metadata ?? EMPTY_ADAPTATION_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createTestContinuousAdaptationEngineService(
  overrides: {
    readonly clock?: () => string;
    readonly withMocks?: boolean;
  } = {},
): ContinuousAdaptationEngineService {
  const withMocks = overrides.withMocks ?? true;
  return createContinuousAdaptationEngineService({
    decisionEnginePort: withMocks ? createMockDecisionEnginePort() : undefined,
    recommendationEnginePort: withMocks ? createMockRecommendationEnginePort() : undefined,
    explainabilityEnginePort: withMocks ? createMockExplainabilityEnginePort() : undefined,
    contextFusionPort: withMocks ? createMockContextFusionPort() : undefined,
    athleteStatePort: withMocks ? createMockAthleteStatePort() : undefined,
    clock: overrides.clock ?? createFixedClock(),
  });
}
`,
);

write(
  "testSupport/index.ts",
  `export * from "./fixtures";
`,
);

write(
  "__tests__/monitoring.test.ts",
  `import { observeAdherence } from "../monitoring/AdherenceMonitor";
import { observeGoal } from "../monitoring/GoalMonitor";
import { observeHistory } from "../monitoring/HistoryMonitor";
import { observeNutrition } from "../monitoring/NutritionMonitor";
import { observePerformance } from "../monitoring/PerformanceMonitor";
import { observeRecovery } from "../monitoring/RecoveryMonitor";
import { observeState } from "../monitoring/StateMonitor";
import { observeTimeline } from "../monitoring/TimelineMonitor";
import { createAdaptationInput, FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("continuous-adaptation monitoring", () => {
  it("returns frozen observation records with key/flag counts only", () => {
    const input = createAdaptationInput();
    const at = FIXED_TIMESTAMP;
    const obs = [
      observeState(input, at),
      observePerformance(input, at),
      observeRecovery(input, at),
      observeNutrition(input, at),
      observeGoal(input, at),
      observeAdherence(input, at),
      observeHistory(input, at),
      observeTimeline(input, at),
    ];
    for (const o of obs) {
      expect(Object.isFrozen(o)).toBe(true);
      expect(Object.isFrozen(o.keys)).toBe(true);
      expect(typeof o.presentCount).toBe("number");
      expect(o.createdAt).toBe(at);
    }
    expect(observeState(input, at).presentCount).toBe(2);
    expect(observeRecovery(input, at).flagsPresent).toContain("recovery:flag");
  });
});
`,
);

write(
  "__tests__/evaluation.test.ts",
  `import { evaluateAdaptationSignals } from "../evaluation/AdaptationEvaluator";
import { evaluateConsistencyOrdinal } from "../evaluation/ConsistencyEvaluator";
import { evaluateDependencyCount } from "../evaluation/DependencyEvaluator";
import { evaluatePriority, evaluatePriorityForCategory } from "../evaluation/PriorityEvaluator";
import { evaluateRiskOrdinal } from "../evaluation/RiskEvaluator";
import { evaluateSeverity } from "../evaluation/SeverityEvaluator";
import { AdaptationTriggerKinds } from "../models/AdaptationTrigger";
import { EMPTY_ADAPTATION_METADATA } from "../models/AdaptationMetadata";

describe("continuous-adaptation evaluation", () => {
  it("uses deterministic ordinal/table lookups only", () => {
    expect(evaluatePriority(0).label).toBe("critical");
    expect(evaluatePriority(3).label).toBe("low");
    expect(evaluatePriorityForCategory("recovery").ordinal).toBe(0);
    expect(evaluateSeverity(0).level).toBe("none");
    expect(evaluateSeverity(4).level).toBe("critical");
    expect(evaluateDependencyCount(["a", "a", "b"])).toBe(2);
    expect(evaluateConsistencyOrdinal(2, 2)).toBe(0);
    expect(evaluateRiskOrdinal(1, 4)).toBe(3);

    const evalResult = evaluateAdaptationSignals({
      subjectId: "athlete:1",
      triggers: Object.freeze([
        Object.freeze({
          id: "t1",
          kind: AdaptationTriggerKinds.RECOVERY,
          signalKey: "recovery:status",
          subjectId: "athlete:1",
          present: true,
          metadata: EMPTY_ADAPTATION_METADATA,
        }),
      ]),
      candidates: Object.freeze([]),
      opportunities: Object.freeze([]),
      dependencyFromIds: Object.freeze(["d1"]),
    });
    expect(Object.isFrozen(evalResult)).toBe(true);
    expect(evalResult.signalKeys).toContain("recovery:status");
  });
});
`,
);

write(
  "__tests__/detection.test.ts",
  `import { detectAdherence } from "../detection/AdherenceDetector";
import { detectConsistency } from "../detection/ConsistencyDetector";
import { detectPlateau } from "../detection/PlateauDetector";
import { detectProgress } from "../detection/ProgressDetector";
import { detectRecovery } from "../detection/RecoveryDetector";
import { detectRegression } from "../detection/RegressionDetector";
import { detectTrend } from "../detection/TrendDetector";
import { createAdaptationInput } from "../testSupport/fixtures";

describe("continuous-adaptation detection", () => {
  it("detects signal key/flag presence only", () => {
    const input = createAdaptationInput();
    const plateau = detectPlateau(input);
    expect(plateau.triggers.length).toBeGreaterThan(0);
    expect(plateau.triggers.every((t) => t.present)).toBe(true);
    expect(Object.isFrozen(plateau.triggers[0])).toBe(true);

    expect(detectProgress(input).candidates.length).toBeGreaterThan(0);
    expect(detectRecovery(input).opportunities.length).toBeGreaterThan(0);
    expect(detectTrend(input).triggers.some((t) => t.signalKey.includes("trend"))).toBe(true);

    const empty = createAdaptationInput({
      performanceKeys: Object.freeze([]),
      recoveryKeys: Object.freeze([]),
      nutritionKeys: Object.freeze([]),
      goalKeys: Object.freeze([]),
      adherenceKeys: Object.freeze([]),
      historyKeys: Object.freeze([]),
      timelineKeys: Object.freeze([]),
      stateKeys: Object.freeze([]),
      signalFlags: Object.freeze({}),
    });
    expect(detectRegression(empty).triggers.length).toBe(0);
    expect(detectConsistency(empty).candidates.length).toBe(0);
    expect(detectAdherence(empty).opportunities.length).toBe(0);
  });
});
`,
);

write(
  "__tests__/comparison.test.ts",
  `import { compareDecisionIds } from "../comparison/DecisionComparator";
import { compareGoalKeys } from "../comparison/GoalComparator";
import { compareRecommendationIds } from "../comparison/RecommendationComparator";
import { compareSnapshots } from "../comparison/SnapshotComparator";
import { compareStateKeys } from "../comparison/StateComparator";
import { compareTimelines } from "../comparison/TimelineComparator";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("continuous-adaptation comparison", () => {
  it("produces immutable key/id diffs", () => {
    const stateDiff = compareStateKeys(["a", "b"], ["b", "c"]);
    expect(stateDiff.added).toEqual(["c"]);
    expect(stateDiff.removed).toEqual(["a"]);
    expect(stateDiff.shared).toEqual(["b"]);
    expect(Object.isFrozen(stateDiff)).toBe(true);

    expect(compareGoalKeys(["g1"], ["g1", "g2"]).added).toEqual(["g2"]);

    const portIn = {
      athleteId: "athlete:1",
      sessionId: null,
      conversationId: null,
      contextId: "context:1",
      at: FIXED_TIMESTAMP,
    };
    const decisions = createMockDecisionEnginePort().loadDecisions(portIn);
    const recs = createMockRecommendationEnginePort().loadRecommendations(portIn);
    expect(compareDecisionIds(decisions, decisions).shared.length).toBe(3);
    expect(compareRecommendationIds(recs, []).removed.length).toBe(3);

    const snapDiff = compareSnapshots(null, null);
    expect(snapDiff.decisionIds.added).toEqual([]);
    expect(compareTimelines(null, null).shared).toEqual([]);
  });
});
`,
);

write(
  "__tests__/timeline.test.ts",
  `import { buildAdaptationHistory } from "../timeline/HistoryBuilder";
import { buildTimelineSnapshot } from "../timeline/SnapshotBuilder";
import { buildAdaptationTimeline } from "../timeline/TimelineBuilder";
import { buildTrendItems } from "../timeline/TrendBuilder";
import { buildAdaptationWindow } from "../timeline/WindowBuilder";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AdaptationInputKinds } from "../models/AdaptationInput";

describe("continuous-adaptation timeline", () => {
  it("organizes history only without forecasting", () => {
    const service = createTestContinuousAdaptationEngineService();
    const result = service.evaluateAdaptation(
      createAdaptationInput({ kind: AdaptationInputKinds.EVALUATE }),
    );
    expect(result.success).toBe(true);
    const decisions = result.decisions;

    const timeline = buildAdaptationTimeline({
      id: "tl:1",
      athleteId: "athlete:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(timeline)).toBe(true);
    expect(timeline.items.length).toBe(decisions.length);

    const history = buildAdaptationHistory({
      id: "hist:1",
      athleteId: "athlete:1",
      decisions,
      historyKeys: Object.freeze(["history:prior"]),
      at: FIXED_TIMESTAMP,
    });
    expect(history.entries.length).toBeGreaterThan(0);

    const trends = buildTrendItems({
      trendKeys: Object.freeze(["trend:signal", "other"]),
      at: FIXED_TIMESTAMP,
    });
    expect(trends).toHaveLength(1);

    const window = buildAdaptationWindow({
      id: "win:1",
      timeline,
      startAt: FIXED_TIMESTAMP,
      endAt: FIXED_TIMESTAMP,
    });
    expect(window.itemIds.length).toBe(timeline.items.length);

    const snap = buildTimelineSnapshot({
      id: "snap:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      summary: result.summary,
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(snap)).toBe(true);
  });
});
`,
);

write(
  "__tests__/builders.test.ts",
  `import { buildAdaptationDescriptor } from "../builders/DescriptorBuilder";
import {
  buildGoalProgressInput,
  buildNutritionAdaptationInput,
  buildRecoveryAdaptationInput,
  buildWorkoutAdaptationInput,
} from "../builders/HandoffBuilder";
import { buildAdaptationPackage } from "../builders/PackageBuilder";
import { buildAdaptationResult } from "../builders/ResultBuilder";
import { buildAdaptationSnapshot } from "../builders/SnapshotBuilder";
import { buildAdaptationSummary } from "../builders/SummaryBuilder";
import { AdaptationOperationKinds } from "../models/AdaptationResult";
import { buildStatistics } from "../utils/StatisticsHelpers";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("continuous-adaptation builders", () => {
  it("builds frozen package, summary, snapshot, handoffs, and result", () => {
    const service = createTestContinuousAdaptationEngineService();
    const evaluated = service.evaluateAdaptation(createAdaptationInput());
    const decisions = evaluated.decisions;

    const summary = buildAdaptationSummary({
      id: "summary:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const snapshot = buildAdaptationSnapshot({
      id: "snapshot:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      summary,
      at: FIXED_TIMESTAMP,
    });
    const workout = buildWorkoutAdaptationInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const nutrition = buildNutritionAdaptationInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const recovery = buildRecoveryAdaptationInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });
    const goal = buildGoalProgressInput({
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      at: FIXED_TIMESTAMP,
    });

    expect(workout.id.startsWith("handoff:")).toBe(true);
    expect(nutrition.id.startsWith("handoff:")).toBe(true);
    expect(recovery.id.startsWith("handoff:")).toBe(true);
    expect(goal.id.startsWith("handoff:")).toBe(true);

    const pkg = buildAdaptationPackage({
      id: "package:1",
      athleteId: "athlete:1",
      contextId: "context:1",
      decisions,
      summary,
      snapshot,
      timeline: null,
      history: null,
      window: null,
      statistics: buildStatistics(decisions),
      processingSteps: Object.freeze(["build"]),
      workoutAdaptationInput: workout,
      nutritionAdaptationInput: nutrition,
      recoveryAdaptationInput: recovery,
      goalProgressInput: goal,
      at: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(pkg)).toBe(true);

    const result = buildAdaptationResult({
      id: "result:1",
      operation: AdaptationOperationKinds.EVALUATE,
      success: true,
      decisions,
      package: pkg,
      createdAt: FIXED_TIMESTAMP,
    });
    expect(Object.isFrozen(result)).toBe(true);

    const descriptor = buildAdaptationDescriptor({
      id: "runtime:test",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(descriptor.name).toBe("Continuous Adaptation Engine");
    expect(descriptor.capabilities).toContain("evaluateAdaptation");
  });
});
`,
);

write(
  "__tests__/validators.test.ts",
  `import { validateAdaptationIntegrity } from "../validators/validateAdaptationIntegrity";
import { validateDependencies } from "../validators/validateDependencies";
import { validateHistory } from "../validators/validateHistory";
import { validateAdaptationPackage } from "../validators/validatePackage";
import { validateSnapshot } from "../validators/validateSnapshot";
import { validateTimelineConsistency } from "../validators/validateTimelineConsistency";
import { validateTriggerConsistency } from "../validators/validateTriggerConsistency";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
} from "../testSupport/fixtures";

describe("continuous-adaptation validators", () => {
  it("validates package integrity and related structures", () => {
    const service = createTestContinuousAdaptationEngineService();
    const result = service.evaluateAdaptation(createAdaptationInput());
    expect(result.package).not.toBeNull();
    const pkg = result.package!;

    expect(validateAdaptationIntegrity(pkg.decisions)).toHaveLength(0);
    expect(validateTriggerConsistency(pkg.decisions)).toHaveLength(0);
    expect(validateTimelineConsistency(pkg.timeline)).toHaveLength(0);
    expect(validateHistory(pkg.history)).toHaveLength(0);
    expect(validateSnapshot(pkg.snapshot)).toHaveLength(0);
    expect(validateDependencies(pkg.dependencies)).toHaveLength(0);

    const validation = validateAdaptationPackage(pkg);
    expect(validation.valid).toBe(true);
    expect(Object.isFrozen(validation)).toBe(true);
  });
});
`,
);

write(
  "__tests__/policies.test.ts",
  `import { applyAdaptationPolicy } from "../policies/AdaptationPolicy";
import { applyConsistencyPolicy } from "../policies/ConsistencyPolicy";
import { applyDetectionPolicy } from "../policies/DetectionPolicy";
import { applyMonitoringPolicy } from "../policies/MonitoringPolicy";
import { applyPriorityPolicy } from "../policies/PriorityPolicy";
import { applySafetyPolicy } from "../policies/SafetyPolicy";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
} from "../testSupport/fixtures";

describe("continuous-adaptation policies", () => {
  it("passes structural policies on successful evaluate path", () => {
    const service = createTestContinuousAdaptationEngineService();
    const input = createAdaptationInput();
    const result = service.evaluateAdaptation(input);
    expect(result.success).toBe(true);

    expect(applyMonitoringPolicy(input)).toHaveLength(0);
    expect(applyDetectionPolicy(result.decisions[0]!.triggers)).toHaveLength(0);
    expect(applyAdaptationPolicy(result.decisions)).toHaveLength(0);
    expect(applyConsistencyPolicy(result.decisions)).toHaveLength(0);
    expect(applyPriorityPolicy(result.decisions)).toHaveLength(0);
    expect(applySafetyPolicy(result.package!)).toHaveLength(0);
  });

  it("flags missing athlete for monitoring policy", () => {
    const input = createAdaptationInput({ athleteId: "" });
    expect(applyMonitoringPolicy(input).length).toBeGreaterThan(0);
  });
});
`,
);

write(
  "__tests__/application.test.ts",
  `import {
  createAdaptationSnapshot,
  describeAdaptation,
  detectAdaptation,
  evaluateAdaptation,
  validateAdaptation,
} from "../application";
import { AdaptationInputKinds } from "../models/AdaptationInput";
import { AdaptationOperationKinds } from "../models/AdaptationResult";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
} from "../testSupport/fixtures";

describe("continuous-adaptation application", () => {
  it("exposes public API evaluate → detect → snapshot → validate → describe", () => {
    const service = createTestContinuousAdaptationEngineService();

    const evaluated = evaluateAdaptation({
      service,
      input: createAdaptationInput({ kind: AdaptationInputKinds.EVALUATE }),
    });
    expect(evaluated.success).toBe(true);
    expect(evaluated.operation).toBe(AdaptationOperationKinds.EVALUATE);
    expect(evaluated.decisions.length).toBeGreaterThan(0);
    expect(Object.isFrozen(evaluated.decisions[0])).toBe(true);

    const detected = detectAdaptation({
      service,
      input: createAdaptationInput({ id: "request:detect", kind: AdaptationInputKinds.DETECT }),
    });
    expect(detected.success).toBe(true);
    expect(detected.operation).toBe(AdaptationOperationKinds.DETECT);

    const snap = createAdaptationSnapshot({
      service,
      input: createAdaptationInput({ id: "request:snapshot", kind: AdaptationInputKinds.SNAPSHOT }),
    });
    expect(snap.success).toBe(true);
    expect(snap.snapshot).not.toBeNull();

    const validated = validateAdaptation({
      service,
      input: createAdaptationInput({ id: "request:validate", kind: AdaptationInputKinds.VALIDATE }),
    });
    expect(validated.success).toBe(true);

    const caps = describeAdaptation({ service });
    expect(caps.name).toBe("Continuous Adaptation Engine");
    expect(caps.capabilities).toEqual(
      expect.arrayContaining([
        "evaluateAdaptation",
        "detectAdaptation",
        "describeAdaptation",
        "createAdaptationSnapshot",
        "validateAdaptation",
      ]),
    );
  });
});
`,
);

write(
  "__tests__/integration.test.ts",
  `import { createMockAthleteStatePort } from "../contracts/AthleteStatePort";
import { createMockContextFusionPort } from "../contracts/ContextFusionPort";
import { createMockDecisionEnginePort } from "../contracts/DecisionEnginePort";
import { createMockExplainabilityEnginePort } from "../contracts/ExplainabilityEnginePort";
import { createMockRecommendationEnginePort } from "../contracts/RecommendationEnginePort";
import {
  createAdaptationInput,
  createFixedClock,
  createTestContinuousAdaptationEngineService,
} from "../testSupport/fixtures";
import { createContinuousAdaptationEngineService } from "../services/ContinuousAdaptationEngineService";

describe("continuous-adaptation integration", () => {
  it("mocks upstream engines via ports and freezes outputs", () => {
    const service = createContinuousAdaptationEngineService({
      decisionEnginePort: createMockDecisionEnginePort(),
      recommendationEnginePort: createMockRecommendationEnginePort(),
      explainabilityEnginePort: createMockExplainabilityEnginePort(),
      contextFusionPort: createMockContextFusionPort(["recovery", "nutrition"]),
      athleteStatePort: createMockAthleteStatePort(true),
      clock: createFixedClock(),
    });

    const input = createAdaptationInput({
      decisions: Object.freeze([]),
      recommendations: Object.freeze([]),
      explanations: Object.freeze([]),
      stateKeys: Object.freeze([]),
    });
    const result = service.evaluateAdaptation(input);

    expect(result.success).toBe(true);
    expect(result.package).not.toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.package)).toBe(true);
    expect(Object.isFrozen(result.decisions[0])).toBe(true);
    expect(result.workoutAdaptationInput).not.toBeNull();
    expect(result.nutritionAdaptationInput).not.toBeNull();
    expect(result.recoveryAdaptationInput).not.toBeNull();
    expect(result.goalProgressInput).not.toBeNull();
  });

  it("does not mutate plans — handoffs are inputs only", () => {
    const service = createTestContinuousAdaptationEngineService();
    const result = service.evaluateAdaptation(createAdaptationInput());
    expect(result.success).toBe(true);

    for (const handoff of [
      result.workoutAdaptationInput,
      result.nutritionAdaptationInput,
      result.recoveryAdaptationInput,
      result.goalProgressInput,
    ]) {
      expect(handoff).not.toBeNull();
      expect(handoff!.id.startsWith("handoff:")).toBe(true);
      expect(Object.isFrozen(handoff)).toBe(true);
      expect(handoff).not.toHaveProperty("plan");
      expect(handoff).not.toHaveProperty("modifiedPlan");
      expect(handoff).not.toHaveProperty("mutations");
    }
  });
});
`,
);

write(
  "__tests__/regression.test.ts",
  `import {
  createAdaptationSnapshot,
  describeAdaptation,
  detectAdaptation,
  evaluateAdaptation,
  validateAdaptation,
} from "../application";
import * as publicApi from "../index";
import { AdaptationInputKinds } from "../models/AdaptationInput";
import {
  createAdaptationInput,
  createTestContinuousAdaptationEngineService,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("continuous-adaptation regression", () => {
  it("keeps public root surface limited to models + application + service", () => {
    expect(typeof publicApi.evaluateAdaptation).toBe("function");
    expect(typeof publicApi.detectAdaptation).toBe("function");
    expect(typeof publicApi.describeAdaptation).toBe("function");
    expect(typeof publicApi.createAdaptationSnapshot).toBe("function");
    expect(typeof publicApi.validateAdaptation).toBe("function");
    expect(publicApi.ContinuousAdaptationEngineService).toBeDefined();
    expect(typeof publicApi.createContinuousAdaptationEngineService).toBe("function");
    expect(publicApi.AdaptationInputKinds).toBeDefined();
    expect((publicApi as Record<string, unknown>).AdaptationCoordinator).toBeUndefined();
    expect((publicApi as Record<string, unknown>).observeState).toBeUndefined();
  });

  it("is deterministic for fixed clock + fixtures", () => {
    const service = createTestContinuousAdaptationEngineService();
    const input = createAdaptationInput({ kind: AdaptationInputKinds.EVALUATE });
    const a = evaluateAdaptation({ service, input });
    const b = evaluateAdaptation({
      service: createTestContinuousAdaptationEngineService(),
      input,
    });
    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.createdAt).toBe(FIXED_TIMESTAMP);
    expect(a.decisions[0]!.id).toBe(b.decisions[0]!.id);
    expect(a.decisions[0]!.signalKeys).toEqual(b.decisions[0]!.signalKeys);
    expect(a.snapshot!.id).toBe(b.snapshot!.id);

    expect(detectAdaptation({ service, input }).success).toBe(true);
    expect(createAdaptationSnapshot({ service, input }).success).toBe(true);
    expect(validateAdaptation({ service, input }).success).toBe(true);
    expect(describeAdaptation({ service }).version).toBe("23.1.0");
  });
});
`,
);

console.log(`Generated ${fileCount} files under continuous-adaptation (part 5).`);
