import { CoachInstructionBuilder } from "../builders/CoachInstructionBuilder";
import { CoachSummaryBuilder } from "../builders/CoachSummaryBuilder";
import { CoachingContextBuilder } from "../builders/CoachingContextBuilder";
import { CoachAudiences } from "../models/CoachAudience";
import { CoachCommunicationStyles } from "../models/CoachCommunicationStyle";
import {
  createCoachEvidenceFixture,
  createCoachObjectiveFixture,
  createCoachSessionFixture,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { aggregateKnowledge } from "../utils/aggregateKnowledge";

describe("coach-intelligence builders", () => {
  it("builds frozen instruction", () => {
    const instruction = new CoachInstructionBuilder()
      .withId("inst-1")
      .withCode("code_a")
      .withObjectiveId("obj-1")
      .withStatement("Structured instruction.")
      .withPriority(70)
      .withReason(
        Object.freeze({
          code: "r1",
          statement: "reason",
          attributes: Object.freeze({}),
        }),
      )
      .withEvidenceIds(["ev-1"])
      .build();

    expect(Object.isFrozen(instruction)).toBe(true);
    expect(instruction.priority).toBe(70);
  });

  it("builds frozen summary and context", () => {
    const session = createCoachSessionFixture();
    const evidence = [createCoachEvidenceFixture()];
    const objectives = [
      createCoachObjectiveFixture({ evidenceIds: [evidence[0].id] }),
    ];

    const summary = new CoachSummaryBuilder()
      .withIds({ contextId: "coach:builder", athleteId: null })
      .withObjectiveCount(1)
      .withConstraintCount(0)
      .withInstructionCount(0)
      .withFocusCount(0)
      .withEvidenceCount(1)
      .withTopObjectiveIds([objectives[0].id])
      .withPrimaryIntent(objectives[0].intent)
      .withSummaryText("1 coaching objective.")
      .build();

    const context = new CoachingContextBuilder()
      .withId("coach:builder")
      .withSession(session)
      .withAudience(CoachAudiences.ATHLETE)
      .withCommunicationStyle(CoachCommunicationStyles.CONCISE)
      .withObjectives(objectives)
      .withConstraints([])
      .withInstructions([])
      .withFocus([])
      .withEvidence(evidence)
      .withKnowledge(
        aggregateKnowledge({
          insightIds: ["i1"],
          selectedInsightIds: ["i1"],
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
          objectiveCount: 1,
          constraintCount: 0,
          instructionCount: 0,
          evidenceCount: 1,
          missingInformation: Object.freeze([] as string[]),
        }),
      )
      .withSummary(summary)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(context)).toBe(true);
    expect(context.communicationStyle).toBe(CoachCommunicationStyles.CONCISE);
  });

  it("throws when required fields are missing", () => {
    expect(() => new CoachInstructionBuilder().build()).toThrow(
      /missing required fields/,
    );
    expect(() => new CoachSummaryBuilder().build()).toThrow(
      /missing required fields/,
    );
    expect(() => new CoachingContextBuilder().build()).toThrow(
      /missing required fields/,
    );
  });
});
