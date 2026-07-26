import type { ContextFusionPort } from "../../../features/decision-engine/contracts/ContextFusionPort";
import { EMPTY_CONTEXT_METADATA } from "../../../features/context-fusion/models/ContextMetadata";
import {
  ContextRequestKinds,
  type ContextRequest,
} from "../../../features/context-fusion/models/ContextRequest";
import type { ContextFusionService } from "../../../features/context-fusion/services/ContextFusionService";

/**
 * Thin adapter: Context Fusion Service → Decision Engine ContextFusionPort.
 */
export function createDecisionContextFusionPortAdapter(
  fusion: ContextFusionService,
): ContextFusionPort {
  const port: ContextFusionPort = {
    loadUnifiedContext(input) {
      const result = fusion.buildUnifiedContext(toContextRequest(input));
      return result.success ? result.context : null;
    },
    loadDecisionEngineContext(input) {
      const result = fusion.buildUnifiedContext(toContextRequest(input));
      return result.success ? result.decisionEngineContext : null;
    },
  };
  return port;
}

function toContextRequest(input: {
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly at: string;
}): ContextRequest {
  return Object.freeze({
    id: `request:fusion:${input.contextId}`,
    kind: ContextRequestKinds.BUILD,
    athleteId: input.athleteId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    contextId: input.contextId,
    base: null,
    contributions: Object.freeze([]),
    reason: "decision-engine handoff",
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.at,
  });
}
