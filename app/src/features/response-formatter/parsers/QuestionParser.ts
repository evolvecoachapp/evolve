import type { CoachQuestion } from "../models/CoachQuestion";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { freezeQuestion } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

/**
 * Parse clarifying questions.
 */
export class QuestionParser {
  parse(sections: readonly CoachSection[]): readonly CoachQuestion[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.QUESTIONS) ?? "";
    if (!content.trim()) {
      return Object.freeze([]);
    }

    return Object.freeze(
      extractBulletLines(content).map((line, index) => {
        const text = stripBulletPrefix(line);
        const optional = /\(optional\)/i.test(text);
        return freezeQuestion({
          id: slugId("question", index),
          text: text.replace(/\(optional\)/i, "").trim(),
          optional,
        });
      }),
    );
  }
}

export const questionParser = new QuestionParser();
