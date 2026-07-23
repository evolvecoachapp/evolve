import type { CoachCitation } from "../models/CoachCitation";
import { freezeCitation } from "../utils/freezeObjects";
import { slugId } from "../utils/formattingHelpers";

/**
 * Extract markdown / URL references from free text.
 */
export class ReferenceExtractor {
  extract(rawContent: string): readonly CoachCitation[] {
    const citations: CoachCitation[] = [];
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = linkRe.exec(rawContent)) !== null) {
      citations.push(
        freezeCitation({
          id: slugId("ref", index),
          title: match[1].trim(),
          url: match[2].trim(),
          source: null,
        }),
      );
      index += 1;
    }

    if (citations.length === 0) {
      const urlRe = /https?:\/\/\S+/gi;
      while ((match = urlRe.exec(rawContent)) !== null) {
        citations.push(
          freezeCitation({
            id: slugId("ref", index),
            title: match[0],
            url: match[0],
            source: null,
          }),
        );
        index += 1;
      }
    }

    return Object.freeze(citations);
  }
}

export const referenceExtractor = new ReferenceExtractor();
