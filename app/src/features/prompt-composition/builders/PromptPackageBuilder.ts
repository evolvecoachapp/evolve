import type { PromptBlock } from "../models/PromptBlock";
import type { PromptConstraints } from "../models/PromptConstraints";
import type { PromptContext } from "../models/PromptContext";
import type { PromptConversation } from "../models/PromptConversation";
import type { PromptIdentity } from "../models/PromptIdentity";
import type { PromptInstruction } from "../models/PromptInstruction";
import type { PromptKnowledge } from "../models/PromptKnowledge";
import type { PromptMemory } from "../models/PromptMemory";
import type { PromptMetadata } from "../models/PromptMetadata";
import type { PromptPackage } from "../models/PromptPackage";
import type { PromptSafety } from "../models/PromptSafety";
import type { PromptSection } from "../models/PromptSection";
import type { PromptSummary } from "../models/PromptSummary";
import type { PromptUserInput } from "../models/PromptUserInput";
import { freezePackage } from "../utils/freezePackage";

/**
 * Fluent builder for immutable PromptPackage.
 */
export class PromptPackageBuilder {
  private id = "";
  private conversationContextId = "";
  private context: PromptContext | null = null;
  private identity: PromptIdentity | null = null;
  private knowledge: PromptKnowledge | null = null;
  private conversation: PromptConversation | null = null;
  private memory: PromptMemory | null = null;
  private constraints: PromptConstraints | null = null;
  private safety: PromptSafety | null = null;
  private userInput: PromptUserInput | null = null;
  private instructions: readonly PromptInstruction[] = [];
  private blocks: readonly PromptBlock[] = [];
  private sections: readonly PromptSection[] = [];
  private composerNames: readonly string[] = [];
  private metadata: PromptMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({}),
  });
  private summary: PromptSummary | null = null;
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withConversationContextId(id: string): this {
    this.conversationContextId = id;
    return this;
  }

  withContext(context: PromptContext): this {
    this.context = context;
    return this;
  }

  withIdentity(identity: PromptIdentity): this {
    this.identity = identity;
    return this;
  }

  withKnowledge(knowledge: PromptKnowledge): this {
    this.knowledge = knowledge;
    return this;
  }

  withConversation(conversation: PromptConversation): this {
    this.conversation = conversation;
    return this;
  }

  withMemory(memory: PromptMemory): this {
    this.memory = memory;
    return this;
  }

  withConstraints(constraints: PromptConstraints): this {
    this.constraints = constraints;
    return this;
  }

  withSafety(safety: PromptSafety): this {
    this.safety = safety;
    return this;
  }

  withUserInput(userInput: PromptUserInput): this {
    this.userInput = userInput;
    return this;
  }

  withInstructions(instructions: readonly PromptInstruction[]): this {
    this.instructions = instructions;
    return this;
  }

  withBlocks(blocks: readonly PromptBlock[]): this {
    this.blocks = blocks;
    return this;
  }

  withSections(sections: readonly PromptSection[]): this {
    this.sections = sections;
    return this;
  }

  withComposerNames(names: readonly string[]): this {
    this.composerNames = names;
    return this;
  }

  withMetadata(metadata: PromptMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withSummary(summary: PromptSummary): this {
    this.summary = summary;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): PromptPackage {
    if (
      !this.id ||
      !this.conversationContextId ||
      !this.context ||
      !this.identity ||
      !this.knowledge ||
      !this.conversation ||
      !this.memory ||
      !this.constraints ||
      !this.safety ||
      !this.userInput ||
      !this.summary ||
      !this.frozenAt
    ) {
      throw new Error("PromptPackageBuilder missing required fields");
    }

    return freezePackage({
      id: this.id,
      conversationContextId: this.conversationContextId,
      context: this.context,
      identity: this.identity,
      knowledge: this.knowledge,
      conversation: this.conversation,
      memory: this.memory,
      constraints: this.constraints,
      safety: this.safety,
      userInput: this.userInput,
      instructions: this.instructions,
      blocks: this.blocks,
      sections: this.sections,
      composerNames: this.composerNames,
      metadata: this.metadata,
      summary: this.summary,
      frozenAt: this.frozenAt,
    });
  }
}
