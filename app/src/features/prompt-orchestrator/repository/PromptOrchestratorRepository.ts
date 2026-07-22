import type { PromptBudget } from "../models/PromptBudget";
import type { PromptPolicy } from "../models/PromptPolicy";
import type { PromptPriority } from "../models/PromptPriority";

/**
 * Persistence boundary for configurable orchestration policies.
 *
 * Future-ready — no durable storage in this sprint.
 */
export interface PromptOrchestratorRepository {
  /** Full policy aggregate. */
  getPolicy(): Promise<PromptPolicy>;

  /** Replace the stored policy aggregate. */
  setPolicy(policy: PromptPolicy): Promise<PromptPolicy>;

  getBudget(): Promise<PromptBudget>;

  setBudget(budget: PromptBudget): Promise<PromptBudget>;

  getPriority(): Promise<PromptPriority>;

  setPriority(priority: PromptPriority): Promise<PromptPriority>;
}
