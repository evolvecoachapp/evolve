import type { PromptContextKind } from "../models/PromptContextKind";
import type { PromptIntent } from "../models/PromptIntent";
import type { PromptPolicy } from "../models/PromptPolicy";
import { createDefaultPromptPolicy } from "../utils/createDefaultPromptPolicy";

/**
 * Pure selection rules: which context kinds belong to each intent.
 */
export class PromptSelectionPolicy {
  private readonly selection: PromptPolicy["selection"];

  constructor(
    selection: PromptPolicy["selection"] = createDefaultPromptPolicy().selection,
  ) {
    this.selection = freezeSelection(selection);
  }

  /** Context kinds for an intent — never invents kinds beyond policy. */
  kindsFor(intent: PromptIntent): readonly PromptContextKind[] {
    return this.selection[intent];
  }

  toRecord(): PromptPolicy["selection"] {
    return this.selection;
  }
}

function freezeSelection(
  selection: PromptPolicy["selection"],
): PromptPolicy["selection"] {
  const entries = Object.entries(selection).map(([intent, kinds]) => [
    intent,
    Object.freeze([...kinds]),
  ]);
  return Object.freeze(Object.fromEntries(entries)) as PromptPolicy["selection"];
}
