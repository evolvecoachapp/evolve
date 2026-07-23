import type { CoachNutritionAdvice } from "../models/CoachNutritionAdvice";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { freezeNutrition } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

/**
 * Parse nutrition advice lines.
 */
export class NutritionParser {
  parse(sections: readonly CoachSection[]): readonly CoachNutritionAdvice[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.NUTRITION) ?? "";
    if (!content.trim()) {
      return Object.freeze([]);
    }

    return Object.freeze(
      extractBulletLines(content).map((line, index) => {
        const text = stripBulletPrefix(line);
        const timingMatch = text.match(/\(([^)]+)\)\s*$/);
        return freezeNutrition({
          id: slugId("nutrition", index),
          text: timingMatch
            ? text.slice(0, timingMatch.index).trim()
            : text,
          timing: timingMatch ? timingMatch[1].trim() : null,
        });
      }),
    );
  }
}

export const nutritionParser = new NutritionParser();
