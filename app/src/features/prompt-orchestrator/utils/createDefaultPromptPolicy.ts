import type { PromptContextKind } from "../models/PromptContextKind";
import type { PromptIntent } from "../models/PromptIntent";
import type { PromptPolicy } from "../models/PromptPolicy";

/**
 * Default orchestration policy — relative weights and intent selections.
 */
export function createDefaultPromptPolicy(): PromptPolicy {
  return Object.freeze({
    selection: Object.freeze({
      GENERAL_CHAT: Object.freeze([
        "conversation",
        "athlete",
      ] as const satisfies readonly PromptContextKind[]),
      WORKOUT: Object.freeze([
        "conversation",
        "athlete",
        "workout",
        "coach",
      ] as const satisfies readonly PromptContextKind[]),
      PROGRAM: Object.freeze([
        "conversation",
        "athlete",
        "coach",
        "workout",
      ] as const satisfies readonly PromptContextKind[]),
      NUTRITION: Object.freeze([
        "conversation",
        "athlete",
        "memory",
      ] as const satisfies readonly PromptContextKind[]),
      RECOVERY: Object.freeze([
        "conversation",
        "athlete",
        "coach",
        "memory",
      ] as const satisfies readonly PromptContextKind[]),
      TECHNIQUE: Object.freeze([
        "conversation",
        "athlete",
        "workout",
        "memory",
      ] as const satisfies readonly PromptContextKind[]),
      GOAL: Object.freeze([
        "conversation",
        "athlete",
        "coach",
        "memory",
      ] as const satisfies readonly PromptContextKind[]),
      PROGRESS: Object.freeze([
        "conversation",
        "athlete",
        "coach",
        "workout",
        "memory",
      ] as const satisfies readonly PromptContextKind[]),
      UNKNOWN: Object.freeze([
        "conversation",
        "athlete",
      ] as const satisfies readonly PromptContextKind[]),
    } satisfies Record<PromptIntent, readonly PromptContextKind[]>),
    priority: Object.freeze({
      ranks: Object.freeze({
        conversation: 50,
        athlete: 40,
        coach: 30,
        workout: 20,
        memory: 10,
      } satisfies Record<PromptContextKind, number>),
    }),
    budget: Object.freeze({
      maxWeight: 100,
      weights: Object.freeze({
        conversation: 25,
        athlete: 25,
        coach: 25,
        workout: 20,
        memory: 20,
      } satisfies Record<PromptContextKind, number>),
    }),
  });
}
