export type CoachMarkdownInline =
  | { readonly type: "text"; readonly value: string }
  | { readonly type: "bold"; readonly value: string };

export type CoachMarkdownBlock =
  | { readonly type: "paragraph"; readonly inlines: readonly CoachMarkdownInline[] }
  | {
      readonly type: "list";
      readonly ordered: boolean;
      readonly items: readonly (readonly CoachMarkdownInline[])[];
    };

const UNORDERED_LIST = /^\s*[-*]\s+(.+)$/;
const ORDERED_LIST = /^\s*(\d+)\.\s+(.+)$/;
const BOLD = /\*\*(.+?)\*\*/g;

/** Turns escaped newline sequences into real line breaks before rendering. */
export function unescapeCoachText(content: string): string {
  return content
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

export function parseCoachInlines(text: string): readonly CoachMarkdownInline[] {
  const inlines: CoachMarkdownInline[] = [];
  const pattern = new RegExp(BOLD.source, "g");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      inlines.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    inlines.push({ type: "bold", value: match[1] ?? "" });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    inlines.push({ type: "text", value: text.slice(lastIndex) });
  }

  return inlines.length > 0 ? inlines : [{ type: "text", value: "" }];
}

function listItem(line: string): { ordered: boolean; text: string } | null {
  const unordered = UNORDERED_LIST.exec(line);
  if (unordered) {
    return { ordered: false, text: unordered[1] ?? "" };
  }
  const ordered = ORDERED_LIST.exec(line);
  if (ordered) {
    return { ordered: true, text: ordered[2] ?? "" };
  }
  return null;
}

/** Parses coach reply text into paragraphs, line breaks, bold, and simple lists. */
export function parseCoachMarkdown(content: string): readonly CoachMarkdownBlock[] {
  const lines = unescapeCoachText(content).split("\n");
  const blocks: CoachMarkdownBlock[] = [];

  const flushList = (
    ordered: boolean,
    items: (readonly CoachMarkdownInline[])[],
  ) => {
    if (items.length === 0) {
      return;
    }
    blocks.push({ type: "list", ordered, items: [...items] });
    items.length = 0;
  };

  let listOrdered = false;
  const listItems: (readonly CoachMarkdownInline[])[] = [];

  for (const line of lines) {
    const item = listItem(line);
    if (item) {
      if (listItems.length > 0 && listOrdered !== item.ordered) {
        flushList(listOrdered, listItems);
      }
      listOrdered = item.ordered;
      listItems.push(parseCoachInlines(item.text));
      continue;
    }

    flushList(listOrdered, listItems);

    if (line.trim().length === 0) {
      continue;
    }

    blocks.push({ type: "paragraph", inlines: parseCoachInlines(line) });
  }

  flushList(listOrdered, listItems);
  return blocks;
}
