/**
 * Prompt block kinds for Prompt Builder composition.
 */
export const PromptBlockTypes = {
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

export type PromptBlockType =
  (typeof PromptBlockTypes)[keyof typeof PromptBlockTypes];

export const ALL_PROMPT_BLOCK_TYPES = Object.freeze(
  Object.values(PromptBlockTypes),
);

export const DEFAULT_BUILT_BLOCK_TYPES = Object.freeze([
  PromptBlockTypes.SYSTEM,
  PromptBlockTypes.PERSONA,
  PromptBlockTypes.CAPABILITIES,
  PromptBlockTypes.KNOWLEDGE,
  PromptBlockTypes.CONVERSATION,
  PromptBlockTypes.ATHLETE,
  PromptBlockTypes.RECOVERY,
  PromptBlockTypes.INSIGHT,
  PromptBlockTypes.CONSTRAINT,
  PromptBlockTypes.FORMATTING,
  PromptBlockTypes.TOOL,
  PromptBlockTypes.SAFETY,
  PromptBlockTypes.SUMMARY,
] as const);

export const MANDATORY_PROMPT_BLOCK_TYPES = Object.freeze([
  PromptBlockTypes.SYSTEM,
  PromptBlockTypes.PERSONA,
  PromptBlockTypes.SAFETY,
  PromptBlockTypes.CONSTRAINT,
  PromptBlockTypes.KNOWLEDGE,
  PromptBlockTypes.CONVERSATION,
  PromptBlockTypes.ATHLETE,
  PromptBlockTypes.SUMMARY,
] as const);

export const DEFAULT_BLOCK_ORDER: Readonly<Record<PromptBlockType, number>> =
  Object.freeze({
    [PromptBlockTypes.SYSTEM]: 10,
    [PromptBlockTypes.PERSONA]: 20,
    [PromptBlockTypes.SAFETY]: 30,
    [PromptBlockTypes.CONSTRAINT]: 40,
    [PromptBlockTypes.CAPABILITIES]: 50,
    [PromptBlockTypes.KNOWLEDGE]: 60,
    [PromptBlockTypes.ATHLETE]: 70,
    [PromptBlockTypes.RECOVERY]: 80,
    [PromptBlockTypes.INSIGHT]: 90,
    [PromptBlockTypes.CONVERSATION]: 100,
    [PromptBlockTypes.FORMATTING]: 110,
    [PromptBlockTypes.TOOL]: 120,
    [PromptBlockTypes.SUMMARY]: 130,
  });
