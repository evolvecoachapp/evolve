import type { CoachAction } from "../models/CoachAction";
import { CoachActionKinds } from "../models/CoachAction";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { freezeAction } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

function classifyActionKind(text: string): CoachAction["kind"] {
  const lower = text.toLowerCase();
  if (lower.includes("workout") || lower.includes("session")) {
    return CoachActionKinds.START_WORKOUT;
  }
  if (lower.includes("log") || lower.includes("track")) {
    return CoachActionKinds.LOG_METRIC;
  }
  if (lower.includes("ask") || lower.includes("tell me")) {
    return CoachActionKinds.ASK_FOLLOWUP;
  }
  if (lower.includes("open") || lower.includes("read") || lower.includes("view")) {
    return CoachActionKinds.OPEN_RESOURCE;
  }
  if (lower.includes("go to") || lower.includes("navigate") || lower.includes("open ")) {
    return CoachActionKinds.NAVIGATE;
  }
  return CoachActionKinds.GENERIC;
}

/**
 * Parse suggested actions from dedicated sections.
 */
export class ActionParser {
  parse(sections: readonly CoachSection[]): readonly CoachAction[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.ACTIONS) ?? "";
    if (!content.trim()) {
      return Object.freeze([]);
    }

    return Object.freeze(
      extractBulletLines(content).map((line, index) => {
        const label = stripBulletPrefix(line);
        return freezeAction({
          id: slugId("action", index),
          label,
          description: null,
          kind: classifyActionKind(label),
          payload: Object.freeze({}),
        });
      }),
    );
  }
}

export const actionParser = new ActionParser();
