import type { ExercisePrescription } from "../models/ExercisePrescription";
import type { PrescriptionExecution } from "../models/PrescriptionExecution";
import type { PrescriptionIntensity } from "../models/PrescriptionIntensity";
import type { PrescriptionRest } from "../models/PrescriptionRest";
import type { PrescriptionSet } from "../models/PrescriptionSet";
import type { PrescriptionTempo } from "../models/PrescriptionTempo";
import type { PrescriptionVolume } from "../models/PrescriptionVolume";
import type { ProgrammingContext } from "../models/ProgrammingContext";
import type { ProgrammingExplanation } from "../models/ProgrammingExplanation";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import type { ProgrammingScore } from "../models/ProgrammingScore";

/**
 * Deep-freeze a ProgrammingResult for immutability guarantees.
 */
export function freezeProgrammingResult(
  result: ProgrammingResult,
): ProgrammingResult {
  return Object.freeze({
    requestId: result.requestId,
    context: freezeContext(result.context),
    prescriptions: Object.freeze(
      result.prescriptions.map(freezePrescription),
    ),
    explanations: Object.freeze(
      result.explanations.map(freezeExplanation),
    ),
    validationIssues: Object.freeze([...result.validationIssues]),
    score: freezeScore(result.score),
    programmedAt: result.programmedAt,
  });
}

/**
 * Deep-freeze a single ExercisePrescription.
 */
export function freezePrescription(
  prescription: ExercisePrescription,
): ExercisePrescription {
  return Object.freeze({
    ...prescription,
    sets: Object.freeze(prescription.sets.map(freezeSet)),
    volume: freezeVolume(prescription.volume),
    intensity: freezeIntensity(prescription.intensity),
    rest: freezeRest(prescription.rest),
    tempo: prescription.tempo ? freezeTempo(prescription.tempo) : null,
    execution: freezeExecution(prescription.execution),
    score: freezeScore(prescription.score),
    reasons: Object.freeze(
      prescription.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeContext(context: ProgrammingContext): ProgrammingContext {
  return Object.freeze({
    ...context,
    focus: Object.freeze({ ...context.focus }),
    priority: Object.freeze({ ...context.priority }),
    goalCodes: Object.freeze([...context.goalCodes]),
    constraints: Object.freeze(
      context.constraints.map((constraint) => Object.freeze({ ...constraint })),
    ),
  });
}

function freezeExplanation(
  explanation: ProgrammingExplanation,
): ProgrammingExplanation {
  return Object.freeze({
    ...explanation,
    score: freezeScore(explanation.score),
    reasons: Object.freeze(
      explanation.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeSet(set: PrescriptionSet): PrescriptionSet {
  return Object.freeze({ ...set });
}

function freezeVolume(volume: PrescriptionVolume): PrescriptionVolume {
  return Object.freeze({ ...volume });
}

function freezeIntensity(
  intensity: PrescriptionIntensity,
): PrescriptionIntensity {
  return Object.freeze({ ...intensity });
}

function freezeRest(rest: PrescriptionRest): PrescriptionRest {
  return Object.freeze({ ...rest });
}

function freezeTempo(tempo: PrescriptionTempo): PrescriptionTempo {
  return Object.freeze({ ...tempo });
}

function freezeExecution(
  execution: PrescriptionExecution,
): PrescriptionExecution {
  return Object.freeze({
    notes: Object.freeze([...execution.notes]),
    cues: Object.freeze([...execution.cues]),
  });
}

function freezeScore(score: ProgrammingScore): ProgrammingScore {
  return Object.freeze({ ...score });
}
