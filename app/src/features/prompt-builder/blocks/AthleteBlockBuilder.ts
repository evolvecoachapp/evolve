import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import { PromptSections } from "../models/PromptSection";

/**
 * Builds the athlete block independently from ConversationContext.
 */
export class AthleteBlockBuilder {
  build(conversationContext: ConversationContext): PromptBlock {
    const ref = conversationContext.id;
    const athleteId = conversationContext.session.athleteId;
    return new PromptBlockBuilder()
      .withId(`prompt-block:athlete:${ref}`)
      .withType(PromptBlockTypes.ATHLETE)
      .withSection(PromptSections.ATHLETE)
      .withPriority(78)
      .withTitle("Athlete")
      .withStatement(
        `Athlete context ref ${athleteId ?? "unknown"} for session ${conversationContext.session.sessionId}.`,
      )
      .withRefs(
        Object.freeze(
          [ref, athleteId, conversationContext.session.sessionId].filter(
            (v): v is string => typeof v === "string" && v.length > 0,
          ),
        ),
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["athlete"]),
          attributes: Object.freeze({
            athleteId,
            sessionId: conversationContext.session.sessionId,
          }),
        }),
      )
      .withAttributes(
        Object.freeze({
          athleteId,
          dayId: conversationContext.session.dayId,
          weekNumber: conversationContext.session.weekNumber,
        }),
      )
      .build();
  }
}

export function createAthleteBlockBuilder(): AthleteBlockBuilder {
  return new AthleteBlockBuilder();
}
