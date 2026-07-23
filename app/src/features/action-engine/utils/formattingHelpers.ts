import type { ActionPlan } from "../models/ActionPlan";
import type { ActionStep } from "../models/ActionStep";

/**
 * Deterministic formatting helpers for plan descriptions (no UI).
 */

export function formatStepLabel(step: ActionStep): string {
  return `[${step.type}/${step.priority}] ${step.label}`.trim();
}

export function formatPlanHeadline(plan: ActionPlan): string {
  return `ActionPlan ${plan.id} (${plan.intent}) — ${plan.steps.length} step(s)`;
}

export function describeStepBrief(step: ActionStep): string {
  const target = step.target ? ` → ${step.target.label}` : "";
  return `${formatStepLabel(step)}${target}`;
}

export function describeActions(
  steps: readonly ActionStep[],
): readonly string[] {
  return Object.freeze(steps.map(describeStepBrief));
}

export function truncateText(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}
