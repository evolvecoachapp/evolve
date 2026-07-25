import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import { DecisionCategories } from "../models/DecisionCategory";
import { EMPTY_DECISION_METADATA } from "../models/DecisionMetadata";
import { freezeDescriptor } from "../utils/FreezeDecisionState";

export function buildDecisionDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): DecisionDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Decision Engine",
    version: "0.1.0",
    capabilities: Object.freeze([
      "buildDecision",
      "evaluateDecision",
      "resolveDecision",
      "describeDecision",
      "validateDecision",
    ]),
    categories: Object.freeze(Object.values(DecisionCategories)),
    metadata: EMPTY_DECISION_METADATA,
    createdAt: input.createdAt,
  });
}
