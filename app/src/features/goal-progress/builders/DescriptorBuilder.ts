import type { GoalDescriptor } from "../models/GoalDescriptor";
import { freezeDescriptor } from "../utils/FreezeGoalProgress";

export function buildGoalDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): GoalDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Goal Progress Engine",
    version: "24.4.0",
    capabilities: Object.freeze([
      "evaluateGoalProgress",
      "trackGoalProgress",
      "describeGoalProgress",
      "createGoalSnapshot",
      "validateGoalProgress",
    ]),
    boundaries: Object.freeze([
      "no_openai_sdk",
      "no_prompt_builder",
      "no_tool_runtime",
      "no_action_engine",
      "no_ai_reasoning",
      "no_goal_mutation",
      "no_business_calculations",
      "no_persistence",
      "no_networking",
      "no_ui",
      "no_plan_adaptation",
      "evaluation_only",
      "deterministic_only",
    ]),
    createdAt: input.createdAt,
  });
}
