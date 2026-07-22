import type { CoachAudience } from "../models/CoachAudience";
import { CoachAudiences } from "../models/CoachAudience";
import type { CoachCommunicationStyle } from "../models/CoachCommunicationStyle";
import { CoachCommunicationStyles } from "../models/CoachCommunicationStyle";
import type { CoachConstraint } from "../models/CoachConstraint";
import type { CoachEvidence } from "../models/CoachEvidence";
import type { CoachFocus } from "../models/CoachFocus";
import type { CoachInstruction } from "../models/CoachInstruction";
import type { CoachKnowledge } from "../models/CoachKnowledge";
import type { CoachMetadata } from "../models/CoachMetadata";
import type { CoachObjective } from "../models/CoachObjective";
import type { CoachPreparation } from "../models/CoachPreparation";
import type { CoachSession } from "../models/CoachSession";
import type { CoachingContext } from "../models/CoachingContext";
import type { CoachingContextSummary } from "../models/CoachingContextSummary";
import { freezeContext } from "../utils/freezeContext";

/**
 * Fluent builder for immutable CoachingContext.
 */
export class CoachingContextBuilder {
  private id = "";
  private session: CoachSession | null = null;
  private audience: CoachAudience = CoachAudiences.ATHLETE;
  private communicationStyle: CoachCommunicationStyle =
    CoachCommunicationStyles.DIRECT;
  private objectives: readonly CoachObjective[] = [];
  private constraints: readonly CoachConstraint[] = [];
  private instructions: readonly CoachInstruction[] = [];
  private focus: readonly CoachFocus[] = [];
  private evidence: readonly CoachEvidence[] = [];
  private knowledge: CoachKnowledge | null = null;
  private preparation: CoachPreparation | null = null;
  private metadata: CoachMetadata = Object.freeze({
    tags: Object.freeze([] as string[]),
    attributes: Object.freeze({}),
  });
  private summary: CoachingContextSummary | null = null;
  private frozenAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withSession(session: CoachSession): this {
    this.session = session;
    return this;
  }

  withAudience(audience: CoachAudience): this {
    this.audience = audience;
    return this;
  }

  withCommunicationStyle(style: CoachCommunicationStyle): this {
    this.communicationStyle = style;
    return this;
  }

  withObjectives(objectives: readonly CoachObjective[]): this {
    this.objectives = objectives;
    return this;
  }

  withConstraints(constraints: readonly CoachConstraint[]): this {
    this.constraints = constraints;
    return this;
  }

  withInstructions(instructions: readonly CoachInstruction[]): this {
    this.instructions = instructions;
    return this;
  }

  withFocus(focus: readonly CoachFocus[]): this {
    this.focus = focus;
    return this;
  }

  withEvidence(evidence: readonly CoachEvidence[]): this {
    this.evidence = evidence;
    return this;
  }

  withKnowledge(knowledge: CoachKnowledge): this {
    this.knowledge = knowledge;
    return this;
  }

  withPreparation(preparation: CoachPreparation): this {
    this.preparation = preparation;
    return this;
  }

  withMetadata(metadata: CoachMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withSummary(summary: CoachingContextSummary): this {
    this.summary = summary;
    return this;
  }

  withFrozenAt(frozenAt: string): this {
    this.frozenAt = frozenAt;
    return this;
  }

  build(): CoachingContext {
    if (
      !this.id ||
      !this.session ||
      !this.knowledge ||
      !this.preparation ||
      !this.summary ||
      !this.frozenAt
    ) {
      throw new Error("CoachingContextBuilder missing required fields");
    }

    return freezeContext({
      id: this.id,
      session: this.session,
      audience: this.audience,
      communicationStyle: this.communicationStyle,
      objectives: this.objectives,
      constraints: this.constraints,
      instructions: this.instructions,
      focus: this.focus,
      evidence: this.evidence,
      knowledge: this.knowledge,
      preparation: this.preparation,
      metadata: this.metadata,
      summary: this.summary,
      frozenAt: this.frozenAt,
    });
  }
}
