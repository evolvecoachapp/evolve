import type { CoachingExplanation } from "./CoachingExplanation";
import type { ExplanationConflict } from "./ExplanationConflict";
import type { ExplanationConstraint } from "./ExplanationConstraint";
import type { ExplanationDependency } from "./ExplanationDependency";
import type { ExplanationDiagnostics } from "./ExplanationDiagnostics";
import type { ExplanationGraph } from "./ExplanationGraph";
import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationResolution } from "./ExplanationResolution";
import type { ExplanationSnapshot } from "./ExplanationSnapshot";
import type { ExplanationStatistics } from "./ExplanationStatistics";
import type { ExplanationSummary } from "./ExplanationSummary";
import type { ExplanationTimeline } from "./ExplanationTimeline";
import type { ExplanationTrace } from "./ExplanationTrace";
import type { LLMFormatterInput } from "./LLMFormatterInput";

export interface ExplanationPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly snapshot: ExplanationSnapshot | null;
  readonly graph: ExplanationGraph | null;
  readonly trace: ExplanationTrace | null;
  readonly timeline: ExplanationTimeline | null;
  readonly statistics: ExplanationStatistics;
  readonly diagnostics: ExplanationDiagnostics;
  readonly llmFormatterInput: LLMFormatterInput | null;
  readonly dependencies: readonly ExplanationDependency[];
  readonly constraints: readonly ExplanationConstraint[];
  readonly conflicts: readonly ExplanationConflict[];
  readonly resolutions: readonly ExplanationResolution[];
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
