import type { CoachCitation } from "../models/CoachCitation";
import { freezeCitation } from "../utils/freezeObjects";

/**
 * Normalize citation titles and URLs.
 */
export class CitationNormalizer {
  normalize(citations: readonly CoachCitation[]): readonly CoachCitation[] {
    return Object.freeze(
      citations.map((citation) =>
        freezeCitation({
          ...citation,
          title: citation.title.trim(),
          url: citation.url ? citation.url.trim() : null,
          source: citation.source ? citation.source.trim() : null,
        }),
      ),
    );
  }
}

export const citationNormalizer = new CitationNormalizer();
