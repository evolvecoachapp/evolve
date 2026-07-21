/**
 * Maps conversation / hook errors to friendly UI copy.
 * Never surfaces raw HTTP or provider payloads.
 */
export function toFriendlyConversationError(
  error: string | null | undefined,
): string {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  const normalized = error.toLowerCase();

  if (
    normalized.includes("prompt context") ||
    normalized.includes("no active conversation")
  ) {
    return "Coach isn’t ready yet. Please try again in a moment.";
  }

  if (
    normalized.includes("network") ||
    normalized.includes("timeout") ||
    normalized.includes("fetch") ||
    normalized.includes("http") ||
    normalized.includes("status")
  ) {
    return "We couldn’t reach Coach right now. Please try again.";
  }

  if (normalized.includes("rate") || normalized.includes("quota")) {
    return "Coach is busy at the moment. Please try again shortly.";
  }

  return "Something went wrong with this conversation. Please try again.";
}
