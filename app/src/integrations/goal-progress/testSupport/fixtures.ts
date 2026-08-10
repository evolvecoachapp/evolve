import type { GoalProgress as GoalProgressDomain } from "../../../features/goal-progress/models/GoalProgress";
import type { GoalMilestone } from "../../../features/goal-progress/models/GoalMilestone";
import type { GoalSnapshot } from "../../../features/goal-progress/models/GoalSnapshot";
import { GoalCategories } from "../../../features/goal-progress/models/GoalCategory";
import { EMPTY_GOAL_METADATA } from "../../../features/goal-progress/models/GoalMetadata";
import { priorityForOrdinal } from "../../../features/goal-progress/models/GoalPriority";
import { riskForSignalCount } from "../../../features/goal-progress/models/GoalRisk";
import {
  createGoalProgressEvent,
  createGoalProgressMetadata,
} from "../models";

const FIXED_PUBLISHED_AT = "2026-08-02T20:00:00.000Z";

export function createTestGoalEvaluation(
  overrides: Partial<GoalProgressDomain["evaluation"]> = {},
): GoalProgressDomain["evaluation"] {
  return {
    id: "evaluation-001",
    subjectId: "Squat 150 kg",
    priority: priorityForOrdinal(1),
    severity: riskForSignalCount(1),
    riskOrdinal: 3,
    consistencyOrdinal: 75,
    dependencyCount: 0,
    signalKeys: Object.freeze(["goal:progress"]),
    metadata: EMPTY_GOAL_METADATA,
    ...overrides,
  };
}

export function createTestGoalProgressDomain(
  overrides: Partial<GoalProgressDomain> = {},
): GoalProgressDomain {
  return {
    id: "goal-progress-001",
    athleteId: "athlete-001",
    sessionId: null,
    conversationId: null,
    contextId: "context-001",
    category: GoalCategories.PERFORMANCE,
    triggers: Object.freeze([]),
    conditions: Object.freeze([]),
    candidates: Object.freeze([]),
    opportunities: Object.freeze([]),
    reasons: Object.freeze([]),
    evaluation: createTestGoalEvaluation(),
    priority: priorityForOrdinal(1),
    severity: riskForSignalCount(1),
    dependencies: Object.freeze([]),
    constraints: Object.freeze([]),
    signalKeys: Object.freeze(["goal:progress"]),
    sourceKeys: Object.freeze(["goal:source"]),
    metadata: EMPTY_GOAL_METADATA,
    createdAt: FIXED_PUBLISHED_AT,
    ...overrides,
  };
}

export function createTestGoalMilestone(
  overrides: Partial<GoalMilestone> = {},
): GoalMilestone {
  return {
    id: "milestone-001",
    category: GoalCategories.PERFORMANCE,
    subjectId: "Squat 150 kg",
    candidateIds: Object.freeze(["candidate-001"]),
    signalKeys: Object.freeze(["goal:milestone"]),
    severity: riskForSignalCount(0),
    metadata: EMPTY_GOAL_METADATA,
    ...overrides,
  };
}

export function createTestGoalSnapshot(
  overrides: Partial<GoalSnapshot> = {},
): GoalSnapshot {
  const progress = createTestGoalProgressDomain();
  return {
    id: "snapshot-001",
    athleteId: "athlete-001",
    contextId: "context-001",
    decisions: Object.freeze([progress]),
    summary: {
      id: "summary-001",
      athleteId: "athlete-001",
      contextId: "context-001",
      decisionCount: 1,
      opportunityCount: 0,
      triggerCount: 0,
      categoryKeys: Object.freeze([GoalCategories.PERFORMANCE]),
      signalKeys: Object.freeze(["goal:progress"]),
      metadata: EMPTY_GOAL_METADATA,
      createdAt: FIXED_PUBLISHED_AT,
    },
    signalKeys: Object.freeze(["goal:progress"]),
    metadata: EMPTY_GOAL_METADATA,
    createdAt: FIXED_PUBLISHED_AT,
    ...overrides,
  };
}

export function createTestGoalProgressEvent(
  overrides: Partial<ReturnType<typeof createGoalProgressEvent>> = {},
) {
  return createGoalProgressEvent({
    id: "evt-001",
    type: "GoalTrackingStarted",
    occurredAt: FIXED_PUBLISHED_AT,
    metadata: createGoalProgressMetadata({
      source: "goal",
      correlationId: "corr-001",
      goalId: "goal-001",
      snapshotId: null,
      athleteId: null,
      publishedAt: FIXED_PUBLISHED_AT,
    }),
    payload: Object.freeze({
      goalId: "goal-001",
      snapshotId: null,
      title: "Squat 150 kg",
      category: "performance",
      currentValue: 75,
      targetValue: 100,
      unit: "percent",
      completionPercent: 75,
      status: "on_track",
      evaluatedAt: null,
      completedAt: null,
      metrics: Object.freeze([]),
    }),
    ...overrides,
  });
}

export { FIXED_PUBLISHED_AT };
