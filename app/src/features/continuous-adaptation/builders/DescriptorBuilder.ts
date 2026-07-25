import type { AdaptationDescriptor } from "../models/AdaptationDescriptor";
import { freezeDescriptor } from "../utils/FreezeAdaptationState";

export function buildAdaptationDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): AdaptationDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Continuous Adaptation Engine",
    version: "23.1.0",
    capabilities: Object.freeze([
      "evaluateAdaptation",
      "detectAdaptation",
      "describeAdaptation",
      "createAdaptationSnapshot",
      "validateAdaptation",
    ]),
    boundaries: Object.freeze([
      "no_openai_sdk",
      "no_prompt_builder",
      "no_tool_runtime",
      "no_action_engine",
      "no_ai_reasoning",
      "no_recommendation_generation",
      "no_business_calculations",
      "no_persistence",
      "no_networking",
      "no_ui",
      "no_plan_modification",
      "detection_only",
      "deterministic_only",
    ]),
    createdAt: input.createdAt,
  });
}
