import type { ProgrammingRequest } from "../models/ProgrammingRequest";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import {
  createProgrammingService,
  type ProgrammingService,
} from "../services";

/**
 * Thin application wrapper — program selected exercises into prescriptions.
 */
export async function programExercises(
  request: ProgrammingRequest,
  service: ProgrammingService = createProgrammingService(),
): Promise<ProgrammingResult> {
  return service.programExercises(request);
}
