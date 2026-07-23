/**
 * Logical section grouping for Prompt Builder blocks.
 */
export const PromptSections = {
  SYSTEM: "system",
  PERSONA: "persona",
  CAPABILITIES: "capabilities",
  KNOWLEDGE: "knowledge",
  CONVERSATION: "conversation",
  ATHLETE: "athlete",
  RECOVERY: "recovery",
  INSIGHT: "insight",
  CONSTRAINT: "constraint",
  FORMATTING: "formatting",
  TOOL: "tool",
  SAFETY: "safety",
  SUMMARY: "summary",
} as const;

export type PromptSection =
  (typeof PromptSections)[keyof typeof PromptSections];

export const ALL_PROMPT_SECTIONS = Object.freeze(Object.values(PromptSections));

export const DEFAULT_SECTION_ORDER: Readonly<Record<PromptSection, number>> =
  Object.freeze({
    [PromptSections.SYSTEM]: 10,
    [PromptSections.PERSONA]: 20,
    [PromptSections.SAFETY]: 30,
    [PromptSections.CONSTRAINT]: 40,
    [PromptSections.CAPABILITIES]: 50,
    [PromptSections.KNOWLEDGE]: 60,
    [PromptSections.ATHLETE]: 70,
    [PromptSections.RECOVERY]: 80,
    [PromptSections.INSIGHT]: 90,
    [PromptSections.CONVERSATION]: 100,
    [PromptSections.FORMATTING]: 110,
    [PromptSections.TOOL]: 120,
    [PromptSections.SUMMARY]: 130,
  });
