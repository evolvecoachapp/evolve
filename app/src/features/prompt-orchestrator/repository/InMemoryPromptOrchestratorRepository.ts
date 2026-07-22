import type { PromptBudget } from "../models/PromptBudget";
import type { PromptPolicy } from "../models/PromptPolicy";
import type { PromptPriority } from "../models/PromptPriority";
import { createDefaultPromptPolicy } from "../utils/createDefaultPromptPolicy";
import type { PromptOrchestratorRepository } from "./PromptOrchestratorRepository";

/**
 * Ephemeral in-process PromptOrchestratorRepository.
 *
 * Suitable for tests and offline orchestration — not durable storage.
 */
export class InMemoryPromptOrchestratorRepository
  implements PromptOrchestratorRepository
{
  private policy: PromptPolicy;

  constructor(initialPolicy: PromptPolicy = createDefaultPromptPolicy()) {
    this.policy = clonePolicy(initialPolicy);
  }

  async getPolicy(): Promise<PromptPolicy> {
    return clonePolicy(this.policy);
  }

  async setPolicy(policy: PromptPolicy): Promise<PromptPolicy> {
    this.policy = clonePolicy(policy);
    return clonePolicy(this.policy);
  }

  async getBudget(): Promise<PromptBudget> {
    return clonePolicy(this.policy).budget;
  }

  async setBudget(budget: PromptBudget): Promise<PromptBudget> {
    this.policy = clonePolicy({
      ...this.policy,
      budget: Object.freeze({
        maxWeight: budget.maxWeight,
        weights: Object.freeze({ ...budget.weights }),
      }),
    });
    return clonePolicy(this.policy).budget;
  }

  async getPriority(): Promise<PromptPriority> {
    return clonePolicy(this.policy).priority;
  }

  async setPriority(priority: PromptPriority): Promise<PromptPriority> {
    this.policy = clonePolicy({
      ...this.policy,
      priority: Object.freeze({
        ranks: Object.freeze({ ...priority.ranks }),
      }),
    });
    return clonePolicy(this.policy).priority;
  }

  /** Test helper — replace policy synchronously. */
  seed(policy: PromptPolicy): void {
    this.policy = clonePolicy(policy);
  }
}

function clonePolicy(policy: PromptPolicy): PromptPolicy {
  const selectionEntries = Object.entries(policy.selection).map(
    ([intent, kinds]) => [intent, Object.freeze([...kinds])],
  );

  return Object.freeze({
    selection: Object.freeze(
      Object.fromEntries(selectionEntries),
    ) as PromptPolicy["selection"],
    priority: Object.freeze({
      ranks: Object.freeze({ ...policy.priority.ranks }),
    }),
    budget: Object.freeze({
      maxWeight: policy.budget.maxWeight,
      weights: Object.freeze({ ...policy.budget.weights }),
    }),
  });
}
