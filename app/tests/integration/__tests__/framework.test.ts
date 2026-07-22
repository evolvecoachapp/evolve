import {
  buildAthlete,
  buildConversation,
  buildWorkflow,
  buildWorkoutRequest,
} from "../builders";
import {
  AdvancedPowerliftingAthlete,
  BeginnerBodybuildingAthlete,
  listAthleteFixtures,
} from "../fixtures";
import { expectWorkout } from "../assertions";
import { executePipeline, loadAthleteFixture, compareSnapshots } from "../utils";
import { normalizeWorkoutSnapshot, normalizeVolatileValues } from "../snapshots";
import { INTEGRATION_FIXED_TIMESTAMP } from "../shared";

describe("integration framework — fixtures", () => {
  it("exposes immutable named athlete fixtures", () => {
    const fixtures = listAthleteFixtures();
    expect(fixtures.length).toBe(10);
    for (const fixture of fixtures) {
      expect(Object.isFrozen(fixture)).toBe(true);
      expect(Object.isFrozen(fixture.athleteContext)).toBe(true);
      expect(Object.isFrozen(fixture.athleteContext.profile)).toBe(true);
    }
  });

  it("loads fixtures by name", () => {
    const fixture = loadAthleteFixture("AdvancedPowerliftingAthlete");
    expect(fixture.key).toBe(AdvancedPowerliftingAthlete.key);
  });
});

describe("integration framework — builders", () => {
  it("supports fluent athlete construction", () => {
    const athlete = buildAthlete()
      .advanced()
      .powerlifting()
      .gym()
      .fourTrainingDays()
      .strengthFocus()
      .withId("athlete-builder-pl")
      .withDisplayName("Builder Powerlifter")
      .build();

    expect(athlete.athleteContext.profile.experience.level).toBe("advanced");
    expect(athlete.athleteContext.profile.goal.primary).toBe("strength");
    expect(athlete.athleteContext.profile.equipment.hasFullGymAccess).toBe(true);
    expect(athlete.athleteContext.profile.availability.daysPerWeek).toBe(4);
    expect(Object.isFrozen(athlete)).toBe(true);
  });

  it("builds conversation and workflow contexts", () => {
    const conversation = buildConversation()
      .withId("conversation-builder-1")
      .withUserMessage("Build me a strength session")
      .build();
    const workflow = buildWorkflow()
      .withAthleteId("athlete-builder-pl")
      .withConversationId(conversation.conversationId)
      .build();

    expect(conversation.messages).toHaveLength(1);
    expect(workflow.now).toBe(INTEGRATION_FIXED_TIMESTAMP);
    expect(Object.isFrozen(conversation)).toBe(true);
    expect(Object.isFrozen(workflow)).toBe(true);
  });

  it("builds aligned workout generation requests", () => {
    const request = buildWorkoutRequest()
      .withAthlete(BeginnerBodybuildingAthlete)
      .alignedContexts()
      .withDefaultUpperBodyBlueprint()
      .withExplanations(true)
      .build();

    expect(request.athleteContext.profile.id).toBe(
      BeginnerBodybuildingAthlete.athleteContext.profile.id,
    );
    expect(request.conversationContext?.conversationId).toContain("conversation:");
    expect(request.dayId).toBe("day-upper");
    expect(Object.isFrozen(request)).toBe(true);
  });
});

describe("integration framework — assertions", () => {
  it("provides reusable domain assertions over a full pipeline result", async () => {
    const result = await executePipeline(
      buildWorkoutRequest()
        .withAthlete(AdvancedPowerliftingAthlete)
        .alignedContexts()
        .withDefaultUpperBodyBlueprint()
        .build(),
    );

    expectWorkout(result)
      .toBeValid()
      .toContainProgramming()
      .toContainProgression()
      .toContainAdaptation()
      .toContainWorkoutSession()
      .toHaveExerciseOrder()
      .toHaveNoDuplicateExercises()
      .toHaveExecutionTrace()
      .toHaveExecutionSummary()
      .toBeImmutable();
  });
});

describe("integration framework — snapshots", () => {
  it("normalizes volatile strings", () => {
    expect(normalizeVolatileValues("2026-07-22T12:00:00.000Z")).toBe(
      "<TIMESTAMP>",
    );
    expect(normalizeVolatileValues("generation:athlete-1:conversation-1")).toBe(
      "<GENERATION_ID>",
    );
  });

  it("builds comparable structural snapshots", async () => {
    const request = buildWorkoutRequest()
      .withAthlete(BeginnerBodybuildingAthlete)
      .alignedContexts()
      .withDefaultUpperBodyBlueprint()
      .build();
    const result = await executePipeline(request);
    const snapshot = normalizeWorkoutSnapshot(result, {
      scenarioId: "framework-self-test",
    });

    expect(snapshot.hasProgramming).toBe(true);
    expect(snapshot.hasProgression).toBe(true);
    expect(snapshot.hasAdaptation).toBe(true);
    expect(snapshot.hasSession).toBe(true);
    expect(snapshot.stepOrder.length).toBeGreaterThan(0);
    expect(compareSnapshots(snapshot, snapshot)).toEqual([]);
  });
});
