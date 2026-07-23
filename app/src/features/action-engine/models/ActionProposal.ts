import type { ActionCandidate } from "./ActionCandidate";
import type { ActionIntent } from "./ActionIntent";
import type { ActionPriority } from "./ActionPriority";

/**
 * Immutable proposal wrapping ranked candidates for a response.
 */
export interface ActionProposal {
  readonly id: string;
  readonly sourceResponseId: string;
  readonly intent: ActionIntent;
  readonly candidates: readonly ActionCandidate[];
  readonly preferredPriority: ActionPriority;
  readonly createdAt: string;
}
