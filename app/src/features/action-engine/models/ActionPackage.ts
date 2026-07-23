import type { ActionContext } from "./ActionContext";
import type { ActionExecutionPlan } from "./ActionExecutionPlan";
import type { ActionPlan } from "./ActionPlan";
import type { ActionProposal } from "./ActionProposal";
import type { ActionSnapshot } from "./ActionSnapshot";
import type { ActionValidation } from "./ActionValidation";

/**
 * Full immutable package produced by the Action Engine pipeline.
 */
export interface ActionPackage {
  readonly plan: ActionPlan;
  readonly context: ActionContext;
  readonly proposal: ActionProposal | null;
  readonly executionPlan: ActionExecutionPlan | null;
  readonly snapshot: ActionSnapshot;
  readonly validation: ActionValidation;
  readonly createdAt: string;
}
