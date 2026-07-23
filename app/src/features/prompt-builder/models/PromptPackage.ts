import type { AssistantPrompt } from "./AssistantPrompt";
import type { PromptBlock } from "./PromptBlock";
import type { PromptCapability } from "./PromptCapability";
import type { PromptComposition } from "./PromptComposition";
import type { PromptConstraint } from "./PromptConstraint";
import type { PromptContext } from "./PromptContext";
import type { PromptFormatting } from "./PromptFormatting";
import type { PromptInstruction } from "./PromptInstruction";
import type { PromptKnowledge } from "./PromptKnowledge";
import type { PromptMetadata } from "./PromptMetadata";
import type { PromptPersona } from "./PromptPersona";
import type { PromptSafety } from "./PromptSafety";
import type { PromptSection } from "./PromptSection";
import type { PromptStatistics } from "./PromptStatistics";
import type { PromptSummary } from "./PromptSummary";
import type { PromptTemplate } from "./PromptTemplate";
import type { PromptToolDefinition } from "./PromptToolDefinition";
import type { SystemPrompt } from "./SystemPrompt";
import type { UserPrompt } from "./UserPrompt";

/**
 * Immutable Prompt Package — primary Prompt Builder output.
 */
export interface PromptPackage {
  readonly id: string;
  readonly conversationContextId: string;
  readonly context: PromptContext;
  readonly persona: PromptPersona;
  readonly capabilities: PromptCapability;
  readonly knowledge: PromptKnowledge;
  readonly formatting: PromptFormatting;
  readonly safety: PromptSafety;
  readonly constraints: readonly PromptConstraint[];
  readonly instructions: readonly PromptInstruction[];
  readonly tools: readonly PromptToolDefinition[];
  readonly blocks: readonly PromptBlock[];
  readonly sections: readonly PromptSection[];
  readonly templates: readonly PromptTemplate[];
  readonly systemPrompt: SystemPrompt;
  readonly userPrompt: UserPrompt;
  readonly assistantPrompt: AssistantPrompt | null;
  readonly composition: PromptComposition;
  readonly statistics: PromptStatistics;
  readonly metadata: PromptMetadata;
  readonly summary: PromptSummary;
  readonly frozenAt: string;
}
