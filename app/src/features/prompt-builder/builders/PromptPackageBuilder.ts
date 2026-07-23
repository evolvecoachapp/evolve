import type { AssistantPrompt } from "../models/AssistantPrompt";
import type { PromptBlock } from "../models/PromptBlock";
import type { PromptCapability } from "../models/PromptCapability";
import type { PromptComposition } from "../models/PromptComposition";
import type { PromptConstraint } from "../models/PromptConstraint";
import type { PromptContext } from "../models/PromptContext";
import type { PromptFormatting } from "../models/PromptFormatting";
import type { PromptInstruction } from "../models/PromptInstruction";
import type { PromptKnowledge } from "../models/PromptKnowledge";
import type { PromptMetadata } from "../models/PromptMetadata";
import type { PromptPackage } from "../models/PromptPackage";
import type { PromptPersona } from "../models/PromptPersona";
import type { PromptSafety } from "../models/PromptSafety";
import type { PromptSection } from "../models/PromptSection";
import type { PromptStatistics } from "../models/PromptStatistics";
import type { PromptSummary } from "../models/PromptSummary";
import type { PromptTemplate } from "../models/PromptTemplate";
import type { PromptToolDefinition } from "../models/PromptToolDefinition";
import type { SystemPrompt } from "../models/SystemPrompt";
import type { UserPrompt } from "../models/UserPrompt";
import { freezePackage } from "../utils/freezePackage";

/**
 * Fluent builder for immutable PromptPackage.
 */
export class PromptPackageBuilder {
  private id = "";
  private conversationContextId = "";
  private context: PromptContext | null = null;
  private persona: PromptPersona | null = null;
  private capabilities: PromptCapability | null = null;
  private knowledge: PromptKnowledge | null = null;
  private formatting: PromptFormatting | null = null;
  private safety: PromptSafety | null = null;
  private constraints: readonly PromptConstraint[] = [];
  private instructions: readonly PromptInstruction[] = [];
  private tools: readonly PromptToolDefinition[] = [];
  private blocks: readonly PromptBlock[] = [];
  private sections: readonly PromptSection[] = [];
  private templates: readonly PromptTemplate[] = [];
  private systemPrompt: SystemPrompt | null = null;
  private userPrompt: UserPrompt | null = null;
  private assistantPrompt: AssistantPrompt | null = null;
  private composition: PromptComposition | null = null;
  private statistics: PromptStatistics | null = null;
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

  withPersona(persona: PromptPersona): this {
    this.persona = persona;
    return this;
  }

  withCapabilities(capabilities: PromptCapability): this {
    this.capabilities = capabilities;
    return this;
  }

  withKnowledge(knowledge: PromptKnowledge): this {
    this.knowledge = knowledge;
    return this;
  }

  withFormatting(formatting: PromptFormatting): this {
    this.formatting = formatting;
    return this;
  }

  withSafety(safety: PromptSafety): this {
    this.safety = safety;
    return this;
  }

  withConstraints(constraints: readonly PromptConstraint[]): this {
    this.constraints = constraints;
    return this;
  }

  withInstructions(instructions: readonly PromptInstruction[]): this {
    this.instructions = instructions;
    return this;
  }

  withTools(tools: readonly PromptToolDefinition[]): this {
    this.tools = tools;
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

  withTemplates(templates: readonly PromptTemplate[]): this {
    this.templates = templates;
    return this;
  }

  withSystemPrompt(systemPrompt: SystemPrompt): this {
    this.systemPrompt = systemPrompt;
    return this;
  }

  withUserPrompt(userPrompt: UserPrompt): this {
    this.userPrompt = userPrompt;
    return this;
  }

  withAssistantPrompt(assistantPrompt: AssistantPrompt | null): this {
    this.assistantPrompt = assistantPrompt;
    return this;
  }

  withComposition(composition: PromptComposition): this {
    this.composition = composition;
    return this;
  }

  withStatistics(statistics: PromptStatistics): this {
    this.statistics = statistics;
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
      !this.persona ||
      !this.capabilities ||
      !this.knowledge ||
      !this.formatting ||
      !this.safety ||
      !this.systemPrompt ||
      !this.userPrompt ||
      !this.composition ||
      !this.statistics ||
      !this.summary ||
      !this.frozenAt
    ) {
      throw new Error("PromptPackageBuilder missing required fields");
    }

    return freezePackage({
      id: this.id,
      conversationContextId: this.conversationContextId,
      context: this.context,
      persona: this.persona,
      capabilities: this.capabilities,
      knowledge: this.knowledge,
      formatting: this.formatting,
      safety: this.safety,
      constraints: this.constraints,
      instructions: this.instructions,
      tools: this.tools,
      blocks: this.blocks,
      sections: this.sections,
      templates: this.templates,
      systemPrompt: this.systemPrompt,
      userPrompt: this.userPrompt,
      assistantPrompt: this.assistantPrompt,
      composition: this.composition,
      statistics: this.statistics,
      metadata: this.metadata,
      summary: this.summary,
      frozenAt: this.frozenAt,
    });
  }
}
