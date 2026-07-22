import { createDefaultPromptPolicy } from "../../utils/createDefaultPromptPolicy";
import { calculateContextWeight } from "../../utils/calculateContextWeight";
import { trimContext } from "../../utils/trimContext";
import { PromptBudgetPolicy } from "../PromptBudgetPolicy";

describe("PromptBudgetPolicy and budget trimming", () => {
  const policy = createDefaultPromptPolicy();

  it("calculates relative weights", () => {
    const budgetPolicy = new PromptBudgetPolicy(policy.budget);
    expect(budgetPolicy.weightOf("conversation")).toBe(25);
    expect(
      budgetPolicy.totalWeight(["conversation", "athlete", "coach"]),
    ).toBe(75);
  });

  it("trims lowest priority first when over budget", () => {
    const kinds = [
      "conversation",
      "athlete",
      "coach",
      "workout",
      "memory",
    ] as const;

    expect(calculateContextWeight(kinds, policy.budget)).toBeGreaterThan(
      policy.budget.maxWeight,
    );

    const result = trimContext(kinds, policy.budget, policy.priority);

    expect(result.trimmed).toEqual(["memory"]);
    expect(result.kept).not.toContain("memory");
    expect(result.usedWeight).toBeLessThanOrEqual(policy.budget.maxWeight);
  });

  it("reports when kinds exceed budget", () => {
    const budgetPolicy = new PromptBudgetPolicy({
      maxWeight: 30,
      weights: policy.budget.weights,
    });

    expect(budgetPolicy.exceeds(["conversation", "athlete"])).toBe(true);
  });
});
