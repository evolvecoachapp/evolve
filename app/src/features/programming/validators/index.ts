import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { ProgrammingRequest } from "../models/ProgrammingRequest";
import { validateExecutionOrder } from "./validateExecutionOrder";
import { validateExerciseUniqueness } from "./validateExerciseUniqueness";
import { validateIntensityRanges } from "./validateIntensityRanges";
import { validatePrescriptionConsistency } from "./validatePrescriptionConsistency";
import { validateRestRanges } from "./validateRestRanges";
import { validateVolumeRanges } from "./validateVolumeRanges";

/**
 * Run the full programming validation suite and return unique issue codes.
 */
export function validateProgrammingResult(
  request: ProgrammingRequest,
  prescriptions: readonly ExercisePrescription[],
): readonly string[] {
  const issues = [
    ...validateSelectionPresent(request),
    ...validatePrescriptionConsistency(prescriptions),
    ...validateExerciseUniqueness(prescriptions),
    ...validateVolumeRanges(prescriptions),
    ...validateIntensityRanges(prescriptions),
    ...validateRestRanges(prescriptions),
    ...validateExecutionOrder(prescriptions),
  ];
  return Object.freeze([...new Set(issues)]);
}

function validateSelectionPresent(
  request: ProgrammingRequest,
): readonly string[] {
  if (request.selection.candidates.length === 0) {
    return Object.freeze(["selection_empty"]);
  }
  return Object.freeze([]);
}

export { validatePrescriptionConsistency } from "./validatePrescriptionConsistency";
export { validateExerciseUniqueness } from "./validateExerciseUniqueness";
export { validateVolumeRanges } from "./validateVolumeRanges";
export { validateIntensityRanges } from "./validateIntensityRanges";
export { validateRestRanges } from "./validateRestRanges";
export { validateExecutionOrder } from "./validateExecutionOrder";
