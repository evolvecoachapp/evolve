import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import {
  createPromptCompositionEngine,
  PromptCompositionEngine,
} from "../engine/PromptCompositionEngine";
import type { PromptEngineResult } from "../models/PromptEngineResult";
import type { PromptPackage } from "../models/PromptPackage";
import type { PromptSnapshot } from "../models/PromptSnapshot";
import type { PromptSummary } from "../models/PromptSummary";

/**
 * Service facade over PromptCompositionEngine.
 * Hides engine internals from application consumers.
 */
export class PromptCompositionService {
  constructor(
    private readonly engine: PromptCompositionEngine = createPromptCompositionEngine(),
  ) {}

  composePromptPackage(options: {
    readonly conversationContext: ConversationContext;
    readonly coachingContext?: CoachingContext;
    readonly insightSnapshot?: InsightSnapshot;
    readonly composedAt?: string;
    readonly packageId?: string;
  }): PromptEngineResult {
    return this.engine.compose(options);
  }

  createPromptSnapshot(
    promptPackage: PromptPackage,
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
      readonly summary?: PromptSummary;
    } = {},
  ): PromptSnapshot {
    return this.engine.createSnapshot(promptPackage, options);
  }

  summarizePromptPackage(
    packageOrSnapshot: PromptPackage | PromptSnapshot,
  ): PromptSummary {
    return this.engine.summarize(packageOrSnapshot);
  }
}

export function createPromptCompositionService(): PromptCompositionService {
  return new PromptCompositionService();
}
