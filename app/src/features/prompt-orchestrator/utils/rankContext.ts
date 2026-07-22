import type { PromptContextKind } from "../models/PromptContextKind";
import type { PromptPriority } from "../models/PromptPriority";

/**
 * Rank kinds by priority (highest first by default).
 */
export function rankContext(
  kinds: readonly PromptContextKind[],
  priority: PromptPriority,
  direction: "asc" | "desc" = "desc",
): readonly PromptContextKind[] {
  const sorted = [...kinds].sort((a, b) => {
    const delta = priority.ranks[a] - priority.ranks[b];
    return direction === "asc" ? delta : -delta;
  });
  return Object.freeze(sorted);
}
