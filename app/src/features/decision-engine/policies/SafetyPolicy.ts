import type { DecisionPackage } from "../models/DecisionPackage";

export function applySafetyPolicy(pkg: DecisionPackage): readonly string[] {
  const warnings: string[] = [];
  const safetyBlock = pkg.decisions.find(
    (d) => d.category === "safety" && d.intent === "block",
  );
  const training = pkg.decisions.find((d) => d.category === "training");
  if (safetyBlock && training) {
    warnings.push("safety_block_with_training_present");
  }
  return Object.freeze(warnings);
}
