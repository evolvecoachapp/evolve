import { resolveService } from "../../../core/composition";
import type { ProgrammingRequest } from "../models/ProgrammingRequest";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import type { ProgrammingService } from "../services";

/**
 * Thin application wrapper — program selected exercises into prescriptions.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function programExercises(
  request: ProgrammingRequest,
  service: ProgrammingService = resolveService("ProgrammingService"),
): Promise<ProgrammingResult> {
  return service.programExercises(request);
}
