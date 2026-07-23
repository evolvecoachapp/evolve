import type { ActionCandidate } from "../models/ActionCandidate";
import type { ActionIntent } from "../models/ActionIntent";
import { ActionIntents } from "../models/ActionIntent";
import type { ActionPriority } from "../models/ActionPriority";
import { ActionPriorities } from "../models/ActionPriority";
import type { ActionProposal } from "../models/ActionProposal";
import { freezeProposal } from "../utils/freezeActionPlan";

/**
 * Fluent builder for immutable ActionProposal.
 */
export class ActionProposalBuilder {
  private id = "";
  private sourceResponseId = "";
  private intent: ActionIntent = ActionIntents.UNKNOWN;
  private candidates: readonly ActionCandidate[] = Object.freeze([]);
  private preferredPriority: ActionPriority = ActionPriorities.MEDIUM;
  private createdAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withSourceResponseId(sourceResponseId: string): this {
    this.sourceResponseId = sourceResponseId;
    return this;
  }

  withIntent(intent: ActionIntent): this {
    this.intent = intent;
    return this;
  }

  withCandidates(candidates: readonly ActionCandidate[]): this {
    this.candidates = candidates;
    return this;
  }

  withPreferredPriority(priority: ActionPriority): this {
    this.preferredPriority = priority;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  build(): ActionProposal {
    if (!this.id || !this.sourceResponseId || !this.createdAt) {
      throw new Error("ActionProposalBuilder missing required fields");
    }

    return freezeProposal({
      id: this.id,
      sourceResponseId: this.sourceResponseId,
      intent: this.intent,
      candidates: this.candidates,
      preferredPriority: this.preferredPriority,
      createdAt: this.createdAt,
    });
  }
}
