import type { ExplanationSnapshot } from "../models/ExplanationSnapshot";
import { createExplanationError, ExplanationErrorCodes } from "../models/ExplanationError";
import type { ExplanationError } from "../models/ExplanationError";
import { validateExplanationIntegrity } from "./validateExplanationIntegrity";

export function validateSnapshot(
  snapshot: ExplanationSnapshot | null,
): readonly ExplanationError[] {
  if (!snapshot) return Object.freeze([]);
  return validateExplanationIntegrity(snapshot.explanations);
}
