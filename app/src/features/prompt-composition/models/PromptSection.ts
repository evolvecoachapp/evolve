/**
 * Logical section grouping for prompt blocks.
 * Extensible for future multimodal / tools sections.
 */
export const PromptSections = {
  SYSTEM: "system",
  IDENTITY: "identity",
  SAFETY: "safety",
  CONSTRAINTS: "constraints",
  KNOWLEDGE: "knowledge",
  MEMORY: "memory",
  CONVERSATION: "conversation",
  USER_INPUT: "user_input",
  /** Reserved */
  TOOLS: "tools",
  /** Reserved */
  MEDIA: "media",
  /** Reserved */
  REASONING: "reasoning",
} as const;

export type PromptSection = (typeof PromptSections)[keyof typeof PromptSections];

export const ALL_PROMPT_SECTIONS = Object.freeze(Object.values(PromptSections));

export const DEFAULT_SECTION_ORDER: Readonly<Record<PromptSection, number>> =
  Object.freeze({
    [PromptSections.SYSTEM]: 10,
    [PromptSections.IDENTITY]: 20,
    [PromptSections.SAFETY]: 30,
    [PromptSections.CONSTRAINTS]: 40,
    [PromptSections.KNOWLEDGE]: 50,
    [PromptSections.MEMORY]: 60,
    [PromptSections.CONVERSATION]: 70,
    [PromptSections.USER_INPUT]: 80,
    [PromptSections.TOOLS]: 90,
    [PromptSections.MEDIA]: 100,
    [PromptSections.REASONING]: 110,
  });
