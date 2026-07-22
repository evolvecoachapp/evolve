import type { PromptBlock } from "./PromptBlock";
import type { PromptConstraints } from "./PromptConstraints";
import type { PromptContext } from "./PromptContext";
import type { PromptConversation } from "./PromptConversation";
import type { PromptIdentity } from "./PromptIdentity";
import type { PromptInstruction } from "./PromptInstruction";
import type { PromptKnowledge } from "./PromptKnowledge";
import type { PromptMemory } from "./PromptMemory";
import type { PromptMetadata } from "./PromptMetadata";
import type { PromptSafety } from "./PromptSafety";
import type { PromptSection } from "./PromptSection";
import type { PromptSummary } from "./PromptSummary";
import type { PromptUserInput } from "./PromptUserInput";

/**
 * Immutable Prompt Package — primary Prompt Composition Engine output.
 *
 * Structured prompt blocks for Future Provider Abstraction.
 * Not a provider-specific prompt string. Not AI-generated.
 */
export interface PromptPackage {
  readonly id: string;
  readonly conversationContextId: string;
  readonly context: PromptContext;
  readonly identity: PromptIdentity;
  readonly knowledge: PromptKnowledge;
  readonly conversation: PromptConversation;
  readonly memory: PromptMemory;
  readonly constraints: PromptConstraints;
  readonly safety: PromptSafety;
  readonly userInput: PromptUserInput;
  readonly instructions: readonly PromptInstruction[];
  readonly blocks: readonly PromptBlock[];
  readonly sections: readonly PromptSection[];
  readonly composerNames: readonly string[];
  readonly metadata: PromptMetadata;
  readonly summary: PromptSummary;
  readonly frozenAt: string;
}
