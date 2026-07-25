import type { CoachingExplanation } from "./CoachingExplanation";
import type { ExplanationDescriptor } from "./ExplanationDescriptor";
import type { ExplanationError } from "./ExplanationError";
import type { ExplanationPackage } from "./ExplanationPackage";
import type { ExplanationSnapshot } from "./ExplanationSnapshot";
import type { ExplanationSummary } from "./ExplanationSummary";
import type { ExplanationValidation } from "./ExplanationValidation";
import type { LLMFormatterInput } from "./LLMFormatterInput";

export const ExplanationOperationKinds = {
  BUILD: "build",
  VALIDATE: "validate",
  SNAPSHOT: "snapshot",
  PACKAGE: "package",
  DESCRIBE: "describe",
} as const;

export type ExplanationOperationKind =
  (typeof ExplanationOperationKinds)[keyof typeof ExplanationOperationKinds];

export interface ExplanationResult {
  readonly id: string;
  readonly operation: ExplanationOperationKind;
  readonly success: boolean;
  readonly explanations: readonly CoachingExplanation[];
  readonly package: ExplanationPackage | null;
  readonly summary: ExplanationSummary | null;
  readonly snapshot: ExplanationSnapshot | null;
  readonly llmFormatterInput: LLMFormatterInput | null;
  readonly validation: ExplanationValidation | null;
  readonly descriptor: ExplanationDescriptor | null;
  readonly errors: readonly ExplanationError[];
  readonly createdAt: string;
}
