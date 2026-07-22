import { prepareCoachingContext } from "../../coach-intelligence/application";
import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import {
  createFullCoachInputs,
  FIXED_TIMESTAMP as COACH_FIXED_TIMESTAMP,
} from "../../coach-intelligence/testSupport/fixtures";
import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import { ConversationContextBuilder } from "../builders/ConversationContextBuilder";
import { ConversationRequestBuilder } from "../builders/ConversationRequestBuilder";
import { ConversationSummaryBuilder } from "../builders/ConversationSummaryBuilder";
import { ConversationAudiences } from "../models/ConversationAudience";
import type { ConversationEvidence } from "../models/ConversationEvidence";
import type { ConversationGoal } from "../models/ConversationGoal";
import { ConversationIntents } from "../models/ConversationIntent";
import type { ConversationSession } from "../models/ConversationSession";
import { ConversationStages } from "../models/ConversationStage";
import { ConversationStates } from "../models/ConversationState";
import type { ConversationContext } from "../models/ConversationContext";
import { aggregateKnowledge } from "../utils/aggregateKnowledge";

export const FIXED_TIMESTAMP = COACH_FIXED_TIMESTAMP;

export { createFullCoachInputs } from "../../coach-intelligence/testSupport/fixtures";

export function createFullConversationInputs(): {
  readonly coachingContext: CoachingContext;
  readonly insightSnapshot: InsightSnapshot;
  readonly recoverySnapshot: RecoverySnapshot;
  readonly athleteHistory: AthleteHistory;
  readonly achievementResult: AchievementResult;
  readonly performanceSnapshot: PerformanceSnapshot;
} {
  const coachInputs = createFullCoachInputs();
  const coaching = prepareCoachingContext({
    ...coachInputs,
    preparedAt: FIXED_TIMESTAMP,
    contextId: "coach:conversation-full",
  });

  return Object.freeze({
    coachingContext: coaching.context,
    insightSnapshot: coachInputs.insightSnapshot,
    recoverySnapshot: coachInputs.recoverySnapshot,
    athleteHistory: coachInputs.athleteHistory,
    achievementResult: coachInputs.achievementResult,
    performanceSnapshot: coachInputs.performanceSnapshot,
  });
}

export function createConversationSessionFixture(
  overrides: Partial<ConversationSession> = {},
): ConversationSession {
  return Object.freeze({
    athleteId: overrides.athleteId ?? null,
    sessionId: overrides.sessionId ?? "session-1",
    runtimeId: overrides.runtimeId ?? "runtime-1",
    dayId: overrides.dayId ?? "day-1",
    weekNumber: overrides.weekNumber ?? 1,
    coachingContextId: overrides.coachingContextId ?? "coach:fixture",
    insightSnapshotId: overrides.insightSnapshotId ?? "insight:coach-fixture",
    performanceSnapshotId: overrides.performanceSnapshotId ?? "perf-1",
    achievementEvaluationId: overrides.achievementEvaluationId ?? "ach-eval-1",
    recoverySnapshotId: overrides.recoverySnapshotId ?? "recv:insight-fixture",
    historyId: overrides.historyId ?? "hist:insight-fixture",
    preparedAt: overrides.preparedAt ?? FIXED_TIMESTAMP,
  });
}

export function createConversationEvidenceFixture(
  overrides: Partial<ConversationEvidence> & { readonly id?: string } = {},
): ConversationEvidence {
  return Object.freeze({
    id: overrides.id ?? "conversation-evidence:fixture:1",
    sourceType: overrides.sourceType ?? "CoachEvidence",
    sourceId: overrides.sourceId ?? "coach-evidence:fixture:1",
    statement: overrides.statement ?? "Fixture evidence statement.",
    priority: overrides.priority ?? 50,
    attributes: Object.freeze({ ...(overrides.attributes ?? {}) }),
  });
}

export function createConversationGoalFixture(
  overrides: Partial<ConversationGoal> & { readonly id?: string } = {},
): ConversationGoal {
  return Object.freeze({
    id: overrides.id ?? "conversation-goal:fixture:1",
    intent: overrides.intent ?? ConversationIntents.FOCUS,
    priority: overrides.priority ?? 50,
    title: overrides.title ?? "Fixture goal",
    statement: overrides.statement ?? "Fixture goal statement.",
    reason:
      overrides.reason ??
      Object.freeze({
        code: "fixture_reason",
        statement: "Fixture reason",
        attributes: Object.freeze({}),
      }),
    evidenceIds: Object.freeze([...(overrides.evidenceIds ?? [])]),
    objectiveIds: Object.freeze([...(overrides.objectiveIds ?? [])]),
    metadata:
      overrides.metadata ??
      Object.freeze({
        tags: Object.freeze(["fixture"]),
        attributes: Object.freeze({}),
      }),
  });
}

export function createConversationContextFixture(
  overrides: {
    readonly id?: string;
    readonly session?: ConversationSession;
    readonly goals?: readonly ConversationGoal[];
    readonly evidence?: readonly ConversationEvidence[];
  } = {},
): ConversationContext {
  const id = overrides.id ?? "conversation:fixture";
  const evidence = overrides.evidence ?? [createConversationEvidenceFixture()];
  const goals =
    overrides.goals ??
    [
      createConversationGoalFixture({
        evidenceIds: evidence.map((item) => item.id),
      }),
    ];
  const session = overrides.session ?? createConversationSessionFixture();

  const request = new ConversationRequestBuilder()
    .withId(`conversation-request:${id}`)
    .withContextId(id)
    .withAudience(ConversationAudiences.ATHLETE)
    .withPrimaryIntent(goals[0]?.intent ?? null)
    .withGoalIds(goals.map((goal) => goal.id))
    .withConstraintIds([])
    .withEvidenceIds(evidence.map((item) => item.id))
    .withKnowledgeRefs([session.coachingContextId])
    .withStatement("Fixture conversation request.")
    .build();

  const summary = new ConversationSummaryBuilder()
    .withIds({ contextId: id, athleteId: session.athleteId })
    .withGoalCount(goals.length)
    .withConstraintCount(0)
    .withEvidenceCount(evidence.length)
    .withTurnCount(0)
    .withMessageCount(0)
    .withTopGoalIds(goals.slice(0, 3).map((g) => g.id))
    .withPrimaryIntent(goals[0]?.intent ?? null)
    .withState(ConversationStates.READY)
    .withStage(ConversationStages.REQUEST_READY)
    .withSummaryText(`${goals.length} conversation goals.`)
    .build();

  return new ConversationContextBuilder()
    .withId(id)
    .withSession(session)
    .withAudience(ConversationAudiences.ATHLETE)
    .withState(ConversationStates.READY)
    .withStage(ConversationStages.REQUEST_READY)
    .withIntent(goals[0]?.intent ?? ConversationIntents.FOCUS)
    .withGoals(goals)
    .withConstraints([])
    .withEvidence(evidence)
    .withKnowledge(
      aggregateKnowledge({
        coachingContextId: session.coachingContextId,
        objectiveIds: goals.flatMap((goal) => goal.objectiveIds),
        selectedObjectiveIds: goals.flatMap((goal) => goal.objectiveIds),
        insightIds: [],
        recoveryReferenced: false,
        historyReferenced: false,
        performanceReferenced: false,
        achievementReferenced: false,
      }),
    )
    .withMessages([])
    .withTurns([])
    .withRequest(request)
    .withResponsePlaceholder(
      Object.freeze({
        id: `conversation-response-placeholder:${id}`,
        contextId: id,
        status: "reserved" as const,
        provider: null,
        content: null,
        reservedAt: FIXED_TIMESTAMP,
      }),
    )
    .withPreparation(
      Object.freeze({
        preparedAt: FIXED_TIMESTAMP,
        coachingContextId: session.coachingContextId,
        selectorNames: Object.freeze(["KnowledgeSelector"]),
        goalCount: goals.length,
        constraintCount: 0,
        evidenceCount: evidence.length,
        turnCount: 0,
        messageCount: 0,
        missingInformation: Object.freeze([] as string[]),
      }),
    )
    .withSummary(summary)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}
