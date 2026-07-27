import {
  CoachConversationIntents,
  routeCoachConversationIntent,
} from "../index";

describe("Coach conversation intent routing", () => {
  it("routes workout explanation intents", () => {
    expect(routeCoachConversationIntent("Explain today's workout")).toBe(
      CoachConversationIntents.WORKOUT_EXPLANATION,
    );
  });

  it("routes workout summary intents", () => {
    expect(routeCoachConversationIntent("Summarize my workout plan")).toBe(
      CoachConversationIntents.WORKOUT_SUMMARY,
    );
  });

  it("routes exercise explanation intents", () => {
    expect(
      routeCoachConversationIntent("Why this exercise in the session?"),
    ).toBe(CoachConversationIntents.EXERCISE_EXPLANATION);
  });

  it("routes progression explanation intents", () => {
    expect(routeCoachConversationIntent("How should I progress next week?")).toBe(
      CoachConversationIntents.PROGRESSION_EXPLANATION,
    );
  });

  it("routes recovery explanation intents", () => {
    expect(routeCoachConversationIntent("Explain the recovery decision")).toBe(
      CoachConversationIntents.RECOVERY_EXPLANATION,
    );
  });

  it("routes recommendation explanation intents", () => {
    expect(
      routeCoachConversationIntent("Why did you recommend this approach?"),
    ).toBe(CoachConversationIntents.RECOMMENDATION_EXPLANATION);
  });

  it("routes adaptive workout modification intents", () => {
    expect(
      routeCoachConversationIntent("Replace this exercise with another lift"),
    ).toBe(CoachConversationIntents.WORKOUT_MODIFICATION);
    expect(
      routeCoachConversationIntent("Reduce the intensity of today's workout"),
    ).toBe(CoachConversationIntents.WORKOUT_MODIFICATION);
    expect(
      routeCoachConversationIntent("I don't have a barbell available"),
    ).toBe(CoachConversationIntents.WORKOUT_MODIFICATION);
  });

  it("routes plan restore intents", () => {
    expect(routeCoachConversationIntent("Undo my last workout change")).toBe(
      CoachConversationIntents.PLAN_RESTORE,
    );
    expect(routeCoachConversationIntent("Bring back my original diet")).toBe(
      CoachConversationIntents.PLAN_RESTORE,
    );
  });

  it("routes timeline query intents", () => {
    expect(routeCoachConversationIntent("Why did you lower my volume?")).toBe(
      CoachConversationIntents.TIMELINE_QUERY,
    );
    expect(routeCoachConversationIntent("What changed this week?")).toBe(
      CoachConversationIntents.TIMELINE_QUERY,
    );
    expect(
      routeCoachConversationIntent("Show me the latest adjustments"),
    ).toBe(CoachConversationIntents.TIMELINE_QUERY);
  });

  it("routes coach insight intents", () => {
    expect(routeCoachConversationIntent("Anything I should know?")).toBe(
      CoachConversationIntents.COACH_INSIGHT,
    );
    expect(routeCoachConversationIntent("Do you see any problems?")).toBe(
      CoachConversationIntents.COACH_INSIGHT,
    );
    expect(routeCoachConversationIntent("How am I progressing?")).toBe(
      CoachConversationIntents.COACH_INSIGHT,
    );
    expect(routeCoachConversationIntent("What should I improve?")).toBe(
      CoachConversationIntents.COACH_INSIGHT,
    );
    expect(
      routeCoachConversationIntent("What patterns do you notice?"),
    ).toBe(CoachConversationIntents.COACH_INSIGHT);
  });

  it("routes general coaching intents", () => {
    expect(routeCoachConversationIntent("Give me coaching tips")).toBe(
      CoachConversationIntents.GENERAL_COACHING,
    );
  });

  it("falls back to unknown intent", () => {
    expect(routeCoachConversationIntent("asdf qwerty")).toBe(
      CoachConversationIntents.UNKNOWN,
    );
  });

  it("honors intent hints", () => {
    expect(
      routeCoachConversationIntent("hello", CoachConversationIntents.WORKOUT_SUMMARY),
    ).toBe(CoachConversationIntents.WORKOUT_SUMMARY);
  });
});
