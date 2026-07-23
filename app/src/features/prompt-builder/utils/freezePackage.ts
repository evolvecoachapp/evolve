import type { PromptBlock } from "../models/PromptBlock";
import type { PromptBuildResult } from "../models/PromptBuildResult";
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
import type { PromptSnapshot } from "../models/PromptSnapshot";
import type { PromptStatistics } from "../models/PromptStatistics";
import type { PromptSummary } from "../models/PromptSummary";
import type { PromptTemplate } from "../models/PromptTemplate";
import type { PromptToolDefinition } from "../models/PromptToolDefinition";
import type { SystemPrompt } from "../models/SystemPrompt";
import type { UserPrompt } from "../models/UserPrompt";

function freezeMetadata(metadata: PromptMetadata): PromptMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeBlock(block: PromptBlock): PromptBlock {
  return Object.freeze({
    ...block,
    refs: Object.freeze([...block.refs]),
    metadata: freezeMetadata(block.metadata),
    attributes: Object.freeze({ ...block.attributes }),
  });
}

export function freezeInstruction(
  instruction: PromptInstruction,
): PromptInstruction {
  return Object.freeze({
    ...instruction,
    sourceRefs: Object.freeze([...instruction.sourceRefs]),
    metadata: freezeMetadata(instruction.metadata),
  });
}

export function freezeConstraint(
  constraint: PromptConstraint,
): PromptConstraint {
  return Object.freeze({
    ...constraint,
    sourceRefs: Object.freeze([...constraint.sourceRefs]),
    metadata: freezeMetadata(constraint.metadata),
  });
}

export function freezePersona(persona: PromptPersona): PromptPersona {
  return Object.freeze({
    ...persona,
    refs: Object.freeze([...persona.refs]),
  });
}

export function freezeCapability(
  capabilities: PromptCapability,
): PromptCapability {
  return Object.freeze({
    ...capabilities,
    codes: Object.freeze([...capabilities.codes]),
    statements: Object.freeze([...capabilities.statements]),
    refs: Object.freeze([...capabilities.refs]),
  });
}

export function freezeKnowledge(knowledge: PromptKnowledge): PromptKnowledge {
  return Object.freeze({
    ...knowledge,
    objectiveIds: Object.freeze([...knowledge.objectiveIds]),
    insightIds: Object.freeze([...knowledge.insightIds]),
    evidenceIds: Object.freeze([...knowledge.evidenceIds]),
    knowledgeRefs: Object.freeze([...knowledge.knowledgeRefs]),
  });
}

export function freezeFormatting(
  formatting: PromptFormatting,
): PromptFormatting {
  return Object.freeze({
    ...formatting,
    rules: Object.freeze([...formatting.rules]),
  });
}

export function freezeTool(
  tool: PromptToolDefinition,
): PromptToolDefinition {
  return Object.freeze({
    ...tool,
    parameterSchema: Object.freeze({ ...tool.parameterSchema }),
  });
}

export function freezeSafety(safety: PromptSafety): PromptSafety {
  return Object.freeze({
    ...safety,
    codes: Object.freeze([...safety.codes]),
    constraintIds: Object.freeze([...safety.constraintIds]),
  });
}

export function freezeContext(context: PromptContext): PromptContext {
  return Object.freeze({ ...context });
}

export function freezeTemplate(template: PromptTemplate): PromptTemplate {
  return Object.freeze({
    ...template,
    blockTypes: Object.freeze([...template.blockTypes]),
    metadata: freezeMetadata(template.metadata),
  });
}

export function freezeSystemPrompt(prompt: SystemPrompt): SystemPrompt {
  return Object.freeze({
    ...prompt,
    statements: Object.freeze([...prompt.statements]),
    blockIds: Object.freeze([...prompt.blockIds]),
    metadata: freezeMetadata(prompt.metadata),
  });
}

export function freezeUserPrompt(prompt: UserPrompt): UserPrompt {
  return Object.freeze({
    ...prompt,
    statements: Object.freeze([...prompt.statements]),
    blockIds: Object.freeze([...prompt.blockIds]),
    metadata: freezeMetadata(prompt.metadata),
  });
}

export function freezeComposition(
  composition: PromptComposition,
): PromptComposition {
  return Object.freeze({
    ...composition,
    blockIds: Object.freeze([...composition.blockIds]),
    sectionIds: Object.freeze([...composition.sectionIds]),
    templateIds: Object.freeze([...composition.templateIds]),
  });
}

export function freezeStatistics(
  statistics: PromptStatistics,
): PromptStatistics {
  return Object.freeze({
    ...statistics,
    blockTypeCounts: Object.freeze({ ...statistics.blockTypeCounts }),
  });
}

export function freezePromptSummary(summary: PromptSummary): PromptSummary {
  return Object.freeze({
    ...summary,
    blockTypes: Object.freeze([...summary.blockTypes]),
    topBlockIds: Object.freeze([...summary.topBlockIds]),
  });
}

export function freezePackage(promptPackage: PromptPackage): PromptPackage {
  return Object.freeze({
    ...promptPackage,
    context: freezeContext(promptPackage.context),
    persona: freezePersona(promptPackage.persona),
    capabilities: freezeCapability(promptPackage.capabilities),
    knowledge: freezeKnowledge(promptPackage.knowledge),
    formatting: freezeFormatting(promptPackage.formatting),
    safety: freezeSafety(promptPackage.safety),
    constraints: Object.freeze(
      promptPackage.constraints.map(freezeConstraint),
    ),
    instructions: Object.freeze(
      promptPackage.instructions.map(freezeInstruction),
    ),
    tools: Object.freeze(promptPackage.tools.map(freezeTool)),
    blocks: Object.freeze(promptPackage.blocks.map(freezeBlock)),
    sections: Object.freeze([...promptPackage.sections]),
    templates: Object.freeze(promptPackage.templates.map(freezeTemplate)),
    systemPrompt: freezeSystemPrompt(promptPackage.systemPrompt),
    userPrompt: freezeUserPrompt(promptPackage.userPrompt),
    assistantPrompt: promptPackage.assistantPrompt
      ? Object.freeze({
          ...promptPackage.assistantPrompt,
          statements: Object.freeze([
            ...promptPackage.assistantPrompt.statements,
          ]),
          blockIds: Object.freeze([...promptPackage.assistantPrompt.blockIds]),
          metadata: freezeMetadata(promptPackage.assistantPrompt.metadata),
        })
      : null,
    composition: freezeComposition(promptPackage.composition),
    statistics: freezeStatistics(promptPackage.statistics),
    metadata: freezeMetadata(promptPackage.metadata),
    summary: freezePromptSummary(promptPackage.summary),
  });
}

export function freezeSnapshot(snapshot: PromptSnapshot): PromptSnapshot {
  return Object.freeze({
    ...snapshot,
    promptPackage: freezePackage(snapshot.promptPackage),
    summary: freezePromptSummary(snapshot.summary),
    statistics: freezeStatistics(snapshot.statistics),
  });
}

export function freezeBuildResult(result: PromptBuildResult): PromptBuildResult {
  return Object.freeze({
    snapshot: freezeSnapshot(result.snapshot),
    promptPackage: freezePackage(result.promptPackage),
    summary: freezePromptSummary(result.summary),
    statistics: freezeStatistics(result.statistics),
    systemPrompt: freezeSystemPrompt(result.systemPrompt),
    userPrompt: freezeUserPrompt(result.userPrompt),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
