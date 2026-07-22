import { createToolExecutor } from "../../tool-calling/services/createToolExecutor";
import type { ToolExecutor } from "../../tool-calling/services/ToolExecutor";
import { InMemoryWorkflowRegistry } from "../registry/InMemoryWorkflowRegistry";
import type { WorkflowRegistry } from "../registry/WorkflowRegistry";
import { freezeWorkflowRegistry } from "../utils/freezeWorkflowRegistry";
import {
  AnalyzeProgressWorkflow,
  BuildNutritionOverviewWorkflow,
  GenerateWorkoutWorkflow,
  PlanDeloadWorkflow,
  RecommendRecoveryWorkflow,
} from "../workflows";
import { WorkflowExecutor } from "./WorkflowExecutor";
import { WorkflowPlanner } from "./WorkflowPlanner";

/**
 * Build a frozen registry with all placeholder workflows.
 */
export function createDefaultWorkflowRegistry(): WorkflowRegistry {
  const registry = new InMemoryWorkflowRegistry();
  registry.register(new GenerateWorkoutWorkflow());
  registry.register(new AnalyzeProgressWorkflow());
  registry.register(new RecommendRecoveryWorkflow());
  registry.register(new PlanDeloadWorkflow());
  registry.register(new BuildNutritionOverviewWorkflow());
  return freezeWorkflowRegistry(registry);
}

/**
 * Compose WorkflowExecutor with the default frozen placeholder registry
 * and a ToolExecutor for step actions.
 */
export function createWorkflowExecutor(
  registry: WorkflowRegistry = createDefaultWorkflowRegistry(),
  toolExecutor: ToolExecutor = createToolExecutor(),
  planner: WorkflowPlanner = new WorkflowPlanner(),
): WorkflowExecutor {
  return new WorkflowExecutor(registry, toolExecutor, planner);
}
