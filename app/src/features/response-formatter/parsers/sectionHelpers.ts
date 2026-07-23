import type { CoachSection, CoachSectionKind } from "../models/CoachSection";
import { CoachSectionKinds } from "../models/CoachSection";
import { freezeSection } from "../utils/freezeObjects";
import { slugId } from "../utils/formattingHelpers";

const HEADER_RE = /^#{1,3}\s+(.+)\s*$/;

const KIND_ALIASES: Readonly<Record<string, CoachSectionKind>> = Object.freeze({
  message: CoachSectionKinds.MESSAGE,
  messages: CoachSectionKinds.MESSAGE,
  response: CoachSectionKinds.MESSAGE,
  answer: CoachSectionKinds.MESSAGE,
  recommendation: CoachSectionKinds.RECOMMENDATIONS,
  recommendations: CoachSectionKinds.RECOMMENDATIONS,
  warning: CoachSectionKinds.WARNINGS,
  warnings: CoachSectionKinds.WARNINGS,
  caution: CoachSectionKinds.WARNINGS,
  action: CoachSectionKinds.ACTIONS,
  actions: CoachSectionKinds.ACTIONS,
  nextsteps: CoachSectionKinds.ACTIONS,
  "next steps": CoachSectionKinds.ACTIONS,
  exercise: CoachSectionKinds.EXERCISES,
  exercises: CoachSectionKinds.EXERCISES,
  workout: CoachSectionKinds.EXERCISES,
  nutrition: CoachSectionKinds.NUTRITION,
  diet: CoachSectionKinds.NUTRITION,
  recovery: CoachSectionKinds.RECOVERY,
  rest: CoachSectionKinds.RECOVERY,
  question: CoachSectionKinds.QUESTIONS,
  questions: CoachSectionKinds.QUESTIONS,
  citation: CoachSectionKinds.CITATIONS,
  citations: CoachSectionKinds.CITATIONS,
  references: CoachSectionKinds.CITATIONS,
  insight: CoachSectionKinds.INSIGHTS,
  insights: CoachSectionKinds.INSIGHTS,
  reasoning: CoachSectionKinds.REASONING,
  rationale: CoachSectionKinds.REASONING,
  confidence: CoachSectionKinds.CONFIDENCE,
});

function normalizeTitleKey(title: string): string {
  return title.trim().toLowerCase().replace(/[_-]+/g, " ");
}

export function resolveSectionKind(title: string): CoachSectionKind {
  const key = normalizeTitleKey(title);
  return KIND_ALIASES[key] ?? CoachSectionKinds.OTHER;
}

/**
 * Split provider content into immutable sections by markdown headers.
 * Content without headers becomes a single message section.
 */
export function parseSections(content: string): readonly CoachSection[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const sections: CoachSection[] = [];
  let currentTitle = "Message";
  let currentKind: CoachSectionKind = CoachSectionKinds.MESSAGE;
  let buffer: string[] = [];
  let order = 0;
  let sawHeader = false;

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (!sawHeader && body.length === 0 && sections.length === 0) {
      buffer = [];
      return;
    }
    sections.push(
      freezeSection({
        id: slugId("section", order),
        title: currentTitle,
        kind: currentKind,
        content: body,
        order,
      }),
    );
    order += 1;
    buffer = [];
  };

  for (const line of lines) {
    const match = line.match(HEADER_RE);
    if (match) {
      if (sawHeader || buffer.some((l) => l.trim().length > 0)) {
        flush();
      } else {
        buffer = [];
      }
      sawHeader = true;
      currentTitle = match[1].trim();
      currentKind = resolveSectionKind(currentTitle);
      continue;
    }
    buffer.push(line);
  }

  if (sawHeader || buffer.some((l) => l.trim().length > 0) || sections.length === 0) {
    if (!sawHeader && sections.length === 0) {
      currentTitle = "Message";
      currentKind = CoachSectionKinds.MESSAGE;
    }
    flush();
  }

  if (sections.length === 0) {
    return Object.freeze([
      freezeSection({
        id: "section:1",
        title: "Message",
        kind: CoachSectionKinds.MESSAGE,
        content: content.trim(),
        order: 0,
      }),
    ]);
  }

  return Object.freeze(sections);
}

export function findSectionContent(
  sections: readonly CoachSection[],
  kind: CoachSectionKind,
): string | null {
  const found = sections.find((section) => section.kind === kind);
  if (!found || !found.content.trim()) {
    return null;
  }
  return found.content;
}

export function extractBulletLines(content: string): readonly string[] {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const bullets = lines.filter((line) => /^[-*•]\s+/.test(line));
  if (bullets.length > 0) {
    return Object.freeze(bullets);
  }

  return Object.freeze(lines);
}
