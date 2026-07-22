import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import type { PromptEngineResult } from "../models/PromptEngineResult";
import type { PromptPackage } from "../models/PromptPackage";
import type { PromptSnapshot } from "../models/PromptSnapshot";
import type { PromptSummary } from "../models/PromptSummary";
import {
  createPromptCompositionService,
  type PromptCompositionService,
} from "../services/PromptCompositionService";

function resolveService(
  service?: PromptCompositionService,
): PromptCompositionService {
  return service ?? createPromptCompositionService();
}

/**
 * Public API — compose immutable PromptPackage from ConversationContext.
 */
export function composePromptPackage(options: {
  readonly conversationContext: ConversationContext;
  readonly coachingContext?: CoachingContext;
  readonly insightSnapshot?: InsightSnapshot;
  readonly composedAt?: string;
  readonly packageId?: string;
  readonly service?: PromptCompositionService;
}): PromptEngineResult {
  const { service, ...rest } = options;
  return resolveService(service).composePromptPackage(rest);
}

/**
 * Public API — create a PromptSnapshot from a PromptPackage.
 */
export function createPromptSnapshot(
  promptPackage: PromptPackage,
  options: {
    readonly snapshotId?: string;
    readonly frozenAt?: string;
    readonly summary?: PromptSummary;
    readonly service?: PromptCompositionService;
  } = {},
): PromptSnapshot {
  const { service, ...rest } = options;
  return resolveService(service).createPromptSnapshot(promptPackage, rest);
}

/**
 * Public API — summarize a prompt package or snapshot.
 */
export function summarizePromptPackage(
  packageOrSnapshot: PromptPackage | PromptSnapshot,
  service?: PromptCompositionService,
): PromptSummary {
  return resolveService(service).summarizePromptPackage(packageOrSnapshot);
}
