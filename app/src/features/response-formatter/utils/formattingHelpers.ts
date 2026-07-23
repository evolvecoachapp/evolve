/**
 * Deterministic formatting helpers (no UI).
 */
export function previewText(text: string, maxLength = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function joinLines(lines: readonly string[]): string {
  return lines.filter((line) => line.trim().length > 0).join("\n");
}

export function bulletList(lines: readonly string[]): string {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => (line.startsWith("- ") ? line : `- ${line}`))
    .join("\n");
}

export function stripBulletPrefix(line: string): string {
  return line.replace(/^\s*[-*•]\s+/, "").trim();
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

export function slugId(prefix: string, index: number): string {
  return `${prefix}:${index + 1}`;
}
