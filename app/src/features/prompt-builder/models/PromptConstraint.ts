import type { PromptMetadata } from "./PromptMetadata";
import type { PromptPriority } from "./PromptPriority";

export interface PromptConstraint {
  readonly id: string;
  readonly code: string;
  readonly statement: string;
  readonly priority: PromptPriority;
  readonly sourceRefs: readonly string[];
  readonly metadata: PromptMetadata;
}
