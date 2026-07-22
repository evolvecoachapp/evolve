import { PromptSelectionPolicy } from "../../policies/PromptSelectionPolicy";
import { selectPromptContexts } from "../selectPromptContexts";
import { createPromptRequest } from "../../testSupport/fixtures";

describe("selectPromptContexts", () => {
  it("selects workout domains for WORKOUT intent", () => {
    const selection = selectPromptContexts(
      "WORKOUT",
      createPromptRequest({ message: "workout" }),
    );

    expect(selection.includeConversation).toBe(true);
    expect(selection.includeAthlete).toBe(true);
    expect(selection.includeWorkout).toBe(true);
    expect(selection.includeCoach).toBe(true);
    expect(selection.includeMemory).toBe(false);
  });

  it("omits unavailable contexts", () => {
    const selection = selectPromptContexts(
      "WORKOUT",
      createPromptRequest({
        workoutSummary: null,
        coachSummary: null,
      }),
    );

    expect(selection.kinds).toEqual(["conversation", "athlete"]);
  });

  it("uses selection policy for GENERAL_CHAT", () => {
    const selection = selectPromptContexts(
      "GENERAL_CHAT",
      createPromptRequest(),
      new PromptSelectionPolicy(),
    );

    expect(selection.kinds).toEqual(["conversation", "athlete"]);
  });

  it("selects progress domains including memory", () => {
    const selection = selectPromptContexts(
      "PROGRESS",
      createPromptRequest(),
    );

    expect(selection.includeMemory).toBe(true);
    expect(selection.includeCoach).toBe(true);
    expect(selection.includeWorkout).toBe(true);
  });
});
