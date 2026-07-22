import type { CoachInstruction } from "../models/CoachInstruction";
import type { CoachPriority } from "../models/CoachPriority";
import { COACH_PRIORITY_DEFAULT } from "../models/CoachPriority";
import type { CoachReason } from "../models/CoachReason";
import { freezeInstruction } from "../utils/freezeContext";
import { normalizePriority } from "../utils/normalizePriorities";

/**
 * Fluent builder for immutable CoachInstruction facts.
 */
export class CoachInstructionBuilder {
  private id = "";
  private code = "";
  private objectiveId: string | null = null;
  private statement = "";
  private priority: CoachPriority = COACH_PRIORITY_DEFAULT;
  private reason: CoachReason | null = null;
  private evidenceIds: readonly string[] = [];

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withCode(code: string): this {
    this.code = code;
    return this;
  }

  withObjectiveId(objectiveId: string | null): this {
    this.objectiveId = objectiveId;
    return this;
  }

  withStatement(statement: string): this {
    this.statement = statement;
    return this;
  }

  withPriority(priority: CoachPriority): this {
    this.priority = normalizePriority(priority);
    return this;
  }

  withReason(reason: CoachReason): this {
    this.reason = reason;
    return this;
  }

  withEvidenceIds(evidenceIds: readonly string[]): this {
    this.evidenceIds = evidenceIds;
    return this;
  }

  build(): CoachInstruction {
    if (!this.id || !this.code || !this.statement || !this.reason) {
      throw new Error("CoachInstructionBuilder missing required fields");
    }

    return freezeInstruction({
      id: this.id,
      code: this.code,
      objectiveId: this.objectiveId,
      statement: this.statement,
      priority: this.priority,
      reason: this.reason,
      evidenceIds: this.evidenceIds,
    });
  }
}
