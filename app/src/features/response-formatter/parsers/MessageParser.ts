import type { CoachMessage } from "../models/CoachMessage";
import { createCoachMessage } from "../models/CoachMessage";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { findSectionContent } from "./sectionHelpers";

/**
 * Parse the primary coach message from sections or raw content.
 */
export class MessageParser {
  parse(
    sections: readonly CoachSection[],
    rawContent: string,
    messageId = "message:1",
  ): CoachMessage {
    const fromSection =
      findSectionContent(sections, CoachSectionKinds.MESSAGE) ??
      findSectionContent(sections, CoachSectionKinds.OTHER);

    const text =
      (fromSection && fromSection.trim()) ||
      (sections.length === 1 ? sections[0].content.trim() : "") ||
      rawContent.trim();

    return createCoachMessage(messageId, text);
  }
}

export const messageParser = new MessageParser();
