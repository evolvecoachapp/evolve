import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import { freezeDescriptor } from "../utils/FreezeExplanationState";

export function buildExplanationDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): ExplanationDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Explainability Engine",
    version: "22.5.0",
    capabilities: Object.freeze([
      "buildExplanation",
      "validateExplanation",
      "describeExplanation",
      "createExplanationSnapshot",
      "packageExplanation",
    ]),
    boundaries: Object.freeze([
      "No AI reasoning",
      "No NL generation",
      "No decision mutation",
      "Structured explanations only",
    ]),
    createdAt: input.createdAt,
  });
}
