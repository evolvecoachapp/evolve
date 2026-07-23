/**
 * Normalize an OpenAI model identifier to a lowercase trimmed slug.
 */
export function normalizeModelName(modelId: string | null | undefined): string {
  if (modelId == null) {
    return "";
  }
  return modelId.trim().toLowerCase();
}

/**
 * Compare model ids case-insensitively after normalization.
 */
export function modelNamesEqual(a: string, b: string): boolean {
  return normalizeModelName(a) === normalizeModelName(b);
}
