import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptTemplate } from "../models/PromptTemplate";
import { PromptSections } from "../models/PromptSection";
import { freezeTemplate } from "../utils/freezePackage";

function template(input: {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly section: (typeof PromptSections)[keyof typeof PromptSections];
  readonly blockType: (typeof PromptBlockTypes)[keyof typeof PromptBlockTypes];
  readonly statementPattern: string;
}): PromptTemplate {
  return freezeTemplate({
    id: input.id,
    name: input.name,
    description: input.description,
    section: input.section,
    blockTypes: Object.freeze([input.blockType]),
    statementPattern: input.statementPattern,
    metadata: Object.freeze({
      tags: Object.freeze(["domain_template", input.blockType]),
      attributes: Object.freeze({ providerAgnostic: true }),
    }),
  });
}

/**
 * Pure domain prompt templates — no provider-specific syntax.
 */
export const DOMAIN_PROMPT_TEMPLATES: readonly PromptTemplate[] = Object.freeze([
  template({
    id: "template:system",
    name: "System",
    description: "System composition facts template",
    section: PromptSections.SYSTEM,
    blockType: PromptBlockTypes.SYSTEM,
    statementPattern: "Structured system block for conversation {contextId}.",
  }),
  template({
    id: "template:persona",
    name: "Persona",
    description: "Coach persona template",
    section: PromptSections.PERSONA,
    blockType: PromptBlockTypes.PERSONA,
    statementPattern: "Coach persona for audience {audience}.",
  }),
  template({
    id: "template:capabilities",
    name: "Capabilities",
    description: "Capability scope template",
    section: PromptSections.CAPABILITIES,
    blockType: PromptBlockTypes.CAPABILITIES,
    statementPattern: "Capability scope for intent {intent}.",
  }),
  template({
    id: "template:knowledge",
    name: "Knowledge",
    description: "Knowledge references template",
    section: PromptSections.KNOWLEDGE,
    blockType: PromptBlockTypes.KNOWLEDGE,
    statementPattern: "Knowledge refs: {insightCount} insights.",
  }),
  template({
    id: "template:conversation",
    name: "Conversation",
    description: "Conversation structure template",
    section: PromptSections.CONVERSATION,
    blockType: PromptBlockTypes.CONVERSATION,
    statementPattern: "Conversation structure: {turnCount} turns.",
  }),
  template({
    id: "template:athlete",
    name: "Athlete",
    description: "Athlete context template",
    section: PromptSections.ATHLETE,
    blockType: PromptBlockTypes.ATHLETE,
    statementPattern: "Athlete context ref {athleteId}.",
  }),
  template({
    id: "template:recovery",
    name: "Recovery",
    description: "Recovery reference template",
    section: PromptSections.RECOVERY,
    blockType: PromptBlockTypes.RECOVERY,
    statementPattern: "Recovery referenced via {recoverySnapshotId}.",
  }),
  template({
    id: "template:insight",
    name: "Insight",
    description: "Insight references template",
    section: PromptSections.INSIGHT,
    blockType: PromptBlockTypes.INSIGHT,
    statementPattern: "Insight refs: {insightCount} linked.",
  }),
  template({
    id: "template:constraint",
    name: "Constraint",
    description: "Constraint set template",
    section: PromptSections.CONSTRAINT,
    blockType: PromptBlockTypes.CONSTRAINT,
    statementPattern: "Constraint set size {constraintCount}.",
  }),
  template({
    id: "template:formatting",
    name: "Formatting",
    description: "Formatting rules template",
    section: PromptSections.FORMATTING,
    blockType: PromptBlockTypes.FORMATTING,
    statementPattern: "Formatting rules for structured composition.",
  }),
  template({
    id: "template:tool",
    name: "Tool",
    description: "Tool definition placeholder template",
    section: PromptSections.TOOL,
    blockType: PromptBlockTypes.TOOL,
    statementPattern: "Tool definition placeholder (no execution).",
  }),
  template({
    id: "template:safety",
    name: "Safety",
    description: "Safety markers template",
    section: PromptSections.SAFETY,
    blockType: PromptBlockTypes.SAFETY,
    statementPattern: "Safety markers with {constraintCount} constraints.",
  }),
  template({
    id: "template:summary",
    name: "Summary",
    description: "Summary composition template",
    section: PromptSections.SUMMARY,
    blockType: PromptBlockTypes.SUMMARY,
    statementPattern: "Conversation summary composition for {contextId}.",
  }),
]);

export function getDomainTemplateById(
  id: string,
): PromptTemplate | undefined {
  return DOMAIN_PROMPT_TEMPLATES.find((t) => t.id === id);
}
