export function formatModelLabel(
  modelId: string,
  displayName?: string | null,
): string {
  if (displayName && displayName.trim().length > 0) {
    return displayName.trim();
  }
  return modelId;
}

export function formatTokenUsage(usage: {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}): string {
  return `${usage.promptTokens} prompt / ${usage.completionTokens} completion / ${usage.totalTokens} total tokens`;
}

export function formatMessageCount(count: number): string {
  return count === 1 ? "1 message" : `${count} messages`;
}
