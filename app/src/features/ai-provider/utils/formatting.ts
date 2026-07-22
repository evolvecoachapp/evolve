export function formatCountPhrase(count: number, noun: string): string {
  const plural = count === 1 ? noun : `${noun}s`;
  return `${count} ${plural}`;
}

export function formatProviderLabel(
  providerId: string,
  displayName?: string | null,
): string {
  if (displayName && displayName.trim().length > 0) {
    return displayName.trim();
  }
  return providerId;
}

export function formatCapabilityLabel(capability: string): string {
  return capability.replace(/_/g, " ");
}
