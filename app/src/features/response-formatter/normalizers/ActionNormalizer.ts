import type { CoachAction } from "../models/CoachAction";
import { freezeAction } from "../utils/freezeObjects";

/**
 * Normalize action labels and payloads.
 */
export class ActionNormalizer {
  normalize(actions: readonly CoachAction[]): readonly CoachAction[] {
    return Object.freeze(
      actions.map((action) =>
        freezeAction({
          ...action,
          label: action.label.trim(),
          description: action.description
            ? action.description.trim()
            : null,
          payload: Object.freeze({ ...action.payload }),
        }),
      ),
    );
  }
}

export const actionNormalizer = new ActionNormalizer();
