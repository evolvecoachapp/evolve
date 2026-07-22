import { calculateContextWeight } from "../calculateContextWeight";
import { createDefaultPromptPolicy } from "../createDefaultPromptPolicy";
import { freezePromptComposition } from "../freezePromptComposition";
import { rankContext } from "../rankContext";
import { trimContext } from "../trimContext";
import type { PromptComposition } from "../../models/PromptComposition";

describe("prompt orchestrator utilities", () => {
  const policy = createDefaultPromptPolicy();

  it("calculateContextWeight sums relative weights", () => {
    expect(
      calculateContextWeight(["conversation", "memory"], policy.budget),
    ).toBe(45);
  });

  it("rankContext orders by priority", () => {
    expect(
      rankContext(["memory", "athlete", "coach"], policy.priority, "desc"),
    ).toEqual(["athlete", "coach", "memory"]);
  });

  it("trimContext removes low priority kinds first", () => {
    const result = trimContext(
      ["conversation", "athlete", "coach", "workout", "memory"],
      policy.budget,
      policy.priority,
    );

    expect(result.trimmed[0]).toBe("memory");
  });

  it("freezePromptComposition freezes nested fields", () => {
    const composition = freezePromptComposition({
      intent: "UNKNOWN",
      selection: {
        kinds: Object.freeze(["conversation"]),
        includeConversation: true,
        includeAthlete: false,
        includeMemory: false,
        includeWorkout: false,
        includeCoach: false,
      },
      conversation: null,
      athleteProfile: null,
      memory: null,
      workoutSummary: null,
      coachSummary: null,
      promptContext: null,
      budget: policy.budget,
      trimmedKinds: Object.freeze([]),
      usedWeight: 0,
    } as PromptComposition);

    expect(Object.isFrozen(composition)).toBe(true);
    expect(Object.isFrozen(composition.selection)).toBe(true);
  });
});
