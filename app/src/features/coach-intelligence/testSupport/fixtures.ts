import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import { generateInsights } from "../../insight-engine/application";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import {
  createFullInsightInputs,
  FIXED_TIMESTAMP as INSIGHT_FIXED_TIMESTAMP,
} from "../../insight-engine/testSupport/fixtures";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import { CoachInstructionBuilder } from "../builders/CoachInstructionBuilder";
import { CoachSummaryBuilder } from "../builders/CoachSummaryBuilder";
import { CoachingContextBuilder } from "../builders/CoachingContextBuilder";
import { CoachAudiences } from "../models/CoachAudience";
import { CoachCommunicationStyles } from "../models/CoachCommunicationStyle";
import type { CoachEvidence } from "../models/CoachEvidence";
import type { CoachObjective } from "../models/CoachObjective";
import { CoachIntents } from "../models/CoachIntent";
import type { CoachSession } from "../models/CoachSession";
import type { CoachingContext } from "../models/CoachingContext";
import { aggregateKnowledge } from "../utils/aggregateKnowledge";

export {
  createSet,
  createExercise,
  createWorkout,
  createTrend,
  createWorkoutRecord,
  createExerciseRecord,
} from "./legacyFixtures";

export const FIXED_TIMESTAMP = INSIGHT_FIXED_TIMESTAMP;

export {
  createFullInsightInputs,
  createAchievementResultFixture,
  createPerformanceSnapshotFixture,
  createAthleteHistoryFixture,
  createRecoverySnapshotFixture,
} from "../../insight-engine/testSupport/fixtures";

export function createInsightSnapshotFixture(
  overrides: {
    readonly performanceSnapshot?: PerformanceSnapshot;
    readonly achievementResult?: AchievementResult;
    readonly recoverySnapshot?: RecoverySnapshot;
    readonly athleteHistory?: AthleteHistory;
    readonly generatedAt?: string;
    readonly snapshotId?: string;
  } = {},
): InsightSnapshot {
  const inputs = createFullInsightInputs();
  return generateInsights({
    performanceSnapshot:
      overrides.performanceSnapshot ?? inputs.performanceSnapshot,
    achievementResult: overrides.achievementResult ?? inputs.achievementResult,
    recoverySnapshot: overrides.recoverySnapshot ?? inputs.recoverySnapshot,
    athleteHistory: overrides.athleteHistory ?? inputs.athleteHistory,
    generatedAt: overrides.generatedAt ?? FIXED_TIMESTAMP,
    snapshotId: overrides.snapshotId ?? "insight:coach-fixture",
  }).snapshot;
}

export function createFullCoachInputs(): {
  readonly insightSnapshot: InsightSnapshot;
  readonly recoverySnapshot: RecoverySnapshot;
  readonly athleteHistory: AthleteHistory;
  readonly achievementResult: AchievementResult;
  readonly performanceSnapshot: PerformanceSnapshot;
} {
  const inputs = createFullInsightInputs();
  const insightSnapshot = createInsightSnapshotFixture({
    performanceSnapshot: inputs.performanceSnapshot,
    achievementResult: inputs.achievementResult,
    recoverySnapshot: inputs.recoverySnapshot,
    athleteHistory: inputs.athleteHistory,
    snapshotId: "insight:coach-full",
  });

  return Object.freeze({
    insightSnapshot,
    recoverySnapshot: inputs.recoverySnapshot,
    athleteHistory: inputs.athleteHistory,
    achievementResult: inputs.achievementResult,
    performanceSnapshot: inputs.performanceSnapshot,
  });
}

export function createCoachSessionFixture(
  overrides: Partial<CoachSession> = {},
): CoachSession {
  return Object.freeze({
    athleteId: overrides.athleteId ?? null,
    sessionId: overrides.sessionId ?? "session-1",
    runtimeId: overrides.runtimeId ?? "runtime-1",
    dayId: overrides.dayId ?? "day-1",
    weekNumber: overrides.weekNumber ?? 1,
    insightSnapshotId: overrides.insightSnapshotId ?? "insight:coach-fixture",
    performanceSnapshotId: overrides.performanceSnapshotId ?? "perf-1",
    achievementEvaluationId: overrides.achievementEvaluationId ?? "ach-eval-1",
    recoverySnapshotId: overrides.recoverySnapshotId ?? "recv:insight-fixture",
    historyId: overrides.historyId ?? "hist:insight-fixture",
    preparedAt: overrides.preparedAt ?? FIXED_TIMESTAMP,
  });
}

export function createCoachEvidenceFixture(
  overrides: Partial<CoachEvidence> & { readonly id?: string } = {},
): CoachEvidence {
  return Object.freeze({
    id: overrides.id ?? "coach-evidence:fixture:1",
    sourceType: overrides.sourceType ?? "Insight",
    sourceId: overrides.sourceId ?? "insight:fixture:1",
    statement: overrides.statement ?? "Fixture evidence statement.",
    priority: overrides.priority ?? 50,
    attributes: Object.freeze({ ...(overrides.attributes ?? {}) }),
  });
}

export function createCoachObjectiveFixture(
  overrides: Partial<CoachObjective> & { readonly id?: string } = {},
): CoachObjective {
  return Object.freeze({
    id: overrides.id ?? "coach-objective:fixture:1",
    intent: overrides.intent ?? CoachIntents.FOCUS,
    priority: overrides.priority ?? 50,
    title: overrides.title ?? "Fixture objective",
    statement: overrides.statement ?? "Fixture objective statement.",
    reason:
      overrides.reason ??
      Object.freeze({
        code: "fixture_reason",
        statement: "Fixture reason",
        attributes: Object.freeze({}),
      }),
    evidenceIds: Object.freeze([...(overrides.evidenceIds ?? [])]),
    focusIds: Object.freeze([...(overrides.focusIds ?? [])]),
    metadata:
      overrides.metadata ??
      Object.freeze({
        tags: Object.freeze(["fixture"]),
        attributes: Object.freeze({}),
      }),
  });
}

export function createCoachingContextFixture(
  overrides: {
    readonly id?: string;
    readonly session?: CoachSession;
    readonly objectives?: readonly CoachObjective[];
    readonly evidence?: readonly CoachEvidence[];
  } = {},
): CoachingContext {
  const id = overrides.id ?? "coach:fixture";
  const evidence = overrides.evidence ?? [createCoachEvidenceFixture()];
  const objectives =
    overrides.objectives ??
    [
      createCoachObjectiveFixture({
        evidenceIds: evidence.map((item) => item.id),
      }),
    ];
  const session = overrides.session ?? createCoachSessionFixture();

  const instructions = objectives.map((objective) =>
    new CoachInstructionBuilder()
      .withId(`coach-instruction:${objective.id}`)
      .withCode("fixture_instruction")
      .withObjectiveId(objective.id)
      .withStatement(`Fixture instruction for ${objective.id}.`)
      .withPriority(objective.priority)
      .withReason(
        Object.freeze({
          code: "fixture_instruction",
          statement: "Fixture instruction",
          attributes: Object.freeze({}),
        }),
      )
      .withEvidenceIds(objective.evidenceIds)
      .build(),
  );

  const summary = new CoachSummaryBuilder()
    .withIds({ contextId: id, athleteId: session.athleteId })
    .withObjectiveCount(objectives.length)
    .withConstraintCount(0)
    .withInstructionCount(instructions.length)
    .withFocusCount(0)
    .withEvidenceCount(evidence.length)
    .withTopObjectiveIds(objectives.slice(0, 3).map((o) => o.id))
    .withPrimaryIntent(objectives[0]?.intent ?? null)
    .withSummaryText(`${objectives.length} coaching objectives.`)
    .build();

  return new CoachingContextBuilder()
    .withId(id)
    .withSession(session)
    .withAudience(CoachAudiences.ATHLETE)
    .withCommunicationStyle(CoachCommunicationStyles.DIRECT)
    .withObjectives(objectives)
    .withConstraints([])
    .withInstructions(instructions)
    .withFocus([])
    .withEvidence(evidence)
    .withKnowledge(
      aggregateKnowledge({
        insightIds: ["insight:fixture:1"],
        selectedInsightIds: ["insight:fixture:1"],
        recoveryReferenced: false,
        historyReferenced: false,
        performanceReferenced: false,
        achievementReferenced: false,
      }),
    )
    .withPreparation(
      Object.freeze({
        preparedAt: FIXED_TIMESTAMP,
        insightSnapshotId: session.insightSnapshotId,
        selectorNames: Object.freeze(["InsightSelector"]),
        objectiveCount: objectives.length,
        constraintCount: 0,
        instructionCount: objectives.length,
        evidenceCount: evidence.length,
        missingInformation: Object.freeze([] as string[]),
      }),
    )
    .withSummary(summary)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}
