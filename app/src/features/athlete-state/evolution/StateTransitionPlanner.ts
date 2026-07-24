import type { AthleteState } from "../models/AthleteState";
import type { SpecialistContribution } from "../models/SpecialistContribution";
import { contributionPaths } from "../utils/StateHelpers";

/**
 * Deterministic transition planning — no prediction / inference.
 */
export function planStateTransition(input: {
  readonly current: AthleteState | null;
  readonly contributions: readonly SpecialistContribution[];
}): {
  readonly paths: readonly string[];
  readonly source: string;
  readonly allowed: boolean;
  readonly reason: string;
} {
  if (!input.current && input.contributions.length === 0) {
    return Object.freeze({
      paths: Object.freeze(["identity", "profile"]),
      source: "build",
      allowed: true,
      reason: "Initial empty state build.",
    });
  }
  const paths = Object.freeze(
    input.contributions.flatMap((c) => [...contributionPaths(c)]),
  );
  const sources = Object.freeze([
    ...new Set(input.contributions.map((c) => c.source)),
  ]);
  return Object.freeze({
    paths,
    source: sources.join(",") || "update",
    allowed: true,
    reason: "Deterministic contribution merge.",
  });
}
