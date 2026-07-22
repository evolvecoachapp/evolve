import type { ProgrammingResult } from "../models/ProgrammingResult";

/**
 * Temporary immutable cache of programming results.
 * No persistence. No networking.
 */
export interface ProgrammingRepository {
  save(result: ProgrammingResult): Promise<ProgrammingResult>;
  load(requestId: string): Promise<ProgrammingResult | null>;
  list(): Promise<readonly ProgrammingResult[]>;
  delete(requestId: string): Promise<boolean>;
  clear(): Promise<void>;
}
