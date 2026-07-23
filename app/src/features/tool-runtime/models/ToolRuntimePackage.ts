import type { ToolExecutionContext } from "./ToolExecutionContext";
import type { ToolExecutionPlan } from "./ToolExecutionPlan";
import type { ToolExecutionRequest } from "./ToolExecutionRequest";
import type { ToolExecutionResult } from "./ToolExecutionResult";
import type { ToolExecutionSnapshot } from "./ToolExecutionSnapshot";
import type { ToolExecutionValidation } from "./ToolExecutionValidation";
import type { ToolRuntime } from "./ToolRuntime";

/**
 * Full immutable package produced by Tool Runtime orchestration.
 */
export interface ToolRuntimePackage {
  readonly runtime: ToolRuntime;
  readonly plan: ToolExecutionPlan;
  readonly context: ToolExecutionContext;
  readonly request: ToolExecutionRequest | null;
  readonly result: ToolExecutionResult | null;
  readonly snapshot: ToolExecutionSnapshot;
  readonly validation: ToolExecutionValidation;
  readonly createdAt: string;
}
