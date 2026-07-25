import type { CoachingExplanation } from "../models/CoachingExplanation";
import type { ExplanationDescriptor } from "../models/ExplanationDescriptor";
import type { ExplanationError } from "../models/ExplanationError";
import type { ExplanationPackage } from "../models/ExplanationPackage";
import type {
  ExplanationOperationKind,
  ExplanationResult,
} from "../models/ExplanationResult";
import type { ExplanationSnapshot } from "../models/ExplanationSnapshot";
import type { ExplanationSummary } from "../models/ExplanationSummary";
import type { ExplanationValidation } from "../models/ExplanationValidation";
import type { LLMFormatterInput } from "../models/LLMFormatterInput";
import { freezeResult } from "../utils/FreezeExplanationState";

export function buildExplanationResult(input: {
  readonly id: string;
  readonly operation: ExplanationOperationKind;
  readonly success: boolean;
  readonly explanations?: readonly CoachingExplanation[];
  readonly package?: ExplanationPackage | null;
  readonly summary?: ExplanationSummary | null;
  readonly snapshot?: ExplanationSnapshot | null;
  readonly llmFormatterInput?: LLMFormatterInput | null;
  readonly validation?: ExplanationValidation | null;
  readonly descriptor?: ExplanationDescriptor | null;
  readonly errors?: readonly ExplanationError[];
  readonly createdAt: string;
}): ExplanationResult {
  return freezeResult({
    id: input.id,
    operation: input.operation,
    success: input.success,
    explanations: Object.freeze([...(input.explanations ?? [])]),
    package: input.package ?? null,
    summary: input.summary ?? null,
    snapshot: input.snapshot ?? null,
    llmFormatterInput: input.llmFormatterInput ?? null,
    validation: input.validation ?? null,
    descriptor: input.descriptor ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    createdAt: input.createdAt,
  });
}
