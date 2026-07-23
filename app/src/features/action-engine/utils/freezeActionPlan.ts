import type { ActionArgument } from "../models/ActionArgument";
import type { ActionCandidate } from "../models/ActionCandidate";
import type { ActionConstraint } from "../models/ActionConstraint";
import type { ActionContext } from "../models/ActionContext";
import type { ActionDependency } from "../models/ActionDependency";
import type { ActionExecutionPlan } from "../models/ActionExecutionPlan";
import type { ActionMetadata } from "../models/ActionMetadata";
import type { ActionPackage } from "../models/ActionPackage";
import type { ActionPlan } from "../models/ActionPlan";
import type { ActionProposal } from "../models/ActionProposal";
import type { ActionSnapshot } from "../models/ActionSnapshot";
import type { ActionStatistics } from "../models/ActionStatistics";
import type { ActionStep } from "../models/ActionStep";
import type { ActionSummary } from "../models/ActionSummary";
import type { ActionTarget } from "../models/ActionTarget";
import type {
  ActionValidation,
  ActionValidationIssue,
} from "../models/ActionValidation";

export function freezeArgument(arg: ActionArgument): ActionArgument {
  return Object.freeze({ ...arg });
}

export function freezeTarget(target: ActionTarget): ActionTarget {
  return Object.freeze({ ...target });
}

export function freezeConstraint(
  constraint: ActionConstraint,
): ActionConstraint {
  return Object.freeze({ ...constraint });
}

export function freezeDependency(
  dependency: ActionDependency,
): ActionDependency {
  return Object.freeze({ ...dependency });
}

export function freezeMetadata(metadata: ActionMetadata): ActionMetadata {
  return Object.freeze({
    ...metadata,
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeStep(step: ActionStep): ActionStep {
  return Object.freeze({
    ...step,
    target: step.target ? freezeTarget(step.target) : null,
    arguments: Object.freeze(step.arguments.map(freezeArgument)),
    constraints: Object.freeze(step.constraints.map(freezeConstraint)),
    dependsOn: Object.freeze([...step.dependsOn]),
    sourceIds: Object.freeze([...step.sourceIds]),
    metadata: freezeMetadata(step.metadata),
  });
}

export function freezeCandidate(
  candidate: ActionCandidate,
): ActionCandidate {
  return Object.freeze({
    ...candidate,
    target: candidate.target ? freezeTarget(candidate.target) : null,
    arguments: Object.freeze(candidate.arguments.map(freezeArgument)),
    sourceIds: Object.freeze([...candidate.sourceIds]),
  });
}

export function freezeProposal(proposal: ActionProposal): ActionProposal {
  return Object.freeze({
    ...proposal,
    candidates: Object.freeze(proposal.candidates.map(freezeCandidate)),
  });
}

export function freezeSummary(summary: ActionSummary): ActionSummary {
  return Object.freeze({ ...summary });
}

export function freezeStatistics(
  stats: ActionStatistics,
): ActionStatistics {
  return Object.freeze({
    ...stats,
    stepsByType: Object.freeze({ ...stats.stepsByType }),
    stepsByPriority: Object.freeze({ ...stats.stepsByPriority }),
    stepsByStatus: Object.freeze({ ...stats.stepsByStatus }),
  });
}

export function freezeValidationIssue(
  issue: ActionValidationIssue,
): ActionValidationIssue {
  return Object.freeze({ ...issue });
}

export function freezeValidation(
  validation: ActionValidation,
): ActionValidation {
  return Object.freeze({
    valid: validation.valid,
    issues: Object.freeze(validation.issues.map(freezeValidationIssue)),
  });
}

export function freezeContext(context: ActionContext): ActionContext {
  return Object.freeze({ ...context });
}

/**
 * Deep-freeze an immutable ActionPlan.
 */
export function freezeActionPlan(plan: ActionPlan): ActionPlan {
  return Object.freeze({
    ...plan,
    steps: Object.freeze(plan.steps.map(freezeStep)),
    dependencies: Object.freeze(plan.dependencies.map(freezeDependency)),
    constraints: Object.freeze(plan.constraints.map(freezeConstraint)),
    metadata: freezeMetadata(plan.metadata),
  });
}

export function freezeExecutionPlan(
  plan: ActionExecutionPlan,
): ActionExecutionPlan {
  return Object.freeze({
    ...plan,
    orderedStepIds: Object.freeze([...plan.orderedStepIds]),
    steps: Object.freeze(plan.steps.map(freezeStep)),
    sourcePlan: freezeActionPlan(plan.sourcePlan),
  });
}

export function freezeSnapshot(snapshot: ActionSnapshot): ActionSnapshot {
  return Object.freeze({
    plan: freezeActionPlan(snapshot.plan),
    summary: freezeSummary(snapshot.summary),
    statistics: freezeStatistics(snapshot.statistics),
    capturedAt: snapshot.capturedAt,
  });
}

export function freezePackage(pkg: ActionPackage): ActionPackage {
  return Object.freeze({
    plan: freezeActionPlan(pkg.plan),
    context: freezeContext(pkg.context),
    proposal: pkg.proposal ? freezeProposal(pkg.proposal) : null,
    executionPlan: pkg.executionPlan
      ? freezeExecutionPlan(pkg.executionPlan)
      : null,
    snapshot: freezeSnapshot(pkg.snapshot),
    validation: freezeValidation(pkg.validation),
    createdAt: pkg.createdAt,
  });
}
