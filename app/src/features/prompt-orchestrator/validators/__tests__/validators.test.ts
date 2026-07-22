import {
  validateBudget,
  validateComposition,
  validateIntent,
  validatePromptRequest,
} from "../validatePromptRequest";
import { createDefaultPromptPolicy } from "../../utils/createDefaultPromptPolicy";
import { createPromptRequest } from "../../testSupport/fixtures";
import { PromptComposer } from "../../composer/PromptComposer";
import { selectPromptContexts } from "../../selectors/selectPromptContexts";

describe("prompt orchestrator validators", () => {
  it("validateIntent accepts known intents", () => {
    expect(validateIntent("WORKOUT")).toEqual([]);
    expect(validateIntent("not-real")).toEqual(["invalid_intent"]);
  });

  it("validatePromptRequest rejects empty messages", () => {
    expect(validatePromptRequest({ message: "   " })).toEqual([
      "empty_message",
    ]);
    expect(validatePromptRequest({ message: "Hello" })).toEqual([]);
  });

  it("validateBudget rejects non-positive maxWeight", () => {
    const defaults = createDefaultPromptPolicy();
    expect(
      validateBudget({ maxWeight: 0, weights: defaults.budget.weights }),
    ).toContain("invalid_max_weight");
  });

  it("validateComposition accepts a frozen composer output", () => {
    const policy = createDefaultPromptPolicy();
    const request = createPromptRequest({ message: "train today" });
    const selection = selectPromptContexts("WORKOUT", request);
    const composition = new PromptComposer().compose({
      intent: "WORKOUT",
      selection,
      request,
      budget: policy.budget,
      priority: policy.priority,
    });

    expect(validateComposition(composition)).toEqual([]);
  });
});
