import type { CoachCitation } from "../models/CoachCitation";
import type { CoachSection } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { freezeCitation } from "../utils/freezeObjects";
import { slugId, stripBulletPrefix } from "../utils/formattingHelpers";
import {
  extractBulletLines,
  findSectionContent,
} from "./sectionHelpers";

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/;

/**
 * Parse citations / references.
 */
export class CitationParser {
  parse(sections: readonly CoachSection[]): readonly CoachCitation[] {
    const content =
      findSectionContent(sections, CoachSectionKinds.CITATIONS) ?? "";
    if (!content.trim()) {
      return Object.freeze([]);
    }

    return Object.freeze(
      extractBulletLines(content).map((line, index) => {
        const text = stripBulletPrefix(line);
        const link = text.match(MARKDOWN_LINK_RE);
        if (link) {
          return freezeCitation({
            id: slugId("citation", index),
            title: link[1].trim(),
            url: link[2].trim(),
            source: null,
          });
        }

        const urlMatch = text.match(/https?:\/\/\S+/i);
        return freezeCitation({
          id: slugId("citation", index),
          title: urlMatch
            ? text.replace(urlMatch[0], "").trim() || urlMatch[0]
            : text,
          url: urlMatch ? urlMatch[0] : null,
          source: null,
        });
      }),
    );
  }
}

export const citationParser = new CitationParser();
