import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import {
  createPromptComposer,
  type PromptComposer,
} from "../composers/PromptComposer";
import type { PromptBuildResult } from "../models/PromptBuildResult";
import type { PromptPackage } from "../models/PromptPackage";
import type { SystemPrompt } from "../models/SystemPrompt";
import type { UserPrompt } from "../models/UserPrompt";
import { validatePromptPackage as runValidatePromptPackage } from "../validators/validatePromptPackage";

function resolveComposer(composer?: PromptComposer): PromptComposer {
  return composer ?? createPromptComposer();
}

/**
 * Public API — build immutable PromptPackage from ConversationContext.
 */
export function buildPromptPackage(options: {
  readonly conversationContext: ConversationContext;
  readonly coachingContextId?: string | null;
  readonly insightSnapshotId?: string | null;
  readonly builtAt?: string;
  readonly packageId?: string;
  readonly composer?: PromptComposer;
}): PromptBuildResult {
  const { composer, ...rest } = options;
  return resolveComposer(composer).compose(rest);
}

/**
 * Public API — build SystemPrompt from an existing PromptPackage.
 */
export function buildSystemPrompt(
  promptPackage: PromptPackage,
  composer?: PromptComposer,
): SystemPrompt {
  return resolveComposer(composer).buildSystemPrompt(promptPackage);
}

/**
 * Public API — build UserPrompt from an existing PromptPackage.
 */
export function buildUserPrompt(
  promptPackage: PromptPackage,
  composer?: PromptComposer,
): UserPrompt {
  return resolveComposer(composer).buildUserPrompt(promptPackage);
}

/**
 * Public API — validate PromptPackage completeness and integrity.
 */
export function validatePromptPackage(
  promptPackage: PromptPackage,
): readonly string[] {
  return runValidatePromptPackage(promptPackage);
}

export {
  getCoachPrompt,
  type GetCoachPromptOptions,
} from "./getCoachPrompt";
