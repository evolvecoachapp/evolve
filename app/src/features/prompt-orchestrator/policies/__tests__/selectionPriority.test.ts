import { PromptPriorityPolicy } from "../PromptPriorityPolicy";
import { PromptSelectionPolicy } from "../PromptSelectionPolicy";
import { createDefaultPromptPolicy } from "../../utils/createDefaultPromptPolicy";

describe("prompt orchestration policies", () => {
  it("PromptSelectionPolicy returns kinds for intent", () => {
    const policy = new PromptSelectionPolicy();
    expect(policy.kindsFor("NUTRITION")).toEqual([
      "conversation",
      "athlete",
      "memory",
    ]);
    expect(policy.kindsFor("UNKNOWN")).toEqual(["conversation", "athlete"]);
  });

  it("PromptPriorityPolicy ranks low priority first when ascending", () => {
    const policy = new PromptPriorityPolicy();
    expect(policy.ascending(["coach", "memory", "athlete"])).toEqual([
      "memory",
      "coach",
      "athlete",
    ]);
  });

  it("accepts custom policy configuration", () => {
    const defaults = createDefaultPromptPolicy();
    const selection = new PromptSelectionPolicy({
      ...defaults.selection,
      GENERAL_CHAT: Object.freeze(["conversation"]),
    });

    expect(selection.kindsFor("GENERAL_CHAT")).toEqual(["conversation"]);
  });
});
