import type { ToolExecutionPlan } from "../models/ToolExecutionPlan";

export interface PipelineDescriptor {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export const DEFAULT_PIPELINE: PipelineDescriptor = Object.freeze({
  id: "pipeline:default",
  name: "Default Execution Pipeline",
  description: "Resolve → validate → schedule → dispatch → aggregate",
});

export const DRY_RUN_PIPELINE: PipelineDescriptor = Object.freeze({
  id: "pipeline:dry-run",
  name: "Dry Run Pipeline",
  description: "Build and validate without adapter dispatch",
});

/**
 * Deterministic pipeline selection.
 */
export class PipelineSelector {
  readonly id = "selector:pipeline:default";

  select(plan: ToolExecutionPlan, preferredId?: string): PipelineDescriptor {
    if (preferredId === DRY_RUN_PIPELINE.id) return DRY_RUN_PIPELINE;
    if (plan.steps.length === 0) return DRY_RUN_PIPELINE;
    return DEFAULT_PIPELINE;
  }

  list(): readonly PipelineDescriptor[] {
    return Object.freeze([DEFAULT_PIPELINE, DRY_RUN_PIPELINE]);
  }
}
