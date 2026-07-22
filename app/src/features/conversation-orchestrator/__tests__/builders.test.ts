import { ConversationContextBuilder } from "../builders/ConversationContextBuilder";
import { ConversationRequestBuilder } from "../builders/ConversationRequestBuilder";
import { ConversationSummaryBuilder } from "../builders/ConversationSummaryBuilder";
import { ConversationAudiences } from "../models/ConversationAudience";
import { ConversationIntents } from "../models/ConversationIntent";
import { ConversationStages } from "../models/ConversationStage";
import { ConversationStates } from "../models/ConversationState";
import {
  createConversationContextFixture,
  createConversationEvidenceFixture,
  createConversationGoalFixture,
  createConversationSessionFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { aggregateKnowledge } from "../utils/aggregateKnowledge";

describe("conversation-orchestrator builders", () => {
  it("ConversationSummaryBuilder builds frozen summary", () => {
    const summary = new ConversationSummaryBuilder()
      .withIds({ contextId: "conversation:builder", athleteId: null })
      .withGoalCount(1)
      .withConstraintCount(0)
      .withEvidenceCount(1)
      .withTurnCount(0)
      .withMessageCount(0)
      .withTopGoalIds(["conversation-goal:1"])
      .withPrimaryIntent(ConversationIntents.FOCUS)
      .withState(ConversationStates.READY)
      .withStage(ConversationStages.REQUEST_READY)
      .withSummaryText("1 conversation goal.")
      .build();

    expect(Object.isFrozen(summary)).toBe(true);
    expect(summary.contextId).toBe("conversation:builder");
  });

  it("ConversationRequestBuilder builds structured handoff request", () => {
    const request = new ConversationRequestBuilder()
      .withId("conversation-request:1")
      .withContextId("conversation:1")
      .withAudience(ConversationAudiences.ATHLETE)
      .withPrimaryIntent(ConversationIntents.FOCUS)
      .withGoalIds(["conversation-goal:1"])
      .withConstraintIds([])
      .withEvidenceIds(["conversation-evidence:1"])
      .withKnowledgeRefs(["coach:1"])
      .withStatement("Structured request.")
      .build();

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.statement).toContain("Structured");
  });

  it("ConversationContextBuilder builds frozen context", () => {
    const session = createConversationSessionFixture();
    const evidence = [createConversationEvidenceFixture()];
    const goals = [
      createConversationGoalFixture({
        evidenceIds: evidence.map((item) => item.id),
      }),
    ];

    const request = new ConversationRequestBuilder()
      .withId("conversation-request:builder")
      .withContextId("conversation:builder-ctx")
      .withAudience(ConversationAudiences.ATHLETE)
      .withPrimaryIntent(ConversationIntents.FOCUS)
      .withGoalIds(goals.map((goal) => goal.id))
      .withConstraintIds([])
      .withEvidenceIds(evidence.map((item) => item.id))
      .withKnowledgeRefs([session.coachingContextId])
      .withStatement("Builder request.")
      .build();

    const summary = new ConversationSummaryBuilder()
      .withIds({
        contextId: "conversation:builder-ctx",
        athleteId: session.athleteId,
      })
      .withGoalCount(goals.length)
      .withConstraintCount(0)
      .withEvidenceCount(evidence.length)
      .withTurnCount(0)
      .withMessageCount(0)
      .withTopGoalIds(goals.map((goal) => goal.id))
      .withPrimaryIntent(ConversationIntents.FOCUS)
      .withState(ConversationStates.READY)
      .withStage(ConversationStages.REQUEST_READY)
      .withSummaryText("1 conversation goal.")
      .build();

    const context = new ConversationContextBuilder()
      .withId("conversation:builder-ctx")
      .withSession(session)
      .withAudience(ConversationAudiences.ATHLETE)
      .withState(ConversationStates.READY)
      .withStage(ConversationStages.REQUEST_READY)
      .withIntent(ConversationIntents.FOCUS)
      .withGoals(goals)
      .withConstraints([])
      .withEvidence(evidence)
      .withKnowledge(
        aggregateKnowledge({
          coachingContextId: session.coachingContextId,
          objectiveIds: [],
          selectedObjectiveIds: [],
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
          id: "conversation-response-placeholder:builder",
          contextId: "conversation:builder-ctx",
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

    expect(Object.isFrozen(context)).toBe(true);
    expect(createConversationContextFixture().id).toBe("conversation:fixture");
  });
});
