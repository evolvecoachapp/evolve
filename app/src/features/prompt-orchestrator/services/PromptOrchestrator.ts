import { PromptComposer } from "../composer/PromptComposer";
import type { PromptOrchestrationResult } from "../models/PromptOrchestrationResult";
import { PromptOrchestratorError } from "../models/PromptOrchestratorError";
import type { PromptRequest } from "../models/PromptRequest";
import { PromptBudgetPolicy } from "../policies/PromptBudgetPolicy";
import { PromptPriorityPolicy } from "../policies/PromptPriorityPolicy";
import { PromptSelectionPolicy } from "../policies/PromptSelectionPolicy";
import type { PromptOrchestratorRepository } from "../repository/PromptOrchestratorRepository";
import { resolvePromptIntent } from "../selectors/detectPromptIntent";
import { selectPromptContexts } from "../selectors/selectPromptContexts";
import {
  validateBudget,
  validateComposition,
  validatePromptRequest,
} from "../validators";

/**
 * Selects and composes prompt context from available domains.
 *
 * Never calls OpenAI, never contains prompt templates, never formats text.
 */
export class PromptOrchestrator {
  private readonly composer = new PromptComposer();

  constructor(private readonly repository: PromptOrchestratorRepository) {}

  /**
   * Detect intent, select contexts, apply budget, freeze composition.
   */
  async orchestrate(
    request: PromptRequest,
  ): Promise<PromptOrchestrationResult> {
    const requestIssues = validatePromptRequest(request);
    if (requestIssues.length > 0) {
      throw new PromptOrchestratorError(
        "invalid_request",
        `Invalid prompt request: ${requestIssues.join(",")}`,
        { issues: requestIssues },
      );
    }

    const policy = await this.repository.getPolicy();
    const budgetIssues = validateBudget(policy.budget);
    if (budgetIssues.length > 0) {
      throw new PromptOrchestratorError(
        "invalid_budget",
        `Invalid prompt budget: ${budgetIssues.join(",")}`,
        { issues: budgetIssues },
      );
    }

    const selectionPolicy = new PromptSelectionPolicy(policy.selection);
    const priorityPolicy = new PromptPriorityPolicy(policy.priority);
    const budgetPolicy = new PromptBudgetPolicy(policy.budget);

    const intent = resolvePromptIntent(request.message, request.intentOverride);
    const selection = selectPromptContexts(intent, request, selectionPolicy);

    const composition = this.composer.compose({
      intent,
      selection,
      request,
      budget: budgetPolicy.toBudget(),
      priority: priorityPolicy.toPriority(),
    });

    const compositionIssues = validateComposition(composition);
    if (compositionIssues.length > 0) {
      throw new PromptOrchestratorError(
        "invalid_composition",
        `Invalid prompt composition: ${compositionIssues.join(",")}`,
        { issues: compositionIssues },
      );
    }

    return Object.freeze({
      intent,
      selection: composition.selection,
      composition,
    });
  }
}
