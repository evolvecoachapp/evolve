import {
  createConstraintSelector,
  createEvidenceSelector,
  createGoalSelector,
  createKnowledgeSelector,
  createPrioritySelector,
  createSessionSelector,
} from "../selectors";
import {
  createFullConversationInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("conversation-orchestrator selectors", () => {
  it("KnowledgeSelector aggregates coaching knowledge refs", () => {
    const inputs = createFullConversationInputs();
    const selection = createKnowledgeSelector().select(inputs.coachingContext);

    expect(selection.knowledge.coachingContextId).toBe(
      inputs.coachingContext.id,
    );
    expect(selection.objectiveIds.length).toBe(
      inputs.coachingContext.objectives.length,
    );
    expect(selection.selectedObjectiveIds.length).toBeGreaterThan(0);
  });

  it("PrioritySelector ranks objectives deterministically", () => {
    const inputs = createFullConversationInputs();
    const selection = createPrioritySelector().select(
      inputs.coachingContext.objectives,
    );

    expect(selection.rankedObjectiveIds.length).toBe(
      inputs.coachingContext.objectives.length,
    );
    const priorities = selection.rankedObjectiveIds.map(
      (id) => selection.prioritiesByObjectiveId[id],
    );
    for (let i = 1; i < priorities.length; i += 1) {
      expect(priorities[i - 1]).toBeGreaterThanOrEqual(priorities[i]);
    }
  });

  it("EvidenceSelector / GoalSelector / ConstraintSelector map coaching facts", () => {
    const inputs = createFullConversationInputs();
    const ranked = createPrioritySelector().select(
      inputs.coachingContext.objectives,
    );
    const rankedObjectives = ranked.rankedObjectiveIds
      .map((id) =>
        inputs.coachingContext.objectives.find((item) => item.id === id),
      )
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const evidence = createEvidenceSelector().select({
      coachEvidence: inputs.coachingContext.evidence,
      rankedObjectives,
    });
    const goals = createGoalSelector().select({
      rankedObjectives,
      evidence,
    });
    const constraints = createConstraintSelector().select(
      inputs.coachingContext.constraints,
    );

    expect(evidence.length).toBe(inputs.coachingContext.evidence.length);
    expect(goals.length).toBeGreaterThan(0);
    expect(goals[0].id).toContain("conversation-goal:");
    expect(constraints.length).toBe(
      inputs.coachingContext.constraints.length,
    );
  });

  it("SessionSelector links coaching + optional upstream ids", () => {
    const inputs = createFullConversationInputs();
    const session = createSessionSelector().select({
      coachingContext: inputs.coachingContext,
      preparedAt: FIXED_TIMESTAMP,
      insightSnapshot: inputs.insightSnapshot,
      recoverySnapshot: inputs.recoverySnapshot,
      athleteHistory: inputs.athleteHistory,
      achievementResult: inputs.achievementResult,
      performanceSnapshot: inputs.performanceSnapshot,
    });

    expect(session.coachingContextId).toBe(inputs.coachingContext.id);
    expect(session.insightSnapshotId).toBe(inputs.insightSnapshot.id);
    expect(session.recoverySnapshotId).toBe(inputs.recoverySnapshot.id);
    expect(session.historyId).toBe(inputs.athleteHistory.id);
  });
});
