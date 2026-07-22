import { resolveService } from "../../../core/composition";
import type { ProgrammingRequest } from "../models/ProgrammingRequest";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import type { ProgrammingService } from "../services";

/**
 * Thin application wrapper — preview programming with explanations enabled.
 * Default service is resolved from the Composition Root (no manual instantiation).
 */
export async function previewProgramming(
  request: ProgrammingRequest,
  service: ProgrammingService = resolveService("ProgrammingService"),
): Promise<ProgrammingResult> {
  return service.previewProgramming(request);
}
