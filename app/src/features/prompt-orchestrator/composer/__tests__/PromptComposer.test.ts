import { PromptComposer } from "../PromptComposer";
import { createDefaultPromptPolicy } from "../../utils/createDefaultPromptPolicy";
import { createPromptRequest } from "../../testSupport/fixtures";
import { selectPromptContexts } from "../../selectors/selectPromptContexts";

describe("PromptComposer", () => {
  const policy = createDefaultPromptPolicy();
  const composer = new PromptComposer();

  it("merges selected contexts and freezes composition", () => {
    const request = createPromptRequest({
      message: "What should I train?",
      intentOverride: "WORKOUT",
    });
    const selection = selectPromptContexts("WORKOUT", request);
    const composition = composer.compose({
      intent: "WORKOUT",
      selection,
      request,
      budget: policy.budget,
      priority: policy.priority,
    });

    expect(Object.isFrozen(composition)).toBe(true);
    expect(composition.workoutSummary?.title).toBe("Upper Strength");
    expect(composition.coachSummary).not.toBeNull();
    expect(composition.memory).toBeNull();
    expect(composition.promptContext).not.toBeNull();
  });

  it("excludes deselected domains", () => {
    const request = createPromptRequest({ message: "hi" });
    const selection = selectPromptContexts("GENERAL_CHAT", request);
    const composition = composer.compose({
      intent: "GENERAL_CHAT",
      selection,
      request,
      budget: policy.budget,
      priority: policy.priority,
    });

    expect(composition.selection.includeWorkout).toBe(false);
    expect(composition.workoutSummary).toBeNull();
    expect(composition.coachSummary).toBeNull();
    expect(composition.memory).toBeNull();
  });
});
