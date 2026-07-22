import { prepareConversation } from "../application";
import {
  createConversationGoalFixture,
  createFullConversationInputs,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { aggregateKnowledge } from "../utils/aggregateKnowledge";
import {
  validateConstraints,
  validateContextConsistency,
  validateGoals,
  validateKnowledge,
  validateMissingInformation,
  validatePriorities,
  validateSnapshotIntegrity,
} from "../validators";

describe("conversation-orchestrator validators", () => {
  it("validateGoals catches missing title and invalid intent", () => {
    const issues = validateGoals([
      createConversationGoalFixture({
        title: "",
        intent: "not-an-intent" as never,
      }),
    ]);

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining("goal_missing_title"),
        expect.stringContaining("goal_invalid_intent"),
      ]),
    );
  });

  it("validateConstraints / validateKnowledge / validatePriorities", () => {
    expect(
      validateConstraints([
        Object.freeze({
          id: "c1",
          code: "",
          statement: "x",
          sourceType: "CoachConstraint",
          sourceId: "src",
          priority: 50,
          reason: Object.freeze({
            code: "r",
            statement: "s",
            attributes: Object.freeze({}),
          }),
        }),
      ]),
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("missing_code")]),
    );

    expect(
      validateKnowledge(
        aggregateKnowledge({
          coachingContextId: "",
          objectiveIds: ["a"],
          selectedObjectiveIds: ["b"],
          insightIds: [],
          recoveryReferenced: false,
          historyReferenced: false,
          performanceReferenced: false,
          achievementReferenced: false,
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        "knowledge_missing_coaching_context_id",
        "knowledge_selected_unknown_objective:b",
      ]),
    );

    expect(
      validatePriorities({
        goals: [createConversationGoalFixture({ priority: 0 })],
        constraints: [],
        evidence: [],
        messages: [],
        turns: [],
      }),
    ).toEqual(
      expect.arrayContaining([expect.stringContaining("invalid_goal_priority")]),
    );
  });

  it("validateContextConsistency and snapshot integrity on prepared result", () => {
    const inputs = createFullConversationInputs();
    const result = prepareConversation({
      ...inputs,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "conversation:validators",
    });

    expect(validateContextConsistency(result.context)).toEqual([]);
    expect(validateSnapshotIntegrity(result.snapshot)).toEqual([]);
  });

  it("validateMissingInformation flags absent optional refs", () => {
    const inputs = createFullConversationInputs();
    const missing = validateMissingInformation({
      coachingContext: inputs.coachingContext,
    });

    expect(missing).toEqual(
      expect.arrayContaining([
        "missing_insight_snapshot",
        "missing_recovery_snapshot",
        "missing_athlete_history",
        "missing_performance_snapshot",
        "missing_achievement_result",
      ]),
    );
  });
});
