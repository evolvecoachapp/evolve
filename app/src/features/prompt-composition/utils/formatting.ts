export function formatCountPhrase(count: number, noun: string): string {
  const plural = count === 1 ? noun : `${noun}s`;
  return `${count} ${plural}`;
}

export function formatBlockTypeLabel(type: string): string {
  return type.replace(/_/g, " ");
}
