import type { PromptBudget } from "../models/PromptBudget";
import type { PromptIntent } from "../models/PromptIntent";
import { PROMPT_INTENTS } from "../models/PromptIntent";

/** Structured validation issue codes — never prose. */
export type PromptOrchestratorValidationCode =
  | "empty_message"
  | "invalid_intent"
  | "invalid_max_weight"
  | "invalid_weight"
  | "missing_budget_weight"
  | "missing_composition_intent"
  | "composition_weight_exceeds_budget"
  | "selection_kind_mismatch";

/**
 * Validate a prompt intent value.
 */
export function validateIntent(
  intent: unknown,
): readonly PromptOrchestratorValidationCode[] {
  if (
    typeof intent !== "string" ||
    !(PROMPT_INTENTS as readonly string[]).includes(intent)
  ) {
    return Object.freeze(["invalid_intent" as const]);
  }
  return Object.freeze([]);
}

/**
 * Validate PromptRequest message presence.
 */
export function validatePromptRequest(request: {
  readonly message: string;
  readonly intentOverride?: PromptIntent;
}): readonly PromptOrchestratorValidationCode[] {
  const issues: PromptOrchestratorValidationCode[] = [];

  if (typeof request.message !== "string" || request.message.trim().length === 0) {
    issues.push("empty_message");
  }

  if (request.intentOverride !== undefined) {
    issues.push(...validateIntent(request.intentOverride));
  }

  return Object.freeze(issues);
}

/**
 * Validate budget configuration (relative weights only).
 */
export function validateBudget(
  budget: PromptBudget,
): readonly PromptOrchestratorValidationCode[] {
  const issues: PromptOrchestratorValidationCode[] = [];

  if (
    typeof budget.maxWeight !== "number" ||
    !Number.isFinite(budget.maxWeight) ||
    budget.maxWeight <= 0
  ) {
    issues.push("invalid_max_weight");
  }

  const required = [
    "conversation",
    "athlete",
    "memory",
    "workout",
    "coach",
  ] as const;

  for (const kind of required) {
    const weight = budget.weights[kind];
    if (weight === undefined) {
      issues.push("missing_budget_weight");
      continue;
    }
    if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) {
      issues.push("invalid_weight");
    }
  }

  return Object.freeze([...new Set(issues)]);
}

/**
 * Validate a frozen PromptComposition structural integrity.
 */
export function validateComposition(composition: {
  readonly intent: PromptIntent;
  readonly selection: {
    readonly kinds: readonly string[];
    readonly includeConversation: boolean;
    readonly includeAthlete: boolean;
    readonly includeMemory: boolean;
    readonly includeWorkout: boolean;
    readonly includeCoach: boolean;
  };
  readonly budget: PromptBudget;
  readonly usedWeight: number;
}): readonly PromptOrchestratorValidationCode[] {
  const issues: PromptOrchestratorValidationCode[] = [];

  issues.push(...validateIntent(composition.intent));
  if (issues.includes("invalid_intent")) {
    issues.push("missing_composition_intent");
  }

  issues.push(...validateBudget(composition.budget));

  if (composition.usedWeight > composition.budget.maxWeight) {
    issues.push("composition_weight_exceeds_budget");
  }

  const kinds = new Set(composition.selection.kinds);
  if (
    composition.selection.includeConversation !== kinds.has("conversation") ||
    composition.selection.includeAthlete !== kinds.has("athlete") ||
    composition.selection.includeMemory !== kinds.has("memory") ||
    composition.selection.includeWorkout !== kinds.has("workout") ||
    composition.selection.includeCoach !== kinds.has("coach")
  ) {
    issues.push("selection_kind_mismatch");
  }

  return Object.freeze([...new Set(issues)]);
}
