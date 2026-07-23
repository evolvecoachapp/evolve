/**
 * Extract tool-call-like markers from free text.
 * Provider-independent — does not execute tools.
 */
export interface ExtractedToolCall {
  readonly id: string;
  readonly name: string;
  readonly argumentsText: string;
}

export class ToolCallExtractor {
  extract(rawContent: string): readonly ExtractedToolCall[] {
    const results: ExtractedToolCall[] = [];
    const re =
      /(?:tool[_-]?call|call)\s*[:=]\s*([A-Za-z0-9_.-]+)\s*(?:\(([^)]*)\))?/gi;
    let match: RegExpExecArray | null;
    let index = 0;
    while ((match = re.exec(rawContent)) !== null) {
      results.push(
        Object.freeze({
          id: `toolcall:${index + 1}`,
          name: match[1],
          argumentsText: (match[2] ?? "").trim(),
        }),
      );
      index += 1;
    }
    return Object.freeze(results);
  }
}

export const toolCallExtractor = new ToolCallExtractor();
