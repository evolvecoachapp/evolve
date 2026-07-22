import { InMemoryToolRegistry } from "../registry/InMemoryToolRegistry";
import type { ToolRegistry } from "../registry/ToolRegistry";
import {
  GetAthleteProfileTool,
  GetCoachSummaryTool,
  GetMemoryContextTool,
  GetWorkoutHistoryTool,
  GetWorkoutSummaryTool,
  SaveCoachNoteTool,
} from "../tools";
import { freezeToolRegistry } from "../utils/freezeToolRegistry";
import { ToolExecutor } from "./ToolExecutor";

/**
 * Build a frozen registry with all placeholder tools.
 */
export function createDefaultToolRegistry(): ToolRegistry {
  const registry = new InMemoryToolRegistry();
  registry.register(new GetAthleteProfileTool());
  registry.register(new GetWorkoutSummaryTool());
  registry.register(new GetWorkoutHistoryTool());
  registry.register(new GetCoachSummaryTool());
  registry.register(new GetMemoryContextTool());
  registry.register(new SaveCoachNoteTool());
  return freezeToolRegistry(registry);
}

/**
 * Compose ToolExecutor with the default frozen placeholder registry.
 */
export function createToolExecutor(
  registry: ToolRegistry = createDefaultToolRegistry(),
): ToolExecutor {
  return new ToolExecutor(registry);
}
