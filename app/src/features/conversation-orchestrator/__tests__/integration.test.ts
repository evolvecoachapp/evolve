import { prepareCoachingContext } from "../../coach-intelligence/application";
import { createFullCoachInputs } from "../../coach-intelligence/testSupport/fixtures";
import { prepareConversation } from "../application";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("conversation-orchestrator integration", () => {
  it("consumes CoachingContext and optional upstream references", () => {
    const coachInputs = createFullCoachInputs();
    const coaching = prepareCoachingContext({
      ...coachInputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:conversation-integration",
    });

    const conversation = prepareConversation({
      coachingContext: coaching.context,
      insightSnapshot: coachInputs.insightSnapshot,
      recoverySnapshot: coachInputs.recoverySnapshot,
      athleteHistory: coachInputs.athleteHistory,
      achievementResult: coachInputs.achievementResult,
      performanceSnapshot: coachInputs.performanceSnapshot,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:integration",
    });

    expect(conversation.context.session.coachingContextId).toBe(
      "coach:conversation-integration",
    );
    expect(conversation.context.session.insightSnapshotId).toBe(
      coachInputs.insightSnapshot.id,
    );
    expect(conversation.context.session.performanceSnapshotId).toBe(
      coachInputs.performanceSnapshot.id,
    );
    expect(conversation.context.session.recoverySnapshotId).toBe(
      coachInputs.recoverySnapshot.id,
    );
    expect(conversation.context.session.historyId).toBe(
      coachInputs.athleteHistory.id,
    );
    expect(conversation.context.knowledge.recoveryReferenced).toBe(true);
    expect(conversation.context.request.goalIds.length).toBe(
      conversation.context.goals.length,
    );
  });

  it("does not mutate CoachingContext or optional upstream inputs", () => {
    const coachInputs = createFullCoachInputs();
    const coaching = prepareCoachingContext({
      ...coachInputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "coach:conversation-immutability",
    });

    const coachingBefore = JSON.stringify(coaching.context);
    const insightBefore = JSON.stringify(coachInputs.insightSnapshot);
    const recoveryBefore = JSON.stringify(coachInputs.recoverySnapshot);
    const historyBefore = JSON.stringify(coachInputs.athleteHistory);
    const performanceBefore = JSON.stringify(coachInputs.performanceSnapshot);
    const achievementBefore = JSON.stringify(coachInputs.achievementResult);

    prepareConversation({
      coachingContext: coaching.context,
      insightSnapshot: coachInputs.insightSnapshot,
      recoverySnapshot: coachInputs.recoverySnapshot,
      athleteHistory: coachInputs.athleteHistory,
      achievementResult: coachInputs.achievementResult,
      performanceSnapshot: coachInputs.performanceSnapshot,
      preparedAt: FIXED_TIMESTAMP,
    });

    expect(JSON.stringify(coaching.context)).toBe(coachingBefore);
    expect(JSON.stringify(coachInputs.insightSnapshot)).toBe(insightBefore);
    expect(JSON.stringify(coachInputs.recoverySnapshot)).toBe(recoveryBefore);
    expect(JSON.stringify(coachInputs.athleteHistory)).toBe(historyBefore);
    expect(JSON.stringify(coachInputs.performanceSnapshot)).toBe(
      performanceBefore,
    );
    expect(JSON.stringify(coachInputs.achievementResult)).toBe(
      achievementBefore,
    );
  });
});
