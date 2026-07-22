import type { ProgrammingRequest } from "../models/ProgrammingRequest";
import type { ProgrammingResult } from "../models/ProgrammingResult";
import {
  createProgrammingService,
  type ProgrammingService,
} from "../services";

/**
 * Thin application wrapper — preview programming with explanations enabled.
 */
export async function previewProgramming(
  request: ProgrammingRequest,
  service: ProgrammingService = createProgrammingService(),
): Promise<ProgrammingResult> {
  return service.previewProgramming(request);
}
