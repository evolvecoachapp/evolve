import type { AdaptationTrigger } from "../models/AdaptationTrigger";
import type { AdaptationTriggerKind } from "../models/AdaptationTrigger";

export function selectPresentTriggers(
  triggers: readonly AdaptationTrigger[],
): readonly AdaptationTrigger[] {
  return Object.freeze(triggers.filter((t) => t.present));
}

export function selectTriggersByKind(
  triggers: readonly AdaptationTrigger[],
  kind: AdaptationTriggerKind,
): readonly AdaptationTrigger[] {
  return Object.freeze(triggers.filter((t) => t.kind === kind));
}
