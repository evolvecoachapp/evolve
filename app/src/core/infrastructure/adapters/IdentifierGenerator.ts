import type { AdapterResult } from "../registry/AdapterResult";

/**
 * Infrastructure adapter contract for identifier generation.
 * No implementation in this sprint.
 */
export interface IdentifierGenerator {
  readonly adapterId: "identifier-generator";
  generate(): AdapterResult<string>;
  generateWithPrefix(prefix: string): AdapterResult<string>;
}
