import type { CoachRecoveryAdvice } from "../models/CoachRecoveryAdvice";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { freezeRecovery } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

/**
 * Parse recovery advice lines.
 */
export class RecoveryParser {
  parse(sections: readonly CoachSection[]): readonly CoachRecoveryAdvice[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.RECOVERY) ?? "";
    if (!content.trim()) {
      return Object.freeze([]);
    }

    return Object.freeze(
      extractBulletLines(content).map((line, index) => {
        const text = stripBulletPrefix(line);
        const focusMatch = text.match(/^([^:]+):\s*(.+)$/);
        if (focusMatch) {
          return freezeRecovery({
            id: slugId("recovery", index),
            text: focusMatch[2].trim(),
            focus: focusMatch[1].trim(),
          });
        }
        return freezeRecovery({
          id: slugId("recovery", index),
          text,
          focus: null,
        });
      }),
    );
  }
}

export const recoveryParser = new RecoveryParser();
