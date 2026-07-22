/**
 * Prompt block kinds for structured composition.
 *
 * Current blocks are composed today. Future blocks are reserved so the
 * architecture can grow without redesign.
 */
export const PromptBlockTypes = {
  SYSTEM: "system",
  IDENTITY: "identity",
  KNOWLEDGE: "knowledge",
  CONVERSATION: "conversation",
  MEMORY: "memory",
  CONSTRAINTS: "constraints",
  SAFETY: "safety",
  USER_INPUT: "user_input",
  /** Reserved — future tools block */
  TOOLS: "tools",
  /** Reserved — future images block */
  IMAGES: "images",
  /** Reserved — future files block */
  FILES: "files",
  /** Reserved — future vision block */
  VISION: "vision",
  /** Reserved — future audio block */
  AUDIO: "audio",
  /** Reserved — future reasoning block */
  REASONING: "reasoning",
} as const;

export type PromptBlockType =
  (typeof PromptBlockTypes)[keyof typeof PromptBlockTypes];

export const ALL_PROMPT_BLOCK_TYPES = Object.freeze(
  Object.values(PromptBlockTypes),
);

/** Blocks composed by the current Prompt Composition Engine. */
export const COMPOSED_PROMPT_BLOCK_TYPES = Object.freeze([
  PromptBlockTypes.SYSTEM,
  PromptBlockTypes.IDENTITY,
  PromptBlockTypes.SAFETY,
  PromptBlockTypes.CONSTRAINTS,
  PromptBlockTypes.KNOWLEDGE,
  PromptBlockTypes.MEMORY,
  PromptBlockTypes.CONVERSATION,
  PromptBlockTypes.USER_INPUT,
] as const);

/** Blocks that must be present in every PromptPackage. */
export const MANDATORY_PROMPT_BLOCK_TYPES = Object.freeze([
  PromptBlockTypes.SYSTEM,
  PromptBlockTypes.IDENTITY,
  PromptBlockTypes.SAFETY,
  PromptBlockTypes.CONSTRAINTS,
  PromptBlockTypes.KNOWLEDGE,
  PromptBlockTypes.CONVERSATION,
  PromptBlockTypes.USER_INPUT,
] as const);

/** Default relative order for composed blocks (lower = earlier). */
export const DEFAULT_BLOCK_ORDER: Readonly<Record<PromptBlockType, number>> =
  Object.freeze({
    [PromptBlockTypes.SYSTEM]: 10,
    [PromptBlockTypes.IDENTITY]: 20,
    [PromptBlockTypes.SAFETY]: 30,
    [PromptBlockTypes.CONSTRAINTS]: 40,
    [PromptBlockTypes.KNOWLEDGE]: 50,
    [PromptBlockTypes.MEMORY]: 60,
    [PromptBlockTypes.CONVERSATION]: 70,
    [PromptBlockTypes.USER_INPUT]: 80,
    [PromptBlockTypes.TOOLS]: 90,
    [PromptBlockTypes.IMAGES]: 100,
    [PromptBlockTypes.FILES]: 110,
    [PromptBlockTypes.VISION]: 120,
    [PromptBlockTypes.AUDIO]: 130,
    [PromptBlockTypes.REASONING]: 140,
  });
